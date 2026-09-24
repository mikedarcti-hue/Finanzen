# Security Specification - FinanZen Firestore Rules

## 1. Data Invariants
1. A user can only read, create, update, or delete documents within their own `/users/{userId}` hierarchy.
2. The `{userId}` path parameter must strictly match `request.auth.uid`.
3. Identity Spoofing Protection: Any `userId` field inside document bodies must match `request.auth.uid`.
4. Path Variable Validation: All document IDs must satisfy `isValidId(id)`: string, size <= 128, matching `^[a-zA-Z0-9_\\-]+$`.
5. Non-authenticated users have zero read or write access to any collection.
6. A user cannot access or tamper with another user's expenses, incomes, financings, or AI analyses.
7. Unbounded array attacks are forbidden.
8. Catch-all denial at the root level ensures unmapped paths are closed.

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read**: Attempting to read `/users/user_abc/expenses/exp_1` without `request.auth`.
2. **Cross-User Snooping**: Authenticated as `user_1`, attempting to read `/users/user_2/expenses/exp_2`.
3. **Cross-User Write**: Authenticated as `user_1`, attempting to write to `/users/user_2/expenses/exp_malicious`.
4. **Body Identity Spoofing**: Authenticated as `user_1`, creating document in `/users/user_1/expenses/exp_3` with payload `{ userId: 'user_2', ... }`.
5. **Junk Character Path Injection**: Writing to `/users/user_1/expenses/$$$###junk@@@` failing `isValidId`.
6. **Oversized String (Wallet Denial)**: Writing an expense with `name` exceeding 256 characters.
7. **Negative Amount**: Writing an expense with a negative amount (`amount: -500`).
8. **Invalid Status Transition Spoofing**: Sending arbitrary string for status instead of allowed values.
9. **Ghost Fields Injection**: Sending unexpected root fields like `{ isAdmin: true, role: 'admin' }`.
10. **Cross-User Subcollection Creation**: Writing to `/users/user_other/financings/fin_xyz`.
11. **Tampering with AI Analysis History of another user**: Attempting to write or delete `/users/user_other/ai_analyses/ana_1`.
12. **Root Collection Poisoning**: Attempting to write directly to `/random_collection/doc_1`.
