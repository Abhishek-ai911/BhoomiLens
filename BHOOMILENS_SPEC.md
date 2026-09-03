# BHOOMILENS — TECHNICAL SPECIFICATION

Version: 1.0
Project: BhoomiLens — SIH 2026

---

# 1. PROJECT OVERVIEW

## 1.1 What is BhoomiLens?

BhoomiLens is a land-record reconciliation and decision-support system.

Its purpose is to collect and compare information related to a land parcel from different records, identify inconsistencies and conflicts, show the evidence behind those conflicts, calculate Clarity and Priority, detect important transaction patterns, and support human investigation and resolution.

BhoomiLens is NOT an automatic fraud-decision system.

The system identifies conflicts and patterns using deterministic rules and presents evidence to a human reviewer.

---

# 2. CORE OBJECTIVE

The system must:

1. Identify a land parcel.
2. Collect its available records.
3. Standardize information from different records.
4. Reconcile the information.
5. Detect conflicts and anomalies.
6. Determine the relevant source authority.
7. Produce evidence for every detected conflict.
8. Calculate Clarity.
9. Calculate Priority.
10. Detect transaction patterns.
11. Present results to government officers.
12. Present a simplified view to citizens.
13. Allow cases to be created and reviewed.
14. Maintain an audit trail.
15. Use an LLM only to explain deterministic results.

---

# 3. CORE PRINCIPLES

## 3.1 Deterministic First

The core BhoomiLens intelligence must use deterministic rules.

Do NOT use:

- AI for conflict detection
- ML for fraud detection
- LLMs for ownership decisions
- probabilistic guessing

## 3.2 Evidence First

Every conflict must be supported by evidence from actual records.

## 3.3 Authority Aware

The system must determine which source has authority for a particular attribute and jurisdiction.

## 3.4 Human Review

BhoomiLens supports human decision-making.

It must not silently make legal or ownership decisions.

## 3.5 Open World

Missing information must not automatically be treated as proof that something does not exist.

---

# 4. TECHNOLOGY STACK

## Frontend / Application

- Next.js
- TypeScript
- Tailwind CSS

## Database

- Supabase
- PostgreSQL
- PostGIS

## Authentication

- Supabase Auth

## Deployment

- Vercel

## Maps

- MapLibre

## Charts

- Recharts

## AI Explanation

- LLM API

## Optional

- jsPDF
- qrcode

---

# 5. TECHNOLOGIES NOT ALLOWED

Do NOT introduce:

- FastAPI
- Docker
- Neo4j
- Redis
- separate backend
- microservices
- blockchain
- ML fraud detection

The application should remain a simple, maintainable architecture.

---

# 6. SYSTEM ARCHITECTURE

The high-level architecture is:

User
 ↓
Next.js Application
 ↓
Supabase
 ↓
PostgreSQL + PostGIS
 ↓
Deterministic BhoomiLens Engine
 ↓
Conflict + Evidence
 ↓
Clarity + Priority
 ↓
Case / Human Review
 ↓
Audit

AI explanation is a separate layer:

Deterministic Result
 ↓
Evidence
 ↓
LLM
 ↓
Human-readable Explanation

The LLM must never replace the deterministic engine.

---

# 7. CORE DATABASE TABLES

The system must contain these core tables:

1. parcels
2. persons
3. interests
4. records
5. transactions
6. conflicts
7. authority_rules
8. cases
9. audit_logs

Do NOT create:

parcels.owner_id

Ownership must be represented through the interests model.

---

# 8. PARCELS

The parcels entity represents the land parcel.

Important fields include:

- parcel_id
- ULPIN
- geometry
- area
- classification

The geometry must use PostGIS.

A parcel may have multiple interests and multiple historical/current records.

---

# 9. PERSONS

The persons entity represents people/entities associated with parcels.

Important information includes:

- person_id
- name
- relevant identity information as defined by the implementation

Persons may be associated with parcels through interests.

---

# 10. INTERESTS

The interests entity represents ownership and other interests in a parcel.

Do not simplify ownership to a single parcel owner.

An interest may contain:

- parcel_id
- person/entity
- interest_type
- share
- status
- validity period

The system must support multiple interests.

---

# 11. RECORDS

Records represent information originating from different sources.

A record should be associated with:

- parcel
- person where applicable
- record type
- source
- payload/value
- status
- valid_from
- valid_to
- recorded_at

Records are the primary input to reconciliation.

---

# 12. OPEN-WORLD DATA STATES

The system must support:

PRESENT

The information is available.

NOT_FOUND

The requested information was not found.

CONFIRMED_ABSENT

The system has evidence that the information is absent.

CONFLICTING

Available records disagree.

UNAVAILABLE

The information could not be accessed or obtained.

These states must not be treated as interchangeable.

---

# 13. BITEMPORAL DATA

Where specified, records must support:

- valid_from
- valid_to
- recorded_at

valid_from and valid_to describe the validity period of information.

recorded_at describes when the information was recorded by the system/source.

---

# 14. RECONCILIATION PIPELINE

The core pipeline is:

RECORDS
 ↓
STANDARDIZATION
 ↓
RECONCILIATION
 ↓
CONFLICT
 ↓
EVIDENCE

The system must compare relevant records according to deterministic rules.

---

# 15. STANDARDIZATION

Records from different sources must be normalized into a common representation before comparison.

Standardization must not change the meaning of source data.

The original source and record identity must remain available for evidence.

---

# 16. CONFLICT DETECTION

The reconciliation engine must support:

1. Ownership mismatch
2. Mutation mismatch
3. Tax mismatch
4. Area mismatch
5. Boundary anomaly
6. Land-use mismatch
7. Court conflict
8. Freshness issues
9. Missing/unavailable information

Additional conflict types must only be added if defined by this specification.

---

# 17. OWNERSHIP RECONCILIATION

Compare ownership/interests across relevant records.

Potential result:

OWNERSHIP_CONFLICT

The system must preserve the underlying records that caused the conflict.

The system must not automatically declare fraud.

---

# 18. MUTATION RECONCILIATION

Compare mutation information with relevant ownership and registration information.

Potential result:

MUTATION_CONFLICT

Mutation information must be evaluated according to the Authority Matrix.

---

# 19. TAX RECONCILIATION

Compare relevant tax records with the appropriate parcel/person/ownership information.

Potential result:

TAX_CONFLICT

The system must show the records and values involved.

---

# 20. AREA RECONCILIATION

Compare reported parcel areas from relevant authoritative sources.

Potential result:

AREA_MISMATCH

The system must preserve the source values and comparison.

---

# 21. BOUNDARY / SPATIAL RECONCILIATION

Use PostGIS geometry for parcel boundaries.

Detect relevant boundary anomalies according to defined deterministic rules.

Potential result:

BOUNDARY_ANOMALY

---

# 22. LAND-USE RECONCILIATION

Compare land-use classification across relevant records.

Potential result:

LAND_USE_CONFLICT

---

# 23. COURT CONFLICT

Where relevant court/dispute information exists, it must be represented in the parcel's conflict/evidence information.

The system must not invent court information.

---

# 24. FRESHNESS

The system must consider the freshness of information where required.

Freshness should be calculated using defined deterministic rules.

The system must distinguish old information from current information.

---

# 25. AUTHORITY MATRIX

Authority must be determined using:

JURISDICTION
+
ATTRIBUTE
 ↓
AUTHORITY RULE
 ↓
RELEVANT SOURCE

Example:

Rajasthan + Cadastral Geometry
→ Survey

Rajasthan + Mutation
→ Revenue

Rajasthan + Registered Transaction
→ Registration

These are examples from the current roadmap and should be encoded through authority_rules rather than scattered hard-coded logic.

---

# 26. CONTESTED AUTHORITY

If legitimate sources compete and no clear authority rule resolves the conflict:

CONTESTED AUTHORITY
 ↓
HUMAN REVIEW

There must be no silent winner.

---

# 27. EVIDENCE

Every conflict must contain understandable evidence.

Evidence should include, where applicable:

- What?
- Why?
- Source?
- Record ID?
- Date?
- Value?
- Comparison?
- Applicable authority

A reviewer must be able to understand why the conflict was created.

---

# 28. CLARITY

Clarity represents how internally consistent and complete the available parcel information is.

Clarity must be deterministic.

Example:

Clarity: 82/100

Clarity must not be generated by an LLM.

## 28.1 Clarity Formula & Deduction Rules

Clarity is calculated deterministically on a scale of 0 to 100:

Base Score = 100
Final Clarity = max(0, min(100, 100 - Total Deductions))

### Conflict Deductions:
- GOVERNMENT_LAND_RISK = -30
- OWNERSHIP_CONFLICT = -25
- COURT_CONFLICT = -20
- CIRCULAR_TRANSACTION = -20
- MUTATION_CONFLICT = -20
- AREA_MISMATCH = -15
- BOUNDARY_ANOMALY = -15
- LAND_USE_CONFLICT = -15
- MULTIPLE_ENCUMBRANCE = -15
- LIFECYCLE_CONFLICT = -14
- UNUSUAL_TRANSACTION_VELOCITY = -10
- RECURRING_ENTITY = -10
- TAX_CONFLICT = -10
- MISSING_RECORD_CONFLICT = 0

### Open-World Incompleteness Deductions:
- PRESENT = 0
- CONFIRMED_ABSENT = 0
- NOT_FOUND = -10
- UNAVAILABLE = -15
- CONFLICTING = handled by specific conflict type

Important: MISSING_RECORD_CONFLICT must never cause an additional deduction beyond open-world state deductions.

---

# 29. PRIORITY

Priority represents how urgently an officer should investigate the parcel.

Priority is separate from Clarity.

Priority must be deterministic.

## 29.1 Priority Decision Hierarchy

Priority must be evaluated strictly in this top-down order:

### 1. CRITICAL
- GOVERNMENT_LAND_RISK
- Active COURT_CONFLICT
- >=4 distinct simultaneous active conflict types

### 2. HIGH
- OWNERSHIP_CONFLICT
- LIFECYCLE_CONFLICT
- CIRCULAR_TRANSACTION
- MULTIPLE_ENCUMBRANCE

### 3. MEDIUM
- MUTATION_CONFLICT
- AREA_MISMATCH
- BOUNDARY_ANOMALY
- LAND_USE_CONFLICT
- TAX_CONFLICT
- UNUSUAL_TRANSACTION_VELOCITY
- RECURRING_ENTITY
- NOT_FOUND (open-world unindexed record)
- UNAVAILABLE (open-world system outage)

### 4. LOW
- No active conflict/risk flags
- Clean parcels (P001)
- Valid co-ownership interests (P014)

---

# 30. CLARITY VS PRIORITY

Do not confuse:

Clarity
=
How consistent/complete is the information?

Priority
=
How urgently should the parcel be investigated?

A parcel may have low Clarity without necessarily having high Priority.
Priority is strictly independent from Clarity.

---

# 31. TRANSACTION DATA

Transactions must be stored in PostgreSQL.

Do not introduce a graph database.

Transactions should support analysis of relationships between parties/parcels and transaction timing.

---

# 32. TRANSACTION PATTERN DETECTION

The system must support deterministic transaction-pattern detection.

Required patterns include:

1. Transaction velocity
2. Circular transactions
3. Recurring entities where specified

---

# 33. TRANSACTION VELOCITY

Example rule from the roadmap:

3+ transactions
within 12 months

→

Unusual transaction velocity

→

Enhanced review recommended

The exact threshold must be treated as a deterministic rule.

---

# 34. CIRCULAR TRANSACTIONS

Example:

A → B
B → C
C → A

This represents a circular transaction pattern.

The system should flag:

Circular transaction pattern
Enhanced review required

The system must not automatically label this as fraud.

---

# 35. RECURRING ENTITY

Detect recurring entities according to deterministic transaction rules.

The pattern must be explainable through evidence.

---

# 36. GOLDEN DATASET

Create 15 important golden parcels.

P001 — Clean

P002 — Ownership conflict

P003 — Mutation pending

P004 — Ancestral ownership — HERO

P005 — Area/boundary mismatch

P006 — Land-use mismatch

P007 — Government/poramboke risk

P008 — Missing/unavailable data

P009 — Court dispute

P010 — Multiple encumbrance

P011 — Transaction velocity

P012 — Circular transaction

P013 — Recurring entity

P014 — Multiple interests

P015 — Multiple simultaneous conflicts

These scenarios must be intentionally constructed.

Do not randomly generate them.

---

# 37. GOLDEN TESTS

Every golden scenario must have deterministic expected results.

Each test must define:

- INPUT
- EXPECTED CONFLICTS
- EXPECTED SEVERITY
- EXPECTED PRIORITY
- EXPECTED CLARITY

Example P004:

Expected conflicts:

OWNERSHIP_CONFLICT
MUTATION_CONFLICT
LIFECYCLE_CONFLICT

Expected priority:

HIGH

Expected clarity:

41/100

---

# 38. OFFICER WORKFLOW

Officer Dashboard
 ↓
Priority Queue
 ↓
Conflict
 ↓
Case
 ↓
Assign
 ↓
Under Verification
 ↓
Resolve / Reject / More Info
 ↓
Audit

---

# 39. CASES

A case represents a conflict or investigation that requires human review.

A case should preserve:

- conflict
- evidence
- assigned person
- status
- actions
- timestamps
- audit information

---

# 40. AUDIT LOG

Important actions must be auditable.

The audit system should record relevant actions such as:

- case creation
- assignment
- status change
- resolution
- rejection
- additional-information request

Do not silently alter historical decisions.

---

# 41. CITIZEN WORKFLOW

Citizen workflow:

ULPIN
 ↓
Parcel
 ↓
Simple Status
 ↓
Known Conflicts
 ↓
Evidence Summary
 ↓
Report Issue

The citizen experience should be simpler than the officer dashboard.

---

# 42. AI EXPLANATION

The LLM is only an explanation layer.

Architecture:

DATABASE
 ↓
DETERMINISTIC ENGINE
 ↓
CONFLICT + EVIDENCE
 ↓
LLM
 ↓
EXPLANATION

The LLM must NOT:

- determine whether a conflict exists
- create new conflicts
- change severity
- change priority
- change clarity
- decide authority
- make ownership decisions
- make fraud decisions
- invent evidence

If evidence is insufficient, the explanation must say so.

---

# 43. END-TO-END FLOW

MAP
 ↓
PARCEL
 ↓
RECORDS
 ↓
RECONCILIATION
 ↓
CONFLICT
 ↓
EVIDENCE
 ↓
CLARITY + PRIORITY
 ↓
AI EXPLANATION
 ↓
CASE
 ↓
HUMAN REVIEW
 ↓
AUDIT

---

# 44. USER ROLES

Primary user types:

1. Government Officer
2. Citizen

The system may have administrative/development roles as required, but additional roles must not be invented without a defined requirement.

---

# 45. MAP EXPERIENCE

The map must:

1. Display parcel geometry.
2. Allow parcel selection.
3. Connect the selected polygon to its parcel profile.
4. Load real database information.
5. Avoid fake parcel information.

---

# 46. PARCEL PROFILE

The parcel profile should provide:

- Overview
- Ownership
- Registration
- Mutation
- Tax
- Land Use
- Spatial
- Clarity
- Priority
- Conflicts
- Records
- Evidence

---

# 47. DATA INTEGRITY RULES

The system must:

- preserve source information
- preserve record IDs
- preserve timestamps
- preserve historical validity
- use explicit foreign keys
- avoid duplicate business logic
- avoid fake evidence
- avoid invented records

---

# 48. ERROR HANDLING

The system must clearly handle:

- unavailable data
- missing records
- conflicting records
- failed database operations
- failed map loading
- failed AI explanation
- empty results

An AI failure must not break the deterministic conflict system.

---

# 49. SECURITY PRINCIPLES

Use Supabase authentication and appropriate database access controls.

Do not expose sensitive internal information to citizens.

Citizen views must not automatically expose internal government workflow information.

---

# 50. PERFORMANCE PRINCIPLES

Keep the architecture simple.

Do not introduce unnecessary microservices or infrastructure.

Use PostgreSQL for transaction analysis.

Use PostGIS for spatial operations.

---

# 51. TESTING REQUIREMENTS

The golden tests are regression tests.

Every significant change to the reconciliation engine must run the relevant golden tests.

The final target is:

15 / 15 GOLDEN TESTS PASS

Do not modify expected results merely to make tests pass.

If the implementation fails a golden test, investigate the implementation.

---

# 52. DEPLOYMENT

The application must be deployable through Vercel.

The production/demo application must connect to the intended Supabase project.

The final demo must use working data.

---

# 53. OPTIONAL FEATURES

Only implement these after the core system works:

- PDF report
- QR code
- Hindi/English
- planning view
- additional analytics

These are lower priority than the core reconciliation, authority/evidence, and transaction-pattern features.

---

# 54. NON-NEGOTIABLE FEATURES

The following must not be sacrificed:

1. Reconciliation
2. Authority + Evidence
3. Transaction Pattern Detection

These represent:

Reconciliation
→ Product

Authority + Evidence
→ Credibility

Transaction Pattern Detection
→ Differentiation

---

# 55. IMPLEMENTATION ORDER

The implementation order is:

1. Specification
2. Database
3. Golden dataset
4. Golden tests
5. Basic application
6. Clickable parcel
7. Map
8. Parcel profile
9. Reconciliation
10. Conflict engine
11. Authority Matrix
12. Evidence
13. Clarity
14. Priority
15. Government workflow
16. Citizen workflow
17. AI explanation
18. Transaction patterns
19. Integration
20. Testing
21. UI polish
22. Freeze/demo

---

# 56. AI CODING RULES

Every AI coding task must follow:

READ
 ↓
UNDERSTAND
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REPORT
 ↓
STOP

Before modifying anything:

1. Read BHOOMILENS_SPEC.md.
2. Inspect the existing implementation.
3. Identify exactly which files need modification.
4. Explain the implementation plan.

Then implement ONLY the requested task.

Do NOT:

- redesign architecture
- add unrelated features
- modify unrelated files
- change business rules
- change golden tests
- invent requirements
- replace deterministic logic with AI

After implementation:

1. Run relevant tests.
2. Report failures honestly.
3. List modified files.
4. Explain important decisions.
5. Verify existing functionality still works.

STOP.
