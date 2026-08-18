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

        <q-form
          class="auth-form dk-reveal"
          autocomplete="on"
          @submit.prevent="login"
        >
          <div class="auth-form__head">
            <span>AUTHENTICATION</span>
            <span>01 / 01</span>
          </div>
          <q-input
            v-model.trim="email"
            type="email"
            label="이메일"
            autocomplete="email"
            outlined
            color="dark"
            :disable="isSubmitting"
          />
          <q-input
            v-model="password"
            type="password"
            label="비밀번호"
            autocomplete="current-password"
            outlined
            color="dark"
            :disable="isSubmitting"
            :error="Boolean(loginError)"
            :error-message="loginError"
            class="auth-form__password"
          />
          <q-btn
            type="submit"
            label="ENTER INTERFACE"
            color="dark"
            unelevated
            class="full-width auth-form__button"
            :loading="isSubmitting"
            :disable="!email || !password"
          />
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'

const LOGIN_URL = '/api/dualsniper/auth/login'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loginError = ref('')
const isSubmitting = ref(false)

function safeRedirect(value) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    value !== '/login'
    ? value
    : '/operation'
}

async function login() {
  if (!email.value || !password.value || isSubmitting.value) return

  isSubmitting.value = true
  loginError.value = ''

  try {
    const { data } = await api.post(LOGIN_URL, {
      email: email.value,
      password: password.value
    })

    authStore.setSession(data)
    password.value = ''
    await router.replace(safeRedirect(route.query.redirect))
  } catch (error) {
    if (error.response?.status === 401) {
      loginError.value = '이메일 또는 비밀번호를 확인해 주세요.'
    } else {
      loginError.value =
        error.response?.data?.message ||
        '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  background: var(--dk-paper);
}

.auth-form__password {
  margin-top: 14px;
}
</style>
