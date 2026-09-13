import { defineStore } from 'pinia'

export const AUTH_STORAGE_KEY = 'donkebi.auth'

function emptyAuthState() {
  return {
    activeUserId: null,
    sessions: []
  }
}

function normalizeUserId(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function decodeJwtPayload(accessToken) {
  if (typeof accessToken !== 'string') return null

  const parts = accessToken.split('.')
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(globalThis.atob(padded), character =>
      character.charCodeAt(0)
    )

    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

function parseApiExpiration(value) {
  if (typeof value !== 'string' || !value) return NaN

  const normalized = value.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:?\d{2})$/, '$1$2')
  return Date.parse(normalized)
}

function sanitizeAuthSession(session = {}) {
  return {
    userId: session.userId,
    email: String(session.email || ''),
    name: String(session.name || ''),
    accessToken: String(session.accessToken || ''),
    tokenType: String(session.tokenType || 'Bearer'),
    expiresAt: String(session.expiresAt || '')
  }
}

function sanitizeAuthState(state, now = Date.now()) {
  if (!state || !Array.isArray(state.sessions)) return emptyAuthState()

  const sessions = []
  const userIds = new Set()

  for (const candidate of state.sessions) {
    const session = sanitizeAuthSession(candidate)
    const userId = normalizeUserId(session.userId)

    if (!userId || userIds.has(userId) || !isAuthSessionValid(session, now)) {
      continue
    }

    userIds.add(userId)
    sessions.push(session)
  }

  const requestedActiveUserId = normalizeUserId(state.activeUserId)
  const activeUserId = userIds.has(requestedActiveUserId)
    ? requestedActiveUserId
    : null

  return { activeUserId, sessions }
}

export function getAuthExpiration(session) {
  const payload = decodeJwtPayload(session?.accessToken)
  const jwtExpiration = Number(payload?.exp) * 1_000
  const apiExpiration = parseApiExpiration(session?.expiresAt)

  if (!Number.isFinite(jwtExpiration) || !Number.isFinite(apiExpiration)) {
    return NaN
  }

  return Math.min(jwtExpiration, apiExpiration)
}

export function isAuthSessionValid(session, now = Date.now()) {
  if (!session?.accessToken || !session?.tokenType) return false

  const expiration = getAuthExpiration(session)
  return Number.isFinite(expiration) && expiration > now
}

export function writeAuthState(
  state,
  storage = globalThis.localStorage,
  now = Date.now()
) {
  const sanitized = sanitizeAuthState(state, now)

  if (!sanitized.sessions.length) {
    storage?.removeItem(AUTH_STORAGE_KEY)
    return sanitized
  }

  storage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitized))
  return sanitized
}

export function readAuthState(
  storage = globalThis.localStorage,
  now = Date.now()
) {
  try {
    const serialized = storage?.getItem(AUTH_STORAGE_KEY)
    if (!serialized) return emptyAuthState()

    const parsed = JSON.parse(serialized)
    if (!Array.isArray(parsed?.sessions)) {
      storage?.removeItem(AUTH_STORAGE_KEY)
      return emptyAuthState()
    }

    return writeAuthState(parsed, storage, now)
  } catch {
    storage?.removeItem(AUTH_STORAGE_KEY)
    return emptyAuthState()
  }
}

export function upsertAuthSession(state, session, now = Date.now()) {
  const sanitizedSession = sanitizeAuthSession(session)
  const userId = normalizeUserId(sanitizedSession.userId)

  if (!userId || !isAuthSessionValid(sanitizedSession, now)) {
    throw new Error('유효하지 않은 인증 응답입니다.')
  }

  const current = sanitizeAuthState(state, now)
  return {
    activeUserId: userId,
    sessions: [
      sanitizedSession,
      ...current.sessions.filter(
        candidate => normalizeUserId(candidate.userId) !== userId
      )
    ]
  }
}

export function activateAuthSession(state, userId, now = Date.now()) {
  const accountId = normalizeUserId(userId)
  const current = sanitizeAuthState(state, now)
  const session = current.sessions.find(
    candidate => normalizeUserId(candidate.userId) === accountId
  )

  if (!session) return current

  return {
    activeUserId: accountId,
    sessions: [
      session,
      ...current.sessions.filter(candidate => candidate !== session)
    ]
  }
}

export function removeAuthSession(
  state,
  userId,
  { activateFallback = false, expectedAccessToken, now = Date.now() } = {}
) {
  const accountId = normalizeUserId(userId)
  const current = sanitizeAuthState(state, now)
  const activeUserId = current.activeUserId
  const currentSessions = current.sessions
  const matchedSession = currentSessions.find(
    session => normalizeUserId(session.userId) === accountId
  )

  if (
    expectedAccessToken !== undefined &&
    matchedSession?.accessToken !== expectedAccessToken
  ) {
    return { activeUserId, sessions: currentSessions }
  }

  const sessions = currentSessions.filter(
    session => normalizeUserId(session.userId) !== accountId
  )

  if (activeUserId !== accountId) return { activeUserId, sessions }

  return {
    activeUserId:
      activateFallback && sessions.length
        ? normalizeUserId(sessions[0].userId)
        : null,
    sessions
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    activeUserId: null,
    sessions: [],
    hydrated: false
  }),

  getters: {
    session: state =>
      state.sessions.find(
        candidate => normalizeUserId(candidate.userId) === state.activeUserId
      ) || null,
    user() {
      return this.session
        ? {
            userId: this.session.userId,
            email: this.session.email,
            name: this.session.name
          }
        : null
    },
    authorizationHeader() {
      return this.session
        ? `${this.session.tokenType} ${this.session.accessToken}`
        : ''
    },
    hasStoredSessions: state => state.sessions.length > 0,
    accountSummaries: state =>
      state.sessions.map(session => ({
        userId: session.userId,
        email: session.email,
        name: session.name,
        expiration: getAuthExpiration(session),
        isActive: normalizeUserId(session.userId) === state.activeUserId
      }))
  },

  actions: {
    replaceAuthState(state) {
      this.activeUserId = state.activeUserId
      this.sessions = state.sessions
      this.hydrated = true
      return this.session
    },

    persist(state) {
      return this.replaceAuthState(writeAuthState(state))
    },

    hydrate() {
      if (!this.hydrated) this.replaceAuthState(readAuthState())
      return this.session
    },

    hasValidSession(now = Date.now()) {
      this.hydrate()
      const next = sanitizeAuthState(this.$state, now)

      if (
        next.activeUserId !== this.activeUserId ||
        next.sessions.length !== this.sessions.length
      ) {
        this.replaceAuthState(
          writeAuthState(next, globalThis.localStorage, now)
        )
      }

      return Boolean(this.session)
    },

    setSession(session) {
      this.hydrate()
      return this.persist(upsertAuthSession(this.$state, session))
    },

    switchSession(userId) {
      this.hydrate()
      const accountId = normalizeUserId(userId)
      const next = activateAuthSession(this.$state, accountId)
      this.persist(next)
      return this.activeUserId === accountId
    },

    removeSession(userId, options) {
      this.hydrate()
      return this.persist(removeAuthSession(this.$state, userId, options))
    },

    invalidateSession(userId, expectedAccessToken) {
      this.hydrate()
      const session = this.sessions.find(
        candidate =>
          normalizeUserId(candidate.userId) === normalizeUserId(userId)
      )

      if (!session || session.accessToken !== expectedAccessToken) return false

      this.removeSession(userId, { expectedAccessToken })
      return true
    }
  }
})
