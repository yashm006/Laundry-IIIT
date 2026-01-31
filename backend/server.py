from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
import resend
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    student_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    student_id: Optional[str] = None

class LaundryItem(BaseModel):
    item_type: str
    quantity: int

class LaundryEntryCreate(BaseModel):
    student_id: str
    student_name: str
    items: List[LaundryItem]

class LaundryEntry(BaseModel):
    entry_id: str
    student_id: str
    student_name: str
    items: List[LaundryItem]
    total_items: int
    submission_date: str
    completion_date: Optional[str] = None
    status: str
    worker_id: str

class LaundryComplete(BaseModel):
    entry_id: str

class LaundryPickup(BaseModel):
    entry_id: str

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {'user_id': user_id, 'email': email, 'role': role}
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    user = await db.users.find_one({"user_id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_data.role == "student" and not user_data.student_id:
        raise HTTPException(status_code=400, detail="Student ID required for students")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "student_id": user_data.student_id
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email, user_data.role)
    
    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role,
            "student_id": user_data.student_id
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['user_id'], user['email'], user['role'])
    return {
        "token": token,
        "user": {
            "user_id": user['user_id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role'],
            "student_id": user.get('student_id')
        }
    }

# Laundry endpoints
@api_router.post("/laundry/create")
async def create_laundry_entry(entry_data: LaundryEntryCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Only workers can create entries")
    
    total_items = sum(item.quantity for item in entry_data.items)
    entry_id = str(uuid.uuid4())
    
    entry_doc = {
        "entry_id": entry_id,
        "student_id": entry_data.student_id,
        "student_name": entry_data.student_name,
        "items": [item.model_dump() for item in entry_data.items],
        "total_items": total_items,
        "submission_date": datetime.now(timezone.utc).isoformat(),
        "completion_date": None,
        "status": "received",
        "worker_id": current_user.user_id
    }
    
    await db.laundry_entries.insert_one(entry_doc)
    return {"message": "Laundry entry created", "entry_id": entry_id}

@api_router.get("/laundry/all")
async def get_all_laundry(current_user: User = Depends(get_current_user)):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Only workers can view all entries")
    
    entries = await db.laundry_entries.find({}, {"_id": 0}).sort("submission_date", -1).to_list(1000)
    return entries

@api_router.get("/laundry/student/{student_id}")
async def get_student_laundry(student_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "student" and current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Cannot access other student's data")
    
    entries = await db.laundry_entries.find({"student_id": student_id}, {"_id": 0}).sort("submission_date", -1).to_list(1000)
    return entries

@api_router.put("/laundry/complete")
async def complete_laundry(data: LaundryComplete, current_user: User = Depends(get_current_user)):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Only workers can mark as completed")
    
    entry = await db.laundry_entries.find_one({"entry_id": data.entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    completion_date = datetime.now(timezone.utc).isoformat()
    await db.laundry_entries.update_one(
        {"entry_id": data.entry_id},
        {"$set": {"status": "completed", "completion_date": completion_date}}
    )
    
    student = await db.users.find_one({"student_id": entry['student_id']}, {"_id": 0})
    if student and resend.api_key:
        items_html = "".join([f"<tr><td style='padding: 8px; border-bottom: 1px solid #E2E8F0;'>{item['item_type']}</td><td style='padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;'>{item['quantity']}</td></tr>" for item in entry['items']])
        
        html_content = f"""
        <html>
        <body style='font-family: Inter, sans-serif; background-color: #F8FAFC; padding: 20px;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);'>
                <h1 style='color: #1E3A8A; font-family: Outfit, sans-serif; font-size: 28px; margin-bottom: 16px;'>Laundry Ready for Pickup!</h1>
                <p style='color: #0F172A; font-size: 16px; margin-bottom: 24px;'>Hi {entry['student_name']},</p>
                <p style='color: #0F172A; font-size: 16px; margin-bottom: 24px;'>Your laundry is now ready for pickup. Please visit the laundry counter at your earliest convenience.</p>
                
                <div style='background-color: #F1F5F9; border-radius: 8px; padding: 20px; margin-bottom: 24px;'>
                    <h2 style='color: #1E3A8A; font-size: 18px; margin-bottom: 12px;'>Receipt Details</h2>
                    <p style='margin: 4px 0;'><strong>Student ID:</strong> {entry['student_id']}</p>
                    <p style='margin: 4px 0;'><strong>Submission Date:</strong> {datetime.fromisoformat(entry['submission_date']).strftime('%B %d, %Y %I:%M %p')}</p>
                    <p style='margin: 4px 0;'><strong>Completion Date:</strong> {datetime.fromisoformat(completion_date).strftime('%B %d, %Y %I:%M %p')}</p>
                    <p style='margin: 4px 0;'><strong>Total Items:</strong> {entry['total_items']}</p>
                </div>
                
                <table style='width: 100%; border-collapse: collapse; margin-bottom: 24px;'>
                    <thead>
                        <tr style='background-color: #1E3A8A; color: white;'>
                            <th style='padding: 12px; text-align: left;'>Item Type</th>
                            <th style='padding: 12px; text-align: right;'>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                
                <p style='color: #64748B; font-size: 14px; margin-top: 32px;'>Please save this email as your receipt.</p>
            </div>
        </body>
        </html>
        """
        
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [student['email']],
                "subject": "Your Laundry is Ready for Pickup!",
                "html": html_content
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
    
    return {"message": "Laundry marked as completed", "entry_id": data.entry_id}

@api_router.put("/laundry/pickup")
async def pickup_laundry(data: LaundryPickup, current_user: User = Depends(get_current_user)):
    entry = await db.laundry_entries.find_one({"entry_id": data.entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    if current_user.role == "student" and entry['student_id'] != current_user.student_id:
        raise HTTPException(status_code=403, detail="Cannot mark other student's laundry")
    
    await db.laundry_entries.update_one(
        {"entry_id": data.entry_id},
        {"$set": {"status": "picked_up"}}
    )
    
    return {"message": "Laundry marked as picked up", "entry_id": data.entry_id}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()