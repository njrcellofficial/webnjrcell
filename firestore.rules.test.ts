/**
 * Firestore Security Rules Specification & Dirty Dozen Verification Suite
 * Target Rules: /firestore.rules
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authContext: {
    uid: string | null;
    email?: string;
    email_verified?: boolean;
  };
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated visitor attempts to create a slide',
    collectionPath: '/slides/slide-hack-1',
    operation: 'create',
    authContext: { uid: null },
    payload: { title: 'Hack' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified admin email spoof attempts to create a slide',
    collectionPath: '/slides/slide-hack-2',
    operation: 'create',
    authContext: {
      uid: 'spoof-uid',
      email: 'njrcell.official@gmail.com',
      email_verified: false,
    },
    payload: { title: 'Spoofed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Public visitor attempts to read a Draft slide',
    collectionPath: '/slides/draft-slide-1',
    operation: 'get',
    authContext: { uid: null },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field injection on slide create (extra key isSuperAdmin)',
    collectionPath: '/slides/slide-shadow-1',
    operation: 'create',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      title: 'Promo Valid',
      isSuperAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field injection on slide update',
    collectionPath: '/slides/slide-1',
    operation: 'update',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      unlistedField: 'injected',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'XSS javascript: URI scheme in targetUrl',
    collectionPath: '/slides/slide-xss',
    operation: 'create',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      targetUrl: 'javascript:alert(1)',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Denial-of-Wallet oversized title (> 120 chars)',
    collectionPath: '/slides/slide-dow',
    operation: 'create',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      title: 'A'.repeat(250),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'ID Poisoning with invalid characters in document ID',
    collectionPath: '/slides/invalid$id!@#',
    operation: 'create',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Author UID spoofing on create (authorUid != request.auth.uid)',
    collectionPath: '/slides/slide-spoof-author',
    operation: 'create',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      authorUid: 'other-admin-uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable field tampering on update (modifying createdAt or authorUid)',
    collectionPath: '/slides/slide-1',
    operation: 'update',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      authorUid: 'tampered-uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Forged client timestamp instead of request.time',
    collectionPath: '/slides/slide-time-forge',
    operation: 'create',
    authContext: {
      uid: 'admin-uid-1',
      email: 'njrcell.official@gmail.com',
      email_verified: true,
    },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-privilege escalation in /admins/{uid} by non-admin',
    collectionPath: '/admins/attacker-uid',
    operation: 'create',
    authContext: {
      uid: 'attacker-uid',
      email: 'attacker@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'attacker-uid',
      role: 'admin',
      addedByUid: 'attacker-uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
