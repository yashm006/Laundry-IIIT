# test_database.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

# Your credentials
username = quote_plus("yash2006")
password = quote_plus("yashita@144")  # URL-encoded
host = "cluster0.whkp9sr.mongodb.net"
db_name = "laundry_db"

# Create the MongoDB URI
MONGO_URI = f"mongodb+srv://{username}:{password}@{host}/{db_name}?retryWrites=true&w=majority"

# Create the client
client = AsyncIOMotorClient(MONGO_URI)

# Access the database
db = client[db_name]

async def test_insert():
    # Insert a test document into 'users' collection
    result = await db.users.insert_one({"name": "Yash Test", "email": "yash@test.com"})
    print("Inserted document ID:", result.inserted_id)

# Run the async function
asyncio.run(test_insert())
