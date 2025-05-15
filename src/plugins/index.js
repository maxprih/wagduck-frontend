import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'
import keycloak from './keycloak'

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(keycloak)
}
