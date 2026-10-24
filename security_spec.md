# Security Specification (`security_spec.md`) — NJR CELL Admin Slideshow CMS

## 1. Data Invariants
1. **Default Deny**: All paths not explicitly matched (`/slides/{slideId}`, `/admins/{adminId}`) are strictly denied (`allow read, write: if false;`).
2. **Admin Authorization (`isAdmin()`)**: A user is an authorized admin ONLY if `request.auth != null && request.auth.token.email_verified == true` AND either:
   - `request.auth.token.email == 'njrcell.official@gmail.com'` (bootstrapped owner email), OR
   - `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`
3. **Public Read Isolation on `/slides/{slideId}`**: Unauthenticated visitors or non-admin users can ONLY `get` or `list` documents in `/slides/{slideId}` where `resource.data.status == 'Published'`. Draft, Scheduled, Expired, and Archived slides are strictly hidden from non-admin queries at the database rule level.
4. **Strict Schema & Volumetric Bounds (`isValidSlide`)**:
   - Exact key allowlist (`hasAll` and `hasOnly` of the 15 required keys).
   - `title`: string, `1 <= size <= 120`
   - `subtitle`: string, `1 <= size <= 300`
   - `category`: string in `['Keuangan', 'Digital', 'Aksesori', 'Info']`
   - `buttonText`: string, `1 <= size <= 60`
   - `targetUrl`: string, `1 <= size <= 500`, matches `^https?://.+` (blocks `javascript:`, `data:`)
   - `imageUrl`: string, `1 <= size <= 350000`
   - `storagePath`: string, `size <= 300`
   - `alt`: string, `1 <= size <= 160`
   - `order`: int/number, `1 <= order <= 999`
   - `status`: string in `['Draft', 'Scheduled', 'Published', 'Expired', 'Archived']`
   - `startAt`, `endAt`: string, `size <= 40`
   - `authorUid`: string, `1 <= size <= 128`, matches `^[a-zA-Z0-9_\-]+$`
   - `createdAt`, `updatedAt`: `timestamp`, strictly equal to `request.time` on write (`createdAt` immutable on update).

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Create**: Anonymous visitor attempts to create a slide in `/slides/slide-hack` → `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: User with `email == 'njrcell.official@gmail.com'` but `email_verified == false` attempts to create/update a slide → `PERMISSION_DENIED`.
3. **Public Visitor Reading Draft Slide**: Unauthenticated user calls `get` or `list` on a slide with `status == 'Draft'` or `status == 'Archived'` → `PERMISSION_DENIED`.
4. **Shadow Field Injection on Create**: Admin sends valid slide payload plus `isSuperAdmin: true` → `PERMISSION_DENIED` (blocked by `hasOnly`).
5. **Shadow Field Injection on Update**: Admin updates slide with extra field `hacked: 1` → `PERMISSION_DENIED`.
6. **XSS URL Injection (`javascript:alert(1)`)**: Admin attempts to save `targetUrl: "javascript:alert(1)"` → `PERMISSION_DENIED` (blocked by `matches('^https?://.+')`).
7. **Denial-of-Wallet Oversized String**: Payload with `title` of 5,000 characters → `PERMISSION_DENIED` (blocked by `title.size() <= 120`).
8. **ID Poisoning Attack**: Document ID with special characters or `> 128` chars → `PERMISSION_DENIED` (blocked by `isValidId(slideId)`).
9. **Author Spoofing on Create**: Admin sets `authorUid` to someone else's UID → `PERMISSION_DENIED` (blocked by `data.authorUid == request.auth.uid`).
10. **Immutable Field Tampering on Update**: Admin attempts to modify `createdAt` or `authorUid` during update → `PERMISSION_DENIED`.
11. **Forged Client Timestamp**: Admin sends a past or future `updatedAt` instead of `serverTimestamp()` (`request.time`) → `PERMISSION_DENIED`.
12. **Self-Privilege Escalation on `/admins/{uid}`**: Non-admin user attempts to create `/admins/{theirUid}` → `PERMISSION_DENIED`.

## 3. Test Runner Specification (`firestore.rules.test.ts`)
Verifies that all 12 Dirty Dozen payloads return `PERMISSION_DENIED` while legitimate admin operations and public reads of `status == 'Published'` succeed.
