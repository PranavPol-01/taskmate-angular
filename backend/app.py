from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from marshmallow import Schema, fields, validate
from flasgger import Swagger
import bcrypt
import logging
from werkzeug.security import check_password_hash, generate_password_hash
import random
import string
from bson import ObjectId

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
jwt = JWTManager(app)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per day", "100 per hour"]
)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
swagger = Swagger(app)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }
})

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
    db = client['task_manager']
    tasks_collection = db['tasks']
    completed_tasks_collection = db['completed_tasks']
    users_collection = db['users']
    admin_collection = db['admins']
    company_collection = db['companies']
    client.server_info()
    logger.info("Successfully connected to MongoDB!")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    raise

# Validation schemas
class TaskSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(validate=validate.Length(max=500))
    status = fields.Str(validate=validate.OneOf(['todo', 'in_progress', 'done']))
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high']))
    category = fields.Str()
    due_date = fields.DateTime(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    user_id = fields.Str(dump_only=True)

class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    email = fields.Email(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(['user', 'admin']))
    company_code = fields.Str(required=True)

class AdminSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)
    company_code = fields.Str(required=True)

class CompanySchema(Schema):
    name = fields.Str(required=True)
    code = fields.Str(required=True)
    created_by = fields.Str(required=True)

task_schema = TaskSchema()
user_schema = UserSchema()

# Authentication routes
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        required_fields = ['username', 'email', 'password', 'role']
        
        # Check for required fields
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if username already exists
        if users_collection.find_one({'username': data['username']}):
            return jsonify({'error': 'Username already exists'}), 400
        
        # Check if email already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Email already exists'}), 400
        
        try:
            # Hash password using bcrypt
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), salt)
            
            # Create user object
            user = {
                'username': data['username'],
                'email': data['email'],
                'password': hashed_password,  # Store as bytes
                'role': data['role'],
                'company_code': None,
                'registration_complete': False,
                'created_at': datetime.utcnow()
            }
            
            # Insert user into database
            result = users_collection.insert_one(user)
            user['_id'] = str(result.inserted_id)
            del user['password']  # Remove password from response
            
            return jsonify({
                'message': 'Registration successful. Please complete your registration.',
                'user': user
            }), 201
        except Exception as e:
            logger.error(f"Password hashing error: {e}")
            return jsonify({'error': 'Error creating user'}), 500
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/auth/complete-registration', methods=['POST'])
def complete_registration():
    try:
        data = request.get_json()
        required_fields = ['username', 'company_code']
        
        # Check for required fields
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Find user
        user = users_collection.find_one({'username': data['username']})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        company_code = data['company_code']
        
        # For admin users, create a new company
        if user['role'] == 'admin':
            if 'company_name' not in data:
                return jsonify({'error': 'Company name is required for admin registration'}), 400
            
            # Check if company code already exists
            if company_collection.find_one({'code': company_code}):
                return jsonify({'error': 'Company code already exists'}), 400
            
            # Create new company
            company = {
                'name': data['company_name'],
                'code': company_code,
                'admin_id': str(user['_id']),
                'created_at': datetime.utcnow()
            }
            company_collection.insert_one(company)
        
        # For regular users, verify company code exists
        else:
            company = company_collection.find_one({'code': company_code})
            if not company:
                return jsonify({'error': 'Invalid company code'}), 400
        
        # Update user with company code and mark registration as complete
        users_collection.update_one(
            {'_id': user['_id']},
            {
                '$set': {
                    'company_code': company_code,
                    'registration_complete': True
                }
            }
        )
        
        # Generate access token
        access_token = create_access_token(identity={
            'id': str(user['_id']),
            'username': user['username'],
            'role': user['role'],
            'company_code': company_code
        })
        
        return jsonify({
            'message': 'Registration completed successfully',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'company_code': company_code
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        data = request.json
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Username and password are required"}), 400
            
        user = users_collection.find_one({"username": data['username']})
        
        if not user:
            logger.error(f"Login failed: User not found - {data['username']}")
            return jsonify({"error": "Invalid credentials"}), 401
            
        try:
            # Ensure both password and stored hash are bytes
            password_bytes = data['password'].encode('utf-8')
            stored_hash = user['password']
            
            # If stored hash is a string, convert it to bytes
            if isinstance(stored_hash, str):
                stored_hash = stored_hash.encode('utf-8')
                
            if bcrypt.checkpw(password_bytes, stored_hash):
                access_token = create_access_token(identity=str(user['_id']))
                return jsonify({
                    "access_token": access_token,
                    "user": {
                        "id": str(user['_id']),
                        "username": user['username'],
                        "email": user['email'],
                        "role": user['role'],
                        "company_code": user.get('company_code')
                    }
                })
            else:
                logger.error(f"Login failed: Invalid password for user - {data['username']}")
                return jsonify({"error": "Invalid credentials"}), 401
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": str(e)}), 500

# Task routes
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get active tasks (not done) based on user role
        if user['role'] == 'admin':
            # Admin can see all active tasks in their company
            tasks = list(tasks_collection.find({
                'company_code': user['company_code'],
                'status': {'$ne': 'done'}  # Only get non-completed tasks
            }))
        else:
            # Regular users can only see active tasks assigned to them
            tasks = list(tasks_collection.find({
                'company_code': user['company_code'],
                '$or': [
                    {'created_by': str(user['_id'])},
                    {'assigned_to': str(user['_id'])}
                ],
                'status': {'$ne': 'done'}  # Only get non-completed tasks
            }))
        
        # Convert ObjectId to string
        for task in tasks:
            task['_id'] = str(task['_id'])
            if 'created_by' in task:
                task['created_by'] = str(task['created_by'])
            if 'assigned_to' in task:
                task['assigned_to'] = str(task['assigned_to'])
        
        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in get_tasks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        print(data)
        
        # Validate required fields
        required_fields = ['title', 'description', 'due_date', 'priority']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get user details
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        print("user",user)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create task object
        task = {
            'title': data['title'],
            'description': data['description'],
            'due_date': datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')),
            'priority': data['priority'],
            'status': 'todo',
            'company_code': user['company_code'],
            'created_by': str(user['_id']),
            'created_at': datetime.utcnow()
        }
        
        # If assigned_to is provided, verify it's a valid user in the same company
        if 'assigned_to' in data:
            assigned_user = users_collection.find_one({
                '_id': ObjectId(data['assigned_to']),
                'company_code': user['company_code']
            })
            if not assigned_user:
                return jsonify({'error': 'Invalid user assignment'}), 400
            task['assigned_to'] = str(assigned_user['_id'])
        
        # Insert task into database
        result = tasks_collection.insert_one(task)
        task['_id'] = str(result.inserted_id)
        
        return jsonify(task), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Get task
        task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Verify user has permission to update the task
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user['role'] != 'admin' and str(task['created_by']) != str(user['_id']):
            return jsonify({'error': 'Unauthorized to update this task'}), 403
        
        # Update task fields
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'due_date' in data:
            update_data['due_date'] = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        if 'priority' in data:
            update_data['priority'] = data['priority']
        if 'status' in data:
            update_data['status'] = data['status']
        if 'assigned_to' in data:
            # Verify assigned user is in the same company
            assigned_user = users_collection.find_one({
                '_id': ObjectId(data['assigned_to']),
                'company_code': user['company_code']
            })
            if not assigned_user:
                return jsonify({'error': 'Invalid user assignment'}), 400
            update_data['assigned_to'] = str(assigned_user['_id'])
        
        # Update task
        tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': update_data}
        )
        
        # Get updated task
        updated_task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        updated_task['_id'] = str(updated_task['_id'])
        if 'created_by' in updated_task:
            updated_task['created_by'] = str(updated_task['created_by'])
        if 'assigned_to' in updated_task:
            updated_task['assigned_to'] = str(updated_task['assigned_to'])
        
        return jsonify(updated_task), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the task
        task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check if user has permission to delete the task
        if user['role'] != 'admin' and str(task['created_by']) != str(user['_id']):
            return jsonify({'error': 'Unauthorized to delete this task'}), 403
        
        # Delete the task
        result = tasks_collection.delete_one({'_id': ObjectId(task_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Task deleted successfully'}), 200
        return jsonify({'error': 'Task not found'}), 404
    except Exception as e:
        logger.error(f"Error in delete_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/search', methods=['GET'])
@jwt_required()
def search_tasks():
    """
    Search tasks
    ---
    parameters:
      - name: q
        in: query
        type: string
        required: true
    responses:
      200:
        description: List of matching tasks
    """
    try:
        user_id = get_jwt_identity()
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify([])

        results = tasks_collection.find({
            'user_id': user_id,
            '$or': [
                {'title': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}},
                {'category': {'$regex': query, '$options': 'i'}}
            ]
        })
        
        tasks = list(results)
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks)
    except Exception as e:
        logger.error(f"Error in search_tasks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/stats', methods=['GET'])
@jwt_required()
@cache.cached(timeout=300)
def get_task_stats():
    """
    Get task statistics
    ---
    responses:
      200:
        description: Task statistics
    """
    try:
        user_id = get_jwt_identity()
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1}
            }}
        ]
        stats = list(tasks_collection.aggregate(pipeline))
        
        priority_pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$priority',
                'count': {'$sum': 1}
            }}
        ]
        priority_stats = list(tasks_collection.aggregate(priority_pipeline))
        
        return jsonify({
            'status_stats': {stat['_id']: stat['count'] for stat in stats if stat['_id']},
            'priority_stats': {stat['_id']: stat['count'] for stat in priority_stats if stat['_id']}
        })
    except Exception as e:
        logger.error(f"Error in get_task_stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the task
        task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check if user has permission to complete the task
        if user['role'] != 'admin' and str(task['assigned_to']) != str(user['_id']):
            return jsonify({'error': 'Unauthorized to complete this task'}), 403
        
        # Update task status to done
        tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {
                '$set': {
                    'status': 'done',
                    'completed_at': datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Task completed successfully'}), 200
    except Exception as e:
        logger.error(f"Error in complete_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/completed', methods=['GET'])
@jwt_required()
def get_completed_tasks():
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get completed tasks based on user role
        if user['role'] == 'admin':
            # Admin can see all completed tasks in their company
            tasks = list(tasks_collection.find({
                'company_code': user['company_code'],
                'status': 'done'
            }))
        else:
            # Regular users can only see completed tasks assigned to them
            tasks = list(tasks_collection.find({
                'company_code': user['company_code'],
                'assigned_to': str(user['_id']),
                'status': 'done'
            }))
        
        # Convert ObjectId to string
        for task in tasks:
            task['_id'] = str(task['_id'])
            if 'created_by' in task:
                task['created_by'] = str(task['created_by'])
            if 'assigned_to' in task:
                task['assigned_to'] = str(task['assigned_to'])
        
        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in get_completed_tasks: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/analytics/tasks', methods=['GET'])
@jwt_required()
def get_task_analytics():
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Active tasks by status
        status_pipeline = [
            {'$match': {'company_code': user['company_code']}},
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1}
            }}
        ]
        status_stats = list(tasks_collection.aggregate(status_pipeline))
        
        # Active tasks by priority
        priority_pipeline = [
            {'$match': {'company_code': user['company_code']}},
            {'$group': {
                '_id': '$priority',
                'count': {'$sum': 1}
            }}
        ]
        priority_stats = list(tasks_collection.aggregate(priority_pipeline))
        
        # Completed tasks by month
        completed_pipeline = [
            {'$match': {
                'company_code': user['company_code'],
                'status': 'done',
                'completed_at': {'$exists': True}
            }},
            {'$group': {
                '_id': {
                    'year': {'$year': '$completed_at'},
                    'month': {'$month': '$completed_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id.year': 1, '_id.month': 1}}
        ]
        completed_stats = list(tasks_collection.aggregate(completed_pipeline))
        
        # Average completion time
        completion_time_pipeline = [
            {'$match': {
                'company_code': user['company_code'],
                'status': 'done',
                'completed_at': {'$exists': True}
            }},
            {'$project': {
                'completion_time': {
                    '$divide': [
                        {'$subtract': ['$completed_at', '$created_at']},
                        3600000  # Convert to hours
                    ]
                }
            }},
            {'$group': {
                '_id': None,
                'avg_completion_time': {'$avg': '$completion_time'}
            }}
        ]
        completion_time = list(tasks_collection.aggregate(completion_time_pipeline))
        
        return jsonify({
            'status_stats': {stat['_id']: stat['count'] for stat in status_stats if stat['_id']},
            'priority_stats': {stat['_id']: stat['count'] for stat in priority_stats if stat['_id']},
            'completed_by_month': [
                {
                    'month': f"{stat['_id']['year']}-{stat['_id']['month']}",
                    'count': stat['count']
                } for stat in completed_stats
            ],
            'avg_completion_time': completion_time[0]['avg_completion_time'] if completion_time else 0
        })
    except Exception as e:
        logger.error(f"Error in get_task_analytics: {e}")
        return jsonify({'error': str(e)}), 500

# Admin routes
@app.route('/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Username and password are required"}), 400
            
        # Find user in users_collection with admin role
        user = users_collection.find_one({
            "username": data['username'],
            "role": "admin"
        })
        
        if not user:
            logger.error(f"Admin login failed: User not found - {data['username']}")
            return jsonify({"error": "Invalid credentials"}), 401
            
        try:
            # Ensure both password and stored hash are bytes
            password_bytes = data['password'].encode('utf-8')
            stored_hash = user['password']
            
            # If stored hash is a string, convert it to bytes
            if isinstance(stored_hash, str):
                stored_hash = stored_hash.encode('utf-8')
                
            if bcrypt.checkpw(password_bytes, stored_hash):
                access_token = create_access_token(identity=str(user['_id']))
                return jsonify({
                    "access_token": access_token,
                    "user": {
                        "id": str(user['_id']),
                        "username": user['username'],
                        "email": user['email'],
                        "role": user['role'],
                        "company_code": user.get('company_code')
                    }
                })
            else:
                logger.error(f"Admin login failed: Invalid password for user - {data['username']}")
                return jsonify({"error": "Invalid credentials"}), 401
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        logger.error(f"Admin login error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/admin/tasks', methods=['POST'])
@jwt_required()
def admin_create_task():
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user or user['role'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'due_date', 'priority', 'assigned_to']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Verify assigned user is in the same company
        assigned_user = users_collection.find_one({
            '_id': ObjectId(data['assigned_to']),
            'company_code': user['company_code']
        })
        
        if not assigned_user:
            return jsonify({'error': 'Invalid user assignment'}), 400
        
        # Create task object
        task = {
            'title': data['title'],
            'description': data['description'],
            'due_date': datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')),
            'priority': data['priority'],
            'status': 'todo',
            'company_code': user['company_code'],
            'created_by': str(user['_id']),
            'assigned_to': str(assigned_user['_id']),
            'created_at': datetime.utcnow()
        }
        
        # Insert task into database
        result = tasks_collection.insert_one(task)
        task['_id'] = str(result.inserted_id)
        
        return jsonify(task), 201
    except Exception as e:
        logger.error(f"Error in admin_create_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin/tasks', methods=['GET'])
@jwt_required()
def admin_get_tasks():
    try:
        current_user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user_id)})

        if not user or user.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403

        # Fetch tasks created by current admin
        tasks = list(tasks_collection.find({
            'created_by': str(user['_id']),
            'company_code': user['company_code']
        }))

        # Collect all assigned_to user IDs
        assigned_user_ids = [ObjectId(task['assigned_to']) for task in tasks if 'assigned_to' in task]
        assigned_users = list(users_collection.find({'_id': {'$in': assigned_user_ids}}))
        user_map = {str(user['_id']): user.get('username', 'Unknown') for user in assigned_users}

        response = []
        for task in tasks:
            task_data = {
                '_id': str(task['_id']),
                'title': task['title'],
                'description': task['description'],
                'due_date': task['due_date'].isoformat() if isinstance(task['due_date'], datetime) else task['due_date'],
                'priority': task['priority'],
                'status': task['status'],
                'created_at': task['created_at'].isoformat() if isinstance(task['created_at'], datetime) else task['created_at'],
                'assigned_to': str(task['assigned_to']) if 'assigned_to' in task else None,
                'assigned_to_name': user_map.get(str(task.get('assigned_to')), 'Unassigned')
            }
            response.append(task_data)

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in admin_get_tasks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    
    comment = {
        'user': current_user['username'],
        'text': data['text'],
        'timestamp': datetime.utcnow().isoformat()
    }
    
    tasks_collection.update_one(
        {'_id': ObjectId(task_id)},
        {'$push': {'comments': comment}}
    )
    return jsonify({'message': 'Comment added successfully'}), 200

@app.route('/admin/company', methods=['POST'])
@jwt_required()
def create_company():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    company_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    company_data = {
        'name': data['name'],
        'code': company_code,
        'created_by': current_user['username'],
        'created_at': datetime.utcnow()
    }
    
    result = company_collection.insert_one(company_data)
    return jsonify({
        'message': 'Company created successfully',
        'company_code': company_code
    }), 201

@app.route('/admin/employees', methods=['GET'])
@jwt_required()
def get_admin_company_employees():
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user)})
        
        if not user or user['role'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all employees in the same company
        employees = list(users_collection.find({
            'company_code': user['company_code'],
            'role': 'user'
        }))
        print(employees)
        
        # Convert ObjectId to string and remove sensitive data
        for employee in employees:
            employee['_id'] = str(employee['_id'])
            del employee['password']
            del employee['email']
        
        return jsonify(employees), 200
    except Exception as e:
        logger.error(f"Error in get_company_employees: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 