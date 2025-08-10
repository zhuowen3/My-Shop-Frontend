import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBars, faHouse, faCartShopping , faMagnifyingGlass , faXmark} from '@fortawesome/free-solid-svg-icons'
library.add(faBars, faCartShopping, faHouse, faMagnifyingGlass, faXmark)
library.add(faCartShopping)
// ✅ Assign createApp result to variable first
const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.mount('#app')

