<template>
  <main class="not-found">
    <div class="not-found__inner dk-container">
      <p class="dk-eyebrow">Error · 404</p>
      <div class="not-found__copy">
        <p class="not-found__number dk-serif" aria-hidden="true">404</p>
        <h1 class="dk-serif">이 페이지는 아직<br />관측되지 않았습니다.</h1>
        <p
          >주소가 바뀌었거나 존재하지 않는 경로입니다. Donkebi의 첫 화면으로
          돌아가세요.</p
        >
        <router-link to="/"
          >홈으로 돌아가기 <span aria-hidden="true">→</span></router-link
        >
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.not-found {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  background: var(--dk-ink);
  color: var(--dk-paper);

  &__inner {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    align-items: start;
    padding-block: 80px;

    > .dk-eyebrow {
      grid-column: 1 / 4;
      padding-top: 12px;
    }
  }

  &__copy {
    grid-column: 5 / 12;
  }

  &__number {
    margin: 0;
    color: rgba(244, 241, 234, 0.16);
    font-size: clamp(6rem, 14vw, 14rem);
    line-height: 0.7;
  }

  h1 {
    margin: 58px 0 0;
    font-size: clamp(3rem, 6.4vw, 6.8rem);
    line-height: 1.13;
  }

  p:not(.dk-eyebrow, .not-found__number) {
    max-width: 500px;
    margin: 30px 0;
    color: rgba(244, 241, 234, 0.58);
    font-size: 0.84rem;
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

@media (max-width: 767px) {
  .not-found {
    &__inner {
      display: block;
    }

    &__copy {
      margin-top: 70px;
    }
  }
}
</style>
