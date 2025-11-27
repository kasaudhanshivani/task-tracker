from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Task
import pymysql
pymysql.install_as_MySQLdb()

from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)

app = Flask(__name__)
CORS(app)

# ================================
# 🔧 DB + JWT CONFIG
# ================================
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root:kasaudhan@localhost/task_tracker_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "SECRET_KEY_123"  # change in production

db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# ================================
# AUTH ROUTES
# ================================

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Username & password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(username=username, password=hashed_pw)

    db.session.add(new_user)
    db.session.commit()

    # ✅ Convert id to string
    token = create_access_token(identity=str(new_user.id))

    return jsonify({
        "msg": "Signup successful",
        "token": token
    }), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))  # ✅ Convert id to string

    return jsonify({"token": token}), 200

# ================================
# TASK ROUTES (JWT Protected)
# ================================

@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "due_date": t.due_date,
        "priority": t.priority,
        "status": t.status
    } for t in tasks]), 200

@app.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.json

    if "title" not in data:
        return jsonify({"msg": "Title required"}), 400

    task = Task(
        title=data["title"],
        description=data.get("description", ""),
        due_date=data.get("due_date", ""),
        priority=data.get("priority", "Low"),
        status=data.get("status", "Pending"),
        user_id=user_id
    )

    db.session.add(task)
    db.session.commit()
    return jsonify({"msg": "Task created", "id": task.id}), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({"msg": "Task not found"}), 404

    data = request.json
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.due_date = data.get("due_date", task.due_date)
    task.priority = data.get("priority", task.priority)
    task.status = data.get("status", task.status)

    db.session.commit()
    return jsonify({"msg": "Task updated"}), 200

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({"msg": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"msg": "Task deleted"}), 200

@app.route("/")
def home():
    return "🚀 Task Tracker API running"

if __name__ == "__main__":
    app.run(debug=True)
