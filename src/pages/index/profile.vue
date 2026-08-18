<template>
  <q-page class="profile-page">
    <main class="profile-workspace">
      <div class="profile-shell dk-container">
        <header class="profile-intro dk-reveal">
          <p class="dk-eyebrow">Private Profile</p>
          <h1 class="dk-serif">Your access.</h1>
          <p>Donkebi에 연결된 사용자와 현재 접근 상태를 확인합니다.</p>
        </header>

        <q-card flat bordered class="profile-card dk-reveal">
          <q-card-section class="profile-card__heading">
            <span>PROFILE · 01</span>
            <span class="profile-status"><i aria-hidden="true"></i>ACTIVE</span>
          </q-card-section>

          <q-separator />

          <q-card-section class="profile-identity">
            <span>IDENTITY</span>
            <strong class="dk-serif">
              {{ authStore.user?.name || 'DONKEBI USER' }}
            </strong>
            <small>{{ authStore.user?.email || '-' }}</small>
          </q-card-section>

          <q-separator />

          <q-card-section class="profile-session">
            <span>ACCESS VALID UNTIL</span>
            <strong>{{ formattedExpiration }}</strong>
          </q-card-section>

          <q-card-actions class="profile-actions">
            <q-btn
              label="LOG OUT"
              color="dark"
              unelevated
              no-caps
              class="full-width"
              @click="logout"
            />
          </q-card-actions>
        </q-card>
      </div>
    </main>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { getAuthExpiration, useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()
authStore.hydrate()

const sessionExpiration = computed(() => getAuthExpiration(authStore.session))

const formattedExpiration = computed(() =>
  formatSessionExpiration(sessionExpiration.value)
)

function formatSessionExpiration(value) {
  if (!Number.isFinite(value)) return '-'

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(new Date(value))
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )

  return `${parts.year}.${parts.month}.${parts.day} ${parts.weekday.toUpperCase()} · ${parts.hour}:${parts.minute} KST`
}

async function logout() {
  authStore.clearSession()
  await router.replace('/')
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: calc(100vh - 82px);
  background: var(--dk-paper);
  color: var(--dk-ink);
}

.profile-workspace {
  padding-block: clamp(48px, 8vw, 108px);
}

.profile-shell {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}

.profile-intro {
  grid-column: 1 / 8;

  h1 {
    margin: 16px 0 20px;
    font-size: clamp(3.5rem, 7vw, 7rem);
    font-weight: 400;
    line-height: 0.95;
  }

  > p:last-child {
    max-width: 420px;
    margin: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body);
    line-height: 1.8;
  }
}

.profile-card {
  grid-column: 9 / 13;
  border-color: var(--dk-line-strong);
  border-radius: 2px;
  background: var(--dk-surface);
  box-shadow: none;
}

.profile-card__heading,
.profile-session {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.profile-card__heading {
  min-height: 52px;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
}

.profile-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--agent-accent, #357a55);

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 4px rgba(53, 122, 85, 0.1);
  }
}

.profile-identity {
  display: grid;
  padding-block: 30px;

  > span,
  small {
    color: var(--dk-muted);
  }

  > span {
    font-size: var(--dk-text-caption);
    letter-spacing: 0.13em;
  }

  strong {
    margin-top: 18px;
    font-size: clamp(1.7rem, 3vw, 2.4rem);
    font-weight: 400;
    line-height: 1.15;
  }

  small {
    margin-top: 6px;
    font-size: var(--dk-text-body-sm);
  }
}

.profile-session {
  padding-block: 20px;
  font-variant-numeric: tabular-nums;

  span {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.1em;
  }

  strong {
    font-size: var(--dk-text-body-sm);
    font-weight: 500;
    text-align: right;
  }
}

.profile-actions {
  padding: 0 16px 16px;

  :deep(.q-btn) {
    min-height: 44px;
    border-radius: 1px;
    font-size: var(--dk-text-label);
    font-weight: 600;
    letter-spacing: 0.12em;
  }
}

@media (max-width: 767px) {
  .profile-page {
    min-height: calc(100vh - 68px);
  }

  .profile-workspace {
    padding-block: 48px 72px;
  }

  .profile-shell {
    display: flex;
    flex-direction: column;
    gap: 52px;
  }

  .profile-intro,
  .profile-card {
    width: 100%;
  }

  .profile-intro h1 {
    font-size: clamp(3.4rem, 16vw, 5rem);
  }

  .profile-identity {
    padding-block: 24px;
  }

  .profile-session {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;

    strong {
      text-align: left;
    }
  }
}
</style>
