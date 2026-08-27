## 🌐 1. Base URLs & Environments

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Production Server** | **`https://gakkounoshiken.site/api/`** | **Do NOT use `www.`** (`www` is routed to Vercel frontend, root domain points to cPanel Django API) |
| **Local Development** | `http://127.0.0.1:8000/api/` | Run via `python manage.py runserver` |

> ⚠️ **IMPORTANT FOR APP DEVELOPERS**:
> Always use `https://gakkounoshiken.site/api/` (WITHOUT `www.`).
> - `https://gakkounoshiken.site/api/` → **Active Live cPanel Django REST API (200 OK)**
> - `https://www.gakkounoshiken.site` → Vercel Next.js Web Frontend

- **Protocol**: HTTPS (Production), HTTP (Local Dev)
- **Data Exchange Format**: `application/json; charset=utf-8`
- **Authentication Scheme**: JWT (JSON Web Token) — `Authorization: Bearer <access_token>`

---

## 🔐 2. Authentication & Authorization

Protected endpoints require a valid JWT access token passed in the request header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle
1. **Access Token**: Short-lived (typically 60 minutes) used for API requests.
2. **Refresh Token**: Long-lived (typically 7–30 days) used to request new access tokens via `POST /api/auth/token/refresh/`.

---

## 📋 3. Endpoint Reference Index

### Authentication & Candidate Profile (`/api/auth/`)
- `POST /api/auth/send-otp/` — Send 6-digit registration OTP to email
- `POST /api/auth/verify-otp/` — Verify OTP, create account & return JWT tokens
- `POST /api/auth/resend-otp/` — Resend verification OTP
- `POST /api/auth/login/` — Candidate login with username or email
- `POST /api/auth/google/` — Google 1-Click / OAuth ID token sign-in
- `POST /api/auth/token/refresh/` — Refresh expired JWT access token
- `GET  /api/auth/me/` — Retrieve currently authenticated user profile
- `GET  /api/auth/profile/` — Fetch editable candidate profile details
- `PUT  /api/auth/profile/` — Update candidate profile (target exam, Japanese level, bio)
- `GET  /api/auth/my-results/` — Candidate exam history, scaled scores & chart analytics

### Tests & CBT Examination Engine (`/api/tests/`)
- `GET  /api/tests/` — List all practice tests (filtered by `?category=basic|skill`)
- `GET  /api/tests/<id>/` — Single test metadata
- `GET  /api/tests/<id>/quiz/` — Structured CBT steps, questions, audio & 10 language translations
- `POST /api/tests/<id>/submit/` — Submit candidate answers & compute raw score
- `GET  /api/attempts/<id>/` — Official CEFR scorecard, 10–250 scaled score & review

### Information & Test Venues (`/api/info/`)
- `GET  /api/info/jft/` — JFT-Basic overview, syllabus & Prometric Bangladesh test centers
- `GET  /api/info/ssw/` — SSW visa overview, 12 industrial sectors & venue guides

### Leaderboard & Public Candidate Profiles (`/api/leaderboard/`, `/api/candidates/`)
- `GET  /api/leaderboard/` — Candidate national rankings (Tests passed, scaled score)
- `GET  /api/candidates/<username>/` — Public candidate profile with achievement badges

---

## 🛠 4. Detailed Endpoint Specifications

### 4.1. Send Registration OTP
* **Endpoint**: `POST /api/auth/send-otp/`
* **Auth Required**: No (Public)
* **Description**: Validates candidate registration details, creates a secure OTP record, and sends a 6-digit code to the user's email.

#### Request Body
```json
{
  "username": "tanvir_japan",
  "email": "tanvir@example.com",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "first_name": "Tanvir",
  "last_name": "Ahmed"
}
```

#### Response (200 OK)
```json
{
  "status": "success",
  "email": "tanvir@example.com",
  "message": "A 6-digit verification code has been sent to tanvir@example.com."
}
```

---

### 4.2. Verify OTP & Activate Account
* **Endpoint**: `POST /api/auth/verify-otp/`
* **Auth Required**: No (Public)
* **Description**: Verifies the 6-digit code, activates candidate user account, and returns JWT tokens.

#### Request Body
```json
{
  "email": "tanvir@example.com",
  "otp_code": "839201"
}
```

#### Response (201 Created)
```json
{
  "user": {
    "id": 42,
    "username": "tanvir_japan",
    "first_name": "Tanvir",
    "last_name": "Ahmed",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "is_staff": false,
    "profile": {
      "bio": "",
      "target_exam": "jft_basic",
      "target_exam_display": "JFT-Basic (A2 Standard)",
      "japanese_level": "n4",
      "japanese_level_display": "Elementary (N4 / A2)",
      "location": "Dhaka, Bangladesh"
    }
  },
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  },
  "message": "Email verified successfully! Welcome to Gakkou No Shiken, tanvir_japan!"
}
```

---

### 4.3. Candidate Login
* **Endpoint**: `POST /api/auth/login/`
* **Auth Required**: No (Public)
* **Description**: Authenticate with either Username OR Email + Password.

#### Request Body
```json
{
  "username": "tanvir@example.com",
  "password": "Password123!"
}
```

#### Response (200 OK)
```json
{
  "user": {
    "id": 42,
    "username": "tanvir_japan",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "is_staff": false,
    "profile": {
      "target_exam": "jft_basic",
      "japanese_level": "n4"
    }
  },
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  },
  "message": "Welcome back, tanvir_japan!"
}
```

---

### 4.4. Google 1-Click / OAuth Sign-In
* **Endpoint**: `POST /api/auth/google/`
* **Auth Required**: No (Public)
* **Description**: Verifies Google ID token from Google Identity Services. Automatically provisions user account if new.

#### Request Body
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
}
```

#### Response (200 OK)
```json
{
  "user": {
    "id": 45,
    "username": "tanvir_ahmed",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir.google@gmail.com"
  },
  "tokens": {
    "access": "...",
    "refresh": "..."
  },
  "is_new_user": false,
  "message": "Welcome back, Tanvir!"
}
```

---

### 4.5. Candidate Exam History & Analytics
* **Endpoint**: `GET /api/auth/my-results/`
* **Auth Required**: Yes (`Authorization: Bearer <access_token>`)
* **Description**: Provides candidate summary stats, scaled scores, pass rates, 4-section breakdown, and chart coordinates.

#### Response (200 OK)
```json
{
  "total_attempts": 5,
  "passed_attempts": 3,
  "pass_rate": 60,
  "highest_scaled_score": 218,
  "avg_scaled_score": 194,
  "highest_level": "A2.2 (A2)",
  "section_stats": [
    { "key": "script_vocab", "name_en": "Script & Vocabulary", "correct": 48, "total": 60, "pct": 80 },
    { "key": "conversation", "name_en": "Conversation & Expression", "correct": 45, "total": 60, "pct": 75 },
    { "key": "listening", "name_en": "Listening Comprehension", "correct": 50, "total": 60, "pct": 83 },
    { "key": "reading", "name_en": "Reading Comprehension", "correct": 42, "total": 60, "pct": 70 }
  ],
  "attempts": [
    {
      "id": 108,
      "test_id": 1,
      "test_title": "JFT-Basic Official Practice Mock Test 1",
      "test_category": "basic",
      "score": 38,
      "total_questions": 42,
      "percentage": 90,
      "scaled_score": 226,
      "assessment_level": "A2.2 (A2)",
      "passed": true,
      "completed_at": "2026-08-24T18:30:00Z"
    }
  ],
  "chart_data": {
    "labels": ["Aug 20, 14:00", "Aug 22, 10:30", "Aug 24, 18:30"],
    "scores": [180, 195, 226],
    "titles": ["Mock 1", "Mock 1", "Mock 1"]
  }
}
```

---

### 4.6. List Practice Tests
* **Endpoint**: `GET /api/tests/`
* **Query Parameters**: `?category=basic` or `?category=skill`
* **Auth Required**: No (Public)

#### Response (200 OK)
```json
{
  "tests": [
    {
      "id": 1,
      "title": "JFT-Basic Official Practice Mock Test 1",
      "description": "Authentic 60-minute Prometric simulation with 42 questions and audio listening.",
      "category": "basic",
      "requires_account": false,
      "is_published": true,
      "is_actual_exam_demo": true,
      "time_limit_seconds": 3600,
      "question_count": 42
    },
    {
      "id": 2,
      "title": "JFT-Basic Official Practice Mock Test 2",
      "category": "basic",
      "requires_account": true,
      "time_limit_seconds": 3600,
      "question_count": 42
    }
  ],
  "tests_by_category": {
    "basic": [ ... ],
    "skill": [ ... ]
  }
}
```

---

### 4.7. Get Structured CBT Quiz Data
* **Endpoint**: `GET /api/tests/<id>/quiz/`
* **Auth Required**: Conditional (Required if `test.requires_account == true`)
* **Description**: Returns CBT test screen steps, questions, options, audio URL, image URL, and 10 language translation aids.

#### Response (200 OK)
```json
{
  "test": {
    "id": 1,
    "title": "JFT-Basic Official Practice Mock Test 1",
    "time_limit_seconds": 3600
  },
  "total_questions": 42,
  "total_steps": 35,
  "steps": [
    {
      "step_number": 1,
      "section": "script_vocab",
      "group": null,
      "questions": [
        {
          "id": 101,
          "type": "single_choice",
          "section": "script_vocab",
          "instruction": "次のことばの読み方として最もよいものを、1・2・3・4から一つえらんでください。",
          "resolved_instruction": "Choose the correct reading for the underlined word.",
          "prompt": "あしたは <ins>雨</ins> がふります。",
          "image_url": null,
          "audio_url": null,
          "translations": {
            "en": "Tomorrow it will rain.",
            "bn": "আগামীকাল বৃষ্টি হবে।",
            "vi": "Ngày mai trời sẽ mưa.",
            "id": "Besok akan turun hujan.",
            "my": "မနက်ဖြန် မိုးရွာမည်။",
            "ne": "भोलि पानी पर्नेछ।",
            "th": "พรุ่งนี้ฝนจะตก",
            "zh": "明天会下雨。",
            "mn": "Маргааш бороо орно.",
            "km": "ថ្ងៃស្អែកនឹងមានភ្លៀងធ្លាក់។"
          },
          "options": [
            { "id": 401, "label": "あめ", "image_url": null, "order_index": 1 },
            { "id": 402, "label": "ゆき", "image_url": null, "order_index": 2 },
            { "id": 403, "label": "かぜ", "image_url": null, "order_index": 3 },
            { "id": 404, "label": "くもり", "image_url": null, "order_index": 4 }
          ]
        }
      ]
    }
  ]
}
```

---

### 4.8. Submit Quiz Answers
* **Endpoint**: `POST /api/tests/<id>/submit/`
* **Auth Required**: Conditional (Required if `test.requires_account == true`)

#### Request Body
```json
{
  "answers": {
    "101": 401,
    "102": 406,
    "103": 412,
    "104": null
  }
}
```

#### Response (201 Created)
```json
{
  "attempt_id": 158,
  "score": 35,
  "total_questions": 42,
  "message": "Quiz submitted successfully!"
}
```

---

### 4.9. Get Official Scorecard & Answer Review
* **Endpoint**: `GET /api/attempts/<id>/`
* **Auth Required**: Conditional (Required for private user attempts)

#### Response (200 OK)
```json
{
  "attempt": {
    "id": 158,
    "score": 35,
    "total_questions": 42,
    "percentage": 83.3,
    "passed": true,
    "scaled_score": 210,
    "assessment_level": "A2.2 (A2)",
    "scaled_score_percent": 83.3,
    "completed_at": "2026-08-25T10:15:00Z"
  },
  "test": {
    "id": 1,
    "title": "JFT-Basic Official Practice Mock Test 1"
  },
  "section_breakdown": {
    "script_vocab": { "name_ja": "文字と語彙", "name_en": "Script and Vocabulary", "correct": 10, "total": 12, "pct": 83 },
    "conversation": { "name_ja": "会話と表現", "name_en": "Conversation and Expression", "correct": 10, "total": 12, "pct": 83 },
    "listening": { "name_ja": "聴解", "name_en": "Listening Comprehension", "correct": 8, "total": 10, "pct": 80 },
    "reading": { "name_ja": "読解", "name_en": "Reading Comprehension", "correct": 7, "total": 8, "pct": 88 }
  },
  "questions": [
    {
      "id": 101,
      "prompt": "あしたは <ins>雨</ins> がふります。",
      "selected_option_id": 401,
      "is_answered_correctly": true,
      "options": [
        { "id": 401, "label": "あめ", "is_correct": true },
        { "id": 402, "label": "ゆき", "is_correct": false }
      ]
    }
  ]
}
```

---

### 4.10. National Leaderboard
* **Endpoint**: `GET /api/leaderboard/`
* **Auth Required**: No (Public)

#### Response (200 OK)
```json
{
  "total_candidates": 84,
  "top_three": [
    {
      "rank": 1,
      "username": "fayaz_sensei",
      "full_name": "Azizul Hakim Fayaz",
      "passed_attempts": 12,
      "highest_score": 248,
      "avg_score": 238,
      "pass_rate": 100,
      "target_exam_display": "JFT-Basic"
    }
  ],
  "rankings": [ ... ],
  "current_user_rank": {
    "rank": 5,
    "highest_score": 218
  }
}
```

---

## 📱 5. Mobile App Integration Example (Flutter / Dart)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class GakkouApiService {
  static const String baseUrl = "https://gakkounoshiken.site/api";
  static final _storage = const FlutterSecureStorage();

  // Helper for Headers
  static Future<Map<String, String>> _headers({bool auth = false}) async {
    final map = <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    if (auth) {
      final token = await _storage.read(key: 'jwt_access_token');
      if (token != null) {
        map['Authorization'] = 'Bearer $token';
      }
    }
    return map;
  }

  // 1. Candidate Login
  static Future<Map<String, dynamic>> login(String usernameOrEmail, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login/'),
      headers: await _headers(),
      body: jsonEncode({'username': usernameOrEmail, 'password': password}),
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode == 200) {
      await _storage.write(key: 'jwt_access_token', value: data['tokens']['access']);
      await _storage.write(key: 'jwt_refresh_token', value: data['tokens']['refresh']);
    }
    return data;
  }

  // 2. Fetch CBT Quiz Steps
  static Future<Map<String, dynamic>> getQuizData(int testId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/tests/$testId/quiz/'),
      headers: await _headers(auth: true),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 3. Submit Answers
  static Future<Map<String, dynamic>> submitQuiz(int testId, Map<String, dynamic> answers) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tests/$testId/submit/'),
      headers: await _headers(auth: true),
      body: jsonEncode({'answers': answers}),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }
}
```

---

## 🚦 6. Standard HTTP Status Codes

| Status Code | Meaning | Action / Description |
| :--- | :--- | :--- |
| **`200 OK`** | Success | Request succeeded. Response contains requested data. |
| **`201 Created`** | Created | User account created, OTP verified, or test attempt saved. |
| **`400 Bad Request`** | Validation Error | Missing fields, password mismatch, or invalid OTP code. |
| **`401 Unauthorized`** | Auth Required | Missing or expired JWT access token. Trigger refresh token flow. |
| **`403 Forbidden`** | Permission Denied | Attempting to view another candidate's private results or draft tests. |
| **`404 Not Found`** | Not Found | Target test ID, attempt ID, or username does not exist. |
| **`500 Internal Error`** | Server Error | Unexpected server error. Client should prompt retry. |
