<template>
  <q-page class="crypto-backtest-route">
    <CryptoBacktestPage />
  </q-page>
</template>

<script setup>
import CryptoBacktestPage from '@/components/backtest/CryptoBacktestPage.vue'
</script>

<style scoped>
.crypto-backtest-route {
  background: var(--dk-paper);
}
</style>
