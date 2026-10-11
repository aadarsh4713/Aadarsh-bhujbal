# ApexFit Security Specification & Threat Model

## 1. Data Invariants
- Each athlete can only read, create, update, and delete their own user profile, workouts, custom routines, and personal records stored under `/users/{userId}/...`.
- Writes to `/users/{userId}/*` must have `request.auth.uid == userId`.
- User ID and document IDs must pass alphanumeric validation (`^[a-zA-Z0-9_\-]+$`) with length `<= 128`.
- No cross-tenant access: One athlete cannot query, read, or modify another athlete's workouts or PRs.
- String boundaries: Titles `<= 120` chars, notes `<= 2000` chars, display names `<= 100` chars.

## 2. Dirty Dozen Security Payloads
1. Spoofed User ID: Attempt to write a workout to `/users/other_user_id/workouts/w1` with `auth.uid = 'victim'`.
2. Unauthenticated Write: Write to `/users/{userId}` without active auth.
3. Giant Document ID Poisoning: Creating an ID of length > 128 with arbitrary escape characters.
4. Payload Bloat: Injecting notes longer than 2,000 characters.
5. Injected Ghost Fields: Appending admin / role manipulation flags in user profile documents.
6. Identity Hijacking: Updating another user's personal records or 1RM stats.
7. Negative Numbers: Submitting negative total volume or negative workout durations.
8. Cross-collection Traversal: Attempting to query arbitrary paths outside `/users/{userId}`.
9. Malicious Type Injection: Submitting objects or arrays in numeric fields (`maxWeight`, `durationSeconds`).
10. Unbounded Array Write: Attempting to bypass limits through arbitrary list flooding.
11. Read Snooping: Attempting to list all users from `/users`.
12. Status Escalation: Attempting to modify read-only account creation timestamps.
