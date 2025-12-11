import httpx
import time
import sys

# Base URL for the local API
BASE_URL = "http://127.0.0.1:8000"

def test_update_user_flow():
    """
    Tests the flow: Register -> Login -> Update User Profile
    """
    # 1. Register a new user
    timestamp = int(time.time())
    username = f"update_user_{timestamp}"
    password = "securepassword123"
    email = f"update_{timestamp}@example.com"
    
    print(f"--- 1. Registering User: {username} ---")
    reg_payload = {
        "username": username,
        "email": email,
        "password": password,
        "exam_date": "2025-01-01"
    }
    
    try:
        reg_response = httpx.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=10.0)
        if reg_response.status_code != 200:
            print(f"❌ Registration failed: {reg_response.text}")
            sys.exit(1)
    except httpx.ConnectError:
        print(f"\n❌ Error: Could not connect to {BASE_URL}. Ensure backend is running.")
        sys.exit(1)

    # 2. Login to get token
    print(f"--- 2. Logging in ---")
    login_payload = {"username": username, "password": password}
    login_response = httpx.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=10.0)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        sys.exit(1)
        
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Update User Profile (PUT /auth/me)
    new_exam_date = "2025-12-31"
    print(f"--- 3. Updating Exam Date to {new_exam_date} ---")
    update_payload = {"exam_date": new_exam_date}
    
    update_response = httpx.put(f"{BASE_URL}/auth/me", json=update_payload, headers=headers, timeout=10.0)
    
    if update_response.status_code == 200:
        data = update_response.json()
        print("✅ Update successful!")
        print(f"Returned Exam Date: {data.get('exam_date')}")
        
        # Verify it matches (UserResponse returns datetime ISO string)
        if new_exam_date in data.get('exam_date', ''):
            print("✅ Date verification passed.")
        else:
             print(f"⚠️ Date verification warning. Expected {new_exam_date}, got {data.get('exam_date')}")

    elif update_response.status_code == 405:
        print("❌ Error 405: Method Not Allowed. The PUT endpoint might not be registered correctly.")
    else:
        print(f"❌ Update failed with status {update_response.status_code}")
        print("Response:", update_response.text)

if __name__ == "__main__":
    test_update_user_flow()
