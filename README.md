# 🌿 Ayur Essence

## Digital Prakriti Assessment & Ayurvedic Constitution Analysis Platform

Ayur Essence is a clinical-grade web platform for Ayurvedic practitioners (physicians and clinical scholars) to perform standardized, reproducible **Prakriti (psychophysical constitution)** assessments, calculate normalized **Vata**, **Pitta**, and **Kapha** bio-energetic distributions, and record longitudinal clinical observations.

---

## 1. Problem Statement

Ayurvedic medicine relies on identifying an individual’s innate constitution (Prakriti), determined by the equilibrium of three biological energies (Doshas): **Vata (Air & Ether)**, **Pitta (Fire & Water)**, and **Kapha (Earth & Water)**. Traditional evaluation methods often suffer from:
1. **Subjective variability**: Inconsistent weights applied across different clinic settings.
2. **Lack of reproducibility**: Scoring rules hardcoded or modified over time, rendering historical patient evaluations untraceable.
3. **Paper-based friction**: Inability to track longitudinal constitutional changes or collaborate between supervising doctors and intern students.

---

## 2. Solution

Ayur Essence provides a digital, modular architecture that standardizes Prakriti diagnosis:
- **Dynamic Scoring Snapshots**: Weights and question versions are stored inside JSONB snapshot columns with each answer, ensuring that calculations remain 100% reproducible indefinitely even if future protocols evolve.
- **Pure Domain Scoring Engine**: Completely decoupled TypeScript domain engine that enforces total score validation, division-by-zero protection, completeness validation, and deterministic tie-handling rules.
- **Strict Role-Based Access Control (RBAC)**: Distinct permissions for `DOCTOR`, `STUDENT`, and `PATIENT` roles, enforcing clinical workflows (e.g. only doctors may finalize or reopen assessments).
- **Longitudinal History & Clinical Reports**: Full timeline of prior assessments with practitioner notes and clear medical disclaimers.

---

## 3. Architecture & Modular Monolith

```text
┌─────────────────────────────────────────────────────────┐
│              React 19 + Vite Frontend                   │
│         Doctor / Student / Patient User Interfaces       │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS / REST (Axios + JWT)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Express.js API                       │
│    Helmet Security • CORS • Rate Limiting • Zod Validation│
│               JWT Authentication Middleware             │
│                     RBAC Middleware                     │
└──────────────┬─────────────┬─────────────┬──────────────┘
               │             │             │
      ┌────────▼──────┐ ┌────▼──────┐ ┌────▼────────┐
      │  AuthModule   │ │PatientMod │ │AssessmentMod│
      └───────────────┘ └───────────┘ └────┬────────┘
                                           │
                                    ┌──────▼──────┐
                                    │ScoringEngine│
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │ Prisma ORM  │
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │ PostgreSQL  │
                                    └─────────────┘
```

---

## 4. Technology Stack

### Backend
- **Runtime**: Node.js 22+ (TypeScript ES2022 / NodeNext)
- **Framework**: Express.js 4.21
- **Database**: PostgreSQL 16+
- **ORM**: Prisma ORM 6.19
- **Authentication**: JWT (JSON Web Tokens) with 60-minute expiration
- **Password Security**: bcrypt (12 cost factor rounds)
- **Request Validation**: Zod
- **API Security**: Helmet, CORS, express-rate-limit
- **Testing**: Vitest 3.2 + Supertest 7.0 (52 automated test cases)

### Frontend
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS (Ayurvedic herbal palette: Forest Sage, Amber Gold, Sky, Rose, Emerald)
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer token interceptor

---

## 5. Database Schema & Entities

The database uses PostgreSQL with Prisma ORM:

```text
USER (DOCTOR, STUDENT, PATIENT)
 │
 ├─── creates ───► PATIENT_PROFILE
 │                      │
 │                      ▼
 │                ASSESSMENT (DRAFT ──► SUBMITTED ──► FINALIZED)
 │                      │
 │             ┌────────┴────────┐
 │             ▼                 ▼
 │     ASSESSMENT_RESPONSE  OBSERVATION
 │             │
 │             ▼
 └───────── QUESTION (options JSON, scoringMap JSON)
```

### Key Models
1. **`User`**: UUID, `fullName`, unique `email`, `passwordHash`, `role` (`DOCTOR`, `STUDENT`, `PATIENT`), `isActive`.
2. **`PatientProfile`**: UUID, `fullName`, `dateOfBirth`, `gender`, `phone`, `address`, `createdBy` (FK User).
3. **`Question`**: UUID, `code` (unique), `prompt`, `options` (JSON), `scoringMap` (JSONB weights), `version`, `methodReference`, `isActive`.
4. **`Assessment`**: UUID, `patientId`, `createdBy`, `supervisingDoctorId`, `status` (`DRAFT`, `SUBMITTED`, `FINALIZED`), `vataPct`, `pittaPct`, `kaphaPct`, `dominantDosha`, `methodVersion`, `revisionNo`, `finalizedBy`, `finalizedAt`.
5. **`AssessmentResponse`**: UUID, `assessmentId`, `questionId`, `responseValue`, `scoringSnapshot` (JSONB), `vataScore`, `pittaScore`, `kaphaScore`. Composite unique constraint: `@@unique([assessmentId, questionId])` for atomic upserts.
6. **`Observation`**: UUID, `assessmentId`, `createdBy`, `notes`, `source`.

---

## 6. Prakriti Scoring Engine & Reproducibility

### Normalization Formula
For an assessment with answered questions:
$$\text{Vata Total} = \sum \text{selected Vata weights}$$
$$\text{Pitta Total} = \sum \text{selected Pitta weights}$$
$$\text{Kapha Total} = \sum \text{selected Kapha weights}$$
$$\text{Total Score} = \text{Vata Total} + \text{Pitta Total} + \text{Kapha Total}$$

$$\text{Vata \%} = \frac{\text{Vata Total}}{\text{Total Score}} \times 100$$
$$\text{Pitta \%} = \frac{\text{Pitta Total}}{\text{Total Score}} \times 100$$
$$\text{Kapha \%} = \frac{\text{Kapha Total}}{\text{Total Score}} \times 100$$

### Benchmark Example:
- **Weights:** Vata = 24, Pitta = 15, Kapha = 11 (Total = 50)
- **Percentages:** Vata = 48.0%, Pitta = 30.0%, Kapha = 22.0%
- **Dominant Dosha:** `VATA`

### Deterministic Tie-Breaking:
- Dual ties: `VATA-PITTA`, `VATA-KAPHA`, `PITTA-KAPHA` when top two Doshas share identical scores.
- Tridoshic tie: `TRIDOSHA` when all three share equal scores.
- Single dominant: `VATA`, `PITTA`, or `KAPHA`.

### Scoring Snapshot:
Every saved answer captures:
```json
{
  "questionVersion": 1,
  "methodVersion": "baseline-v1",
  "selectedOption": "Thin, narrow, prominent joints and bones",
  "weights": { "vata": 3, "pitta": 1, "kapha": 0 }
}
```
This guarantees an evaluation completed today remains 100% reproducible years later even if question scoring maps are updated.

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js 22+ installed
- npm 10+

### Setup & Run Commands

```bash
# 1. Clone or enter project root
cd "ayur esence"

# 2. Setup and run backend
cd backend
npm install
cp .env.example .env

# 3. Start local PostgreSQL engine (runs native Postgres on localhost:5432)
npm run db:start

# In a new terminal:
cd backend

# 4. Apply migrations and seed data
npm run prisma:migrate
npm run prisma:seed

# 5. Run automated test suite (52 tests)
npm test

# 6. Start backend development server
npm run dev
# Server running on http://localhost:4000
```

### Start Frontend (in a separate terminal)
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 8. Test Accounts

| Role | Email | Password | Verification Code |
|---|---|---|---|
| **Doctor / Physician** | `doctor@example.com` | `Password@123` | `AYUR-2026` |
| **Student / Scholar** | `student@example.com` | `Password@123` | `AYUR-2026` |
| **Patient** | `patient@example.com` | `Password@123` | N/A |

---

## 9. API Endpoints Reference

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Service health probe |
| `POST` | `/api/auth/register` | Public | Register practitioner/patient |
| `POST` | `/api/auth/login` | Public | Authenticate & obtain JWT |
| `GET` | `/api/patients` | `DOCTOR`, `STUDENT` | List / search patient profiles |
| `POST` | `/api/patients` | `DOCTOR`, `STUDENT` | Register new patient profile |
| `GET` | `/api/patients/:id` | `DOCTOR`, `STUDENT`, `PATIENT` | Get patient details |
| `GET` | `/api/patients/:id/history` | `DOCTOR`, `STUDENT`, `PATIENT` | Get longitudinal assessment history |
| `POST` | `/api/patients/:id/assessments` | `DOCTOR`, `STUDENT` | Start new Prakriti assessment |
| `GET` | `/api/questions` | Authenticated | Retrieve active questionnaire questions |
| `GET` | `/api/assessments/:id` | Authenticated | Get assessment details and answers |
| `PUT` | `/api/assessments/:id/responses` | `DOCTOR`, `STUDENT` | Upsert questionnaire responses |
| `POST` | `/api/assessments/:id/calculate` | `DOCTOR`, `STUDENT` | Validate completeness & calculate Doshas |
| `POST` | `/api/assessments/:id/finalize` | `DOCTOR` only | Lock assessment as finalized |
| `POST` | `/api/assessments/:id/reopen` | `DOCTOR` only | Reopen assessment for revision |
| `POST` | `/api/assessments/:id/observations` | `DOCTOR`, `STUDENT` | Add clinical practitioner notes |
| `GET` | `/api/assessments/:id/report` | Authenticated | Generate clinical assessment report |

---

## 10. Postman Automated Testing

The Postman collection is located in:
- Collection: `backend/postman/Ayur_Essence.postman_collection.json`
- Environment: `backend/postman/Ayur_Essence_Local.postman_environment.json`

### Import & Run Instructions:
1. Open Postman.
2. Click **Import** and select both JSON files from `backend/postman/`.
3. Select the **Ayur Essence Local Environment**.
4. Open **Collection Runner** and run the collection.
5. All 11 folders execute sequentially, automatically chaining authentication tokens (`doctorToken`, `studentToken`), `patientId`, and `assessmentId`, asserting HTTP response codes, JSON structures, RBAC prohibitions (`403 Forbidden` on student finalization), and scoring normalization ($\text{Vata} + \text{Pitta} + \text{Kapha} \approx 100\%$).

---

## 11. Automated Test Suite (Vitest)

Run from `backend/`:
```bash
npm test
```
Result:
```text
 ✓ tests/scoring.test.ts (9 tests)
 ✓ tests/question.test.ts (4 tests)
 ✓ tests/assessment.test.ts (8 tests)
 ✓ tests/workflow-reports.test.ts (8 tests)
 ✓ tests/patient.test.ts (6 tests)
 ✓ tests/auth.test.ts (8 tests)
 ✓ tests/rbac.test.ts (9 tests)

 Test Files  7 passed (7)
      Tests  52 passed (52)
   Duration  2.42s
```

---

## 12. Complete 2–3 Minute End-to-End Demo Flow

1. **Sign In**: Navigate to `http://localhost:5173/login`. Click **"Doctor Role"** to auto-fill credentials, then click **Sign In**.
2. **Dashboard**: Observe practitioner metrics and recent patients roster.
3. **Patient Profile**: Click **"Manage Patients"** or click on patient **"Ananya Rao"** to view demographic details and prior assessment timeline.
4. **Start Assessment**: Click **"Start Prakriti Assessment"**.
5. **Questionnaire**: Answer the 16 clinical indicators (or click the **"⚡ Quick Demo Fill"** button in the top right to instantly populate all questions).
6. **Calculate Constitution**: Click **"Calculate Prakriti Result"**.
7. **Prakriti Dossier**:
   - View computed Dominant Dosha badge (e.g. `VATA`, `PITTA`, or `KAPHA`).
   - Inspect the interactive Tridosha breakdown bars and percentages (totaling 100%).
   - Add a clinical practitioner observation note (e.g. *"Nadi indicates light, mobile Vata pulse"*).
   - Click **"Finalize & Lock Report"** to transition status to `FINALIZED`.
   - Click **"Reopen for Revision"** to demonstrate the physician revision workflow (increments revision number to 2 and returns status to `DRAFT`).

---

## 13. Medical Disclaimer

> **Important Clinical Notice:**
> The Prakriti assessment results and Dosha distributions calculated by this platform are based strictly on the configured questionnaire scoring method and are intended for educational, research, and practitioner-assisted evaluation. They do **not** constitute a standalone medical diagnosis, prescription, or clinical guarantee.
