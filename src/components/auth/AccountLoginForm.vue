<template>
  <q-form class="account-login-form" autocomplete="on" @submit.prevent="login">
    <div class="auth-form__head">
      <span>{{ heading }}</span>
      <span>{{ counter }}</span>
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
      :label="submitLabel"
      color="dark"
      unelevated
      no-caps
      class="full-width auth-form__button"
      :loading="isSubmitting"
      :disable="!email || !password"
    />
  </q-form>
</template>

<script setup>
import { ref } from 'vue'

import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'

const LOGIN_URL = '/api/dualsniper/auth/login'

defineProps({
  submitLabel: {
    type: String,
    default: 'ENTER INTERFACE'
  },
  heading: {
    type: String,
    default: 'AUTHENTICATION'
  },
  counter: {
    type: String,
    default: '01 / 01'
  }
})

const emit = defineEmits(['authenticated'])
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loginError = ref('')
const isSubmitting = ref(false)

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
    emit('authenticated', authStore.user)
  } catch (error) {
    if (error.response?.status === 401) {
      loginError.value = '이메일 또는 비밀번호를 확인해 주세요.'
    } else {
      loginError.value =
        error.response?.data?.message ||
        error.message ||
        '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-form__password {
  margin-top: 14px;
}
</style>
