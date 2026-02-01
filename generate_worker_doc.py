#!/usr/bin/env python3
"""
Simple worker document generator for MongoDB Atlas
Generates JSON document to manually insert into MongoDB
"""

import uuid
import bcrypt
from datetime import datetime, timezone
import json

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_worker_document(name, email, password):
    """Generate a worker document ready for insertion"""
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    worker_doc = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(password),
        "name": name,
        "role": "worker",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    return worker_doc

def main():
    print("\n" + "="*60)
    print("🔧 MONGODB ATLAS - WORKER DOCUMENT GENERATOR")
    print("="*60)
    print("\nEnter Worker Details:")
    print("-" * 40)
    
    name = input("Worker Name: ").strip()
    email = input("Worker Email: ").strip()
    password = input("Worker Password: ").strip()
    
    if not name or not email or not password:
        print("\n❌ All fields are required!")
        return
    
    worker_doc = generate_worker_document(name, email, password)
    
    print("\n" + "="*60)
    print("📋 COPY THIS DOCUMENT TO MONGODB ATLAS:")
    print("="*60)
    print("\nSteps:")
    print("1. Go to: https://cloud.mongodb.com/")
    print("2. Log in and select Cluster0")
    print("3. Click 'Browse Collections'")
    print("4. Database: laundry_db → Collection: users")
    print("5. Click 'INSERT DOCUMENT'")
    print("6. Switch to JSON view")
    print("7. Copy-paste the document below:\n")
    
    print(json.dumps(worker_doc, indent=2))
    
    print("\n" + "="*60)
    print("\n✅ After inserting, the worker can login with:")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
