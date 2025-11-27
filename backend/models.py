from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    tasks = db.relationship("Task", backref="user", lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    due_date = db.Column(db.String(50))
    priority = db.Column(db.String(20), default="Low")
    status = db.Column(db.String(20), default="Pending")
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)  # Add this

