# AI Academic Advisor Backend System Blueprint

Correction pass based on confirmed project decisions. This document updates the backend architecture only. No backend code is implemented here.

## Priority Legend

| Badge | Color | Meaning |
|---|---:|---|
| [CRITICAL] | `#C62828` | Required to avoid unsafe, incorrect, or broken production behavior |
| [REQUIRED] | `#E53935` | Required for the prototype/MVP flow |
| [RECOMMENDED] | `#FB8C00` | Strongly advised for a strong FYP submission |
| [OPTIONAL] | `#FDD835` | Useful only if time and scope allow |
| [FUTURE] | `#1E88E5` | Later integration or production roadmap |
| [SECURITY] | `#8E24AA` | Authentication, authorization, privacy, audit, abuse prevention |
| [DERIVED/LOCAL ONLY/NOT BACKEND] | `#757575` | Current UI-only behavior or data derived locally |
| [CURRENTLY AVAILABLE] | `#43A047` | Already present in the frontend prototype |

## 1. Corrected Architecture Decision

The intended cloud backend should be Supabase-primary with an Express API layer. Firebase remains a valid alternative for simple prototypes, but this project needs relational joins, RAG source traceability, academic rule versioning, advisor request state, and ownership policies. Supabase fits those needs better because it provides PostgreSQL, Auth, Storage, and Row Level Security in one stack.

Recommended stack:

```text
React Native
  -> Node.js / Express API
  -> Supabase Auth, PostgreSQL Database, Storage, Row Level Security
  -> Gemini and existing RAG implementation
```

[CRITICAL] Express must remain in the architecture. Core AI, RAG, rule-engine, document-processing, advisor-escalation, admin, and Gemini calls should run through Express, not directly from React Native.

## 2. Firebase vs Supabase Comparison

| Concern | Firebase | Supabase | Recommendation |
|---|---|---|---|
| Authentication | Mature Auth, good RN support. | Supabase Auth supports email/password, email verification, reset password, JWT sessions. | [REQUIRED] Supabase is sufficient and aligns with PostgreSQL/RLS. |
| React Native integration | Mature SDKs. | Mature JS client; session persistence needs explicit secure storage strategy. | [REQUIRED] Supabase works with RN. |
| Relational data | Firestore is document-oriented; joins and relational constraints are manual. | PostgreSQL is relational with constraints, joins, views, jsonb, RLS. | [CRITICAL] Supabase is stronger for academic data. |
| Conversations/messages | Firestore can model nested collections well. | PostgreSQL can model conversations, messages, citations, advisor links with referential integrity. | [REQUIRED] Supabase is preferable. |
| Message sources | Requires manual document references. | Natural FK model from `message_sources` to `document_chunks`. | [CRITICAL] Supabase is better for traceable RAG. |
| Document metadata | Firestore metadata plus Storage works. | PostgreSQL metadata plus Supabase Storage works. | [REQUIRED] Supabase is better for queryable metadata. |
| Academic rule versioning | Possible but less natural. | PostgreSQL/jsonb versioned rules are straightforward. | [CRITICAL] Supabase is better. |
| Advisor requests | Possible. | Strong relational status model and ownership rules. | [REQUIRED] Supabase is better. |
| Notifications | Firebase Cloud Messaging is strong for push. | In-app notifications are simple in PostgreSQL; push can be added later. | [RECOMMENDED] Supabase for data; Firebase only if push becomes a priority. |
| File storage | Cloud Storage is mature. | Supabase Storage with policies is adequate. | [REQUIRED] Supabase is adequate. |
| Authorization | Security rules are powerful but separate from SQL model. | RLS lives next to PostgreSQL data model. | [SECURITY] Supabase RLS fits ownership-heavy tables. |
| Development complexity | Simple at first, more custom logic for relational consistency. | More SQL upfront, less workaround for relational/RAG needs. | [RECOMMENDED] Supabase primary. |

Decision: [RECOMMENDED] Use Supabase as the primary architecture unless a later implementation constraint proves otherwise. Do not remove Express.

## 3. Current Frontend Scan Summary

| Area | Finding |
|---|---|
| Screens scanned | [CURRENTLY AVAILABLE] 9 routed screens: Login, SignUp, ForgotPassword, Home, ChatHistory, Notifications, Settings, ContactAdvisor, EditProfile. |
| Components scanned | [CURRENTLY AVAILABLE] 12 reusable components: auth fields/layout, headers, buttons, profile header, settings rows, notification cards, selector modal. |
| Navigation | [CURRENTLY AVAILABLE] `RootNavigator` defines all app routes with no backend dependency. |
| Static data | [CURRENTLY AVAILABLE] `src/data/mockData.ts` stores profile, notifications, quick questions, settings rows, and selector options. |
| Backend client | [CRITICAL] No API client, Supabase client, auth state store, or persistent session handling exists in the frontend yet. |
| Home UI | [CURRENTLY AVAILABLE] Static AI chat UI; message send only clears input or navigates to advisor on keyword. |

## 4. Corrected Authentication Architecture

Minimum authentication flow must include:

1. [REQUIRED] Register.
2. [REQUIRED] Verify email.
3. [REQUIRED] Login.
4. [REQUIRED] Restore persistent session.
5. [REQUIRED] Refresh session automatically.
6. [REQUIRED] Forgot password.
7. [REQUIRED] Reset password.
8. [SECURITY] Logout.

### Responsibility Split

| Layer | Responsibilities |
|---|---|
| Supabase Auth | [REQUIRED] Account creation, password verification, email verification, reset-password email, access token and refresh session issuance. |
| React Native | [REQUIRED] Authentication UI, session persistence, secure client session handling, auth-state navigation, logout UI, reset-password UI. |
| Express | [SECURITY] Verify Supabase JWT, enforce business authorization, protect AI/admin endpoints, map authenticated Supabase auth user to `student_profiles`, never expose service-role keys. |

[CRITICAL] Do not design a second custom password-hashing, custom refresh-token, or duplicate password table unless a later documented requirement proves Supabase Auth cannot satisfy the flow.

### Supabase Auth Data Boundary

| Data | Location |
|---|---|
| Email/password account | Supabase-managed `auth.users`. |
| Password hashes | Supabase Auth only; never duplicated in app tables. |
| Refresh sessions | Supabase Auth only; not stored in app-owned session tables. |
| Student profile | App-owned `student_profiles`, linked by `student_profiles.user_id -> auth.users.id`. |
| Role/admin capability | Express business authorization and/or controlled profile/admin tables; students must never self-assign privileged roles. |

## 5. Self-Declared Student Profile Policy

This FYP prototype is not integrated with the university information system. Students are allowed to edit their own academic profile data, but the data must be labelled clearly as:

- [REQUIRED] SELF-DECLARED
- [REQUIRED] UNVERIFIED
- [REQUIRED] NOT CONNECTED TO UTAR SYSTEM

The UI and AI responses should state that profile information is student-provided and not verified by the university.

### Student-Editable Fields

Students may edit only their own:

| Field | Type | Notes |
|---|---|---|
| `full_name` | text | Legal/full name as entered by student. |
| `preferred_name` | text | Display name. |
| `student_id` | text | Self-declared student id. |
| `programme` | text | Self-declared programme. |
| `faculty` | text | Self-declared faculty. |
| `current_year` | integer | Self-declared year. |
| `current_trimester` | integer | Self-declared trimester. |
| `academic_standing` | text enum | `NORMAL`, `PROBATION`, `WARNING`, `TERMINATED`, `GRADUATED`. Minimum demo may support only `NORMAL` and `PROBATION` if documents/rules only support those. |
| `cgpa` | numeric | Self-declared CGPA. |
| `credits_earned` | integer | Self-declared. |
| `total_credits_required` | integer | Self-declared. |
| `expected_graduation_date` | date/text | Self-declared estimate. |
| `notification_preferences` | jsonb | App preference object. |

### Required Profile Metadata

| Field | Type | Rule |
|---|---|---|
| `profile_source` | text | Default `SELF_DECLARED`. |
| `is_verified` | boolean | Default `false`; student cannot modify. |
| `last_updated_by` | uuid | Current authenticated user id or admin id. |
| `updated_at` | timestamptz | Server-generated update timestamp. |

Removed decision: [CRITICAL] Do not define a separate enrollment-mode field. Academic status is represented only by `academic_standing`.

## 6. Profile Authorization Policy

| Rule | Enforcement |
|---|---|
| Student may read own profile only. | [SECURITY] Supabase RLS and Express ownership check. |
| Student may update own editable fields only. | [SECURITY] RLS plus Express whitelist validation. |
| Student may not modify another user's profile. | [CRITICAL] `user_id = auth.uid()` policy. |
| Student may not set own role. | [CRITICAL] Role fields are not student-writable. |
| Student may not become admin/advisor. | [CRITICAL] Privileged roles controlled by backend/admin only. |
| Student may not change `is_verified`. | [CRITICAL] Backend/admin only. |
| Student may not access another student's conversations. | [CRITICAL] RLS/Express ownership. |
| Student may not access another student's notifications. | [CRITICAL] RLS/Express ownership. |
| Student may not access another student's advisor requests. | [CRITICAL] RLS/Express ownership. |

## 7. Supabase PostgreSQL Data Model

Supabase manages `auth.users`. Application tables should use PostgreSQL/Supabase-native types such as `uuid`, `timestamptz`, `jsonb`, `text`, `integer`, `numeric`, and `boolean`.

Do not duplicate password hashes or refresh tokens in application tables.

### Minimum Demo Scope Tables

Minimum Demo Scope includes Supabase Auth plus 7 application tables.

| # | Table | Purpose | Access pattern |
|---:|---|---|---|
| 1 | `student_profiles` | Self-declared, unverified student profile linked to `auth.users.id`. | Student own row direct or through Express; admin all through Express. |
| 2 | `conversations` | AI chat sessions owned by a student. | Prefer through Express. |
| 3 | `messages` | Student and assistant messages. | Through Express because AI validation is required. |
| 4 | `message_sources` | Links assistant answers to document chunks. | Read through Express. |
| 5 | `documents` | Academic document metadata. | Express/admin only. |
| 6 | `document_chunks` | RAG chunks and embeddings/source text. | Express/admin only. |
| 7 | `academic_rules` | Versioned academic rule definitions. | Read/write through Express/admin only. |

### Strong FYP Scope Tables

Strong FYP Scope adds 6 tables, for 13 application tables total.

| Added table | Purpose |
|---|---|
| `chat_feedback` | Helpful/not-helpful feedback and issue reporting. |
| `advisor_requests` | Human advisor escalation cases. |
| `advisor_request_messages` | Case comments/messages. |
| `announcements` | Admin-authored announcements. |
| `notifications` | Per-user notification inbox and read state. |
| `audit_logs` | Security/admin/business audit trail. |

### Full Planned / Optional Tables

Course catalogue tables are not core MVP unless personalised course-planning logic depends on them.

| Table | Scope | Notes |
|---|---|---|
| `courses` | [RECOMMENDED] Strong FYP or Full Planned | Needed only for structured course planning. |
| `course_prerequisites` | [RECOMMENDED] Strong FYP or Full Planned | Needed only when prerequisite checks are database-backed instead of document/rule-backed. |
| `academic_terms` | [RECOMMENDED] Strong FYP or Full Planned | Useful for deadlines and calendar reasoning. |
| `student_course_records` | [FUTURE] Full Planned | Should remain self-declared unless future university integration verifies it. |
| `support_articles` | [OPTIONAL] | Help center content. |
| `legal_documents` | [OPTIONAL] | Terms/privacy versions. |
| `feature_flags` | [OPTIONAL] | Controlled rollout. |
| `model_usage_logs` | [RECOMMENDED] | Cost/performance tracking; can be added after chat MVP. |
| `retrieval_logs` | [RECOMMENDED] | RAG debugging; can be added after chat MVP. |

## 8. Corrected Table Dictionary

### `student_profiles` [REQUIRED] [SECURITY]

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid PK | FK to Supabase `auth.users.id`. |
| `full_name` | text | Student-editable, self-declared. |
| `preferred_name` | text | Student-editable display name. |
| `student_id` | text | Student-editable, self-declared. |
| `programme` | text | Student-editable, self-declared. |
| `faculty` | text | Student-editable, self-declared. |
| `current_year` | integer | Student-editable. |
| `current_trimester` | integer | Student-editable. |
| `academic_standing` | text | One of `NORMAL`, `PROBATION`, `WARNING`, `TERMINATED`, `GRADUATED`; minimum demo may support `NORMAL`, `PROBATION`. |
| `cgpa` | numeric | Student-editable, self-declared. |
| `credits_earned` | integer | Student-editable, self-declared. |
| `total_credits_required` | integer | Student-editable, self-declared. |
| `expected_graduation_date` | text | Student-editable estimate. |
| `notification_preferences` | jsonb | Student-editable preferences. |
| `profile_source` | text | Default `SELF_DECLARED`; student cannot set arbitrary value. |
| `is_verified` | boolean | Default `false`; backend/admin only. |
| `last_updated_by` | uuid | Set by backend/RLS-aware update flow. |
| `created_at` | timestamptz | Server-generated. |
| `updated_at` | timestamptz | Server-generated. |

### `conversations` [CRITICAL]

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Conversation id. |
| `student_user_id` | uuid | FK to `auth.users.id`. |
| `title` | text | Generated from first message. |
| `status` | text | `active`, `archived`, `escalated`. |
| `last_message_at` | timestamptz | History ordering. |
| `created_at`, `updated_at` | timestamptz | Server-generated. |

### `messages` [CRITICAL]

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Message id. |
| `conversation_id` | uuid | FK to conversations. |
| `sender_type` | text | `student`, `assistant`, `advisor`, `system`. |
| `content` | text | Redact from logs. |
| `intent` | text | Classifier result. |
| `confidence` | numeric | AI confidence score or null. |
| `answer_status` | text | `answered`, `needs_advisor`, `insufficient_context`, `blocked`. |
| `response_action` | text | Suggested frontend action. |
| `metadata` | jsonb | Model, rule ids, safety flags, prompt version. |
| `created_at` | timestamptz | Immutable timestamp. |

### RAG Tables [CRITICAL]

| Table | Key columns | Notes |
|---|---|---|
| `documents` | `id uuid`, `title text`, `category text`, `visibility text`, `version integer`, `storage_path text`, `status text`, `uploaded_by uuid`, `effective_from timestamptz`, `effective_to timestamptz`, `metadata jsonb` | Admin/Express only. Metadata is queryable in Supabase PostgreSQL. |
| `document_chunks` | `id uuid`, `document_id uuid`, `chunk_index integer`, `content text`, `embedding vector/jsonb`, `token_count integer`, `page_number integer`, `section_heading text`, `metadata jsonb` | Express retrieval only. Use pgvector if enabled; otherwise store embedding externally and keep metadata in Supabase. |

### `academic_rules` [CRITICAL]

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Rule id. |
| `rule_type` | text | prerequisite, standing, deadline, attendance, graduation, advisor escalation. |
| `name` | text | Admin-readable. |
| `version` | integer | Required for rule versioning. |
| `condition_json` | jsonb | Deterministic condition. |
| `result_json` | jsonb | Deterministic result/action. |
| `status` | text | draft, active, retired. |
| `created_by`, `updated_by` | uuid | Admin ids. |
| `created_at`, `updated_at` | timestamptz | Server-generated. |

## 9. Supabase Table Ownership Matrix

| Table | Mobile SELECT direct | Mobile INSERT direct | Mobile UPDATE direct | Mobile DELETE direct | Express-only notes |
|---|---|---|---|---|---|
| `student_profiles` | Own row allowed by RLS. | Own row allowed after signup bootstrap if controlled. | Own editable fields allowed; verification fields blocked. | No. | Admin can read/update all through Express. |
| `conversations` | Prefer no; use Express. | Prefer no; use Express. | Prefer no; use Express. | Prefer no; archive through Express. | AI processing and validation required. |
| `messages` | Prefer no; use Express. | No direct insert. | No. | No. | Express creates messages after validation and AI response. |
| `message_sources` | Prefer no; use Express. | No. | No. | No. | Created by Express after RAG. |
| `documents` | No. | No. | No. | No. | Admin-only document upload and metadata management. |
| `document_chunks` | No. | No. | No. | No. | Express/admin only; students should not access raw chunks directly. |
| `academic_rules` | No direct read. | No. | No. | No. | Student reads rule results through Express only; admin writes through Express only. |
| `chat_feedback` | Own feedback allowed or Express. | Own feedback allowed or Express. | Own feedback allowed. | No. | Express preferred if feedback affects moderation/analytics. |
| `advisor_requests` | Own requests allowed. | Own create allowed only if policy permits; Express preferred. | Student limited to safe fields; status/assignment blocked. | No. | Status and assignment controlled by backend/advisor. |
| `advisor_request_messages` | Own case messages allowed. | Own case insert allowed or Express. | No or limited. | No. | Express preferred for notifications and audit. |
| `announcements` | Read published only if exposed. | No. | No. | No. | Admin writes through Express. |
| `notifications` | Own notifications allowed. | No. | Own `read_at` only. | No. | Creation through Express/admin event. |
| `audit_logs` | No. | No. | No. | No. | Express/admin only. |

## 10. Supabase Security Section

| Requirement | Policy |
|---|---|
| Mobile Supabase key | [SECURITY] The anon/publishable Supabase key may exist in the mobile app. |
| Service role key | [CRITICAL] The service-role key must never exist in the mobile app. |
| Gemini API key | [CRITICAL] Gemini API key remains backend-only in Express environment variables/secrets. |
| RLS | [CRITICAL] Enable Row Level Security on all user-owned tables. |
| Express JWT verification | [SECURITY] Express verifies Supabase access tokens before protected AI/admin endpoints. |
| Student-owned records | [SECURITY] Students can read/write only their own permitted records. |
| Admin operations | [SECURITY] Admin operations use trusted backend credentials only. |
| Profile image storage | [SECURITY] Storage policies allow users to read/update only their own profile image path, or use signed uploads through Express. |
| Academic documents storage | [CRITICAL] Admin-only upload/update/delete; students should receive cited excerpts through Express, not raw unrestricted storage access. |
| Document processing | [CRITICAL] Express worker processes documents, chunks, embeddings, and RAG indexes. |

## 11. AI Chat, RAG, and Rule Engine Flow

1. [SECURITY] React Native restores Supabase session and sends access token to Express.
2. [SECURITY] Express verifies Supabase JWT and maps `sub` to `student_profiles.user_id`.
3. [REQUIRED] Express checks profile ownership and reads self-declared profile context.
4. [REQUIRED] Express labels profile context as `SELF_DECLARED`, `UNVERIFIED`, `NOT CONNECTED TO UTAR SYSTEM`.
5. [CRITICAL] Express validates chat input and runs intent/escalation classification.
6. [CRITICAL] Express runs RAG retrieval over allowed documents/chunks.
7. [CRITICAL] Express runs academic rules for supported rule types.
8. [CRITICAL] Express calls Gemini with grounded context and safety instructions.
9. [SECURITY] Express post-checks for hallucination, prompt injection, and inappropriate reliance on unverified profile data.
10. [REQUIRED] Express saves `conversations`, `messages`, and `message_sources`.
11. [REQUIRED] React Native receives answer, citations, confidence/status, and UI actions.

### Required AI Response Notice

AI responses that use profile data should include or support a visible note:

```text
This answer uses student-provided profile information. It is self-declared, unverified, and not connected to the UTAR system.
```

## 12. Screen-to-Backend Consistency

| Frontend flow | Corrected backend flow |
|---|---|
| Sign Up | React Native UI -> Supabase Auth signup -> email verification -> create/update `student_profiles` row. |
| Login | React Native UI -> Supabase Auth login -> persist session -> navigate by auth state. |
| Forgot Password | React Native UI -> Supabase Auth reset email -> reset password flow. |
| Logout | React Native UI -> Supabase signOut -> clear auth navigation state. |
| Home AI Chat | React Native sends Supabase access token to Express -> Express verifies JWT -> AI/RAG/rules -> stores messages. |
| Chat History | Prefer Express endpoint reading own conversations/messages. |
| Notifications | Own notifications may be read via Supabase RLS or Express; read state own row only. |
| Contact Advisor | Prefer Express to create request, attach summary, enforce ownership, notify advisor/student. |
| Edit Profile | Student updates own self-declared fields only; verification/role/admin fields blocked. |

## 13. API Catalogue Adjustments

| API area | Corrected design |
|---|---|
| Auth | Use Supabase Auth client methods for register, email verification, login, session restore, refresh, forgot password, reset password, logout. |
| Protected Express APIs | All AI, RAG, rule, admin, advisor, document-processing endpoints verify Supabase JWT. |
| Profile | `GET/PATCH /v1/me/profile` may be Express-backed for validation; direct Supabase own-row updates are possible but must not expose restricted fields. |
| Chat | `POST /v1/conversations/{id}/messages` must be Express-backed. |
| RAG Documents | Admin upload/process endpoints must be Express-backed. |
| Rules | Student receives rule results through Express; admin writes rules through Express. |
| Advisor | Case creation/status/assignment preferably through Express. |
| Notifications | Student may read own notifications and update read state; creation/admin targeting through Express. |

## 14. Future University Integration

The current architecture is not connected to UTAR systems. Future integration may replace student-editable, self-declared fields with:

- [FUTURE] Official student portal synchronization.
- [FUTURE] Administrator-managed profiles.
- [FUTURE] Verified academic records.
- [FUTURE] Read-only institution-owned fields.
- [FUTURE] UTAR SSO.
- [FUTURE] Official programme, CGPA, course record, and academic standing feeds.

Do not describe this future state as current architecture. Current profile data remains self-declared and unverified.

## 15. Revised Scope Summary

| Scope | Included |
|---|---|
| Minimum Demo Scope | Supabase Auth plus `student_profiles`, `conversations`, `messages`, `message_sources`, `documents`, `document_chunks`, `academic_rules`. |
| Strong FYP Scope | Minimum tables plus `chat_feedback`, `advisor_requests`, `advisor_request_messages`, `announcements`, `notifications`, `audit_logs`. |
| Full Planned Scope | Optional course catalogue, prerequisites, academic terms, student course records, support/legal, feature flags, analytics/model/retrieval logs. |

Minimum Demo Scope table count: 7 application tables plus Supabase-managed `auth.users`.

Strong FYP Scope table count: 13 application tables total, including the 7 minimum tables plus 6 added tables.

## 16. Remaining Open Decisions

| Decision | Options |
|---|---|
| React Native session storage | Supabase default storage adapter vs secure storage package. |
| Profile writes | Direct Supabase own-row update vs Express-only validation endpoint. |
| Vector storage | Supabase `pgvector` vs existing external RAG vector implementation with metadata in Supabase. |
| Notifications | Supabase direct read/update vs Express-only notification API. |
| Admin UI | Separate web admin app vs API-only admin tooling for FYP demo. |
| Email verification UX | Deep link into app vs browser confirmation then return to login. |
| Password reset UX | Supabase deep link handling vs browser-based reset screen. |

## 17. Final Consistency Checklist

| Chain | Status |
|---|---|
| React Native auth UI -> Supabase Auth | [REQUIRED] Corrected. |
| Supabase Auth -> Express JWT verification | [SECURITY] Corrected. |
| Express JWT -> self-owned student profile | [SECURITY] Corrected. |
| Student profile -> AI Chat context | [REQUIRED] Corrected with self-declared/unverified warning. |
| AI Chat -> RAG -> Academic Rules | [CRITICAL] Kept behind Express. |
| RAG/Rules -> Supabase database | [CRITICAL] Corrected for Supabase PostgreSQL/jsonb/uuid/timestamptz. |
| Frontend response state | [REQUIRED] Should handle auth/session, answer status, citations, advisor action, validation errors. |
