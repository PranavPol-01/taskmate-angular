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

# CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Add OPTIONS handler for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:4200')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
    db = client['task_manager']
    tasks_collection = db['tasks']
    completed_tasks_collection = db['completed_tasks']
    users_collection = db['users']
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

task_schema = TaskSchema()
user_schema = UserSchema()

# Authentication routes
@app.route('/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """
    Register a new user
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: User
          required:
            - username
            - password
            - email
          properties:
            username:
              type: string
              minimum: 3
            password:
              type: string
              minimum: 6
            email:
              type: string
    responses:
      201:
        description: User created successfully
      400:
        description: Invalid input
    """
    try:
        data = request.json
        errors = user_schema.validate(data)
        if errors:
            return jsonify({"errors": errors}), 400

        if users_collection.find_one({"username": data['username']}):
            return jsonify({"error": "Username already exists"}), 400

        if users_collection.find_one({"email": data['email']}):
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        user = {
            "username": data['username'],
            "password": hashed_password,
            "email": data['email'],
            "created_at": datetime.utcnow()
        }
        users_collection.insert_one(user)
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        logger.error(f"Error in register: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """
    Login user
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            username:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    try:
        data = request.json
        user = users_collection.find_one({"username": data['username']})
        
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            access_token = create_access_token(identity=str(user['_id']))
            return jsonify({
                "access_token": access_token,
                "username": user['username']
            })
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({"error": str(e)}), 500

# Task routes
@app.route('/tasks', methods=['GET'])
@jwt_required()
@cache.cached(timeout=30)
def get_tasks():
    """
    Get all tasks for the current user
    ---
    parameters:
      - name: status
        in: query
        type: string
      - name: priority
        in: query
        type: string
      - name: category
        in: query
        type: string
    responses:
      200:
        description: List of tasks
    """
    try:
        user_id = get_jwt_identity()
        query = {"user_id": user_id}
        
        # Apply filters
        status = request.args.get('status')
        priority = request.args.get('priority')
        category = request.args.get('category')
        
        if status:
            query['status'] = status
        if priority:
            query['priority'] = priority
        if category:
            query['category'] = category

        tasks = list(tasks_collection.find(query))
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks)
    except Exception as e:
        logger.error(f"Error in get_tasks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """
    Create a new task
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: Task
          required:
            - title
          properties:
            title:
              type: string
            description:
              type: string
            status:
              type: string
            priority:
              type: string
            category:
              type: string
            due_date:
              type: string
              format: date-time
    responses:
      201:
        description: Task created successfully
      400:
        description: Invalid input
    """
    try:
        task_data = request.json
        errors = task_schema.validate(task_data)
        if errors:
            return jsonify({"errors": errors}), 400

        user_id = get_jwt_identity()
        task_data['user_id'] = user_id
        task_data['created_at'] = datetime.utcnow()
        task_data['status'] = task_data.get('status', 'todo')
        
        result = tasks_collection.insert_one(task_data)
        task_data['_id'] = str(result.inserted_id)
        cache.delete('tasks')  # Invalidate cache
        return jsonify(task_data), 201
    except Exception as e:
        logger.error(f"Error in create_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        from bson import ObjectId
        user_id = get_jwt_identity()
        task_data = request.json
        
        errors = task_schema.validate(task_data, partial=True)
        if errors:
            return jsonify({"errors": errors}), 400

        if '_id' in task_data:
            del task_data['_id']
        
        result = tasks_collection.update_one(
            {'_id': ObjectId(task_id), 'user_id': user_id},
            {'$set': task_data}
        )
        
        if result.modified_count:
            updated_task = tasks_collection.find_one({'_id': ObjectId(task_id)})
            updated_task['_id'] = str(updated_task['_id'])
            cache.delete('tasks')  # Invalidate cache
            return jsonify(updated_task)
        return jsonify({'error': 'Task not found or unauthorized'}), 404
    except Exception as e:
        logger.error(f"Error in update_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        from bson import ObjectId
        user_id = get_jwt_identity()
        result = tasks_collection.delete_one({
            '_id': ObjectId(task_id),
            'user_id': user_id
        })
        if result.deleted_count:
            cache.delete('tasks')  # Invalidate cache
            return '', 204
        return jsonify({'error': 'Task not found or unauthorized'}), 404
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
    """
    Mark a task as completed and move it to completed tasks
    """
    try:
        from bson import ObjectId
        user_id = get_jwt_identity()
        
        # Get the task
        task = tasks_collection.find_one({
            '_id': ObjectId(task_id),
            'user_id': user_id
        })
        
        if not task:
            return jsonify({'error': 'Task not found or unauthorized'}), 404
            
        # Add completion date and move to completed tasks
        task['completed_at'] = datetime.utcnow()
        completed_tasks_collection.insert_one(task)
        
        # Delete from active tasks
        tasks_collection.delete_one({'_id': ObjectId(task_id)})
        
        return jsonify({'message': 'Task completed successfully'})
    except Exception as e:
        logger.error(f"Error in complete_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/completed', methods=['GET'])
@jwt_required()
def get_completed_tasks():
    """
    Get all completed tasks for the current user
    """
    try:
        user_id = get_jwt_identity()
        tasks = list(completed_tasks_collection.find({'user_id': user_id}))
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks)
    except Exception as e:
        logger.error(f"Error in get_completed_tasks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/tasks', methods=['GET'])
@jwt_required()
def get_task_analytics():
    """
    Get task analytics for the current user
    """
    try:
        user_id = get_jwt_identity()
        
        # Active tasks by status
        status_pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1}
            }}
        ]
        status_stats = list(tasks_collection.aggregate(status_pipeline))
        
        # Active tasks by priority
        priority_pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$priority',
                'count': {'$sum': 1}
            }}
        ]
        priority_stats = list(tasks_collection.aggregate(priority_pipeline))
        
        # Completed tasks by month
        completed_pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$completed_at'},
                    'month': {'$month': '$completed_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id.year': 1, '_id.month': 1}}
        ]
        completed_stats = list(completed_tasks_collection.aggregate(completed_pipeline))
        
        # Average completion time
        completion_time_pipeline = [
            {'$match': {'user_id': user_id, 'completed_at': {'$exists': True}}},
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
        completion_time = list(completed_tasks_collection.aggregate(completion_time_pipeline))
        
        return jsonify({
            'status_stats': {stat['_id']: stat['count'] for stat in status_stats},
            'priority_stats': {stat['_id']: stat['count'] for stat in priority_stats},
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

if __name__ == '__main__':
    app.run(debug=True, port=5000) 