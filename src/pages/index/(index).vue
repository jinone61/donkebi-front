<template>
  <q-page class="home-page">
    <main>
      <section class="hero dk-container" aria-labelledby="hero-title">
        <div class="hero__copy dk-reveal">
          <p class="dk-eyebrow">Independent Market Research</p>
          <h1 id="hero-title" class="dk-serif">
            시장을 읽는<br />
            새로운 감각.
          </h1>
          <p class="hero__intro">
            숫자 너머의 흐름을 발견합니다. Donkebi는 시장의 변화와 투자자의 판단
            사이에 선명한 관점을 더합니다.
          </p>
          <DkTextLink label="오늘의 리서치" to="#perspective" />
        </div>

        <div class="hero__market dk-reveal">
          <DkMarketMetric v-bind="marketSnapshot" />
          <svg
            class="hero__sparkline"
            aria-label="KOSPI 장중 상승 추이"
            role="img"
            viewBox="0 0 420 120"
          >
            <path
              d="M1 98 35 81 69 87 103 63 137 70 171 48 205 58 239 44 273 51 307 31 341 38 375 17 419 5"
            />
          </svg>
        </div>

        <div class="hero__foot" aria-hidden="true">
          <span>Seoul · 37.5665° N</span>
          <span>Scroll to explore</span>
        </div>
      </section>

      <section id="perspective" class="perspective dk-section">
        <div class="perspective__inner dk-container">
          <DkEditorialImage
            class="perspective__image"
            :src="architectureImage"
            alt="채광창 아래 긴 콘크리트 벽과 검은 기하학 오브제가 놓인 가상의 건축 공간"
            :caption="featuredResearch.caption"
          />

          <div class="perspective__copy">
            <p class="dk-eyebrow">{{ featuredResearch.eyebrow }}</p>
            <h2 class="dk-serif">{{ featuredResearch.title }}</h2>
            <p>{{ featuredResearch.summary }}</p>
            <DkTextLink label="관점 읽기" to="#research" />
          </div>
        </div>
      </section>

      <section id="market" class="market dk-section">
        <div class="dk-container">
          <DkSectionHeader
            eyebrow="Market Pulse"
            title="오늘의 움직임을, 더 긴 흐름 위에서 봅니다."
            description="한 번의 등락보다 방향을 만드는 리듬에 집중합니다. 기간을 바꿔 같은 데이터의 다른 표정을 살펴보세요."
          />

          <div class="market__summary">
            <DkMarketMetric v-bind="marketSnapshot" />
            <div class="market__note">
              <span class="dk-eyebrow">Session Note</span>
              <p
                >대형주 중심의 완만한 상승. 거래 강도는 오후 들어 점진적으로
                확대됐습니다.</p
              >
            </div>
          </div>

          <DkTrendChart
            v-model="activePeriod"
            :points="marketSeries"
            :periods="chartPeriods"
          />
        </div>
      </section>

      <section id="research" class="research dk-section">
        <div class="dk-container">
          <DkSectionHeader
            eyebrow="Research Index"
            title="빠른 뉴스보다 오래 남는 해석."
            description="매크로, 기업, 수급을 하나의 관점으로 연결한 Donkebi의 최신 리서치입니다."
          />

          <div id="archive" class="research__list">
            <DkResearchItem
              v-for="item in researchItems"
              :key="item.index"
              v-bind="item"
            />
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer__inner dk-container">
        <div class="site-footer__intro">
          <p class="dk-eyebrow">Weekly Perspective</p>
          <h2 class="dk-serif">생각할 시간을<br />보내드립니다.</h2>
          <form class="site-footer__form" @submit.prevent="subscribed = true">
            <label class="dk-visually-hidden" for="newsletter-email"
              >이메일 주소</label
            >
            <input
              id="newsletter-email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="Email address"
              required
            />
            <button type="submit"
              >Subscribe <span aria-hidden="true">→</span></button
            >
          </form>
          <p v-if="subscribed" class="site-footer__status" role="status">
            등록되었습니다. 다음 관점에서 만나요.
          </p>
        </div>

        <div class="site-footer__nav">
          <section v-for="group in footerGroups" :key="group.title">
            <h3>{{ group.title }}</h3>
            <a
              v-for="item in group.items"
              :key="item"
              href="#top"
              @click.prevent
              >{{ item }}</a
            >
          </section>
        </div>

        <div class="site-footer__bottom">
          <span>© 2026 DONKEBI</span>
          <span>Independent research for considered decisions.</span>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import DkEditorialImage from '@/components/DkEditorialImage.vue'
import DkMarketMetric from '@/components/DkMarketMetric.vue'
import DkResearchItem from '@/components/DkResearchItem.vue'
import DkSectionHeader from '@/components/DkSectionHeader.vue'
import DkTextLink from '@/components/DkTextLink.vue'
import DkTrendChart from '@/components/DkTrendChart.vue'
import {
  chartPeriods,
  featuredResearch,
  footerGroups,
  marketSeries,
  marketSnapshot,
  researchItems
} from '@/content/home.js'
import architectureImage from '@/assets/editorial/architecture.webp'

const activePeriod = ref('1D')
const subscribed = ref(false)
</script>

<style scoped lang="scss">
.home-page {
  background: var(--dk-paper);
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: center;
  min-height: calc(100vh - 82px);
  padding-block: clamp(86px, 9vw, 140px) 66px;

  &__copy {
    grid-column: 1 / 7;
    animation-delay: 80ms;
  }

  h1 {
    max-width: 740px;
    margin: 40px 0 0;
    font-size: clamp(4rem, 7.3vw, 7.6rem);
    line-height: 1.04;
  }

  &__intro {
    max-width: 470px;
    margin: 34px 0 28px;
    color: var(--dk-muted);
    font-size: 0.91rem;
    line-height: 1.85;
  }

  &__market {
    grid-column: 9 / 13;
    padding-left: clamp(0px, 2vw, 28px);
    animation-delay: 180ms;
  }

  &__sparkline {
    width: 100%;
    margin-top: 54px;
    overflow: visible;
    fill: none;
    stroke: var(--dk-ink);
    stroke-width: 1.4;
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
    text-transform: uppercase;
  }
}

.perspective {
  background: var(--dk-surface);

  &__inner {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    align-items: center;
  }

  &__image {
    grid-column: 1 / 7;
  }

  &__copy {
    grid-column: 8 / 13;
    max-width: 570px;
    padding-left: clamp(0px, 3vw, 48px);

    h2 {
      margin: 38px 0 0;
      font-size: clamp(2.8rem, 5.3vw, 5.7rem);
      line-height: 1.16;
    }

    > p:not(.dk-eyebrow) {
      max-width: 450px;
      margin: 28px 0 30px;
      color: var(--dk-muted);
      font-size: 0.9rem;
      line-height: 1.85;
    }
  }
}

.market {
  scroll-margin-top: 82px;

  &__summary {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    align-items: end;
    padding-block: clamp(36px, 4vw, 58px);
    border-block: 1px solid var(--dk-line);

    > :first-child {
      grid-column: 1 / 6;
    }
  }

  &__note {
    grid-column: 9 / 13;
    padding-bottom: 8px;

    p {
      margin: 16px 0 0;
      color: var(--dk-muted);
      font-size: 0.78rem;
      line-height: 1.7;
    }
  }

  :deep(.trend-chart) {
    padding-top: clamp(38px, 5vw, 72px);
  }
}

.research {
  scroll-margin-top: 82px;
  background: var(--dk-surface);
}

.site-footer {
  background: var(--dk-ink);
  color: var(--dk-paper);

  &__inner {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    padding-block: clamp(76px, 8vw, 120px) 30px;
  }

  &__intro {
    grid-column: 1 / 7;

    h2 {
      margin: 34px 0 0;
      font-size: clamp(2.9rem, 5.7vw, 6rem);
      line-height: 1.12;
    }
  }

  &__form {
    display: flex;
    max-width: 520px;
    margin-top: 48px;
    border-bottom: 1px solid rgba(244, 241, 234, 0.48);

    input,
    button {
      border: 0;
      background: transparent;
      color: var(--dk-paper);
    }

    input {
      min-width: 0;
      flex: 1;
      padding: 15px 0;
      outline: 0;

      &::placeholder {
        color: rgba(244, 241, 234, 0.42);
      }
    }

    button {
      padding: 15px 0 15px 18px;
      cursor: pointer;
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }
  }

  &__status {
    margin: 12px 0 0;
    color: rgba(244, 241, 234, 0.62);
    font-size: 0.72rem;
  }

  &__nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column: 9 / 13;
    gap: 24px;
    padding-top: 8px;

    section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    h3 {
      margin: 0 0 9px;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    a {
      width: max-content;
      color: rgba(244, 241, 234, 0.56);
      font-size: 0.7rem;
    }
  }

  &__bottom {
    display: flex;
    grid-column: 1 / -1;
    justify-content: space-between;
    margin-top: 92px;
    padding-top: 25px;
    border-top: 1px solid rgba(244, 241, 234, 0.18);
    color: rgba(244, 241, 234, 0.45);
    font-size: 0.57rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }
}

@media (max-width: 1023px) {
  .hero {
    &__copy {
      grid-column: 1 / 8;
    }

    &__market {
      grid-column: 9 / 13;
    }
  }

  .perspective {
    &__image {
      grid-column: 1 / 7;
    }

    &__copy {
      grid-column: 7 / 13;
    }
  }
}

@media (max-width: 767px) {
  .hero {
    display: block;
    min-height: auto;
    padding-block: 94px 88px;

    h1 {
      margin-top: 32px;
      font-size: clamp(3.8rem, 18vw, 5.6rem);
    }

    &__market {
      margin-top: 94px;
      padding-top: 34px;
      padding-left: 0;
      border-top: 1px solid var(--dk-line);
    }

    &__sparkline {
      max-height: 110px;
    }

    &__foot {
      display: none;
    }
  }

  .perspective {
    &__inner {
      display: flex;
      flex-direction: column;
      gap: 58px;
      align-items: stretch;
    }

    &__image {
      order: 2;
    }

    &__copy {
      order: 1;
      padding-left: 0;
    }
  }

  .market {
    &__summary {
      display: block;
    }

    &__note {
      margin-top: 44px;
      padding-top: 30px;
      border-top: 1px solid var(--dk-line);
    }
  }

  .site-footer {
    &__inner {
      display: block;
    }

    &__nav {
      margin-top: 76px;
      padding-top: 44px;
      border-top: 1px solid rgba(244, 241, 234, 0.18);
    }

    &__bottom {
      display: grid;
      gap: 9px;
      margin-top: 64px;
    }
  }
}
</style>
