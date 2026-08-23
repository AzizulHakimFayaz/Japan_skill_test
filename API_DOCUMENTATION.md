# 📚 Gakkou No Shiken (学校の試験) - REST API Documentation

**Base Production URL**: `https://japanskilltest-production.up.railway.app`  
**Local Development URL**: `http://127.0.0.1:8000`

All endpoints accept and return `application/json` unless stated otherwise.

---

## 📑 Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
   - [Register / Sign Up](#11-register--sign-up)
   - [Login](#12-login)
   - [Refresh JWT Token](#13-refresh-jwt-token)
   - [Get Current User Profile](#14-get-current-user-profile)
   - [Get Candidate Exam History & Stats](#15-get-candidate-exam-history--stats)
2. [Practice Tests & CBT Examination](#2-practice-tests--cbt-examination)
   - [List All Practice Tests](#21-list-all-practice-tests)
   - [Get Test Details](#22-get-test-details)
   - [Get Full CBT Quiz Data](#23-get-full-cbt-quiz-data)
   - [Submit Quiz Answers](#24-submit-quiz-answers)
   - [Get Official Score Report & Review](#25-get-official-score-report--review)
3. [Informational & Syllabus Data](#3-informational--syllabus-data)
   - [JFT-Basic Overview & Centers](#31-jft-basic-overview--centers)
   - [SSW Sectors & Venues](#32-ssw-sectors--venues)

---

## 1. Authentication & Authorization

All protected endpoints require the following HTTP header:
```http
Authorization: Bearer <your_access_token>
```

### 1.1 Register / Sign Up
Create a new student candidate account.

- **Endpoint**: `POST /api/auth/register/` (or `POST /api/auth/signup/`)
- **Access**: Public

#### Request Body
```json
{
  "username": "tanaka2026",
  "email": "tanaka@example.com",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

#### Success Response (`201 Created`)
```json
{
  "user": {
    "id": 12,
    "username": "tanaka2026",
    "email": "tanaka@example.com",
    "is_staff": false
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Welcome to JFT Practice, tanaka2026!"
}
```

---

### 1.2 Login
Authenticate using username **or** email address.

- **Endpoint**: `POST /api/auth/login/`
- **Access**: Public

#### Request Body
```json
{
  "username": "tanaka@example.com",
  "password": "SecurePassword123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "user": {
    "id": 12,
    "username": "tanaka2026",
    "email": "tanaka@example.com",
    "is_staff": false
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Welcome back, tanaka2026!"
}
```

---

### 1.3 Refresh JWT Token
Obtain a new access token when the current token expires.

- **Endpoint**: `POST /api/auth/token/refresh/`
- **Access**: Public

#### Request Body
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (`200 OK`)
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.4 Get Current User Profile
Fetch account details of the authenticated candidate.

- **Endpoint**: `GET /api/auth/me/`
- **Access**: Authenticated (`Bearer <token>`)

#### Success Response (`200 OK`)
```json
{
  "user": {
    "id": 12,
    "username": "tanaka2026",
    "email": "tanaka@example.com",
    "is_staff": false
  }
}
```

---

### 1.5 Get Candidate Exam History & Stats
Returns comprehensive candidate analytics: pass rate, CEFR level, section correct percentages, historical attempts, and score progression chart data.

- **Endpoint**: `GET /api/auth/my-results/`
- **Access**: Authenticated (`Bearer <token>`)

#### Success Response (`200 OK`)
```json
{
  "total_attempts": 3,
  "passed_attempts": 2,
  "pass_rate": 67,
  "highest_scaled_score": 218,
  "avg_scaled_score": 195,
  "highest_level": "A2.2 (A2)",
  "section_stats": [
    {
      "key": "script_vocab",
      "name_en": "Script & Vocabulary",
      "name_ja": "文字と語彙",
      "correct": 30,
      "total": 36,
      "pct": 83,
      "color": "rose"
    },
    {
      "key": "conversation",
      "name_en": "Conversation & Expression",
      "name_ja": "会話と表現",
      "correct": 28,
      "total": 36,
      "pct": 78,
      "color": "indigo"
    },
    {
      "key": "listening",
      "name_en": "Listening Comprehension",
      "name_ja": "聴解",
      "correct": 22,
      "total": 30,
      "pct": 73,
      "color": "amber"
    },
    {
      "key": "reading",
      "name_en": "Reading Comprehension",
      "name_ja": "読解",
      "correct": 25,
      "total": 33,
      "pct": 76,
      "color": "emerald"
    }
  ],
  "attempts": [
    {
      "id": 58,
      "test_id": 5,
      "test_title": "JFT-Basic Mock Test 1",
      "test_category": "basic",
      "score": 38,
      "total_questions": 45,
      "percentage": 84,
      "scaled_score": 212,
      "assessment_level": "A2.2 (A2)",
      "passed": true,
      "completed_at": "2026-08-23T12:30:15.000Z"
    }
  ],
  "chart_data": {
    "labels": ["Aug 21, 10:15", "Aug 22, 14:20", "Aug 23, 12:30"],
    "scores": [168, 195, 212],
    "titles": ["JFT Mock 1", "JFT Mock 1", "JFT Mock 1"]
  }
}
```

---

## 2. Practice Tests & CBT Examination

### 2.1 List All Practice Tests
Fetch all published mock tests.

- **Endpoint**: `GET /api/tests/`
- **Access**: Public
- **Query Parameters (Optional)**:
  - `category`: Filter by `basic` (JFT-Basic) or `skill` (SSW Skills)
  - `requires_account`: Filter by `true` or `false`

#### Success Response (`200 OK`)
```json
{
  "count": 4,
  "tests": [
    {
      "id": 5,
      "title": "JFT-Basic Mock Test 1",
      "description": "Full official Prometric format test with 45 questions across 4 sections.",
      "category": "basic",
      "requires_account": false,
      "is_published": true,
      "is_actual_exam_demo": true,
      "time_limit_seconds": 3600,
      "created_at": "2026-08-23T05:30:00Z",
      "question_count": 45
    }
  ]
}
```

---

### 2.2 Get Test Details
- **Endpoint**: `GET /api/tests/<id>/`
- **Access**: Public

#### Success Response (`200 OK`)
```json
{
  "id": 5,
  "title": "JFT-Basic Mock Test 1",
  "description": "Official 45 questions format",
  "category": "basic",
  "requires_account": false,
  "is_published": true,
  "is_actual_exam_demo": true,
  "time_limit_seconds": 3600,
  "created_at": "2026-08-23T05:30:00Z",
  "question_count": 45
}
```

---

### 2.3 Get Full CBT Quiz Data
Returns the structured Computer-Based Testing (CBT) screens with QuestionGroups, Questions, Media, and Multi-language Translations.

- **Endpoint**: `GET /api/tests/<id>/quiz/`
- **Access**: Public (or Authenticated if `test.requires_account = true`)

#### Success Response (`200 OK`)
```json
{
  "test": {
    "id": 5,
    "title": "JFT-Basic Mock Test 1",
    "description": "...",
    "category": "basic",
    "requires_account": false,
    "is_published": true,
    "is_actual_exam_demo": true,
    "time_limit_seconds": 3600,
    "question_count": 45
  },
  "total_questions": 45,
  "total_steps": 38,
  "steps": [
    {
      "step_number": 1,
      "section": "script_vocab",
      "group": null,
      "questions": [
        {
          "id": 101,
          "type": "image",
          "section": "script_vocab",
          "instruction": "Look at the illustration and choose the correct word.",
          "resolved_instruction": "Look at the illustration and choose the correct word.",
          "prompt": "",
          "image_url": "https://res.cloudinary.com/demo/image/upload/v1/glasses.jpg",
          "audio_url": null,
          "translations": {
            "English": "Look at the illustration and choose the correct word.",
            "Bengali": "ছবিটি দেখুন এবং সঠিক শব্দটি বেছে নিন।",
            "Indonesian": "Lihat ilustrasi dan pilih kata yang benar.",
            "Vietnamese": "Hãy nhìn hình minh họa và chọn từ đúng."
          },
          "order_index": 1,
          "group_id": null,
          "options": [
            { "id": 401, "label": "トケイ", "image_url": null, "order_index": 1 },
            { "id": 402, "label": "メガネ", "image_url": null, "order_index": 2 },
            { "id": 403, "label": "カバン", "image_url": null, "order_index": 3 },
            { "id": 404, "label": "クツ", "image_url": null, "order_index": 4 }
          ]
        }
      ]
    },
    {
      "step_number": 37,
      "section": "reading",
      "group": {
        "id": 8,
        "title": "Reading Passage F - Iroha Town Map",
        "instruction": "You are looking at a map of Iroha Town. Answer questions (1) and (2).",
        "image_url": "https://res.cloudinary.com/demo/image/upload/v1/map.png",
        "audio_url": null,
        "order_index": 44
      },
      "questions": [
        {
          "id": 144,
          "type": "image",
          "section": "reading",
          "instruction": "",
          "resolved_instruction": "You are looking at a map of Iroha Town. Answer questions (1) and (2).",
          "prompt": "夕日が きれいに 見えるのは どこですか。",
          "image_url": "https://res.cloudinary.com/demo/image/upload/v1/map.png",
          "audio_url": null,
          "translations": {},
          "order_index": 44,
          "group_id": 8,
          "options": [
            { "id": 501, "label": "やしが浜", "image_url": null, "order_index": 1 },
            { "id": 502, "label": "花山公園", "image_url": null, "order_index": 2 },
            { "id": 503, "label": "夕日の丘展望台", "image_url": null, "order_index": 3 }
          ]
        },
        {
          "id": 145,
          "type": "image",
          "section": "reading",
          "instruction": "",
          "resolved_instruction": "You are looking at a map of Iroha Town. Answer questions (1) and (2).",
          "prompt": "いろはそばが 食べられるのは どこですか。",
          "image_url": "https://res.cloudinary.com/demo/image/upload/v1/map.png",
          "audio_url": null,
          "translations": {},
          "order_index": 45,
          "group_id": 8,
          "options": [
            { "id": 504, "label": "もみじ庵", "image_url": null, "order_index": 1 },
            { "id": 505, "label": "いろはカフェ", "image_url": null, "order_index": 2 },
            { "id": 506, "label": "花山公園", "image_url": null, "order_index": 3 }
          ]
        }
      ]
    }
  ]
}
```

---

### 2.4 Submit Quiz Answers
Submits candidate answers, calculates score, and records an `Attempt`.

- **Endpoint**: `POST /api/tests/<id>/submit/`
- **Access**: Public (Stores user if JWT header is attached)

#### Request Body
Format: `{"answers": { "<question_id>": <option_id> }}`
```json
{
  "answers": {
    "101": 402,
    "102": 405,
    "144": 503,
    "145": 504
  }
}
```

#### Success Response (`201 Created`)
```json
{
  "attempt_id": 59,
  "score": 38,
  "total_questions": 45,
  "message": "Quiz submitted successfully!"
}
```

---

### 2.5 Get Official Score Report & Review
Returns the official score breakdown, Prometric scaled score (10–250), assessment level, section breakdown, and detailed question-by-question answer review.

- **Endpoint**: `GET /api/attempts/<id>/`
- **Access**: Public (or Owner only if test requires an account)

#### Success Response (`200 OK`)
```json
{
  "attempt": {
    "id": 59,
    "score": 38,
    "total_questions": 45,
    "percentage": 84,
    "scaled_score": 212,
    "scaled_score_percent": 84.17,
    "assessment_level": "A2.2 (A2)",
    "passed": true,
    "completed_at": "2026-08-23T12:35:00Z"
  },
  "test": {
    "id": 5,
    "title": "JFT-Basic Mock Test 1",
    "category": "basic"
  },
  "section_breakdown": {
    "script_vocab": {
      "name_ja": "文字と語彙",
      "name_en": "Script and Vocabulary",
      "correct": 10,
      "total": 12,
      "pct": 83
    },
    "conversation": {
      "name_ja": "会話と表現",
      "name_en": "Conversation and Expression",
      "correct": 10,
      "total": 12,
      "pct": 83
    },
    "listening": {
      "name_ja": "聴解",
      "name_en": "Listening Comprehension",
      "correct": 9,
      "total": 10,
      "pct": 90
    },
    "reading": {
      "name_ja": "読解",
      "name_en": "Reading Comprehension",
      "correct": 9,
      "total": 11,
      "pct": 82
    }
  },
  "questions": [
    {
      "id": 101,
      "type": "image",
      "section": "script_vocab",
      "instruction": "Look at the illustration and choose the correct word.",
      "resolved_instruction": "Look at the illustration and choose the correct word.",
      "prompt": "",
      "image_url": "https://res.cloudinary.com/demo/image/upload/v1/glasses.jpg",
      "audio_url": null,
      "order_index": 1,
      "selected_option_id": 402,
      "is_answered_correctly": true,
      "options": [
        { "id": 401, "label": "トケイ", "image_url": null, "is_correct": false, "order_index": 1 },
        { "id": 402, "label": "メガネ", "image_url": null, "is_correct": true, "order_index": 2 },
        { "id": 403, "label": "カバン", "image_url": null, "is_correct": false, "order_index": 3 },
        { "id": 404, "label": "クツ", "image_url": null, "is_correct": false, "order_index": 4 }
      ]
    }
  ]
}
```

---

## 3. Informational & Syllabus Data

### 3.1 JFT-Basic Overview & Centers
- **Endpoint**: `GET /api/info/jft/`
- **Access**: Public
- **Returns**: Exam structure, time limits, test center map locations (Japan & Asia), and learning resources.

### 3.2 SSW Sectors & Venues
- **Endpoint**: `GET /api/info/ssw/`
- **Access**: Public
- **Returns**: Specified Skilled Worker (SSW) 14+ industrial sectors (Nursing Care, Food Service, Agriculture, Construction, etc.) and testing center venues.

---

## 🛠 Mobile App Integration (Flutter / React Native / Swift / Kotlin)

### Quick Example (Dart / Flutter):
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

const String baseUrl = 'https://japanskilltest-production.up.railway.app';

// 1. Fetch Quiz Data
Future<Map<String, dynamic>> fetchQuizData(int testId) async {
  final res = await http.get(Uri.parse('$baseUrl/api/tests/$testId/quiz/'));
  if (res.statusCode == 200) {
    return jsonDecode(res.body);
  }
  throw Exception('Failed to load quiz');
}

// 2. Submit Answers
Future<int> submitExam(int testId, Map<String, int> answers, {String? authToken}) async {
  final headers = {'Content-Type': 'application/json'};
  if (authToken != null) {
    headers['Authorization'] = 'Bearer $authToken';
  }

  final res = await http.post(
    Uri.parse('$baseUrl/api/tests/$testId/submit/'),
    headers: headers,
    body: jsonEncode({'answers': answers}),
  );

  if (res.statusCode == 201) {
    final data = jsonDecode(res.body);
    return data['attempt_id'];
  }
  throw Exception('Failed to submit exam');
}
```
