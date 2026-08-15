<template>
  <q-page class="home-page">
    <main>
      <section class="hero dk-container" aria-labelledby="hero-title">
        <div class="hero__copy dk-reveal">
          <p class="dk-eyebrow">AI Trading Agent</p>
          <h1 id="hero-title" class="dk-serif">돈 나와라 와라,<br />뚝딱.</h1>
          <p class="hero__intro">
            시간은 흐르고, 시장은 변합니다. <br />
            Donkebi는 그 흐름에 맞춰 스스로 생각하고 행동합니다.
          </p>
          <!-- <DkTextLink label="Discover the system" to="#system" /> -->
          <router-link class="section-link" to="/agent">
            Donkebi Agent <span aria-hidden="true">→</span>
          </router-link>
        </div>

        <div class="agent-figure dk-reveal" aria-label="Donkebi agent status">
          <div class="agent-figure__orbit agent-figure__orbit--outer"></div>
          <div class="agent-figure__orbit agent-figure__orbit--inner"></div>
          <div class="agent-figure__core"></div>
          <span class="agent-figure__tick agent-figure__tick--one"></span>
          <span class="agent-figure__tick agent-figure__tick--two"></span>
          <span class="agent-figure__tick agent-figure__tick--three"></span>
          <div class="agent-figure__status">
            <span>AGENT 01</span>
            <span><i></i> OBSERVING</span>
          </div>
        </div>

        <div class="hero__foot" aria-hidden="true">
          <span>DONKEBI · SEOUL</span>
          <span>System online · 24 / 7</span>
        </div>
      </section>

      <section id="system" class="system dk-section">
        <div class="dk-container">
          <div class="section-intro">
            <p class="dk-eyebrow">The System</p>
            <h2 class="dk-serif">Built to think.<br />Built to act.</h2>
            <p>
              순간의 확신보다 검증된 원칙을 따릅니다. Donkebi는 시장을 관찰하고,
              조건을 평가하고, 같은 전략을 과거에서 검증한 뒤 실행 가능한
              행동으로 정리합니다.
            </p>
          </div>

          <ol class="agent-cycle" aria-label="Agent process">
            <li v-for="(step, index) in agentSteps" :key="step.name">
              <span class="agent-cycle__index">0{{ index + 1 }}</span>
              <div>
                <h3>{{ step.name }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="backtest" class="backtest-section dk-section">
        <div class="backtest-section__inner dk-container">
          <div class="backtest-section__copy">
            <p class="dk-eyebrow">Private Backtest Interface</p>
            <h2 class="dk-serif">AI driven,<br />Real-world magic.</h2>
            <p>
              AI. 기술과 경험의 정점에서, <br />시장의 불확실성을 자산으로
              바꾸는 현대의 마법을 경험하세요.
            </p>
            <router-link class="section-link" to="/backtest">
              Enter Backtest <span aria-hidden="true">→</span>
            </router-link>
          </div>

          <div
            ref="backtestPlate"
            class="backtest-plate"
            :class="{
              'backtest-plate--revealed': isBacktestPlateRevealed
            }"
            aria-hidden="true"
          >
            <div class="backtest-plate__head">
              <span>BACKTEST / 01</span>
              <span>READY</span>
            </div>
            <div class="backtest-plate__graph">
              <svg viewBox="0 0 620 250" preserveAspectRatio="none">
                <path
                  class="backtest-plate__line backtest-plate__line--market"
                  d="M0 188 C38 180 64 195 96 176 C124 160 149 171 180 142 C212 115 235 129 267 92 C285 71 298 51 316 44 C339 52 354 80 381 72 C411 64 432 94 459 87 C487 80 508 113 537 105 C565 98 589 130 620 125"
                />
                <path
                  class="backtest-plate__line backtest-plate__line--donkebi"
                  d="M0 188 C55 182 75 166 120 170 S181 132 228 145 S290 96 337 110 S407 63 452 78 S531 34 620 28"
                />
              </svg>
              <span
                class="backtest-plate__marker backtest-plate__marker--asset"
              ></span>
              <span
                class="backtest-plate__marker backtest-plate__marker--market"
              ></span>
              <span class="backtest-plate__label backtest-plate__label--donkebi"
                >ASSET</span
              >
              <span class="backtest-plate__label backtest-plate__label--market"
                >MARKET</span
              >
            </div>
            <div class="backtest-plate__meta">
              <span>STRATEGY</span>
              <span>PERFORMANCE</span>
              <span>ORDERS</span>
            </div>
          </div>
        </div>
      </section>

      <section id="principle" class="principle dk-section">
        <div class="principle__inner dk-container">
          <p class="dk-eyebrow">Our Principle</p>
          <blockquote class="dk-serif">
            Discipline over prediction.<br />Evidence before action.
          </blockquote>
          <div class="principle__note">
            <span>01 / 01</span>
            <p>
              우리는 시장을 안다고 말하지 않습니다. <br />대신 하나의 원칙 아래
              시장을 끊임없이 관찰하고, 행동에 앞서 전략을 검증합니다.
            </p>
          </div>
        </div>
      </section>

      <section id="origin" class="origin dk-section">
        <div class="origin__inner dk-container">
          <div class="origin__mark" aria-hidden="true">
            <span>D</span>
            <i></i>
          </div>
          <div class="origin__copy">
            <p class="dk-eyebrow">Origin · Claude Shannon</p>
            <h2 class="dk-serif">Donkebi.<br />From Shannon’s Devil.</h2>
            <p>
              정보이론의 아버지, Claude Shannon. 그는 불확실성을 다루는 규칙을
              탐구했습니다. 오늘, Donkebi가 이어갑니다
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer__inner dk-container">
        <div>
          <p class="dk-eyebrow">DONKEBI</p>
          <h2 class="dk-serif">Quietly observing.<br />Ready to act.</h2>
        </div>
        <router-link class="site-footer__access" to="/backtest">
          Private Access <span aria-hidden="true">↗</span>
        </router-link>
        <div class="site-footer__bottom">
          <span>© 2026 DONKEBI</span>
          <span>AI Agent Trading System · Seoul</span>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import DkTextLink from '@/components/DkTextLink.vue'

const backtestPlate = ref(null)
const isBacktestPlateRevealed = ref(false)
let backtestPlateObserver

onMounted(() => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    isBacktestPlateRevealed.value = true
    return
  }

  backtestPlateObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return

      isBacktestPlateRevealed.value = true
      backtestPlateObserver?.disconnect()
      backtestPlateObserver = undefined
    },
    { threshold: 0.35 }
  )

  if (backtestPlate.value) {
    backtestPlateObserver.observe(backtestPlate.value)
  } else {
    isBacktestPlateRevealed.value = true
  }
})

onBeforeUnmount(() => {
  backtestPlateObserver?.disconnect()
})

const agentSteps = [
  {
    name: 'Observe',
    description: '시장 데이터와 전략의 조건을 끊임없이 관찰합니다.'
  },
  {
    name: 'Validate',
    description: '현재 상태가 행동할 수 있는 규칙과 일치하는지 평가합니다.'
  },
  {
    name: 'Backtest',
    description: '같은 원칙을 과거에 적용해 결과와 위험을 다시 확인합니다.'
  },
  {
    name: 'Execute',
    description: '정해진 시간에 실행 가능한 주문으로 전략을 전환합니다.'
  }
]
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
  padding-block: clamp(82px, 9vw, 140px) 68px;

  &__copy {
    grid-column: 1 / 8;
    animation-delay: 60ms;
  }

  h1 {
    max-width: 850px;
    margin: 38px 0 0;
    font-size: clamp(3.5rem, 6.5vw, 7rem);
    line-height: 1.08;
    white-space: nowrap;
  }

  &__intro {
    max-width: 500px;
    margin: 38px 0 30px;
    color: var(--dk-muted);
    font-size: var(--dk-text-body);
    line-height: 1.9;
  }

  &__foot {
    position: absolute;
    right: var(--dk-page-gutter);
    bottom: 24px;
    left: var(--dk-page-gutter);
    display: flex;
    justify-content: space-between;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
}

.agent-figure {
  position: relative;
  grid-column: 9 / 13;
  aspect-ratio: 1;
  animation-delay: 180ms;

  &__orbit,
  &__core {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  &__orbit {
    border: 1px solid var(--dk-line);

    &--outer {
      width: 100%;
      height: 100%;
    }

    &--inner {
      width: 66%;
      height: 66%;
    }
  }

  &__core {
    width: 26%;
    height: 26%;
    background: var(--dk-ink);
    box-shadow: 0 0 0 0 rgba(23, 23, 23, 0.18);
    animation: agent-pulse 3.2s ease-out infinite;
  }

  &__tick {
    position: absolute;
    width: 1px;
    height: 10%;
    background: var(--dk-ink);

    &--one {
      top: 8%;
      left: 52%;
    }

    &--two {
      right: 13%;
      bottom: 24%;
      height: 6%;
    }

    &--three {
      bottom: 11%;
      left: 27%;
      height: 8%;
    }
  }

  &__status {
    position: absolute;
    right: 0;
    bottom: -34px;
    left: 0;
    display: flex;
    justify-content: space-between;
    font-size: var(--dk-text-caption);
    letter-spacing: 0.13em;

    span:last-child {
      display: flex;
      gap: 7px;
      align-items: center;
    }

    i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #486b52;
    }
  }
}

@keyframes agent-pulse {
  60%,
  100% {
    box-shadow: 0 0 0 36px rgba(23, 23, 23, 0);
  }
}

.system {
  scroll-margin-top: 82px;
  background: var(--dk-surface);
}

.section-intro {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: start;

  > .dk-eyebrow {
    grid-column: 1 / 4;
  }

  h2 {
    grid-column: 4 / 10;
    margin: -14px 0 0;
    font-size: clamp(3rem, 5.8vw, 6.2rem);
    line-height: 1.08;
  }

  > p:last-child {
    grid-column: 10 / 13;
    margin: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body);
    line-height: 1.85;
  }
}

.agent-cycle {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin: clamp(70px, 9vw, 130px) 0 0;
  padding: 0;
  border-top: 1px solid var(--dk-ink);
  list-style: none;

  li {
    min-height: 240px;
    padding: 18px 24px 24px;
    border-right: 1px solid var(--dk-line);

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      border-right: 0;
    }
  }

  &__index {
    font-size: var(--dk-text-caption);
    letter-spacing: 0.13em;
  }

  div {
    margin-top: 92px;
  }

  h3 {
    margin: 0;
    font-family: var(--dk-font-serif);
    font-size: 1.7rem;
    font-weight: 400;
  }

  p {
    max-width: 220px;
    margin: 15px 0 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body-sm);
    line-height: 1.75;
  }
}

.backtest-section {
  scroll-margin-top: 82px;

  &__inner {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    align-items: center;
  }

  &__copy {
    grid-column: 1 / 6;

    h2 {
      margin: 36px 0 0;
      font-size: clamp(3.3rem, 5.8vw, 6.1rem);
      line-height: 1.12;
    }

    > p:not(.dk-eyebrow) {
      max-width: 430px;
      margin: 30px 0;
      color: var(--dk-muted);
      font-size: var(--dk-text-body);
      line-height: 1.85;
    }
  }
}

.section-link {
  display: inline-flex;
  gap: 20px;
  align-items: center;
  padding-block: 8px;
  border-bottom: 1px solid currentColor;
  font-size: var(--dk-text-label);
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  transition: gap var(--dk-fast);

  &:hover {
    gap: 28px;
  }
}

.backtest-plate {
  grid-column: 7 / 13;
  min-height: 520px;
  padding: 24px;
  background: var(--dk-ink);
  color: var(--dk-paper);

  &__head,
  &__meta {
    display: flex;
    justify-content: space-between;
    font-size: var(--dk-text-caption);
    letter-spacing: 0.12em;
  }

  &__graph {
    position: relative;
    height: 390px;
    margin-block: 28px 22px;
    border-block: 1px solid rgba(244, 241, 234, 0.16);
    background-image:
      linear-gradient(rgba(244, 241, 234, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(244, 241, 234, 0.08) 1px, transparent 1px);
    background-size: 25% 25%;

    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
      clip-path: inset(0 100% 0 0);
      fill: none;
    }
  }

  &__line {
    fill: none;
    vector-effect: non-scaling-stroke;

    &--market {
      stroke: rgba(244, 241, 234, 0.48);
      stroke-width: 1.2;
      stroke-dasharray: 5 7;
    }

    &--donkebi {
      stroke: var(--dk-paper);
      stroke-width: 1.4;
    }
  }

  &__marker {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0.4);

    &--asset {
      top: calc(11.2% - 3.5px);
      right: -3.5px;
      background: var(--dk-paper);
    }

    &--market {
      top: calc(50% - 3.5px);
      right: -3.5px;
      background: rgba(244, 241, 234, 0.5);
    }
  }

  &__label {
    position: absolute;
    right: 0;
    padding: 4px 0 4px 8px;
    background: var(--dk-ink);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.12em;
    opacity: 0;
    transform: translateX(-8px);

    &--donkebi {
      top: 1%;
      color: var(--dk-paper);
    }

    &--market {
      top: calc(50% + 8px);
      background: transparent;
      color: rgba(244, 241, 234, 0.48);
    }
  }

  &__meta {
    justify-content: flex-start;
    gap: 32px;
    color: rgba(244, 241, 234, 0.55);
  }

  &--revealed {
    .backtest-plate__graph svg {
      animation: backtest-chart-reveal 1.4s cubic-bezier(0.22, 1, 0.36, 1)
        forwards;
    }

    .backtest-plate__marker {
      animation: backtest-marker-reveal 360ms ease-out 1.05s forwards;
    }

    .backtest-plate__label {
      animation: backtest-label-reveal 380ms ease-out 1.08s forwards;
    }
  }
}

@keyframes backtest-chart-reveal {
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes backtest-marker-reveal {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes backtest-label-reveal {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.principle {
  scroll-margin-top: 82px;
  background: var(--dk-surface);

  blockquote {
    margin: clamp(58px, 7vw, 100px) 0 0;
    font-size: clamp(3.1rem, 5.7vw, 6rem);
    line-height: 1.04;
  }

  &__note {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    margin-top: clamp(60px, 8vw, 110px);
    padding-top: 22px;
    border-top: 1px solid var(--dk-line);
    font-size: var(--dk-text-caption);

    p {
      grid-column: 9 / 13;
      margin: 0;
      color: var(--dk-muted);
      font-size: var(--dk-text-body);
      line-height: 1.8;
    }
  }
}

.origin {
  scroll-margin-top: 82px;

  &__inner {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    align-items: center;
  }

  &__mark {
    position: relative;
    display: grid;
    grid-column: 1 / 6;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid var(--dk-line);
    border-radius: 50%;

    span {
      font-family: var(--dk-font-serif);
      font-size: clamp(5rem, 12vw, 12rem);
    }

    i {
      position: absolute;
      right: 10%;
      bottom: 18%;
      width: 15%;
      height: 15%;
      border-radius: 50%;
      background: var(--dk-ink);
    }
  }

  &__copy {
    grid-column: 7 / 13;
    padding-left: clamp(0px, 4vw, 64px);

    h2 {
      margin: 38px 0 0;
      font-size: clamp(3.1rem, 5.7vw, 6rem);
      line-height: 1.1;
    }

    > p:last-child {
      max-width: 470px;
      margin: 32px 0 0;
      color: var(--dk-muted);
      font-size: var(--dk-text-body);
      line-height: 1.9;
    }
  }
}

.site-footer {
  background: var(--dk-ink);
  color: var(--dk-paper);

  &__inner {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    padding-block: clamp(80px, 9vw, 130px) 30px;

    > div:first-child {
      grid-column: 1 / 8;
    }

    h2 {
      margin: 36px 0 0;
      font-size: clamp(3.2rem, 6vw, 6.4rem);
      line-height: 1.08;
    }
  }

  &__access {
    display: flex;
    grid-column: 10 / 13;
    align-self: end;
    justify-content: space-between;
    padding-block: 14px;
    border-block: 1px solid rgba(244, 241, 234, 0.28);
    font-size: var(--dk-text-label);
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  &__bottom {
    display: flex;
    grid-column: 1 / -1;
    justify-content: space-between;
    margin-top: 100px;
    padding-top: 24px;
    border-top: 1px solid rgba(244, 241, 234, 0.18);
    color: rgba(244, 241, 234, 0.65);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
}

@media (prefers-reduced-motion: reduce) {
  .backtest-plate {
    &__graph svg {
      clip-path: none;
    }

    &__marker,
    &__label {
      opacity: 1;
      transform: none;
    }
  }
}

@media (max-width: 1023px) {
  .hero__copy {
    grid-column: 1 / 8;
  }

  .agent-figure {
    grid-column: 9 / 13;
  }

  .section-intro {
    h2 {
      grid-column: 4 / 9;
    }

    > p:last-child {
      grid-column: 9 / 13;
    }
  }
}

@media (max-width: 767px) {
  .hero {
    display: block;
    min-height: auto;
    padding-block: 88px 96px;

    h1 {
      margin-top: 30px;
      font-size: clamp(2.5rem, 12.5vw, 4.6rem);
    }

    &__intro {
      margin-top: 30px;
    }

    &__foot {
      display: none;
    }
  }

  .agent-figure {
    width: min(86vw, 430px);
    margin: 110px auto 34px;
  }

  .section-intro {
    display: block;

    h2 {
      margin-top: 34px;
    }

    > p:last-child {
      width: 100%;
      max-width: none;
      margin-top: 30px;
    }
  }

  .agent-cycle {
    grid-template-columns: 1fr;

    li {
      display: grid;
      grid-template-columns: 44px 1fr;
      min-height: auto;
      padding: 18px 0 24px;
      border-right: 0;
      border-bottom: 1px solid var(--dk-line);
    }

    p {
      max-width: none;
    }

    div {
      margin-top: 0;
    }
  }

  .backtest-section__inner,
  .origin__inner {
    display: flex;
    flex-direction: column;
    gap: 64px;
    align-items: stretch;
  }

  .backtest-plate {
    min-height: 390px;
    padding: 18px;

    &__graph {
      height: 275px;
    }
  }

  .principle {
    &__note {
      display: block;

      p {
        margin-top: 25px;
      }
    }
  }

  .origin {
    &__mark {
      width: min(82vw, 430px);
    }

    &__copy {
      padding-left: 0;
    }
  }

  .site-footer {
    &__inner {
      display: block;
    }

    &__access {
      margin-top: 70px;
    }

    &__bottom {
      display: grid;
      gap: 8px;
      margin-top: 70px;
    }
  }
}
</style>
