import requests
import sys
import json
from datetime import datetime

class LaundrySystemTester:
    def __init__(self, base_url="https://campus-laundry.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.worker_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.timestamp = datetime.now().strftime('%H%M%S')
        self.worker_email = f"worker_{self.timestamp}@test.com"
        self.student_email = f"student_{self.timestamp}@test.com"
        self.student_id = f"STU{self.timestamp}"
        self.test_entry_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            return response
        except Exception as e:
            return None

    def test_worker_registration(self):
        """Test worker registration"""
        data = {
            "email": self.worker_email,
            "password": "WorkerPass123!",
            "name": "Test Worker",
            "role": "worker"
        }
        
        response = self.make_request('POST', '/auth/register', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'token' in response_data and 'user' in response_data:
                self.worker_token = response_data['token']
                self.log_test("Worker Registration", True)
                return True
            else:
                self.log_test("Worker Registration", False, "Missing token or user in response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Worker Registration", False, f"Status: {status}")
        
        return False

    def test_student_registration(self):
        """Test student registration with student ID"""
        data = {
            "email": self.student_email,
            "password": "StudentPass123!",
            "name": "Test Student",
            "role": "student",
            "student_id": self.student_id
        }
        
        response = self.make_request('POST', '/auth/register', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'token' in response_data and 'user' in response_data:
                self.student_token = response_data['token']
                user = response_data['user']
                if user.get('student_id') == self.student_id:
                    self.log_test("Student Registration", True)
                    return True
                else:
                    self.log_test("Student Registration", False, "Student ID not saved correctly")
            else:
                self.log_test("Student Registration", False, "Missing token or user in response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Student Registration", False, f"Status: {status}")
        
        return False

    def test_worker_login(self):
        """Test worker login"""
        data = {
            "email": self.worker_email,
            "password": "WorkerPass123!"
        }
        
        response = self.make_request('POST', '/auth/login', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'token' in response_data:
                self.log_test("Worker Login", True)
                return True
            else:
                self.log_test("Worker Login", False, "Missing token in response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Worker Login", False, f"Status: {status}")
        
        return False

    def test_student_login(self):
        """Test student login"""
        data = {
            "email": self.student_email,
            "password": "StudentPass123!"
        }
        
        response = self.make_request('POST', '/auth/login', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'token' in response_data:
                self.log_test("Student Login", True)
                return True
            else:
                self.log_test("Student Login", False, "Missing token in response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Student Login", False, f"Status: {status}")
        
        return False

    def test_create_laundry_entry(self):
        """Test creating laundry entry as worker"""
        if not self.worker_token:
            self.log_test("Create Laundry Entry", False, "No worker token available")
            return False
        
        data = {
            "student_id": self.student_id,
            "student_name": "Test Student",
            "items": [
                {"item_type": "Shirt", "quantity": 3},
                {"item_type": "Pants", "quantity": 2}
            ]
        }
        
        response = self.make_request('POST', '/laundry/create', data, self.worker_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'entry_id' in response_data:
                self.test_entry_id = response_data['entry_id']
                self.log_test("Create Laundry Entry", True)
                return True
            else:
                self.log_test("Create Laundry Entry", False, "Missing entry_id in response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Create Laundry Entry", False, f"Status: {status}")
        
        return False

    def test_get_all_laundry_entries(self):
        """Test getting all laundry entries as worker"""
        if not self.worker_token:
            self.log_test("Get All Laundry Entries", False, "No worker token available")
            return False
        
        response = self.make_request('GET', '/laundry/all', token=self.worker_token)
        
        if response and response.status_code == 200:
            entries = response.json()
            if isinstance(entries, list):
                self.log_test("Get All Laundry Entries", True)
                return True
            else:
                self.log_test("Get All Laundry Entries", False, "Response is not a list")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get All Laundry Entries", False, f"Status: {status}")
        
        return False

    def test_get_student_laundry(self):
        """Test getting student's laundry entries"""
        if not self.student_token:
            self.log_test("Get Student Laundry", False, "No student token available")
            return False
        
        response = self.make_request('GET', f'/laundry/student/{self.student_id}', token=self.student_token)
        
        if response and response.status_code == 200:
            entries = response.json()
            if isinstance(entries, list):
                self.log_test("Get Student Laundry", True)
                return True
            else:
                self.log_test("Get Student Laundry", False, "Response is not a list")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Student Laundry", False, f"Status: {status}")
        
        return False

    def test_complete_laundry(self):
        """Test marking laundry as completed"""
        if not self.worker_token or not self.test_entry_id:
            self.log_test("Complete Laundry", False, "No worker token or entry ID available")
            return False
        
        data = {"entry_id": self.test_entry_id}
        response = self.make_request('PUT', '/laundry/complete', data, self.worker_token)
        
        if response and response.status_code == 200:
            self.log_test("Complete Laundry", True)
            return True
        else:
            status = response.status_code if response else "No response"
            self.log_test("Complete Laundry", False, f"Status: {status}")
        
        return False

    def test_pickup_laundry(self):
        """Test marking laundry as picked up"""
        if not self.student_token or not self.test_entry_id:
            self.log_test("Pickup Laundry", False, "No student token or entry ID available")
            return False
        
        data = {"entry_id": self.test_entry_id}
        response = self.make_request('PUT', '/laundry/pickup', data, self.student_token)
        
        if response and response.status_code == 200:
            self.log_test("Pickup Laundry", True)
            return True
        else:
            status = response.status_code if response else "No response"
            self.log_test("Pickup Laundry", False, f"Status: {status}")
        
        return False

    def test_unauthorized_access(self):
        """Test unauthorized access scenarios"""
        # Test student trying to create entry
        if self.student_token:
            data = {
                "student_id": "TEST123",
                "student_name": "Test",
                "items": [{"item_type": "Shirt", "quantity": 1}]
            }
            response = self.make_request('POST', '/laundry/create', data, self.student_token)
            
            if response and response.status_code == 403:
                self.log_test("Student Cannot Create Entry", True)
            else:
                self.log_test("Student Cannot Create Entry", False, "Should return 403")
        
        # Test student accessing other student's data
        if self.student_token:
            response = self.make_request('GET', '/laundry/student/OTHER123', token=self.student_token)
            
            if response and response.status_code == 403:
                self.log_test("Student Cannot Access Other's Data", True)
            else:
                self.log_test("Student Cannot Access Other's Data", False, "Should return 403")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Backend API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 50)
        
        # Authentication tests
        self.test_worker_registration()
        self.test_student_registration()
        self.test_worker_login()
        self.test_student_login()
        
        # Laundry management tests
        self.test_create_laundry_entry()
        self.test_get_all_laundry_entries()
        self.test_get_student_laundry()
        self.test_complete_laundry()
        self.test_pickup_laundry()
        
        # Security tests
        self.test_unauthorized_access()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = LaundrySystemTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())