# BhoomiLens — Golden Tests

Version: 1.0

## Purpose

This file contains the 15 golden test scenarios for BhoomiLens.

These tests are the regression test suite for the deterministic reconciliation engine.

Every major change to the BhoomiLens engine must be tested against these scenarios.

The expected results in this file are fixed requirements.

Do NOT modify expected results just to make an implementation pass.

If an implementation fails a test, investigate and fix the implementation unless the specification itself has intentionally changed.

---

# Test Result Format

Every golden test must define:

- INPUT
- EXPECTED CONFLICTS
- EXPECTED SEVERITY
- EXPECTED PRIORITY
- EXPECTED CLARITY

---

# P001 — Clean Parcel

## Purpose

Verify that BhoomiLens correctly handles a parcel whose available records are internally consistent.

## INPUT

Create a parcel with consistent information across the available records.

Ownership, registration, mutation, tax, land-use, spatial and other available information should not contain an intentional conflict.

## EXPECTED CONFLICTS

None.

## EXPECTED SEVERITY

NONE

## EXPECTED PRIORITY

LOW

## EXPECTED CLARITY

100/100

---

# P002 — Ownership Conflict

## Purpose

Verify that BhoomiLens detects conflicting ownership information.

## INPUT

Create a parcel where relevant ownership records contain different ownership information.

Example:

Registration → Person A

Mutation → Person B

## EXPECTED CONFLICTS

OWNERSHIP_CONFLICT

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

HIGH

## EXPECTED CLARITY

75/100

---

# P003 — Mutation Pending

## Purpose

Verify that BhoomiLens correctly identifies a pending or inconsistent mutation state.

## INPUT

Create a parcel where the mutation process is pending or the available mutation information does not yet reconcile with the relevant records.

## EXPECTED CONFLICTS

MUTATION_CONFLICT

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

MEDIUM

## EXPECTED CLARITY

80/100

---

# P004 — Ancestral Ownership — HERO

## Purpose

This is the HERO golden scenario.

Verify that BhoomiLens can identify multiple ownership/lifecycle inconsistencies in an ancestral ownership situation.

## INPUT

Create an ancestral ownership scenario containing the records required by the specification to produce the expected conflicts.

## EXPECTED CONFLICTS

OWNERSHIP_CONFLICT

MUTATION_CONFLICT

LIFECYCLE_CONFLICT

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

HIGH

## EXPECTED CLARITY

41/100

---

# P005 — Area / Boundary Mismatch

## Purpose

Verify that BhoomiLens detects a mismatch involving parcel area and/or boundary information.

## INPUT

Create a parcel where relevant area or boundary information differs between applicable records/sources.

## EXPECTED CONFLICTS

AREA_MISMATCH

BOUNDARY_ANOMALY

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

MEDIUM

## EXPECTED CLARITY

70/100

---

# P006 — Land-Use Mismatch

## Purpose

Verify that BhoomiLens detects conflicting land-use information.

## INPUT

Create a parcel where relevant land-use classifications do not agree.

## EXPECTED CONFLICTS

LAND_USE_CONFLICT

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

MEDIUM

## EXPECTED CLARITY

85/100

---

# P007 — Government / Poramboke Risk

## Purpose

Verify that BhoomiLens identifies a government/poramboke risk scenario.

## INPUT

Create a parcel with the records and classification information required to represent a government/poramboke risk.

## EXPECTED CONFLICTS

Government / poramboke conflict or risk as defined by BHOOMILENS_SPEC.md.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

CRITICAL

## EXPECTED CLARITY

70/100

---

# P008 — Missing / Unavailable Data

## Purpose

Verify that BhoomiLens correctly handles missing or unavailable information.

## INPUT

Create a parcel where one or more required information sources are unavailable or information cannot be found.

## EXPECTED CONFLICTS

Missing/unavailable information according to the specification.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

LOW

## EXPECTED CLARITY

75/100

## IMPORTANT

NOT_FOUND must not automatically be treated as CONFIRMED_ABSENT.

UNAVAILABLE must not automatically be treated as CONFIRMED_ABSENT.

---

# P009 — Court Dispute

## Purpose

Verify that BhoomiLens correctly represents a parcel involved in a court dispute.

## INPUT

Create a parcel with the relevant court/dispute information required by the specification.

## EXPECTED CONFLICTS

COURT_CONFLICT

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

CRITICAL

## EXPECTED CLARITY

80/100

---

# P010 — Multiple Encumbrance

## Purpose

Verify that BhoomiLens detects multiple relevant encumbrances.

## INPUT

Create a parcel with multiple encumbrances according to the data model and specification.

## EXPECTED CONFLICTS

Multiple encumbrance condition as defined by BHOOMILENS_SPEC.md.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

HIGH

## EXPECTED CLARITY

85/100

---

# P011 — Transaction Velocity

## Purpose

Verify that BhoomiLens detects unusually frequent transactions.

## INPUT

Create a parcel with:

3 or more transactions within 12 months.

## EXPECTED CONFLICTS

Transaction velocity pattern.

## EXPECTED PATTERN

UNUSUAL_TRANSACTION_VELOCITY

## EXPECTED RESULT

Enhanced review recommended.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

MEDIUM

## EXPECTED CLARITY

80/100

---

# P012 — Circular Transaction

## Purpose

Verify that BhoomiLens detects a circular transaction pattern.

## INPUT

Create transactions forming a cycle:

A → B

B → C

C → A

## EXPECTED CONFLICTS

Circular transaction pattern.

## EXPECTED PATTERN

CIRCULAR_TRANSACTION

## EXPECTED RESULT

Enhanced review required.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

HIGH

## EXPECTED CLARITY

70/100

## IMPORTANT

The system must NOT automatically label the transaction pattern as fraud.

It should flag the pattern and recommend enhanced review.

---

# P013 — Recurring Entity

## Purpose

Verify that BhoomiLens detects a recurring entity pattern.

## INPUT

Create transaction/record data in which the same entity repeatedly appears according to the rules defined in BHOOMILENS_SPEC.md.

## EXPECTED CONFLICTS

Recurring entity pattern.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

MEDIUM

## EXPECTED CLARITY

90/100

---

# P014 — Multiple Interests

## Purpose

Verify that BhoomiLens correctly handles a parcel with multiple interests.

## INPUT

Create a parcel with multiple valid interests.

Example:

Person A → 50%

Person B → 50%

The interests must be represented using the interests model.

## EXPECTED CONFLICTS

Multiple interests condition according to BHOOMILENS_SPEC.md.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

LOW

## EXPECTED CLARITY

100/100

---

# P015 — Multiple Simultaneous Conflicts

## Purpose

Verify that BhoomiLens can detect and represent multiple different conflicts on the same parcel.

## INPUT

Create a parcel containing multiple intentionally conflicting conditions.

The scenario must combine multiple conflict types defined by BHOOMILENS_SPEC.md.

## EXPECTED CONFLICTS

Multiple simultaneous conflicts.

The exact conflict list must be defined by BHOOMILENS_SPEC.md.

## EXPECTED SEVERITY

To be defined by BHOOMILENS_SPEC.md.

## EXPECTED PRIORITY

CRITICAL

## EXPECTED CLARITY

30/100

---

# GOLDEN TEST RULES

1. All 15 golden scenarios must remain deterministic.

2. Golden test data must be intentionally designed.

3. Do not randomly generate the 15 golden scenarios.

4. Golden tests are regression tests.

5. The reconciliation engine must not use AI or ML to determine the expected results.

6. The LLM must not change golden-test results.

7. Do not modify expected test results merely to make the implementation pass.

8. If a golden test fails, investigate the implementation.

9. Preserve the original source records used to produce each conflict.

10. Every conflict must have evidence.

11. Authority must be determined using the Authority Matrix.

12. Contested authority must go to human review.

13. NOT_FOUND, CONFIRMED_ABSENT and UNAVAILABLE must remain separate states.

14. Transaction-pattern detection must be deterministic.

15. The final integrated system should achieve:

15 / 15 GOLDEN TESTS PASS
