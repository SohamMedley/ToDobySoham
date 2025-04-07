from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory
from flask_cors import CORS
import json
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import uuid

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Database files
USERS_DB = 'data/users.json'
TASKS_DB = 'data/tasks.json'
OTP_DB = 'data/otps.json'

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Initialize database files if they don't exist
def init_db():
    if not os.path.exists(USERS_DB):
        with open(USERS_DB, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(TASKS_DB):
        with open(TASKS_DB, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(OTP_DB):
        with open(OTP_DB, 'w') as f:
            json.dump({}, f)

# Load data from JSON file
def load_data(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except:
        return []

# Save data to JSON file
def save_data(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# Generate OTP
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

# Send email with OTP
def send_otp_email(email, otp):
    # In a real application, you would configure this with your SMTP server
    # For demo purposes, we'll just print the OTP
    print(f"OTP for {email}: {otp}")
    
       # Uncomment and configure this in a real application
    '''
    sender_email = "your-email@example.com"
    password = "your-password"
    
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Your TaskFlow OTP"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563eb;">TaskFlow</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px;">
                <h2 style="margin-top: 0;">Your OTP Verification Code</h2>
                <p>Please use the following OTP to verify your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f9ff; border-radius: 5px; display: inline-block;">
                        {otp}
                    </div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>&copy; 2023 TaskFlow. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    message.attach(MIMEText(body, "html"))
    '''

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, email, message.as_string())

    
    # Store OTP in database
    otps = {}
    if os.path.exists(OTP_DB):
        with open(OTP_DB, 'r') as f:
            otps = json.load(f)
    
    otps[email] = {
        "otp": otp,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat()
    }
    
    with open(OTP_DB, 'w') as f:
        json.dump(otps, f)
    
    return True

# Verify OTP
def verify_otp(email, otp):
    if not os.path.exists(OTP_DB):
        return False
    
    with open(OTP_DB, 'r') as f:
        otps = json.load(f)
    
    if email not in otps:
        return False
    
    stored_otp = otps[email]["otp"]
    expires_at = datetime.fromisoformat(otps[email]["expires_at"])
    
    # Check if OTP has expired
    if datetime.now() > expires_at:
        return False
    
    return stored_otp == otp

# Routes
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_files(path):
    return app.send_static_file(path)

# API Routes
@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    otp = generate_otp()
    success = send_otp_email(email, otp)
    
    if success:
        # For demo purposes, always return 123456 as the OTP
        return jsonify({"message": "OTP sent successfully", "demo_otp": "123456"}), 200
    else:
        return jsonify({"error": "Failed to send OTP"}), 500

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400
    
    # For demo purposes, always verify if OTP is 123456
    if otp == "123456":
        # Check if user exists
        users = load_data(USERS_DB)
        user = next((u for u in users if u["email"] == email), None)
        
        if user:
            return jsonify({
                "message": "OTP verified successfully",
                "user": user,
                "isNewUser": False
            }), 200
        else:
            return jsonify({
                "message": "OTP verified successfully",
                "isNewUser": True
            }), 200
    else:
        return jsonify({"error": "Invalid OTP"}), 400

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    
    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400
    
    # Check if user already exists
    users = load_data(USERS_DB)
    if any(u["email"] == email for u in users):
        return jsonify({"error": "User already exists"}), 400
    
    # Create new user
    new_user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "avatar": None,
        "createdAt": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_data(users, USERS_DB)
    
    return jsonify({
        "message": "User created successfully",
        "user": new_user
    }), 201

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    name = data.get('name')
    avatar = data.get('avatar')
    
    users = load_data(USERS_DB)
    user = next((u for u in users if u["id"] == user_id), None)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if name:
        user["name"] = name
    
    if avatar:
        user["avatar"] = avatar
    
    save_data(users, USERS_DB)
    
    return jsonify({
        "message": "User updated successfully",
        "user": user
    }), 200

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('userId')
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    tasks = load_data(TASKS_DB)
    user_tasks = [t for t in tasks if t["userId"] == user_id]
    
    return jsonify(user_tasks), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('dueDate')
    priority = data.get('priority')
    user_id = data.get('userId')
    
    if not title or not user_id:
        return jsonify({"error": "Title and user ID are required"}), 400
    
    new_task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "dueDate": due_date,
        "priority": priority or "medium",
        "completed": False,
        "createdAt": datetime.now().isoformat(),
        "userId": user_id
    }
    
    tasks = load_data(TASKS_DB)
    tasks.append(new_task)
    save_data(tasks, TASKS_DB)
    
    return jsonify({
        "message": "Task created successfully",
        "task": new_task
    }), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('dueDate')
    priority = data.get('priority')
    completed = data.get('completed')
    
    tasks = load_data(TASKS_DB)
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    if title:
        task["title"] = title
    
    if description is not None:
        task["description"] = description
    
    if due_date:
        task["dueDate"] = due_date
    
    if priority:
        task["priority"] = priority
    
    if completed is not None:
        task["completed"] = completed
    
    save_data(tasks, TASKS_DB)
    
    return jsonify({
        "message": "Task updated successfully",
        "task": task
    }), 200

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_data(TASKS_DB)
    tasks = [t for t in tasks if t["id"] != task_id]
    save_data(tasks, TASKS_DB)
    
    return jsonify({
        "message": "Task deleted successfully"
    }), 200

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    
    if not name or not email or not subject or not message:
        return jsonify({"error": "All fields are required"}), 400
    
    # In a real app, you would send an email or store the contact message
    print(f"Contact form submission: {name} ({email}): {subject}")
    
    return jsonify({
        "message": "Message sent successfully"
    }), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True)