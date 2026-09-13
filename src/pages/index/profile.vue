<template>
  <q-page class="profile-page">
    <main class="profile-workspace">
      <div class="profile-shell dk-container">
        <header class="profile-intro dk-reveal">
          <p class="dk-eyebrow">Private Profile</p>
          <h1 class="dk-serif">Your access.</h1>
          <p>현재 연결된 계정과 접근 상태를 확인합니다.</p>
        </header>

        <section class="profile-panel dk-reveal" aria-label="계정 관리">
          <q-card v-if="currentAccount" flat bordered class="profile-card">
            <q-card-section class="profile-card__heading">
              <span>ACCOUNT</span>
              <span>CONNECTED</span>
            </q-card-section>

            <q-separator />

            <q-list class="account-list">
              <q-item class="account-item">
                <q-item-section>
                  <strong class="account-item__name dk-serif">
                    {{ currentAccount.name || 'DONKEBI USER' }}
                  </strong>
                  <span class="account-item__email">
                    {{ currentAccount.email }}
                  </span>
                  <small class="account-item__expiration">
                    ACCESS VALID UNTIL ·
                    {{ formatSessionExpiration(currentAccount.expiration) }}
                  </small>
                </q-item-section>

                <q-item-section side class="account-item__action">
                  <span class="profile-status">
                    <i aria-hidden="true"></i>ACTIVE
                  </span>
                </q-item-section>
              </q-item>
            </q-list>

            <q-card-actions class="profile-card__actions">
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
        </section>
      </div>
    </main>

    <q-dialog
      v-model="accountDialogOpen"
      persistent
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="account-dialog-card">
        <q-card-section class="account-dialog__heading">
          <span>SELECT ACCOUNT</span>
          <q-btn
            aria-label="계정 선택 닫기"
            icon="close"
            flat
            round
            dense
            @click="closeAccountDialog"
          />
        </q-card-section>

        <q-separator />

        <q-list v-if="authStore.hasStoredSessions" separator>
          <q-item
            v-for="account in selectableAccounts"
            :key="account.userId"
            clickable
            class="account-dialog__item"
            @click="switchAccount(account.userId)"
          >
            <q-item-section>
              <strong class="account-dialog__name dk-serif">
                {{ account.name || 'DONKEBI USER' }}
              </strong>
              <span class="account-item__email">{{ account.email }}</span>
            </q-item-section>

            <q-item-section side>
              <q-btn
                label="REMOVE"
                flat
                no-caps
                class="account-dialog__remove"
                @click.stop="requestAccountRemoval(account)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-else class="account-dialog__empty">
          저장된 계정이 없습니다.
        </q-card-section>

        <q-card-actions class="account-dialog__actions">
          <q-btn
            :label="showAddAccount ? 'CANCEL' : 'ADD ACCOUNT'"
            color="dark"
            unelevated
            no-caps
            class="full-width"
            @click="showAddAccount = !showAddAccount"
          />
        </q-card-actions>

        <DkExpandTransition :show="showAddAccount">
          <q-separator />
          <q-card-section class="profile-add-account">
            <AccountLoginForm
              heading="ACCOUNT LOGIN"
              counter="NEW"
              submit-label="LOGIN"
              @authenticated="finishAddingAccount"
            />
          </q-card-section>
        </DkExpandTransition>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="removeDialogOpen"
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="remove-dialog-card">
        <q-card-section>
          <strong class="remove-dialog__title">REMOVE ACCOUNT?</strong>
          <p>{{ accountToRemove?.email }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="CANCEL" flat color="dark" no-caps v-close-popup />
          <q-btn
            label="REMOVE"
            color="negative"
            unelevated
            no-caps
            @click="removeAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DkExpandTransition from '@/components/DkExpandTransition.vue'
import AccountLoginForm from '@/components/auth/AccountLoginForm.vue'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
authStore.hydrate()

const currentAccount = computed(() =>
  authStore.accountSummaries.find(account => account.isActive)
)
const selectableAccounts = computed(() =>
  [...authStore.accountSummaries].sort(
    (a, b) => Number(a.userId) - Number(b.userId)
  )
)
const accountDialogOpen = ref(
  !authStore.activeUserId || route.query.session === 'expired'
)
const showAddAccount = ref(false)
const removeDialogOpen = ref(false)
const accountToRemove = ref(null)

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

async function clearSessionNotice() {
  if (route.query.session === 'expired') {
    await router.replace('/profile')
  }
}

async function switchAccount(userId) {
  showAddAccount.value = false
  if (!authStore.switchSession(userId)) return

  accountDialogOpen.value = false
  await clearSessionNotice()
}

async function finishAddingAccount() {
  showAddAccount.value = false
  accountDialogOpen.value = false
  await clearSessionNotice()
}

function logout() {
  accountDialogOpen.value = true
}

function closeAccountDialog() {
  showAddAccount.value = false
  accountDialogOpen.value = false
}

function requestAccountRemoval(account) {
  accountToRemove.value = account
  removeDialogOpen.value = true
}

function removeAccount() {
  if (!accountToRemove.value) return

  authStore.removeSession(accountToRemove.value.userId)
  accountToRemove.value = null
  removeDialogOpen.value = false
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
  grid-column: 1 / 6;

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

.profile-panel {
  display: grid;
  grid-column: 7 / 13;
  gap: 14px;
  animation-delay: 120ms;
}

.profile-card {
  border-color: var(--dk-line-strong);
  border-radius: 2px;
  background: var(--dk-surface);
  box-shadow: none;
}

.profile-card__heading {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
}

.account-item {
  min-height: 126px;
  padding: 22px 16px;
  align-items: center;
}

.account-item__name {
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  font-weight: 400;
  line-height: 1.15;
}

.account-item__email,
.account-item__expiration {
  color: var(--dk-muted);
}

.account-item__email {
  margin-top: 5px;
  font-size: var(--dk-text-body-sm);
}

.account-item__expiration {
  margin-top: 14px;
  font-size: var(--dk-text-caption);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.account-item__action {
  padding-left: 18px;

  :deep(.q-btn) {
    min-height: 36px;
    border-radius: 1px;
    font-size: var(--dk-text-caption);
    letter-spacing: 0.1em;
  }
}

.profile-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--agent-accent, #357a55);
  font-size: var(--dk-text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 4px rgba(53, 122, 85, 0.1);
  }
}

.profile-card__actions {
  padding: 0 16px 16px;

  :deep(.q-btn) {
    min-height: 44px;
    border-radius: 1px;
    font-size: var(--dk-text-label);
    font-weight: 600;
    letter-spacing: 0.12em;
  }
}

.account-dialog-card {
  width: min(520px, calc(100vw - 32px));
  max-width: 520px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  border-radius: 2px;
}

.account-dialog__heading {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
}

.account-dialog__item {
  min-height: 88px;
  padding: 18px 16px;
}

.account-dialog__remove {
  min-height: 32px;
  padding-inline: 10px;
  border-radius: 2px;
  background: rgba(36, 34, 30, 0.05);
  color: var(--dk-muted);
  box-shadow: inset 0 0 0 1px var(--dk-line);
}

.account-dialog__name {
  font-size: 1.25rem;
  font-weight: 400;
}

.account-dialog__empty {
  padding-block: 28px;
  color: var(--dk-muted);
  text-align: center;
}

.account-dialog__actions {
  padding: 16px;
}

.remove-dialog-card {
  width: min(360px, calc(100vw - 32px));
  border-radius: 2px;

  p {
    margin: 8px 0 0;
    color: var(--dk-muted);
  }
}

.remove-dialog__title {
  font-size: var(--dk-text-label);
  letter-spacing: 0.1em;
}

.profile-add-account {
  padding: 28px 16px 20px;

  :deep(.auth-form__head) {
    display: flex;
    justify-content: space-between;
    margin-bottom: 28px;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.13em;
  }

  :deep(.q-field__control) {
    border-radius: 2px;
    background: rgba(244, 241, 234, 0.34);
  }

  :deep(.auth-form__button) {
    height: 48px;
    margin-top: 12px;
    border-radius: 0;
    font-size: var(--dk-text-label);
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
  .profile-panel {
    width: 100%;
  }

  .profile-intro h1 {
    font-size: clamp(3.4rem, 16vw, 5rem);
  }

  .account-item {
    min-height: 0;
    align-items: flex-start;
    padding-block: 20px;
  }

  .account-item__expiration {
    line-height: 1.5;
  }
}

@media (max-width: 420px) {
  .account-item {
    display: grid;
    gap: 18px;
  }

  .account-item__action {
    align-items: flex-start;
    padding-left: 0;
  }
}
</style>
