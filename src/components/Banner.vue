<template>
  <section class="banner" @mouseenter="pause()" @mouseleave="play()">
    <div class="carousel">
      <!-- Left: Image -->
      <div class="image-wrap">
        <Transition name="fade" mode="out-in">
          <img
            :key="index"
            :src="currentSlide.image"
            :alt="currentSlide.title"
            class="hero-img"
          />
        </Transition>

        <button class="nav left" @click="prev" aria-label="Previous slide">‹</button>
        <button class="nav right" @click="next" aria-label="Next slide">›</button>

        <!-- Dots -->
        <div class="dots">
          <button
            v-for="(s, i) in slides"
            :key="i"
            :class="['dot', { active: i === index }]"
            @click="goTo(i)"
            :aria-label="`Go to slide ${i+1}`"
          />
        </div>
      </div>

      <!-- Right: Text -->
      <Transition name="fade" mode="out-in">
        <div class="copy" :style="{ background: currentSlide.bg }" :key="`copy-${index}`">
          <h3 class="eyebrow">{{ currentSlide.eyebrow }}</h3>
          <h2 class="title">{{ currentSlide.title }}</h2>
          <p class="desc">{{ currentSlide.desc }}</p>
          <div class="cta-row">
            <router-link
              :to="currentSlide.ctaHref"
              class="cta"
              :style="{ borderColor: currentSlide.accent, color: currentSlide.accent }"
            >
              {{ currentSlide.ctaLabel }}
            </router-link>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Slide = {
  image: string
  eyebrow: string
  title: string
  desc: string
  ctaLabel: string
  ctaHref: string
  bg: string
  accent: string
}

// Use your uploaded image in /src/assets
import firstImg from '@/assets/image.jpg'

const slides = ref<Slide[]>([
  {
    image: firstImg,
    eyebrow: 'New Drop',
    title: 'Capybara Stuffed Animal Keychains',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ctaLabel: 'Shop Capybara',
    ctaHref: '/category/1',
    bg: 'linear-gradient(135deg, #fff6fb, #ffe9f4)',
    accent: '#ff4da6'
  },
  {
    image: 'https://picsum.photos/id/1003/1200/800',
    eyebrow: 'Summer Pick',
    title: 'Fruit Buddy Capy Series',
    desc: 'Strawberry, melon, and blueberry styles—each with its own playful charm.',
    ctaLabel: 'Explore Capy',
    ctaHref: '/category/2',
    bg: 'linear-gradient(135deg, #f0fff4, #e8fff0)',
    accent: '#2f9e44'
  },
  {
    image: 'https://picsum.photos/id/1015/1200/800',
    eyebrow: 'Limited',
    title: 'Holiday Mini Hats',
    desc: 'Christmas Special Hats',
    ctaLabel: 'View Holiday',
    ctaHref: '/category/3',
    bg: 'linear-gradient(135deg, #eef6ff, #eaf1ff)',
    accent: '#3b82f6'
  }
])

const index = ref(0)
const currentSlide = computed(() => slides.value[index.value])

let timer: number | null = null
const DURATION = 10000 // 10s

function stop() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}
function safeSet(i: number) {
  index.value = (i + slides.value.length) % slides.value.length
}

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

// Use chained timeouts (less drift than setInterval) and preload next image
async function tick() {
  const nextIdx = (index.value + 1) % slides.value.length
  await preload(slides.value[nextIdx].image)
  timer = window.setTimeout(() => {
    safeSet(nextIdx)
    tick()
  }, DURATION)
}
function play() { stop(); tick() }
function pause() { stop() }

async function next() {
  pause()
  const nextIdx = (index.value + 1) % slides.value.length
  await preload(slides.value[nextIdx].image)
  safeSet(nextIdx)
  play()
}
async function prev() {
  pause()
  const prevIdx = (index.value - 1 + slides.value.length) % slides.value.length
  await preload(slides.value[prevIdx].image)
  safeSet(prevIdx)
  play()
}
async function goTo(i: number) {
  if (i === index.value) return
  pause()
  await preload(slides.value[i].image)
  safeSet(i)
  play()
}

function handleVisibility() {
  if (document.hidden) pause()
  else play()
}

onMounted(async () => {
  // Preload current and next before starting
  await preload(currentSlide.value.image)
  const n = (index.value + 1) % slides.value.length
  preload(slides.value[n].image)
  play()
  document.addEventListener('visibilitychange', handleVisibility)
})
onBeforeUnmount(() => {
  pause()
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<style scoped>
/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;700&display=swap');

.banner {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

.carousel {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  align-items: stretch;
}

/* Image side */
.image-wrap {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #f6f6f6;
  min-height: 340px;
}
.hero-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform .8s ease;
}
.image-wrap:hover .hero-img {
  transform: scale(1.02);
}

/* Arrows */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  font-size: 32px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .85);
  cursor: pointer;
  line-height: 1;
  display: grid;
  place-items: center;
  transition: box-shadow .2s ease, transform .1s ease;
}
.nav:hover { box-shadow: 0 6px 18px rgba(0,0,0,.12); }
.nav:active { transform: translateY(-50%) scale(.96); }
.nav.left { left: 12px; }
.nav.right { right: 12px; }

/* Dots */
.dots {
  position: absolute;
  left: 0; right: 0; bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.9);
  background: rgba(255,255,255,.25);
  cursor: pointer;
}
.dot.active { background: rgba(255,255,255,.95); }

/* Copy side */
.copy {
  border-radius: 18px;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 340px;
}
.eyebrow {
  font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .14em;
  margin: 0 0 6px;
  opacity: .7;
}
.title {
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: 34px;
  line-height: 1.12;
  margin: 0 0 10px;
}
.desc {
  font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 18px;
  max-width: 42ch;
}
.cta-row { display: flex; gap: 12px; }
.cta {
  display: inline-block;
  padding: 10px 16px;
  border: 2px solid currentColor;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
}

/* Fade used by image & text */
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }

/* Responsive */
@media (max-width: 1024px) {
  .carousel {
    grid-template-columns: 1fr;
  }
  .copy { min-height: auto; }
  .title { font-size: 28px; }
}
</style>
