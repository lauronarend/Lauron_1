#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class GolTubeAPITester:
    def __init__(self, base_url="https://goalfinder-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "email": f"test.user.{timestamp}@goltube.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['user_id']
            self.test_email = test_user['email']
            self.test_password = test_user['password']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No test user created")
            return False
            
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and 'user_id' in response:
            return True
        return False

    def test_search_goals(self):
        """Test goal search functionality"""
        search_data = {
            "query": "Pelé",
            "player": "Pelé",
            "team": "Brasil",
            "goal_type": "bicicleta",
            "max_results": 5
        }
        
        success, response = self.run_test(
            "Search Goals",
            "POST",
            "goals/search",
            200,
            data=search_data
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} videos")
            return True
        return False

    def test_search_goals_simple(self):
        """Test simple goal search"""
        search_data = {
            "query": "gol",
            "max_results": 3
        }
        
        success, response = self.run_test(
            "Simple Goal Search",
            "POST",
            "goals/search",
            200,
            data=search_data
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} videos")
            return True
        return False

    def test_get_search_history(self):
        """Test getting search history"""
        success, response = self.run_test(
            "Get Search History",
            "GET",
            "goals/history",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} history items")
            return True
        return False

    def test_logout(self):
        """Test user logout"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            self.token = None
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = temp_token
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting GolTube Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Test sequence
        tests = [
            ("Registration & Authentication", [
                self.test_user_registration,
                self.test_get_current_user,
                self.test_user_login,
            ]),
            ("Goal Search Features", [
                self.test_search_goals_simple,
                self.test_search_goals,
                self.test_get_search_history,
            ]),
            ("Security & Error Handling", [
                self.test_invalid_login,
                self.test_unauthorized_access,
            ]),
            ("Session Management", [
                self.test_logout,
            ])
        ]

        for category, test_functions in tests:
            print(f"\n📋 {category}")
            print("-" * 40)
            
            for test_func in test_functions:
                try:
                    test_func()
                except Exception as e:
                    self.log_test(test_func.__name__, False, f"Exception: {str(e)}")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")

        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")

        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = GolTubeAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())