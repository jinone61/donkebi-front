<template>
  <main class="backtest-placeholder">
    <div class="backtest-placeholder__inner dk-container">
      <div class="backtest-placeholder__intro">
        <p class="dk-eyebrow">Backtest · In Preparation</p>
        <h1 class="dk-serif">전략을 검증하는<br />새로운 공간.</h1>
      </div>

      <div class="backtest-placeholder__note">
        <span class="dk-eyebrow">Coming Next</span>
        <p>
          백테스트 페이지를 준비하고 있습니다. 새로운 데이터와 전략 검증 경험은
          이 공간에서 이어집니다.
        </p>
        <router-link to="/">
          홈으로 돌아가기 <span aria-hidden="true">→</span>
        </router-link>
      </div>

      <div class="backtest-placeholder__foot" aria-hidden="true">
        <span>DONKEBI · RESEARCH SYSTEM</span>
        <span>SEOUL · 2026</span>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.backtest-placeholder {
  min-height: 100dvh;
  background: var(--dk-paper);
  color: var(--dk-ink);

  &__inner {
    position: relative;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    align-items: center;
    min-height: 100dvh;
    padding-block: clamp(80px, 9vw, 130px);
  }

  &__intro {
    grid-column: 1 / 8;

    h1 {
      margin: 40px 0 0;
      font-size: clamp(4rem, 7.3vw, 7.4rem);
      line-height: 1.08;
    }
  }

  &__note {
    grid-column: 9 / 13;
    padding-top: 16px;
    border-top: 1px solid var(--dk-line);

    p {
      margin: 24px 0 28px;
      color: var(--dk-muted);
      font-size: 0.82rem;
      line-height: 1.8;
    }

    a {
      display: inline-flex;
      gap: 20px;
      align-items: center;
      padding-block: 8px;
      border-bottom: 1px solid currentColor;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }
  }

  &__foot {
    position: absolute;
    right: var(--dk-page-gutter);
    bottom: 24px;
    left: var(--dk-page-gutter);
    display: flex;
    justify-content: space-between;
    color: var(--dk-muted);
    font-size: 0.58rem;
    letter-spacing: 0.1em;
  }
}

@media (max-width: 767px) {
  .backtest-placeholder {
    &__inner {
      display: flex;
      flex-direction: column;
      gap: 80px;
      align-items: stretch;
      justify-content: center;
      padding-block: 72px 110px;
    }

    &__intro h1 {
      margin-top: 30px;
      font-size: clamp(3.7rem, 17vw, 5.2rem);
    }

    &__note {
      padding-top: 24px;
    }
  }
}
</style>
