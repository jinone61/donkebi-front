import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AUTH_STORAGE_KEY,
  getAuthExpiration,
  isAuthSessionValid,
  readAuthSession,
  writeAuthSession
} from '../src/stores/auth-store.js'

function createJwt(payload) {
  const encode = value =>
    Buffer.from(JSON.stringify(value)).toString('base64url')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
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

test('auth cache restores only the allowed user and token fields', () => {
  const storage = createStorage()
  const session = {
    userId: 1,
    email: 'jinone61@naver.com',
    name: 'Malfoy',
    phone: '01000000000',
    accessToken: createJwt({ exp: 4_102_444_800, userId: 1 }),
    tokenType: 'Bearer',
    expiresAt: '2099-12-31T00:00:00.123456789Z'
  }

  writeAuthSession(session, storage)
  const restored = readAuthSession(storage, Date.parse('2026-08-18T00:00:00Z'))

  assert.deepEqual(restored, {
    userId: 1,
    email: 'jinone61@naver.com',
    name: 'Malfoy',
    accessToken: session.accessToken,
    tokenType: 'Bearer',
    expiresAt: '2099-12-31T00:00:00.123456789Z'
  })
  assert.equal('phone' in restored, false)
})

test('damaged or expired auth cache is removed', () => {
  const damagedStorage = createStorage('{not-json')
  assert.equal(readAuthSession(damagedStorage), null)
  assert.equal(damagedStorage.has(AUTH_STORAGE_KEY), false)

  const expiredStorage = createStorage(
    JSON.stringify({
      userId: 1,
      email: 'jinone61@naver.com',
      name: 'Malfoy',
      accessToken: createJwt({ exp: 1_700_000_000, userId: 1 }),
      tokenType: 'Bearer',
      expiresAt: '2023-11-14T22:13:20Z'
    })
  )

  assert.equal(readAuthSession(expiredStorage, 1_800_000_000_000), null)
  assert.equal(expiredStorage.has(AUTH_STORAGE_KEY), false)
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
