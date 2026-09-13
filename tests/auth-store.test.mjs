import assert from 'node:assert/strict'
import test from 'node:test'

import * as authStoreModule from '../src/stores/auth-store.js'

const {
  AUTH_STORAGE_KEY,
  activateAuthSession,
  getAuthExpiration,
  isAuthSessionValid,
  readAuthState,
  removeAuthSession,
  upsertAuthSession,
  writeAuthState
} = authStoreModule

function createJwt(payload) {
  const encode = value =>
    Buffer.from(JSON.stringify(value)).toString('base64url')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

function createSession(userId, overrides = {}) {
  return {
    userId,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    accessToken: createJwt({ exp: 4_102_444_800, userId }),
    tokenType: 'Bearer',
    expiresAt: '2099-12-31T00:00:00.123456789Z',
    ...overrides
  }
}

function createStorage(initialValue) {
  const values = new Map()
  if (initialValue !== undefined) {
    values.set(AUTH_STORAGE_KEY, initialValue)
  }

  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
    has: key => values.has(key)
  }
}

test('auth session uses the earlier JWT and API expiration', () => {
  const accessToken = createJwt({ exp: 1_787_616_000, userId: 1 })
  const session = {
    accessToken,
    tokenType: 'Bearer',
    expiresAt: '2026-08-24T23:52:07.786883433Z'
  }

  assert.equal(getAuthExpiration(session), 1_787_615_527_786)
  assert.equal(isAuthSessionValid(session, 1_787_615_527_000), true)
  assert.equal(isAuthSessionValid(session, 1_787_615_527_786), false)
})

test('auth cache restores multiple sanitized sessions and the active account', () => {
  assert.equal(typeof writeAuthState, 'function')
  assert.equal(typeof readAuthState, 'function')

  const storage = createStorage()
  const first = createSession(1, { phone: '01000000000' })
  const second = createSession(2)

  writeAuthState(
    {
      activeUserId: '2',
      sessions: [second, first]
    },
    storage
  )

  const restored = readAuthState(storage, Date.parse('2026-08-18T00:00:00Z'))

  assert.equal(restored.activeUserId, '2')
  assert.deepEqual(
    restored.sessions.map(session => session.userId),
    [2, 1]
  )
  assert.equal('phone' in restored.sessions[1], false)
})

test('legacy, damaged, and empty auth caches are removed', () => {
  assert.equal(typeof readAuthState, 'function')

  const legacyStorage = createStorage(JSON.stringify(createSession(1)))
  assert.deepEqual(readAuthState(legacyStorage), {
    activeUserId: null,
    sessions: []
  })
  assert.equal(legacyStorage.has(AUTH_STORAGE_KEY), false)

  const damagedStorage = createStorage('{not-json')
  assert.deepEqual(readAuthState(damagedStorage), {
    activeUserId: null,
    sessions: []
  })
  assert.equal(damagedStorage.has(AUTH_STORAGE_KEY), false)
})

test('auth cache removes only expired sessions and clears an expired active account', () => {
  assert.equal(typeof readAuthState, 'function')

  const storage = createStorage(
    JSON.stringify({
      activeUserId: '1',
      sessions: [
        createSession(1, {
          accessToken: createJwt({ exp: 1_700_000_000, userId: 1 }),
          expiresAt: '2023-11-14T22:13:20Z'
        }),
        createSession(2)
      ]
    })
  )

  const restored = readAuthState(storage, Date.parse('2026-08-18T00:00:00Z'))

  assert.equal(restored.activeUserId, null)
  assert.deepEqual(
    restored.sessions.map(session => session.userId),
    [2]
  )
})

test('upserting a session activates it and replaces duplicate account data', () => {
  assert.equal(typeof upsertAuthSession, 'function')

  const first = createSession(1)
  const second = createSession(2)
  const refreshedFirst = createSession(1, {
    name: 'Updated User',
    accessToken: createJwt({ exp: 4_102_444_900, userId: 1 })
  })

  const next = upsertAuthSession(
    { activeUserId: '2', sessions: [second, first] },
    refreshedFirst,
    Date.parse('2026-08-18T00:00:00Z')
  )

  assert.equal(next.activeUserId, '1')
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [1, 2]
  )
  assert.equal(next.sessions[0].name, 'Updated User')
})

test('activating an account moves it to the front of recent accounts', () => {
  assert.equal(typeof activateAuthSession, 'function')

  const next = activateAuthSession(
    {
      activeUserId: '1',
      sessions: [createSession(1), createSession(2)]
    },
    2,
    Date.parse('2026-08-18T00:00:00Z')
  )

  assert.equal(next.activeUserId, '2')
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [2, 1]
  )
})

test('selecting an expired account prunes it without throwing', () => {
  const now = Date.parse('2026-08-18T00:00:00Z')
  const expired = createSession(1, {
    accessToken: createJwt({ exp: 1_700_000_000, userId: 1 }),
    expiresAt: '2023-11-14T22:13:20Z'
  })
  const available = createSession(2)

  const next = activateAuthSession(
    { activeUserId: null, sessions: [expired, available] },
    1,
    now
  )

  assert.equal(next.activeUserId, null)
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [2]
  )
})

test('logging out the active account activates the most recent remaining account', () => {
  assert.equal(typeof removeAuthSession, 'function')

  const next = removeAuthSession(
    {
      activeUserId: '2',
      sessions: [createSession(2), createSession(1)]
    },
    2,
    { activateFallback: true }
  )

  assert.equal(next.activeUserId, '1')
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [1]
  )
})

test('logging out skips expired fallback accounts', () => {
  const now = Date.parse('2026-08-18T00:00:00Z')
  const expired = createSession(2, {
    accessToken: createJwt({ exp: 1_700_000_000, userId: 2 }),
    expiresAt: '2023-11-14T22:13:20Z'
  })

  const next = removeAuthSession(
    {
      activeUserId: '3',
      sessions: [createSession(3), expired, createSession(1)]
    },
    3,
    { activateFallback: true, now }
  )

  assert.equal(next.activeUserId, '1')
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [1]
  )
})

test('invalidating the active account waits for an explicit account choice', () => {
  assert.equal(typeof removeAuthSession, 'function')

  const next = removeAuthSession(
    {
      activeUserId: '2',
      sessions: [createSession(2), createSession(1)]
    },
    2
  )

  assert.equal(next.activeUserId, null)
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [1]
  )
})

test('removing a stale request account preserves the newly active account', () => {
  assert.equal(typeof removeAuthSession, 'function')

  const next = removeAuthSession(
    {
      activeUserId: '2',
      sessions: [createSession(2), createSession(1)]
    },
    1
  )

  assert.equal(next.activeUserId, '2')
  assert.deepEqual(
    next.sessions.map(session => session.userId),
    [2]
  )
})

test('a stale 401 token cannot remove a renewed session for the same account', () => {
  const renewedSession = createSession(1, {
    accessToken: createJwt({ exp: 4_102_444_900, userId: 1 })
  })
  const staleToken = createJwt({ exp: 4_102_444_800, userId: 1 })

  const next = removeAuthSession(
    { activeUserId: '1', sessions: [renewedSession] },
    1,
    { expectedAccessToken: staleToken }
  )

  assert.equal(next.activeUserId, '1')
  assert.deepEqual(next.sessions, [renewedSession])
})

test('a malformed JWT is invalid even with a future API expiration', () => {
  assert.equal(
    isAuthSessionValid(
      {
        accessToken: 'not-a-jwt',
        tokenType: 'Bearer',
        expiresAt: '2099-12-31T00:00:00Z'
      },
      Date.parse('2026-08-18T00:00:00Z')
    ),
    false
  )
})
