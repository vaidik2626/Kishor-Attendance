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

## 👤 MEMBER APIs (NEW SCHEMA)

### 1. Bulk Import Members (JSON)
**POST** `{{base_url}}/api/import-json`

**Body (raw JSON):**
```json
[
  {
    "role": "KISHOR",
    "photoUrl": "https://...",
    "smkNo": "SMK001",
    "hajriNumber": "HJ001",
    "firstName": "John",
    "middleName": "A",
    "lastName": "Doe",
    "mobileNumber": "9876543210",
    "personalMobile": "9876543210",
    "homeMobile": "9876543211",
    "fatherMobile": "9876543212",
    "address": "123 Main Street",
    "pincode": "395006",
    "nativePlace": "Ahmedabad",
    "fatherOccupation": "Teacher",
    "dateOfBirth": "2005-05-15",
    "satsangDay": "Sunday",
    "bloodGroup": "B+",
    "currentStandard": "10th Grade",
    "schoolName": "ABC High School",
    "futureAspiration": "Engineer",
    "skills": "Singing, Drawing",
    "hobbies": "Cricket, Reading",
    "doesPooja": "YES",
    "hasOutsideFriends": "NO",
    "satsangAtHome": "YES",
    "balSabhaName": "Assembly A",
    "balSabhaCoordinatorName": "Leader Name",
    "sant1Name": "Saint 1",
    "sant2Name": "Saint 2",
    "haribhakta1Name": "Devotee 1",
    "haribhakta1Smk": "SMK002",
    "haribhakta1Mobile": "9876543213",
    "haribhakta2Name": "Devotee 2",
    "haribhakta2Smk": "SMK003",
    "haribhakta2Mobile": "9876543214",
    "sabhaType": "Teen assembly",
    "poshakLeaderId": "<MongoId>",
    "familyLeaderId": "<MongoId>",
    "sevaRoles": ["FOOD_SERVICE", "TEACHING"],
    "whatsappGroupAdded": { "familyKishor": true },
    "kishorStatus": "Active",
    "sabhaJoiningDate": "2025-01-01"
  }
]
```

---

### 2. Add Single Member (JSON)
**POST** `{{base_url}}/api/users`

**Body (raw JSON):**
```json
{
  "role": "KISHOR",
  "smkNo": "SMK002",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

---

### 3. Get All Members
**GET** `{{base_url}}/api/users`

---

### 4. Get Member by ID
**GET** `{{base_url}}/api/users/:id`

---

### 5. Update Member
**PUT** `{{base_url}}/api/users/:id`

**Body (form-data or raw JSON):**
- Only include fields you want to update

---

### 6. Delete Member
**DELETE** `{{base_url}}/api/users/:id`

---

## 📅 SABHA APIs (UPDATED SCHEMA)

### 1. Bulk Import Sabhas (JSON)
**POST** `{{base_url}}/api/sabhas/import-json`

**Body (raw JSON):**
```json
[
  {
    "sabhaType": "Teen assembly",
    "sabhaDate": "2025-11-23",
    "sabhaStartTime": "2025-11-23T09:00:00Z",
    "sabhaEndTime": "2025-11-23T11:00:00Z",
    "sabhaLeader": "John Doe",
    "sahSanchalak": "Jane Smith",
    "sahayak": "Bob Wilson",
    "yajman": "Alice Brown",
    "prashad": "Fruits and sweets",
    "Topic": "Spiritual Growth",
    "SabhaSanchalan": "John Doe",
    "Vakta": "Speaker Name",
    "isCancelled": false,
    "reasonForCancellation": "",
    "reason": "Weekly sabha",
    "attendance": [
      { "user": "<MongoId>", "isPresent": true, "markedAt": "2025-11-23T09:30:00Z" }
    ],
    "area": "Murtibaug",
    "visibility": "REGISTERED",
    "visibleToRoles": ["KISHOR", "POSHAK_LEADER"],
    "visibleToUsers": ["<MongoId>", "<MongoId>"] ,
    "notes": "Regular weekly assembly"
  }
]
```

---

### 2. Add Single Sabha (JSON)
**POST** `{{base_url}}/api/sabhas`

**Body (raw JSON):**
```json
{
  "sabhaType": "Teen assembly",
  "sabhaDate": "2025-11-23",
  "area": "Murtibaug"
}
```

---

### 3. Get All Sabhas
**GET** `{{base_url}}/api/sabhas`

---

### 4. Get Sabha by ID
**GET** `{{base_url}}/api/sabhas/:id`

---

### 5. Update Sabha
**PUT** `{{base_url}}/api/sabhas/:id`

**Body (raw JSON):**
- Only include fields you want to update

---

### 6. Delete Sabha
**DELETE** `{{base_url}}/api/sabhas/:id`

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
    { "userId": "674212345678901234567890", "isPresent": true },
    { "userId": "674212345678901234567891", "isPresent": false }
  ]
}
```

---

### 3. Get Sabha Attendance Report
**GET** `{{base_url}}/api/sabhas/:sabhaId/attendance/report`

---

### 4. Get User Attendance History
**GET** `{{base_url}}/api/users/:userId/attendance/history`

---

## 🔥 Testing Workflow

### Step 1: Register/Login
1. Register a new admin → Save token
2. Or login → Save token

### Step 2: Create Members
1. Create 3-5 members (Kishor, Leader, etc.)
2. Note their IDs from response

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
5. **Bulk Import**: Use raw JSON array for bulk import endpoints

---

**Happy Testing! 🚀**
