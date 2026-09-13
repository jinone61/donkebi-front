<template>
  <q-page class="login-page">
    <div class="auth-area">
      <div class="auth-shell dk-container">
        <div class="auth-intro dk-reveal">
          <p class="dk-eyebrow">Private Access Only</p>
          <h1 class="dk-serif">Donkebi<br />Access.</h1>
          <p>승인된 사용자만 Donkebi의 작업 화면에 접근할 수 있습니다.</p>
          <div class="auth-intro__meta" aria-hidden="true">
            <span>AGENT / 01</span>
            <span>ACCESS / RESTRICTED</span>
          </div>
        </div>

        <AccountLoginForm
          class="auth-form dk-reveal"
          submit-label="ENTER INTERFACE"
          @authenticated="finishLogin"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

import AccountLoginForm from '@/components/auth/AccountLoginForm.vue'

const route = useRoute()
const router = useRouter()

function safeRedirect(value) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    value !== '/login'
    ? value
    : '/operation'
}

async function finishLogin() {
  await router.replace(safeRedirect(route.query.redirect))
}
</script>

<style scoped>
.login-page {
  background: var(--dk-paper);
}
</style>
