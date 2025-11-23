# Attendance Backend API - Postman Testing Guide

## 🚀 Getting Started

### 1. Start the Server
```bash
npm start
# or
node server.js
```
Server will run on: `http://localhost:6000`

---

## 📝 Postman Collection Setup

### Base URL
Set a Postman environment variable:
- Variable: `base_url`
- Value: `http://localhost:6000`

---

## 🔐 AUTHENTICATION APIs

### 1. Register Admin
**POST** `{{base_url}}/api/auth/register`

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "id": "...",
    "username": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**⚠️ Save the token for protected routes!**

---

### 2. Login Admin
**POST** `{{base_url}}/api/auth/login`

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "username": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Profile (Protected)
**GET** `{{base_url}}/api/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👤 USER APIs

### 1. Create User (with Photo)
**POST** `{{base_url}}/api/users`

**Body (form-data):**
```
photo: [Select File]
smkNo: SMK001
name: John Doe
address: 123 Main Street
nativeVillage: Ahmedabad
personalMobile: 9876543210
homeMobile: 9876543211
fatherMobile: 9876543212
fatherOccupation: Teacher
dateOfBirth: 2005-05-15
satsangDay: Sunday
bloodGroup: B+
education: 10th Grade
currentSchool: ABC High School
futureGoal: Engineer
skills: ["Singing", "Drawing"]
hobbies: ["Cricket", "Reading"]
doWorship: true
haveFriendsOutside: false
satsangAtHome: true
childrensAssembly: Assembly A
assemblySaintsKnown: ["Saint 1", "Saint 2"]
hariDevoteesKnown: ["Devotee 1", "Devotee 2"]
poshakLeader: Leader Name
assemblyType: Teen assembly
poshakLeaderSelection: Leader 1
familyLeaderSelection: Family Leader 1
sevaRole: Music
whatsappGroupAdded: true
familyTeen: Family Teen A
teenStatus: regular
```

---

### 2. Get All Users
**GET** `{{base_url}}/api/users`

---

### 3. Get User by ID
**GET** `{{base_url}}/api/users/:userId`

Replace `:userId` with actual user ID from MongoDB

---

### 4. Update User
**PUT** `{{base_url}}/api/users/:userId`

**Body (form-data):** (Same as create, but only fields you want to update)
```
name: John Updated Doe
personalMobile: 9999999999
```

---

### 5. Delete User
**DELETE** `{{base_url}}/api/users/:userId`

---

## 📅 SABHA APIs

### 1. Create Sabha
**POST** `{{base_url}}/api/sabhas`

**Body (JSON):**
```json
{
  "sabhaType": "Teen assembly",
  "sabhaDate": "2025-11-23",
  "sabhaLeader": "John Doe",
  "sahSanchalak": "Jane Smith",
  "sahayak": "Bob Wilson",
  "yajman": "Alice Brown",
  "prashad": "Fruits and sweets",
  "isCancelled": false,
  "reason": "Weekly sabha",
  "notes": "Regular weekly assembly"
}
```

---

### 2. Get All Sabhas
**GET** `{{base_url}}/api/sabhas`

**Query Parameters (Optional):**
```
?sabhaType=Teen assembly
?startDate=2025-11-01
?endDate=2025-11-30
?isCancelled=false
```

---

### 3. Get Sabha by ID
**GET** `{{base_url}}/api/sabhas/:sabhaId`

---

### 4. Update Sabha
**PUT** `{{base_url}}/api/sabhas/:sabhaId`

**Body (JSON):**
```json
{
  "sabhaLeader": "Updated Leader",
  "prashad": "Updated prashad details"
}
```

---

### 5. Delete Sabha
**DELETE** `{{base_url}}/api/sabhas/:sabhaId`

---

## ✅ ATTENDANCE APIs

### 1. Mark Single User Attendance
**POST** `{{base_url}}/api/sabhas/:sabhaId/attendance`

**Body (JSON):**
```json
{
  "userId": "674212345678901234567890",
  "isPresent": true
}
```

---

### 2. Mark Bulk Attendance
**POST** `{{base_url}}/api/sabhas/:sabhaId/attendance/bulk`

**Body (JSON):**
```json
{
  "attendanceList": [
    {
      "userId": "674212345678901234567890",
      "isPresent": true
    },
    {
      "userId": "674212345678901234567891",
      "isPresent": false
    },
    {
      "userId": "674212345678901234567892",
      "isPresent": true
    }
  ]
}
```

---

### 3. Get Sabha Attendance Report
**GET** `{{base_url}}/api/sabhas/:sabhaId/attendance/report`

**Response:**
```json
{
  "success": true,
  "data": {
    "sabhaNo": "SAB000001",
    "sabhaType": "Teen assembly",
    "sabhaDate": "2025-11-23",
    "totalPresent": 18,
    "totalAbsent": 2,
    "totalUsers": 20,
    "presentUsers": [...],
    "absentUsers": [...]
  }
}
```

---

### 4. Get User Attendance History
**GET** `{{base_url}}/api/users/:userId/attendance/history`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "smkNo": "SMK001",
      "attendanceNumber": "ATT000001"
    },
    "statistics": {
      "totalSabhas": 20,
      "totalPresent": 18,
      "totalAbsent": 2,
      "attendancePercentage": "90.00%"
    },
    "history": [...]
  }
}
```

---

## 🔥 Testing Workflow

### Step 1: Register/Login
1. Register a new admin → Save token
2. Or login → Save token

### Step 2: Create Users
1. Create 3-5 users with photos
2. Note their user IDs from response

### Step 3: Create Sabha
1. Create a new sabha
2. Note sabha ID from response

### Step 4: Mark Attendance
1. Use bulk attendance API
2. Mark users as present/absent

### Step 5: View Reports
1. Get sabha attendance report
2. Get individual user attendance history

---

## 📸 Photo Upload in Postman

For photo uploads:
1. Select **Body** tab
2. Choose **form-data**
3. For `photo` field:
   - Hover over key name
   - Click dropdown that appears
   - Select **File** (not Text)
   - Click "Select Files" to choose image

---

## ⚠️ Common Issues

1. **Token Missing**: Add `Authorization: Bearer YOUR_TOKEN` in Headers
2. **Invalid User ID**: Use MongoDB ObjectId format (24 characters)
3. **Photo Upload**: Use form-data, not JSON for file uploads
4. **Arrays in form-data**: Use JSON format: `["item1", "item2"]`

---

## 🎯 Quick Test Endpoints

```
✅ POST /api/auth/register
✅ POST /api/auth/login
✅ POST /api/users (with form-data)
✅ GET /api/users
✅ POST /api/sabhas
✅ GET /api/sabhas
✅ POST /api/sabhas/:sabhaId/attendance/bulk
✅ GET /api/sabhas/:sabhaId/attendance/report
✅ GET /api/users/:userId/attendance/history
```

---

**Happy Testing! 🚀**
