<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col class="text-center" cols="12" lg="6" md="8">
        <template v-if="!redirecting && !keycloakState.authenticated">
          <v-card class="pa-sm-8 pa-6" elevation="2" rounded="lg">
            <v-img
              alt="WagDuck Logo"
              class="mb-6 mx-auto"
              height="100"
              src="@/assets/logo.svg"
              width="100"
            />
            <h1 class="text-h4 text-sm-h3 font-weight-bold mb-3">
              Welcome to WagDuck Backend Generator
            </h1>
            <p class="text-h6 text-medium-emphasis font-weight-regular mb-8">
              Streamline your backend development. Create, manage, and generate projects with ease.
            </p>
            <v-btn
              color="primary"
              prepend-icon="mdi-rocket-launch-outline"
              size="x-large"
              variant="flat"
              @click="goToProjects"
            >
              Get Started
            </v-btn>
          </v-card>
        </template>
        <template v-else-if="redirecting || keycloakState.authenticated">
          <v-progress-circular color="primary" indeterminate size="64" />
          <p class="mt-4 text-h6 text-medium-emphasis">Loading your workspace...</p>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { state as keycloakState } from '@/plugins/keycloak'

  const router = useRouter()
  const redirecting = ref(false)

  const goToProjects = () => {
    router.push('/projects')
  }


  watch(
    () => ({ auth: keycloakState.authenticated, init: keycloakState.initialized }),
    newState => {
      if (newState.init && newState.auth) {
        redirecting.value = true;
        router.push('/projects')
      } else if (newState.init && !newState.auth) {
        redirecting.value = false;
      }
    },
    { immediate: true, deep: true }
  )
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px - 40px);
}
</style>
