<template>
  <v-card
    class="api-endpoints-card"
    color="surface"
    elevation="2"
    rounded="lg"
    variant="elevated"
  >
    <v-card-text class="px-4 py-3">
      <div v-if="loading" class="d-flex justify-center py-4">
        <v-progress-circular color="primary" indeterminate />
      </div>

      <v-alert
        v-else-if="error"
        border="start"
        class="mb-3"
        color="error"
        density="compact"
        icon="mdi-alert-circle-outline"
        variant="tonal"
      >
        {{ error }}
      </v-alert>

      <template v-else>
        <div class="endpoints-header d-flex align-center text-caption text-medium-emphasis mb-2 px-2">
          <div class="endpoint-status-col">Status</div>
          <div class="endpoint-method-col">Method</div>
          <div class="endpoint-path-col">HTTP Path</div>
        </div>

        <v-hover v-for="(endpoint, index) in endpointsMapped" :key="endpoint.apiMethod" v-slot="{ isHovering, props: hoverProps }">
          <v-sheet
            v-bind="hoverProps"
            :class="['endpoint-row d-flex align-center px-2 py-2 mb-2', {'endpoint-row-hover': isHovering}]"
            color="background"
            rounded="lg"
          >
            <div class="endpoint-status-col">
              <v-switch
                v-model="endpointStates[endpoint.apiMethod]"
                :color="getEndpointColor(endpoint.apiMethod)"
                density="comfortable"
                :disabled="savingMethods[endpoint.apiMethod]"
                hide-details
                inset
                :loading="savingMethods[endpoint.apiMethod]"
                @update:model-value="(value) => updateEndpoint(index, endpoint.apiMethod, value)"
              />
            </div>
            <div class="endpoint-method-col">
              <v-chip
                class="text-body-2 font-weight-medium"
                :class="{'text-disabled': !endpointStates[endpoint.apiMethod]}"
                :color="getEndpointColor(endpoint.apiMethod)"
                size="small"
                :variant="endpointStates[endpoint.apiMethod] ? 'elevated' : 'outlined'"
              >
                {{ formatMethod(endpoint.apiMethod) }}
              </v-chip>
            </div>
            <div class="endpoint-path-col endpoint-details">
              <code :class="{'text-disabled': !endpointStates[endpoint.apiMethod]}">{{ endpoint.httpPath }}</code>
              <div class="endpoint-description text-caption text-medium-emphasis mt-1">
                {{ getMethodDescription(endpoint.apiMethod) }}
              </div>
            </div>
          </v-sheet>
        </v-hover>

        <v-alert
          v-if="endpointsMapped.length === 0"
          border="start"
          class="mb-0 mt-3"
          color="info"
          density="compact"
          icon="mdi-information-outline"
          variant="tonal"
        >
          No API endpoints configured for this entity.
        </v-alert>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { getApiEndpoints, updateApiEndpoints } from '@/api/index.js'

  const props = defineProps({
    entityId: {
      type: String,
      required: true,
    },
  })

  const emit = defineEmits(['endpoints-updated'])

  const endpoints = ref([])
  const endpointStates = reactive({
    GET: true,
    GET_LIST: true,
    POST: true,
    PUT: true,
    DELETE: true,
  })
  const savingMethods = reactive({})
  const loading = ref(false)
  const error = ref(null)


  const methodMap = {
    GET: { label: 'GET', description: 'Get single entity by ID' },
    GET_LIST: { label: 'GET LIST', description: 'Get list of entities' },
    POST: { label: 'POST', description: 'Create new entity' },
    PUT: { label: 'PUT', description: 'Update existing entity' },
    DELETE: { label: 'DELETE', description: 'Delete entity by ID' },
  }


  const endpointsMapped = computed(() => {
    const methods = ['GET', 'GET_LIST', 'POST', 'PUT', 'DELETE']

    return methods.map(method => {
      const endpoint = endpoints.value.find(e => e.apiMethod === method)
      return {
        apiMethod: method,
        httpPath: endpoint?.httpPath || getDefaultPath(method),
        id: endpoint?.id || null,
      }
    })
  })

  function getDefaultPath (method) {
    const basePath = '/api/v1/{entityPath}'
    switch (method) {
      case 'GET':
        return `${basePath}/{id}`
      case 'GET_LIST':
        return basePath
      case 'POST':
        return basePath
      case 'PUT':
        return `${basePath}/{id}`
      case 'DELETE':
        return `${basePath}/{id}`
      default:
        return basePath
    }
  }

  function formatMethod (method) {
    return methodMap[method]?.label || method
  }

  function getMethodDescription (method) {
    return methodMap[method]?.description || ''
  }

  function getEndpointColor (method) {
    const colorMap = {
      GET: 'info',
      GET_LIST: 'info',
      POST: 'success',
      PUT: 'warning',
      DELETE: 'error',
    }
    return colorMap[method] || 'primary'
  }

  async function updateEndpoint (index, method, enabled) {

    savingMethods[method] = true

    try {
      const payload = {
        methods: {
          GET: endpointStates.GET,
          GET_LIST: endpointStates.GET_LIST,
          POST: endpointStates.POST,
          PUT: endpointStates.PUT,
          DELETE: endpointStates.DELETE,
        },
      }


      payload.methods[method] = enabled

      await updateApiEndpoints(props.entityId, payload)


      emit('endpoints-updated', { method, enabled })


      updateEndpointsInBackground()
    } catch (err) {
      console.error(`Error updating ${method} endpoint:`, err)


      endpointStates[method] = !enabled

      error.value = `Failed to update ${formatMethod(method)} endpoint. Please try again.`


      setTimeout(() => {
        error.value = null
      }, 3000)
    } finally {

      savingMethods[method] = false
    }
  }


  function updateEndpointsInBackground () {
    if (!props.entityId) return

    getApiEndpoints(props.entityId)
      .then(response => {

        endpoints.value = response.data || []
      })
      .catch(err => {
        console.error('Background refresh of endpoints failed:', err)
      })
  }

  async function loadEndpoints () {
    if (loading.value || !props.entityId) return

    loading.value = true
    error.value = null

    try {
      const response = await getApiEndpoints(props.entityId)
      endpoints.value = response.data || []


      const methods = ['GET', 'GET_LIST', 'POST', 'PUT', 'DELETE']
      methods.forEach(method => {

        endpointStates[method] = endpoints.value.some(e => e.apiMethod === method)
      })
    } catch (err) {
      console.error('Error fetching API endpoints:', err)
      error.value = 'Failed to load API endpoints. Please try again.'
    } finally {
      loading.value = false
    }
  }

  watch(() => props.entityId, newId => {
    if (newId) {
      loadEndpoints()
    }
  }, { immediate: true })

  onMounted(() => {
    if (props.entityId) {
      loadEndpoints()
    }
  })
</script>

<style scoped>
.api-endpoints-card {
  border: 1px solid rgba(93, 176, 168, 0.12);
}

.endpoint-row {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.endpoint-row-hover {
  border-color: rgba(93, 176, 168, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.endpoint-status-col {
  width: 70px;
  flex-shrink: 0;
}

.endpoint-method-col {
  width: 110px;
  flex-shrink: 0;
}

.endpoint-path-col {
  flex-grow: 1;
  overflow-x: auto;
}

.endpoint-details {
  display: flex;
  flex-direction: column;
}

code {
  background-color: rgba(31, 41, 55, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Fira Mono', Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 0.85rem;
}

.text-disabled {
  opacity: 0.6;
}

.v-sheet {
  transition: background-color 0.3s ease;
}

.v-switch {
  transition: opacity 0.3s ease;
}

.endpoint-description {
  transition: opacity 0.3s ease;
}
</style>
