import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'

import 'vue-sonner/style.css'

const app = createApp(App)

app.use(MotionPlugin, {
  directives: {
    'custom-pop': {
      initial: { scale: 0, opacity: 0 },
      enter: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
    },
    'custom-slide-up': {
      initial: { y: 100, opacity: 0 },
      visibleOnce: { y: 0, opacity: 1, transition: { duration: 600 } }
    },
    'custom-fade-in': {
      initial: { opacity: 0 },
      enter: { opacity: 1, transition: { duration: 500 } }
    }
  }
})

app.mount('#app')
