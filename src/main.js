import { registerPlugins } from '@/plugins'
import { initKeycloak } from '@/plugins/keycloak'


import App from './App.vue'


import { createApp } from 'vue'


import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

initKeycloak().then(() => {
  app.mount('#app')
})
