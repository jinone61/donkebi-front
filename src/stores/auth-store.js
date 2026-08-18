import { defineStore } from 'pinia'

export const AUTH_STORAGE_KEY = 'donkebi.auth'

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

export function writeAuthSession(session, storage = globalThis.localStorage) {
  const sanitized = sanitizeAuthSession(session)
  storage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitized))
  return sanitized
}

export function readAuthSession(
  storage = globalThis.localStorage,
  now = Date.now()
) {
  try {
    const serialized = storage?.getItem(AUTH_STORAGE_KEY)
    if (!serialized) return null

    const session = sanitizeAuthSession(JSON.parse(serialized))
    if (isAuthSessionValid(session, now)) return session
  } catch {
    // Invalid persisted sessions are cleared below.
  }

  storage?.removeItem(AUTH_STORAGE_KEY)
  return null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null,
    hydrated: false
  }),

  getters: {
    user: state =>
      state.session
        ? {
            userId: state.session.userId,
            email: state.session.email,
            name: state.session.name
          }
        : null,
    authorizationHeader: state =>
      state.session
        ? `${state.session.tokenType} ${state.session.accessToken}`
        : ''
  },

  actions: {
    hydrate() {
      if (!this.hydrated) {
        this.session = readAuthSession()
        this.hydrated = true
      }
      return this.session
    },

    hasValidSession() {
      this.hydrate()
      if (isAuthSessionValid(this.session)) return true

      this.clearSession()
      return false
    },

    setSession(session) {
      const sanitized = writeAuthSession(session)
      if (!isAuthSessionValid(sanitized)) {
        this.clearSession()
        throw new Error('유효하지 않은 인증 응답입니다.')
      }

      this.session = sanitized
      this.hydrated = true
    },

    clearSession() {
      globalThis.localStorage?.removeItem(AUTH_STORAGE_KEY)
      this.session = null
      this.hydrated = true
    }
  }
})
