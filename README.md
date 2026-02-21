# SmartOnboarder – KYC Onboarding Platform

> AI-powered Know Your Customer (KYC) onboarding with OCR document verification, selfie identity matching, and risk-based approval decisions.

## Problem Statement

Traditional KYC processes are paper-based, slow, and error-prone. SmartOnboarder automates document ingestion, OCR-based data extraction, identity verification, and risk assessment — delivering decisions in minutes, not days.

## Solution

A role-based React application backed by Supabase that guides candidates through a structured onboarding flow while giving HR and Admin teams powerful review dashboards.

## Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Frontend    | React 18 + Vite 5                            |
| Styling     | Vanilla CSS (custom design system)           |
| Backend     | Supabase (Database + Auth + Storage)         |
| OCR         | Tesseract.js (real) with simulation fallback |
| Risk Engine | Custom AI scoring (ai.js)                    |

## Architecture

```
Browser
  └── React App (Vite)
        ├── AuthView         → 3-role login (Admin / HR / Candidate)
        ├── App.jsx          → Role-based routing + ErrorBoundary
        ├── OnboardingView   → Onboarding flow (5 steps)
        ├── AdminDashboard   → Analytics + approve/reject + interview
        └── HRDashboard      → Review + schedule interviews
              │
        Services Layer
        ├── services/db.js      → Supabase + local fallback
        ├── services/storage.js → File uploads to Supabase Storage
        ├── services/ai.js      → Risk scoring + fraud check
        └── utils/ocr.js        → Tesseract.js OCR + fallback
              │
        Supabase (Backend)
        ├── Database Tables: users, customers, cases, audit_logs
        └── Storage Bucket:  kyc-documents/{userId}/
```

## Database Design

### `users` table
| Column     | Type     | Notes                    |
|------------|----------|--------------------------|
| id         | uuid     | PK                       |
| email      | text     | Unique                   |
| password   | text     | Plain text (dev only!)   |
| name       | text     |                          |
| role       | text     | admin / hr / candidate   |

### `customers` table  
| Column                 | Type      | Notes                      |
|------------------------|-----------|----------------------------|
| id                     | uuid      | PK                         |
| user_id                | uuid      | FK → users(id)             |
| name, email, phone...  | text      | Candidate personal info    |
| doc_type, doc_number   | text      | Document info              |
| doc_extracted_name/dob | text      | OCR extracted values       |
| document_url           | text      | Supabase Storage URL       |
| selfie_url             | text      | Supabase Storage URL       |
| ocr_raw_text           | text      | Full OCR output            |
| manual_corrections     | jsonb     | Corrected OCR fields       |
| risk_score             | numeric   | 0–100                      |
| risk_level             | text      | LOW / MEDIUM / HIGH        |
| application_stage      | text      | 7-stage workflow           |
| interview_scheduled_at | timestamptz | Interview datetime       |

**Application Stages:**  
`APPLIED → DOCUMENTS_UPLOADED → UNDER_REVIEW → INTERVIEW_SCHEDULED → APPROVED / REJECTED → COMPLETED`

## Setup

### Prerequisites
- Node.js 18+
- Supabase project

### Steps

1. **Clone & install**
   ```bash
   git clone <your-repo>
   cd smartonboarder
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
   ```

3. **Set up Supabase**
   - Open your Supabase project → **SQL Editor**
   - Paste and run `supabase_schema.sql`
   - Go to **Storage** → Create bucket: `kyc-documents` (set to **private**)

4. **Run locally**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`

## Demo Credentials

| Role      | Email                       | Password   |
|-----------|-----------------------------|------------|
| Admin     | `admin@bank.com`            | `admin`    |
| HR        | `hr@bank.com`               | `hr123`    |
| Candidate | `candidate@example.com`     | `pass123`  |

> 💡 On the login page, click **⚡ Fill Demo Credentials** for instant login.

## Feature Summary

### Role-Based Access
- **Candidate** → Can only access their onboarding flow
- **HR** → Can review applications and schedule interviews
- **Admin** → Full access: approve, reject, schedule, view all

### Onboarding Flow (Candidate)
1. **Profile** — Personal details with real-time validation (age, email, DOB)
2. **Documents** — Upload JPG/PNG/PDF, real Tesseract.js OCR, editable extracted fields, raw OCR view
3. **Selfie** — Upload selfie, side-by-side comparison with document, simulated face match
4. **Risk Check** — AI risk scoring with detailed breakdown
5. **Result** — Auto-approve (LOW risk) or sent to manual review + full audit trail

### Dashboards
- **Admin**: Analytics cards (Total/Pending/Approved/Rejected/Interview), stage bar chart, full decision control (approve/reject/schedule interview), document/selfie image thumbnails
- **HR**: Analytics overview, interview scheduling, read-only application review

## Security & Compliance
- `.env` excluded from git (`.gitignore`)
- Files stored in Supabase Storage (private bucket), URLs stored in database
- Role-based access control enforced in routing
- WORM audit trail for all events
- AES-256 encryption via Supabase

## Production Considerations

> ⚠️ **Important**: The current implementation stores plain-text passwords in the database for demo purposes. In production, use **Supabase Auth** (JWT-based) and remove the `password` column from the `users` table.
