from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
    db = client['task_manager']
    tasks_collection = db['tasks']
    # Test the connection
    client.server_info()
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = list(tasks_collection.find())
        # Convert ObjectId to string for JSON serialization
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks)
    except Exception as e:
        print(f"Error in get_tasks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    try:
        from bson import ObjectId
        task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        if task:
            task['_id'] = str(task['_id'])
            return jsonify(task)
        return jsonify({'error': 'Task not found'}), 404
    except Exception as e:
        print(f"Error in get_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        task_data = request.json
        task_data['created_at'] = datetime.utcnow()
        result = tasks_collection.insert_one(task_data)
        task_data['_id'] = str(result.inserted_id)
        return jsonify(task_data), 201
    except Exception as e:
        print(f"Error in create_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        from bson import ObjectId
        task_data = request.json
        if '_id' in task_data:
            del task_data['_id']
        
        result = tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': task_data}
        )
        
        if result.modified_count:
            updated_task = tasks_collection.find_one({'_id': ObjectId(task_id)})
            updated_task['_id'] = str(updated_task['_id'])
            return jsonify(updated_task)
        return jsonify({'error': 'Task not found'}), 404
    except Exception as e:
        print(f"Error in update_task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        from bson import ObjectId
        result = tasks_collection.delete_one({'_id': ObjectId(task_id)})
        if result.deleted_count:
            return '', 204
        return jsonify({'error': 'Task not found'}), 404
    except Exception as e:
        print(f"Error in delete_task: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 