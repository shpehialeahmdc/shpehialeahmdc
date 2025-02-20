from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shpe.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
app.config['SMTP_SERVER'] = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
app.config['SMTP_PORT'] = int(os.getenv('SMTP_PORT', 587))
app.config['SENDER_EMAIL'] = os.getenv('SENDER_EMAIL')
app.config['SENDER_PASSWORD'] = os.getenv('SENDER_PASSWORD')

db = SQLAlchemy(app)

@app.route('/')
def home():
    return "Welcome to the SHPE API!"

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)  # Changed to default True
    is_officer = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class EventRSVP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('event_id', 'user_id'),)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    team_size = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Proposal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    objectives = db.Column(db.Text, nullable=False)
    required_resources = db.Column(db.Text, nullable=False)
    team_size = db.Column(db.Integer, nullable=False)
    timeline = db.Column(db.String(120), nullable=False)
    additional_info = db.Column(db.Text)
    preliminary_research = db.Column(db.Text)
    submitted_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    supervising_officer = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])

        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'is_active': user.is_active,
                'is_officer': user.is_officer
            }
        })

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    if User.query.filter_by(student_id=data['student_id']).first():
        return jsonify({'message': 'Student ID already registered'}), 400

    hashed_password = generate_password_hash(data['password'])
    
    # Set is_officer to True if it's the president's email
    is_officer = data['email'] == 'cesar.roque002@mymdc.net'
    
    new_user = User(
        email=data['email'],
        password=hashed_password,
        name=data['name'],
        student_id=data['student_id'],
        is_active=True,
        is_officer=is_officer
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/auth/validate', methods=['POST'])
@token_required
def validate_token(current_user):
    return jsonify({
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'is_active': current_user.is_active,
            'is_officer': current_user.is_officer
        }
    })

@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.order_by(Event.start_time.desc()).all()
    return jsonify([{
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'start': event.start_time.isoformat(),
        'end': event.end_time.isoformat(),
        'location': event.location,
        'type': event.type,
        'created_by': event.created_by
    } for event in events])

@app.route('/api/events', methods=['POST'])
@token_required
def create_event(current_user):
    try:
        data = request.get_json()
        
        new_event = Event(
            title=data['title'],
            description=data['description'],
            start_time=datetime.datetime.fromisoformat(data['start']),
            end_time=datetime.datetime.fromisoformat(data['end']),
            location=data['location'],
            type=data['type'],
            created_by=current_user.id
        )
        
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'id': new_event.id,
            'message': 'Event created successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/events/<int:event_id>', methods=['PUT'])
@token_required
def update_event(current_user, event_id):
    try:
        event = Event.query.get_or_404(event_id)
        
        if not current_user.is_officer and event.created_by != current_user.id:
            return jsonify({
                'success': False,
                'error': 'Unauthorized to update this event'
            }), 403
        
        data = request.get_json()
        
        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'start' in data:
            event.start_time = datetime.datetime.fromisoformat(data['start'])
        if 'end' in data:
            event.end_time = datetime.datetime.fromisoformat(data['end'])
        if 'location' in data:
            event.location = data['location']
        if 'type' in data:
            event.type = data['type']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event updated successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@token_required
def delete_event(current_user, event_id):
    try:
        event = Event.query.get_or_404(event_id)
        
        if not current_user.is_officer and event.created_by != current_user.id:
            return jsonify({
                'success': False,
                'error': 'Unauthorized to delete this event'
            }), 403
            
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/events/<int:event_id>/rsvp', methods=['POST'])
@token_required
def rsvp_event(current_user, event_id):
    try:
        event = Event.query.get_or_404(event_id)
        
        existing_rsvp = EventRSVP.query.filter_by(
            event_id=event_id,
            user_id=current_user.id
        ).first()
        
        if existing_rsvp:
            return jsonify({
                'success': False,
                'error': 'Already RSVP\'d for this event'
            }), 400
        
        rsvp = EventRSVP(event_id=event_id, user_id=current_user.id)
        db.session.add(rsvp)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Successfully RSVP\'d for event'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/events/<int:event_id>/rsvp', methods=['DELETE'])
@token_required
def cancel_rsvp(current_user, event_id):
    try:
        rsvp = EventRSVP.query.filter_by(
            event_id=event_id,
            user_id=current_user.id
        ).first()
        
        if not rsvp:
            return jsonify({
                'success': False,
                'error': 'No RSVP found for this event'
            }), 404
            
        db.session.delete(rsvp)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Successfully cancelled RSVP'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([{
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'status': project.status,
        'team_size': project.team_size
    } for project in projects])

@app.route('/api/send-proposal', methods=['POST'])
@token_required
def send_proposal(current_user):
    try:
        data = request.json
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = app.config['SENDER_EMAIL']
        msg['To'] = "cesar.roque002@mymdc.net"  # Officer's email address
        msg['Subject'] = f"New Project Proposal: {data['title']}"
        
        # Create email body
        email_body = f"""
        New Project Proposal Submission

        Title: {data['title']}
        Category: {data['category']}
        Submitted By: {current_user.name} ({current_user.email})

        Description:
        {data['description']}

        Objectives:
        {data['objectives']}

        Required Resources:
        {data['required_resources']}

        Team Size: {data['team_size']}
        Timeline: {data['timeline']}

        Additional Information:
        {data.get('additional_info', 'None provided')}

        Preliminary Research:
        {data.get('preliminary_research', 'None provided')}

        Supervising Officer: {data.get('supervising_officer', 'To be assigned')}
        """
        
        msg.attach(MIMEText(email_body, 'plain'))
        
        # Send email
        with smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT']) as server:
            server.starttls()
            server.login(app.config['SENDER_EMAIL'], app.config['SENDER_PASSWORD'])
            server.send_message(msg)
        
        # Save proposal to database
        new_proposal = Proposal(
            title=data['title'],
            category=data['category'],
            description=data['description'],
            objectives=data['objectives'],
            required_resources=data['required_resources'],
            team_size=data['team_size'],
            timeline=data['timeline'],
            additional_info=data.get('additional_info'),
            preliminary_research=data.get('preliminary_research'),
            submitted_by=current_user.id,
            supervising_officer=data.get('supervising_officer')
        )
        
        db.session.add(new_proposal)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Proposal sent successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/proposals', methods=['GET'])
@token_required
def get_proposals(current_user):
    try:
        if current_user.is_officer:
            proposals = Proposal.query.all()
        else:
            proposals = Proposal.query.filter_by(submitted_by=current_user.id).all()
            
        return jsonify([{
            'id': proposal.id,
            'title': proposal.title,
            'category': proposal.category,
            'description': proposal.description,
            'objectives': proposal.objectives,
            'required_resources': proposal.required_resources,
            'team_size': proposal.team_size,
            'timeline': proposal.timeline,
            'additional_info': proposal.additional_info,
            'preliminary_research': proposal.preliminary_research,
            'submitted_by': proposal.submitted_by,
            'supervising_officer': proposal.supervising_officer,
            'created_at': proposal.created_at.isoformat()
        } for proposal in proposals]), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def create_president_account():
    president_email = 'cesar.roque002@mymdc.net'
    if not User.query.filter_by(email=president_email).first():
        president = User(
            email=president_email,
            password=generate_password_hash('adminSHPE2025'),
            name='Cesar Roque',
            student_id='10101010',
            is_active=True,
            is_officer=True
        )
        db.session.add(president)
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_president_account()
    app.run(debug=True)

 