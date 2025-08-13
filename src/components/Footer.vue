<template>
  <footer class="footer">
    <nav class="footer__nav" aria-label="Footer">
      <section
        v-for="(section, i) in sections"
        :key="section.key"
        class="footer__section"
      >
        <button
          class="footer__row"
          :aria-expanded="openMap[section.key] ? 'true' : 'false'"
          :aria-controls="`panel-${section.key}`"
          @click="toggle(section.key)"
        >
          <span class="footer__row-title">{{ section.title }}</span>
          <svg
            class="footer__chevron"
            :class="{ 'is-open': openMap[section.key] }"
            viewBox="0 0 20 20"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path d="M5.8 7.2a1 1 0 0 1 1.4 0L10 10l2.8-2.8a1 1 0 1 1 1.4 1.4l-3.5 3.5a1 1 0 0 1-1.4 0L5.8 8.6a1 1 0 0 1 0-1.4z" />
          </svg>
        </button>

        <transition name="accordion">
          <div
            v-show="openMap[section.key]"
            class="footer__panel"
            :id="`panel-${section.key}`"
            role="region"
            :aria-labelledby="`label-${section.key}`"
          >
            <ul class="footer__links">
              <li v-for="item in section.items" :key="item.label">
                <a
                  class="footer__link"
                  :href="item.href"
                  :target="item.external ? '_blank' : undefined"
                  :rel="item.external ? 'noopener noreferrer' : undefined"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </transition>
      </section>
    </nav>

<div class="footer__bar">
  <div class="footer__brand">
    © {{ year }} {{ brandName }} •
    <a :href="`mailto:${supportEmail}`" class="footer__bar-link">{{ supportEmail }}</a>
  </div>

  <div class="footer__payments">
    <ul class="pay-list" aria-label="Accepted payment methods">
      <li v-for="m in paymentMethods" :key="m.label" class="pay-badge">{{ m.label }}</li>
    </ul>
    <div class="pay-note">More local options appear at checkout.</div>
  </div>
</div>
  </footer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

type LinkItem = { label: string; href: string; external?: boolean }
type Section = { key: string; title: string; items: LinkItem[] }

const brandName = 'PlushieHouse'             // change if needed
const supportEmail = 'support@plushiehouse.com'
type Payment = { label: string }

const paymentMethods: Payment[] = [
  { label: 'Visa' },
  { label: 'Mastercard' },
  { label: 'AmEx' },
  { label: 'Apple Pay' },
  { label: 'Google Pay' },
  { label: 'Link' },
  { label: 'Cash App Pay' },
  { label: 'ACH' },
]
const sections = ref<Section[]>([
  {
    key: 'help',
    title: 'Help / FAQ',
    items: [
      { label: 'Shipping & Returns', href: '/policies/shipping-return' },
      { label: 'Order Tracking', href: '/orders/track' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    key: 'legal',
    title: 'Legal & Compliance',
    items: [
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms of Service', href: '/policies/terms' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
  {
    key: 'shop',
    title: 'Shop Shortcuts',
    items: [
      { label: 'New Arrivals', href: '/collections/new' },
      { label: 'Best Sellers', href: '/collections/best-sellers' },
      { label: 'All Products', href: '/collections/all' },
    ],
  },
  {
    key: 'social',
    title: 'Social',
    items: [
      { label: 'Instagram', href: 'https://instagram.com/plushiehouse', external: true },
      { label: 'TikTok', href: 'https://tiktok.com/@plushiehouse', external: true },
      { label: 'YouTube', href: 'https://youtube.com/@plushiehouse', external: true },
    ],
  },
])

// open state per section (multiple can be open)
const openMap = reactive<Record<string, boolean>>({})
sections.value.forEach(s => (openMap[s.key] = false))
// If you prefer one-at-a-time behavior, flip toggle() below.

function toggle(key: string) {
  // multi-open:
  openMap[key] = !openMap[key]

  // one-at-a-time (accordion) mode:
  // const isOpening = !openMap[key]
  // Object.keys(openMap).forEach(k => (openMap[k] = false))
  // openMap[key] = isOpening
}

const year = new Date().getFullYear()
</script>

<style scoped>
/* ---------- Theme (tweak these) ---------- */
.footer {
  --row-bg: #0b1220;          /* deeper color for main row */
  --row-fg: #ffffff;
  --row-hover: #0f1a30;

  --panel-bg: #16233d;        /* lighter than row */
  --panel-fg: #e6e8ec;

  --border: rgba(255, 255, 255, 0.08);
  --bar-bg: #0a0f1a;
  --bar-fg: #cbd5e1;

  background: #0a0f1a linear-gradient(180deg, #0a0f1a 0%, #0b1220 100%);
  color: var(--row-fg);
  padding-top: 12px;
}

/* ---------- Layout ---------- */
.footer__nav {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px 8px;
}

.footer__section + .footer__section {
  margin-top: 10px;
}

/* ---------- Row (deep color) ---------- */
.footer__row {
  width: 100%;
  background: var(--row-bg);
  color: var(--row-fg);
  border: 1px solid var(--border);
  padding: 16px 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  outline: none;
  transition: background 0.2s ease, transform 0.05s ease;
}
.footer__row:hover { background: var(--row-hover); }
.footer__row:active { transform: translateY(1px); }
.footer__row-title { font-weight: 600; letter-spacing: 0.2px; }

/* chevron */
.footer__chevron { fill: currentColor; opacity: 0.9; transition: transform 0.2s ease; }
.footer__chevron.is-open { transform: rotate(180deg); }

/* ---------- Panel (lighter color) ---------- */
.footer__panel {
  background: var(--panel-bg);
  color: var(--panel-fg);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-top: 8px;
  overflow: hidden;
}

/* animated open/close */
.accordion-enter-from,
.accordion-leave-to { max-height: 0; opacity: 0; }
.accordion-enter-to,
.accordion-leave-from { max-height: 400px; opacity: 1; }
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 200ms ease, opacity 200ms ease;
}

/* ---------- Links ---------- */
.footer__links {
  list-style: none;
  padding: 10px 10px 12px;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.footer__link {
  display: block;
  padding: 10px 10px 10px 12px;
  color: var(--panel-fg);
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.03);
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.05s ease;
}
.footer__link:hover {
  background: rgba(255,255,255,0.06);
  border-color: var(--border);
}

/* ---------- Bottom bar ---------- */
.footer__bar {
  border-top: 1px solid var(--border);
  margin-top: 16px;
  background: var(--bar-bg);
  color: var(--bar-fg);
}
.footer__brand,
.footer__payments {
  max-width: 1120px;
  margin: 0 auto;
  padding: 8px 16px 16px;
}

.pay-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pay-badge {
  font-size: 12px;
  line-height: 1;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--bar-fg);
  white-space: nowrap;
}

.pay-note {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}
.footer__bar-link {
  color: #8ab4ff;
  text-decoration: none;
}
.footer__bar-link:hover { text-decoration: underline; }

/* ---------- Responsive ---------- */
@media (min-width: 768px) {
  .footer__links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .footer__links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
