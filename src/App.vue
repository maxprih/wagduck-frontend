<template>
  <v-app>
    <v-app-bar
      class="app-header"
      :class="{ 'app-header-shadow': !appBarTransparent }"
      :color="appBarTransparent ? 'transparent' : 'surface'"
      elevation="1"
    >
      <div class="d-flex align-center brand-container" @click="navigateHome">
        <div class="wagduck-logo ms-3 mr-3">
          <v-img
            alt="WagDuck Logo"
            class="logo-image"
            height="36"
            src="./assets/logo.svg"
            width="36"
          />
        </div>
        <h1 class="text-h5 brand-title">
          <span class="brand-highlight">WagDuck</span>
        </h1>
      </div>

      <v-spacer />

      <v-btn
        v-if="currentRoute !== '/projects'"
        class="mr-3"
        color="primary"
        prepend-icon="mdi-folder-multiple"
        variant="tonal"
        @click="navigateToProjects"
      >
        Projects
      </v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="user-menu-btn"
            icon
          >
            <v-avatar :color="userColor" size="34">
              <span class="text-subtitle-2 text-white">{{ userInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card class="menu-card" min-width="200">
          <v-card-text class="pa-3">
            <div class="d-flex align-center mb-3">
              <v-avatar :color="userColor" size="32">
                <span class="text-subtitle-2 text-white">{{ userInitials }}</span>
              </v-avatar>
              <div class="ml-3">
                <div class="text-subtitle-1 font-weight-medium">{{ userName }}</div>
              </div>
            </div>
          </v-card-text>
          <v-divider />
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-logout-variant"
              title="Sign Out"
              @click="logout"
            />
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>

    <v-footer
      app
      border
      class="app-footer"
    >
      <div class="d-flex align-center justify-space-between w-100 px-4">
        <div class="text-caption text-medium-emphasis">
          © {{ new Date().getFullYear() }} WagDuck Generator • v1.0.0
        </div>
        <div class="d-flex align-center">
          <v-btn
            v-for="(link, i) in footerLinks"
            :key="i"
            class="mx-1"
            density="comfortable"
            icon
            size="small"
            :title="link.title"
            variant="text"
          >
            <v-icon :icon="link.icon" />
          </v-btn>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getUsername, logout as keycloakLogout } from '@/plugins/keycloak'


  const router = useRouter()
  const route = useRoute()


  const appBarTransparent = ref(true)
  const userName = ref('Default')


  const userInitials = computed(() => {
    const nameParts = userName.value.split(' ')
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : nameParts[0].substring(0, 2)
  })

  const userColor = computed(() => {

    const colors = ['#5DB0A8', '#FF8A80', '#66BB6A', '#FFA726', '#2196F3', '#9C27B0']
    let hash = 0
    for (let i = 0; i < userName.value.length; i++) {
      hash = userName.value.charCodeAt(i) + ((hash << 5) - hash)
      hash = hash & hash
    }
    return colors[Math.abs(hash) % colors.length]
  })

  const currentRoute = computed(() => route.path)


  const footerLinks = [
    { icon: 'mdi-github', title: 'GitHub Repository', url: '#' },
    { icon: 'mdi-help-circle', title: 'Documentation', url: '#' },
    { icon: 'mdi-message-text', title: 'Feedback', url: '#' },
  ]


  const handleScroll = () => {
    appBarTransparent.value = window.scrollY < 50
  }


  const navigateHome = () => {
    router.push('/')
  }

  const navigateToProjects = () => {
    router.push('/projects')
  }

  const logout = () => {
    keycloakLogout()
  }


  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    userName.value = getUsername() || 'Default User'
  })
</script>

<style scoped>
.app-header {
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  border-bottom: 1px solid rgba(93, 176, 168, 0.1);
}

.app-header-shadow {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
}

.brand-container {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.brand-container:hover {
  opacity: 0.9;
}

.wagduck-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-container:hover .logo-image {
  transform: rotate(15deg);
}

.brand-title {
  letter-spacing: 0.3px;
  font-weight: 500;
}

.brand-highlight {
  color: var(--v-primary-base, #5DB0A8);
  font-weight: 700;
}

.user-menu-btn {
  transition: transform 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-menu-btn:hover {
  transform: scale(1.05);
}

.menu-card {
  border: 1px solid rgba(93, 176, 168, 0.12);
  background-color: var(--v-surface-base, #1F2937);
}

.app-footer {
  background-color: var(--v-background-base, #1A1A2E);
  border-top: 1px solid rgba(93, 176, 168, 0.1) !important;
  height: 48px !important;
}
</style>
