import Keycloak from 'keycloak-js'
import { reactive, readonly } from 'vue'

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'wagduck',
  clientId: 'wagduck-id',
}

const state = reactive({
  keycloak: null,
  initialized: false,
  authenticated: false,
  token: null,
  userProfile: null,
})

export { state }

export async function initKeycloak () {
  const keycloak = new Keycloak(keycloakConfig)
  state.keycloak = keycloak
  await keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    enableLogging: false,
  })
  state.authenticated = keycloak.authenticated
  state.token = keycloak.token
  state.initialized = true
  if (keycloak.authenticated) {
    state.userProfile = await keycloak.loadUserProfile()
  }
  setInterval(async () => {
    if (keycloak.token) {
      await keycloak.updateToken(60)
      state.token = keycloak.token
    }
  }, 30000)
}

export function logout () {
  if (state.keycloak) {
    state.keycloak.logout();
    state.authenticated = false;
    state.token = null;
    state.userProfile = null;
  }
}

export function getUsername () {
  if (!state.authenticated || !state.userProfile) {
    return null;
  }

  return state.userProfile.username;
}

export default {
  install: app => {
    app.config.globalProperties.$keycloak = readonly(state)
    app.provide('keycloak', readonly(state))
  },
}
