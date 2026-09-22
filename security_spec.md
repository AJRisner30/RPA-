# Security Specification — Overland Athletics Firebase Security

## 1. Data Invariants
1. **Athlete Identity Invariant**: An athlete profile document must strictly belong to the authenticated user (`data.userId == request.auth.uid`). A user can never create or update an athlete document with another user's `userId`.
2. **Log Ownership Invariant**: A workout session log must be authored by and tied to the authenticated user (`data.userId == request.auth.uid`).
3. **Immutability of Core Identifiers**: Once written, the `id`, `userId`, and `createdAt` properties of an Athlete, WorkoutLog, or CustomProgram cannot be mutated.
4. **Volume & Set Sanity**: Metric numeric fields (`durationMinutes`, `totalVolumeLbs`, `totalSetsCompleted`) must be non-negative numbers.
5. **No Blind Public Querying**: Read operations for workout logs, custom programs, and athlete personal biometrics require authentication and ownership verification (`resource.data.userId == request.auth.uid` or admin privilege).
6. **Path Hardening**: All document path IDs must conform to `isValidId(id)` (`^[a-zA-Z0-9_\\-]+$` up to 128 chars).

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Identity Spoofing on Athlete Profile)**:
   Attempting to create an athlete profile where `userId` is someone else's UID (`"victim_uid"`).
   Expected: PERMISSION_DENIED.

2. **Payload 2 (Ghost Field Injection / Shadow Update)**:
   Attempting to update an athlete profile with an arbitrary unverified property `{"isAdmin": true}` or `{"verifiedCoach": true}`.
   Expected: PERMISSION_DENIED.

3. **Payload 3 (Unauthenticated Read of Biometrics)**:
   Unauthenticated client querying `/athletes/{athleteId}`.
   Expected: PERMISSION_DENIED.

4. **Payload 4 (Log Scraping / Cross-User Query)**:
   Authenticated User A listing `/workoutLogs` without scoping query to their own `userId`.
   Expected: PERMISSION_DENIED.

5. **Payload 5 (ID Path Poisoning)**:
   Sending a document creation with a 2KB junk character string as `{logId}`.
   Expected: PERMISSION_DENIED (`isValidId` fails).

6. **Payload 6 (Forged Workout Log Ownership)**:
   User B attempting to create a workout log under User A's `userId`.
   Expected: PERMISSION_DENIED.

7. **Payload 7 (Immutable Field Tampering)**:
   User attempting to update an existing workout log to reassign `userId` to a coach or third party.
   Expected: PERMISSION_DENIED.

8. **Payload 8 (Negative Volume / Corrupt Metric Poisoning)**:
   Creating a workout log with `totalVolumeLbs: -5000` or `durationMinutes: -100`.
   Expected: PERMISSION_DENIED.

9. **Payload 9 (Date Format Violation)**:
   Creating a workout log with `date: "not-a-date"`.
   Expected: PERMISSION_DENIED (regex pattern mismatch).

10. **Payload 10 (Massive Payload Flooding / Denial of Wallet)**:
    Attempting to write an athlete profile where `notes` exceeds maximum length (e.g. 50,000 characters).
    Expected: PERMISSION_DENIED.

11. **Payload 11 (Unverified Email Admin Spoofing)**:
    Attempting admin operations using an account with unverified email or spoofed token.
    Expected: PERMISSION_DENIED.

12. **Payload 12 (Cross-User Log Deletion)**:
    User A attempting to delete User B's workout session log.
    Expected: PERMISSION_DENIED.
