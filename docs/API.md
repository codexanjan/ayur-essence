# 🌿 Ayur Essence — API Specification Document

This document provides complete technical specifications for the **Ayur Essence** REST API.

- **Base URL:** `http://localhost:4000/api`
- **Authentication:** Standard HTTP Bearer Token (`Authorization: Bearer <token>`)
- **Format:** JSON (`Content-Type: application/json`)

---

## 1. System Health

### `GET /api/health`
Verifies API server status and availability.

- **Authentication:** None (Public)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Ayur Essence API is running"
}
```

---

## 2. Authentication & Authorization

### `POST /api/auth/register`
Registers a new practitioner (Doctor or Student) or Patient user. Privileged roles (`DOCTOR`, `STUDENT`) require a valid staff registration code.

- **Authentication:** None (Public)
- **Request Body:**
```json
{
  "fullName": "Dr. Rahul Sharma",
  "email": "doctor@example.com",
  "password": "Password@123",
  "role": "DOCTOR",
  "registrationCode": "AYUR-2026"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "12766ba4-fa98-4b68-9765-751353526c60",
      "fullName": "Dr. Rahul Sharma",
      "email": "doctor@example.com",
      "role": "DOCTOR",
      "isActive": true,
      "createdAt": "2026-09-19T12:47:35.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Errors:**
  - `400 BAD_REQUEST`: Invalid registration code or password complexity failure.
  - `409 RESOURCE_CONFLICT`: Email already registered.

---

### `POST /api/auth/login`
Authenticates user credentials and returns a signed 60-minute JWT token.

- **Authentication:** None (Public)
- **Request Body:**
```json
{
  "email": "doctor@example.com",
  "password": "Password@123"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "12766ba4-fa98-4b68-9765-751353526c60",
      "fullName": "Dr. Rahul Sharma",
      "email": "doctor@example.com",
      "role": "DOCTOR"
    }
  }
}
```
- **Errors:**
  - `401 UNAUTHORIZED`: Invalid email or password (`INVALID_CREDENTIALS`).

---

## 3. Patient Management

### `POST /api/patients`
Registers a new patient profile.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`
- **Request Body:**
```json
{
  "fullName": "Ananya Rao",
  "dateOfBirth": "1998-05-12",
  "gender": "FEMALE",
  "phone": "9876543210",
  "address": "Mysuru, Karnataka"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "c138fd94-f28c-4a37-8e65-21d74659b02a",
      "fullName": "Ananya Rao",
      "dateOfBirth": "1998-05-12T00:00:00.000Z",
      "gender": "FEMALE",
      "phone": "9876543210",
      "address": "Mysuru, Karnataka",
      "createdBy": "12766ba4-fa98-4b68-9765-751353526c60",
      "createdAt": "2026-09-19T12:48:00.000Z"
    },
    "id": "c138fd94-f28c-4a37-8e65-21d74659b02a"
  }
}
```

---

### `GET /api/patients/:id`
Fetches patient profile details and assessment summaries.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`, `PATIENT` (linked self only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "c138fd94-f28c-4a37-8e65-21d74659b02a",
      "fullName": "Ananya Rao",
      "assessments": []
    },
    "id": "c138fd94-f28c-4a37-8e65-21d74659b02a"
  }
}
```

---

### `GET /api/patients/:id/history`
Returns chronological assessment history for a patient.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`, `PATIENT` (linked self only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patientId": "c138fd94-f28c-4a37-8e65-21d74659b02a",
    "patientName": "Ananya Rao",
    "assessments": [
      {
        "id": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
        "date": "2026-09-19T12:48:00.000Z",
        "vataPct": 48.0,
        "pittaPct": 30.0,
        "kaphaPct": 22.0,
        "dominantDosha": "VATA",
        "status": "FINALIZED",
        "revisionNo": 1
      }
    ]
  }
}
```

---

## 4. Questionnaire

### `GET /api/questions`
Loads all active clinical Prakriti indicators. Internal scoring maps are withheld server-side.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`, `PATIENT`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "methodVersion": "baseline-v1",
    "total": 16,
    "questions": [
      {
        "id": "84897f10-ff9a-41df-a7da-c20e2ef5b6d9",
        "code": "BODY_FRAME",
        "prompt": "How would you describe your overall physical body frame?",
        "answerType": "SINGLE_CHOICE",
        "options": [
          "Thin, narrow, prominent joints and bones",
          "Medium, well-proportioned, athletic",
          "Broad, sturdy, large-boned and solid"
        ],
        "version": 1,
        "methodReference": "baseline-v1"
      }
    ]
  }
}
```

---

## 5. Assessments & Scoring

### `POST /api/patients/:id/assessments`
Initializes a new assessment session in `DRAFT` status under revision 1.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`
- **Request Body:**
```json
{
  "methodVersion": "baseline-v1"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
    "patientId": "c138fd94-f28c-4a37-8e65-21d74659b02a",
    "status": "DRAFT",
    "methodVersion": "baseline-v1",
    "revisionNo": 1,
    "createdAt": "2026-09-19T12:48:00.000Z"
  }
}
```

---

### `PUT /api/assessments/:id/responses`
Saves or updates questionnaire responses. Implements database upsert on `(assessmentId, questionId)` and computes reproducible scoring snapshots.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`
- **Request Body:**
```json
{
  "responses": [
    {
      "questionId": "84897f10-ff9a-41df-a7da-c20e2ef5b6d9",
      "responseValue": "Thin, narrow, prominent joints and bones"
    }
  ]
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
    "count": 1,
    "responses": [
      {
        "id": "e0b1965a-02bf-48f5-93ca-ee65278784d0",
        "questionId": "84897f10-ff9a-41df-a7da-c20e2ef5b6d9",
        "responseValue": "Thin, narrow, prominent joints and bones",
        "scoringSnapshot": {
          "questionVersion": 1,
          "methodVersion": "baseline-v1",
          "selectedOption": "Thin, narrow, prominent joints and bones",
          "weights": { "vata": 3, "pitta": 1, "kapha": 0 }
        },
        "vataScore": 3.0,
        "pittaScore": 1.0,
        "kaphaScore": 0.0
      }
    ]
  }
}
```

---

### `POST /api/assessments/:id/calculate`
Validates assessment completeness, aggregates weights, computes normalized V/P/K percentages, determines dominant Dosha, and transitions status to `SUBMITTED`.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
    "status": "SUBMITTED",
    "methodVersion": "baseline-v1",
    "revisionNo": 1,
    "result": {
      "vataPct": 48.0,
      "pittaPct": 30.0,
      "kaphaPct": 22.0,
      "dominantDosha": "VATA",
      "scoreTotals": {
        "vata": 24,
        "pitta": 15,
        "kapha": 11,
        "total": 50
      }
    }
  }
}
```
- **Errors:**
  - `422 UNPROCESSABLE_ENTITY`: Assessment incomplete (`ASSESSMENT_INCOMPLETE`). Returns list of `missingQuestionIds`.

---

### `POST /api/assessments/:id/finalize`
Doctor locks a submitted assessment, transitioning it to `FINALIZED`.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR` (Students and Patients receive `403 FORBIDDEN`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
    "status": "FINALIZED",
    "finalizedBy": "Dr. Rahul Sharma",
    "finalizedAt": "2026-09-19T12:49:00.000Z"
  }
}
```
- **Errors:**
  - `400 BAD_REQUEST`: Cannot finalize assessment in DRAFT status.
  - `409 CONFLICT`: Assessment already finalized.

---

### `POST /api/assessments/:id/reopen`
Doctor reopens a finalized assessment for clinical revision. Increments `revisionNo` and sets status back to `DRAFT`.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR` (Students and Patients receive `403 FORBIDDEN`)
- **Request Body:**
```json
{
  "reason": "Revision requested during practitioner review"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
    "status": "DRAFT",
    "revisionNo": 2,
    "message": "Assessment successfully reopened for revision 2."
  }
}
```

---

## 6. Observations & Clinical Reports

### `POST /api/assessments/:id/observations`
Records clinical practitioner notes (e.g. pulse, tongue, general physical observations).

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`
- **Request Body:**
```json
{
  "notes": "Pulse examination demonstrates light, dry Vata characteristics.",
  "source": "PRACTITIONER"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "observation": {
      "id": "b3e94321-995a-4e2b-b461-71fa8d39e230",
      "notes": "Pulse examination demonstrates light, dry Vata characteristics.",
      "source": "PRACTITIONER",
      "createdAt": "2026-09-19T12:49:15.000Z"
    },
    "id": "b3e94321-995a-4e2b-b461-71fa8d39e230"
  }
}
```

---

### `GET /api/assessments/:id/report`
Generates comprehensive clinical assessment report including patient profile, constitution percentages, practitioner notes, and the official disclaimer.

- **Authentication:** Bearer JWT
- **Allowed Roles:** `DOCTOR`, `STUDENT`, `PATIENT` (linked self only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportTitle": "Ayur Essence Prakriti Assessment Report",
    "disclaimer": "This Prakriti assessment result is based on the configured questionnaire scoring method and is not a standalone medical diagnosis.",
    "generatedAt": "2026-09-19T12:49:30.000Z",
    "patient": {
      "id": "c138fd94-f28c-4a37-8e65-21d74659b02a",
      "fullName": "Ananya Rao",
      "gender": "FEMALE"
    },
    "assessment": {
      "id": "765ba1d8-4f11-4fa2-bc91-3829031ef189",
      "status": "FINALIZED",
      "methodVersion": "baseline-v1",
      "revisionNo": 1,
      "dominantDosha": "VATA"
    },
    "prakritiConstitution": {
      "vataPct": 48.0,
      "pittaPct": 30.0,
      "kaphaPct": 22.0,
      "dominantDosha": "VATA"
    },
    "observations": []
  }
}
```
