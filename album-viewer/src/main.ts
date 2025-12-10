import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'

import './index.css'
import 'vue-sonner/style.css'

const app = createApp(App)

// Register motion plugin without custom directives to avoid conflicts
app.use(MotionPlugin)

app.mount('#app')
