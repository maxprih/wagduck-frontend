<template>
  <v-container class="py-6" fluid>
    <v-card class="project-header mb-6" color="surface" elevation="3" rounded="lg">
      <v-row class="pa-0 ma-0">
        <v-col class="pa-0" cols="12">
          <div class="header-gradient d-flex align-center px-6 py-5">
            <v-btn
              class="mr-5"
              color="primary"
              prepend-icon="mdi-arrow-left"
              variant="tonal"
              @click="goBack"
            >
              Projects
            </v-btn>

            <template v-if="project && !loading">
              <v-avatar class="mr-4 project-avatar" :color="getProjectColor(project.projectName)" size="64">
                <v-icon color="white" size="32">{{ getProjectIcon(project.language) }}</v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center flex-wrap">
                  <h1 class="text-h3 font-weight-bold mb-0">{{ project.projectName }}</h1>
                  <v-chip
                    v-if="project.language"
                    class="ml-3 text-uppercase"
                    color="primary"
                    label
                    size="small"
                  >
                    {{ project.language }}
                  </v-chip>
                </div>
                <div class="d-flex align-center mt-2 gap-3 flex-wrap">
                  <span class="text-body-1 text-medium-emphasis d-flex align-center">
                    <v-icon class="mr-1" color="primary" size="small">mdi-database</v-icon>
                    {{ project.databaseType || "No Database" }}
                  </span>
                  <span class="text-body-1 text-medium-emphasis d-flex align-center">
                    <v-icon class="mr-1" color="primary" size="small">mdi-layers</v-icon>
                    {{ project.framework || "No Framework" }}
                  </span>
                  <span class="text-body-1 text-medium-emphasis d-flex align-center">
                    <v-icon class="mr-1" color="primary" size="small">mdi-tools</v-icon>
                    {{ project.buildTool || "No Build Tool" }}
                  </span>
                </div>
              </div>

              <v-spacer />

              <v-btn
                class="download-btn"
                color="accent"
                :loading="generatingProject"
                prepend-icon="mdi-download"
                size="large"
                variant="elevated"
                @click="handleGenerateProject"
              >
                Generate
              </v-btn>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-row v-if="loading && !project" align="center" class="fill-height" justify="center">
      <v-col class="text-center" cols="12" md="6">
        <v-progress-circular
          class="mb-6"
          color="primary"
          indeterminate
          size="64"
          width="5"
        />
        <h2 class="text-h5 text-medium-emphasis mb-2">Loading Project</h2>
        <p class="text-body-1 text-medium-emphasis">Please wait while we fetch your project data...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error && !project" align="center" class="fill-height" justify="center">
      <v-col class="text-center" cols="12" md="8">
        <v-card class="pa-5" color="background" elevation="2" rounded="lg">
          <v-icon class="mb-4" color="error" size="64">mdi-alert-circle-outline</v-icon>
          <h2 class="text-h4 mb-3">Error Loading Project</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">{{ error }}</p>
          <v-btn
            class="mr-2"
            color="primary"
            size="large"
            variant="flat"
            @click="fetchProject"
          >
            <v-icon class="mr-2" left>mdi-refresh</v-icon>Retry
          </v-btn>
          <v-btn size="large" variant="outlined" @click="goBack">
            <v-icon class="mr-2" left>mdi-arrow-left</v-icon>Go Back
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="project">
      <v-col cols="12" lg="4">
        <v-card class="mb-6 project-settings-card" color="surface" elevation="2" rounded="lg">
          <v-card-title class="px-4 py-3 d-flex align-center">
            <v-icon class="mr-2" color="primary" size="24">mdi-cog</v-icon>
            <span class="text-h6">Project Settings</span>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <v-form ref="editFormRef">
              <v-text-field
                v-model="editForm.projectName"
                class="mb-4"
                color="primary"
                density="comfortable"
                label="Project Name"
                prepend-inner-icon="mdi-rename-box"
                :rules="[rules.required]"
                variant="outlined"
              />

              <v-select
                v-model="editForm.language"
                class="mb-4"
                color="primary"
                density="comfortable"
                :items="languages"
                label="Language"
                prepend-inner-icon="mdi-code-tags"
                :rules="[rules.required]"
                variant="outlined"
              />

              <v-text-field
                v-if="editForm.language === 'JAVA' || editForm.language === 'KOTLIN'"
                v-model="editForm.basePackage"
                class="mb-4"
                color="primary"
                density="comfortable"
                hint="e.g., com.example.app"
                label="Base Package"
                persistent-hint
                prepend-inner-icon="mdi-folder-pound-outline"
                :rules="[rules.required, rules.basePackage]"
                variant="outlined"
              />

              <v-text-field
                v-if="editForm.language === 'GO'"
                v-model="editForm.moduleName"
                class="mb-4"
                color="primary"
                density="comfortable"
                hint="e.g., myproject"
                label="Module Name"
                persistent-hint
                prepend-inner-icon="mdi-folder-pound-outline"
                :rules="[rules.required, rules.moduleName]"
                variant="outlined"
              />

              <v-select
                v-model="editForm.framework"
                class="mb-4"
                color="primary"
                density="comfortable"
                :disabled="!editForm.language || frameworksByLanguage.length === 0"
                :items="frameworksByLanguage"
                label="Framework"
                :no-data-text="editForm.language ? 'No frameworks for this language' : 'Select a language first'"
                prepend-inner-icon="mdi-layers-outline"
                :rules="[rules.required]"
                variant="outlined"
              />

              <v-select
                v-model="editForm.databaseType"
                class="mb-4"
                color="primary"
                density="comfortable"
                :items="databaseTypes"
                label="Database"
                prepend-inner-icon="mdi-database-outline"
                :rules="[rules.required]"
                variant="outlined"
              />

              <v-select
                v-model="editForm.buildTool"
                class="mb-4"
                color="primary"
                density="comfortable"
                :disabled="!editForm.language || buildToolsByLanguage.length === 0"
                :items="buildToolsByLanguage"
                label="Build Tool"
                :no-data-text="editForm.language ? 'No build tools for this language' : 'Select a language first'"
                prepend-inner-icon="mdi-tools"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-4 py-3">
            <div class="d-flex flex-wrap gap-2 justify-space-between w-100">
              <div class="project-meta d-flex flex-column">
                <span class="text-caption text-medium-emphasis d-flex align-center">
                  <v-icon class="mr-1" size="12">mdi-calendar</v-icon>
                  Created: {{ formatDate(project.createdAt) }}
                </span>
                <span class="text-caption text-medium-emphasis d-flex align-center mt-1">
                  <v-icon class="mr-1" size="12">mdi-update</v-icon>
                  Updated: {{ formatDate(project.updatedAt) }}
                </span>
              </div>
              <v-btn
                v-if="settingsChanged"
                color="primary"
                :loading="saving"
                prepend-icon="mdi-content-save"
                size="default"
                variant="elevated"
                @click="saveSettings"
              >
                Save Settings
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>

        <v-card class="mb-6" color="surface" elevation="2" rounded="lg">
          <v-card-title class="px-4 py-3 d-flex align-center">
            <v-icon class="mr-2" color="primary" size="24">mdi-api</v-icon>
            <span class="text-h6">Project API Endpoints</span>
          </v-card-title>

          <v-divider />

          <v-card-text v-if="entitiesLoading" class="pa-4">
            <div class="d-flex justify-center py-4">
              <v-progress-circular color="primary" indeterminate />
            </div>
          </v-card-text>

          <v-card-text v-else-if="entities.length === 0" class="pa-4">
            <v-alert
              border="start"
              class="mb-0"
              color="info"
              density="compact"
              icon="mdi-information-outline"
              variant="tonal"
            >
              No entities have been created yet. Add an entity to view its API endpoints.
            </v-alert>
          </v-card-text>

          <v-card-text v-else class="pa-4">
            <div v-for="entity in entities" :key="entity.id" class="mb-4">
              <v-card class="entity-api-card" rounded="lg" variant="outlined">
                <v-card-item>
                  <template #prepend>
                    <v-avatar class="mr-3" :color="getProjectColor(entity.entityName)" size="32">
                      <v-icon color="white" size="16">mdi-database</v-icon>
                    </v-avatar>
                  </template>
                  <v-card-title>
                    <span class="font-weight-medium">{{ entity.entityName }}</span>
                  </v-card-title>
                  <v-card-subtitle>
                    Table: {{ entity.tableName }}
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text class="pt-0">
                  <ApiEndpointsPanel
                    :entity-id="entity.id"
                    @endpoints-updated="showSnackbar('API endpoints updated for ' + entity.entityName, 'success')"
                  />
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="entities-card fill-height" color="surface" elevation="2" rounded="lg">
          <v-card-title class="px-4 py-3 d-flex align-center">
            <v-icon class="mr-2" color="primary" size="24">mdi-database-edit</v-icon>
            <span class="text-h6">Project Entities</span>
            <v-spacer />
            <v-tooltip location="bottom" text="View Schema Graph">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  class="mr-2"
                  color="primary"
                  :disabled="entitiesLoading || !project || entities.length === 0"
                  icon="mdi-graphql"
                  size="small"
                  variant="outlined"
                  @click="showGraphDialog = true"
                />
              </template>
            </v-tooltip>
            <v-btn
              color="primary"
              :disabled="entitiesLoading || !project"
              prepend-icon="mdi-plus"
              size="default"
              variant="elevated"
              @click="openAddEntityDialog = true"
            >
              Add Entity
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <div v-if="entitiesLoading" class="text-center py-12 d-flex flex-column justify-center align-center">
              <v-progress-circular
                class="mb-4"
                color="primary"
                indeterminate
                size="48"
              />
              <p class="text-subtitle-1 text-medium-emphasis">Loading Entities...</p>
            </div>

            <template v-else-if="entities.length > 0">
              <v-row>
                <v-col
                  v-for="entity in entities"
                  :key="entity.id"
                  class="entity-card-col"
                  cols="12"
                  lg="6"
                  md="6"
                >
                  <v-hover v-slot="{ isHovering, props }">
                    <v-card
                      v-bind="props"
                      class="entity-card h-100 d-flex flex-column"
                      :class="{ 'on-hover': isHovering }"
                      color="background"
                      :elevation="isHovering ? 8 : 2"
                      rounded="lg"
                      @click="openEntity(entity)"
                    >
                      <div class="entity-card-header" :style="`background: linear-gradient(to right, ${getProjectColor(entity.entityName)}22, transparent)`">
                        <v-card-item>
                          <template #prepend>
                            <v-avatar class="entity-icon" :color="getProjectColor(entity.entityName)" size="50">
                              <v-icon color="white" size="24">mdi-database</v-icon>
                            </v-avatar>
                          </template>
                          <v-card-title class="text-h6 font-weight-bold pb-1">
                            {{ entity.entityName }}
                          </v-card-title>
                          <v-card-subtitle class="pt-1">
                            <span class="text-body-2">Table: <code>{{ entity.tableName }}</code></span>
                          </v-card-subtitle>
                        </v-card-item>
                      </div>

                      <v-card-text class="entity-card-content pt-3 flex-grow-1">
                        <div class="entity-stats d-flex gap-4 mb-3">
                          <div class="entity-stat pa-2 rounded">
                            <div class="text-h5 font-weight-bold text-center">{{ entity.attributes?.length || 0 }}</div>
                            <div class="text-caption text-center">Fields</div>
                          </div>

                          <div class="entity-stat pa-2 rounded">
                            <div class="text-h5 font-weight-bold text-center">{{ entity.relationships?.length || 0 }}</div>
                            <div class="text-caption text-center">Relations</div>
                          </div>
                        </div>

                        <div v-if="entity.attributes && entity.attributes.length > 0" class="entity-fields mb-2">
                          <div class="text-caption text-uppercase font-weight-medium mb-2 d-flex align-center">
                            <v-icon class="mr-1" size="14">mdi-format-list-bulleted</v-icon>
                            Fields
                          </div>
                          <div class="entity-field-list">
                            <div
                              v-for="(attribute, index) in entity.attributes.slice(0, 3)"
                              :key="attribute.id || index"
                              class="entity-field d-flex align-center pa-2 rounded"
                            >
                              <div class="field-icon-wrapper mr-2">
                                <v-icon
                                  :color="getFieldTypeColor(attribute.dataType)"
                                  size="18"
                                >
                                  {{ getFieldTypeIcon(attribute.dataType) }}
                                </v-icon>
                              </div>
                              <div class="field-name font-weight-medium">{{ attribute.attributeName }}</div>
                              <div class="field-type text-caption text-medium-emphasis ml-auto">{{ attribute.dataType }}</div>
                            </div>
                            <div v-if="entity.attributes.length > 3" class="text-caption text-center mt-1">
                              + {{ entity.attributes.length - 3 }} more fields
                            </div>
                          </div>
                        </div>

                        <div v-if="entity.description" class="entity-description text-caption text-medium-emphasis mt-3">
                          {{ entity.description }}
                        </div>
                      </v-card-text>

                      <v-card-actions class="entity-card-actions pa-2">
                        <v-spacer />
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-pencil"
                          size="small"
                          variant="tonal"
                          @click.stop="openEntity(entity)"
                        >
                          Edit Entity
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-hover>
                </v-col>
              </v-row>
            </template>

            <div v-else-if="!entitiesLoading && entities.length === 0 && !entityFetchError" class="text-center py-10 d-flex flex-column justify-center align-center">
              <v-icon class="mb-6" color="secondary" size="80">mdi-database-off-outline</v-icon>
              <h2 class="text-h5 text-grey-darken-1 mb-3">No Entities Defined</h2>
              <p class="text-body-1 text-grey-darken-2 mb-8">
                This project doesn't have any entities yet. <br>
                Start by adding your first entity to model your data structure.
              </p>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus-circle-outline"
                size="large"
                variant="flat"
                @click="openAddEntityDialog = true"
              >
                Create First Entity
              </v-btn>
            </div>

            <v-alert
              v-if="entityFetchError && !entitiesLoading"
              border="start"
              class="mt-4"
              closable
              density="compact"
              icon="mdi-alert-outline"
              type="warning"
              variant="tonal"
              @click:close="entityFetchError = ''"
            >
              {{ entityFetchError }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="openAddEntityDialog" max-width="550">
      <v-card color="surface" rounded="lg">
        <v-form ref="addEntityFormRef" @submit.prevent="handleAddEntity">
          <v-card-title class="px-4 py-3 bg-primary-darken-2">
            <v-icon class="mr-2" color="primary">mdi-database-plus</v-icon>
            <span class="text-h6">Add New Entity</span>
          </v-card-title>

          <v-card-text class="pt-4 px-4">
            <v-alert
              v-if="addEntityError"
              class="mb-4"
              closable
              density="compact"
              type="error"
              variant="tonal"
              @click:close="addEntityError = ''"
            >{{ addEntityError }}</v-alert>

            <v-text-field
              v-model="newEntity.entityName"
              autofocus
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="Must be PascalCase, e.g., UserProfile, OrderItem"
              label="Entity Name"
              persistent-hint
              :rules="[rules.required, rules.entityName]"
              variant="outlined"
            />

            <v-text-field
              v-model="newEntity.tableName"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="Must be snake_case, e.g., user_profiles, order_items"
              label="Table Name"
              persistent-hint
              :rules="[rules.required, rules.tableName]"
              variant="outlined"
            />

            <v-textarea
              v-model="newEntity.description"
              auto-grow
              color="primary"
              density="comfortable"
              label="Description (Optional)"
              rows="3"
              variant="outlined"
            />
          </v-card-text>

          <v-card-actions class="px-4 pb-4 pt-0">
            <v-spacer />
            <v-btn
              variant="text"
              @click="closeAddEntityDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :loading="addingEntity"
              type="submit"
              variant="elevated"
            >
              Create Entity
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showGraphDialog"
      fullscreen
      no-click-animation
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <EntityRelationshipGraph
        v-if="showGraphDialog"
        :project-id="projectId"
        @close="showGraphDialog = false"
        @navigate-to-entity="navigateToEntityFromGraph"
      />
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top end"
      :timeout="4000"
    >
      <v-icon class="mr-2">{{ snackbarIcon }}</v-icon>
      {{ snackbarText }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import EntityRelationshipGraph from '@/components/EntityRelationshipGraph.vue'
  import ApiEndpointsPanel from '@/components/ApiEndpointsPanel.vue'
  import {
    createEntity,
    generateProject as generateProjectApi,
    getAllEntitiesForProject,
    getProject,
    updateApiEndpoints,
    updateProject,
  } from '@/api/index.js'
  import { state as keycloakState } from '@/plugins/keycloak'


  const route = useRoute()
  const router = useRouter()
  const projectId = route.params.id


  const project = ref(null)
  const loading = ref(true)
  const error = ref('')
  const saving = ref(false)
  const generatingProject = ref(false)
  const isInitializing = ref(true);


  const editFormRef = ref(null)
  const editForm = ref({
    projectName: '',
    language: '',
    basePackage: '',
    moduleName: '',
    framework: '',
    databaseType: '',
    buildTool: '',
  })


  const originalForm = ref({})


  const settingsChanged = computed(() => {
    return Object.keys(editForm.value).some(key => editForm.value[key] !== originalForm.value[key])
  })


  const languages = ['JAVA', 'KOTLIN', 'GO']
  const allFrameworks = {
    JAVA: ['SPRING_BOOT'],
    KOTLIN: ['SPRING_BOOT'],
    GO: ['GIN'],
  }
  const databaseTypes = ['POSTGRESQL']
  const allBuildTools = {
    JAVA: ['MAVEN', 'GRADLE'],
    KOTLIN: ['GRADLE'],
    GO: ['GO_MODULES'],
  }


  const frameworksByLanguage = computed(() => {
    return editForm.value.language ? allFrameworks[editForm.value.language] || [] : []
  })

  const buildToolsByLanguage = computed(() => {
    return editForm.value.language ? allBuildTools[editForm.value.language] || [] : []
  })


  const entities = ref([])
  const entitiesLoading = ref(true)
  const entityFetchError = ref('')


  const openAddEntityDialog = ref(false)
  const addEntityFormRef = ref(null)
  const newEntity = ref({ entityName: '', tableName: '', description: '' })
  const addingEntity = ref(false)
  const addEntityError = ref('')


  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')
  const showGraphDialog = ref(false)


  const snackbarIcon = computed(() => {
    switch (snackbarColor.value) {
      case 'success': return 'mdi-check-circle'
      case 'error': return 'mdi-alert-circle'
      case 'warning': return 'mdi-alert'
      default: return 'mdi-information'
    }
  })


  const rules = {
    required: value => !!value || 'This field is required.',
    basePackage: value => (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(value) || 'Invalid package name (e.g., com.example.app, all lowercase).'),
    moduleName: value => (/^[a-zA-Z0-9_./-]+$/.test(value) || 'Invalid module name (e.g., myproject or github.com/user/project)'),
    entityName: value => (/^[A-Z][a-zA-Z0-9]*$/.test(value) || 'Entity name must be PascalCase (e.g., UserProfile).'),
    tableName: value => (/^[a-z_][a-z0-9_]*$/.test(value) || 'Table name must be snake_case (e.g., user_profiles).'),
  }


  function showSnackbar (text, color = 'success') {
    snackbarText.value = text
    snackbarColor.value = color
    snackbar.value = true
  }

  function goBack () {
    router.push('/projects')
  }

  const projectColors = ['#5DB0A8', '#FF8A80', '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#607D8B', '#795548', '#FFC107'];

  function getProjectColor (name) {
    if (!name) return projectColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return projectColors[Math.abs(hash) % projectColors.length];
  }

  function getProjectIcon (language) {
    switch (language?.toUpperCase()) {
      case 'JAVA': return 'mdi-language-java';
      case 'KOTLIN': return 'mdi-language-kotlin';
      case 'GO': return 'mdi-language-go';
      default: return 'mdi-file-code-outline';
    }
  }

  function getFieldTypeIcon (dataType) {
    const typeMap = {
      'String': 'mdi-format-text',
      'Integer': 'mdi-numeric',
      'Long': 'mdi-numeric',
      'Float': 'mdi-decimal',
      'Double': 'mdi-decimal',
      'Boolean': 'mdi-toggle-switch',
      'UUID': 'mdi-identifier',
      'Date': 'mdi-calendar',
      'DateTime': 'mdi-calendar-clock',
      'Text': 'mdi-text-box',
      'Blob': 'mdi-file-binary',
      'Json': 'mdi-code-json',
      'Enum': 'mdi-format-list-bulleted-type',
      'Decimal': 'mdi-currency-usd',
    }
    return typeMap[dataType] || 'mdi-database'
  }

  function getFieldTypeColor (dataType) {
    const colorMap = {
      'String': 'primary',
      'Integer': 'info',
      'Long': 'info',
      'Float': 'accent',
      'Double': 'accent',
      'Boolean': 'success',
      'UUID': 'primary',
      'Date': 'warning',
      'DateTime': 'warning',
      'Text': 'primary',
      'Blob': 'secondary',
      'Json': 'warning',
      'Enum': 'accent',
      'Decimal': 'success',
    }
    return colorMap[dataType] || 'secondary'
  }

  function formatDate (dateString) {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }


  async function fetchProject () {
    isInitializing.value = true;
    loading.value = true
    error.value = ''
    project.value = null

    try {
      const userId = keycloakState.userProfile?.id
      if (!userId) throw new Error('User not authenticated. Please login.')

      const res = await getProject(projectId, userId)
      project.value = res.data


      Object.assign(editForm.value, {
        projectName: res.data.projectName || '',
        language: res.data.language || '',
        basePackage: res.data.basePackage || '',
        moduleName: res.data.moduleName || '',
        framework: res.data.framework || '',
        databaseType: res.data.databaseType || '',
        buildTool: res.data.buildTool || '',
      })


      originalForm.value = { ...editForm.value }

      await fetchEntities()
    } catch (e) {
      console.error('Fetch project error:', e)
      error.value = e.response?.data?.message || e.message || 'Failed to load project details.'
    } finally {
      loading.value = false


      nextTick(() => {
        isInitializing.value = false;
      });
    }
  }
  async function fetchEntities () {
    entitiesLoading.value = true
    entityFetchError.value = ''

    try {
      if (!project.value || !projectId) {
        console.warn('Cannot fetch entities: Project ID or project data is missing.')
        entities.value = []
        return
      }

      const res = await getAllEntitiesForProject(projectId)
      entities.value = res.data.map(entity => ({
        ...entity,
        attributes: entity.attributes || [],
        relationships: entity.relationships || [],
        description: entity.description || '',
        endpoints: entity.endpoints || [],
      }))
    } catch (e) {
      console.error('Fetch entities error:', e)
      entityFetchError.value = e.response?.data?.message || e.message || 'Failed to load entities for this project.'
    } finally {
      entitiesLoading.value = false
    }
  }

  async function validateForm (formRef) {
    if (!formRef || !formRef.value) return true
    const { valid } = await formRef.value.validate()
    return valid
  }

  async function saveSettings () {
    const isValid = await validateForm(editFormRef)
    if (!isValid) {
      showSnackbar('Please correct the errors in the form.', 'warning')
      return
    }

    saving.value = true
    try {
      const userId = keycloakState.userProfile?.id
      if (!userId) throw new Error('User not authenticated.')

      const payload = { ...editForm.value }


      if (editForm.value.language !== 'JAVA' && editForm.value.language !== 'KOTLIN') {
        delete payload.basePackage
      } else if (!payload.basePackage) {
        payload.basePackage = `com.example.${payload.projectName.toLowerCase().replace(/[^a-z0-9]/gi, '')}`
      }

      if (editForm.value.language !== 'GO') {
        delete payload.moduleName
      } else if (!payload.moduleName) {
        payload.moduleName = payload.projectName.toLowerCase().replace(/[^a-z0-9-]/gi, '')
      }

      const res = await updateProject(projectId, userId, payload)

      project.value = { ...project.value, ...res.data }
      Object.assign(editForm.value, {
        projectName: res.data.projectName || '',
        language: res.data.language || '',
        basePackage: res.data.basePackage || '',
        moduleName: res.data.moduleName || '',
        framework: res.data.framework || '',
        databaseType: res.data.databaseType || '',
        buildTool: res.data.buildTool || '',
      })


      originalForm.value = { ...editForm.value }

      showSnackbar('Project settings saved successfully!', 'success')
    } catch (e) {
      console.error('Save settings error:', e)
      showSnackbar(e.response?.data?.message || e.message || 'Failed to save project settings.', 'error')
    } finally {
      saving.value = false
    }
  }

  async function handleGenerateProject () {
    generatingProject.value = true
    try {
      const ownerId = keycloakState.userProfile?.id
      if (!ownerId) throw new Error('User not authenticated.')

      const response = await generateProjectApi(projectId, ownerId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers['content-disposition']
      let filename = `${project.value?.projectName || 'project'}-${new Date().toISOString().split('T')[0]}.zip`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']+)['"]?;?/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1])
        }
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      showSnackbar('Project generated and download started!', 'success')
    } catch (e) {
      console.error('Error generating project:', e)
      const errorMsg = e.response?.data instanceof Blob ?
        'Failed to generate project: Server returned an unexpected file.' :
        (e.response?.data?.message || e.message || 'Failed to generate project.')
      showSnackbar(errorMsg, 'error')
    } finally {
      generatingProject.value = false
    }
  }

  async function handleAddEntity () {
    addEntityError.value = ''
    const isValid = await validateForm(addEntityFormRef)

    if (!isValid) {
      addEntityError.value = 'Please correct the errors in the form.'
      return
    }

    addingEntity.value = true
    try {
      const payload = { ...newEntity.value, projectId }
      const res = await createEntity(payload)

      const newEntityData = {
        ...res.data,
        attributes: res.data.attributes || [],
        relationships: res.data.relationships || [],
        description: res.data.description || '',
      }


      const createEndpoints = {
        methods: {
          GET: true,
          GET_LIST: true,
          POST: true,
          PUT: true,
          DELETE: true,
        },
      }

      await updateApiEndpoints(res.data.id, createEndpoints)


      entities.value.unshift(newEntityData)

      closeAddEntityDialog()
      showSnackbar('Entity added successfully!', 'success')
    } catch (e) {
      console.error('Add entity error:', e)
      addEntityError.value = e.response?.data?.message || e.message || 'Failed to add entity.'
    } finally {
      addingEntity.value = false
    }
  }

  function closeAddEntityDialog () {
    openAddEntityDialog.value = false
    newEntity.value = { entityName: '', tableName: '', description: '' }
    addEntityError.value = ''

    if (addEntityFormRef.value) {
      addEntityFormRef.value.resetValidation()
    }
  }

  function openEntity (entity) {
    router.push({ path: `/entity/${entity.id}`, query: { projectId } })
  }

  function navigateToEntityFromGraph (entityId) {
    showGraphDialog.value = false
    router.push({ path: `/entity/${entityId}`, query: { projectId } })
  }


  watch(() => editForm.value.language, (newLang, oldLang) => {

    if (isInitializing.value) {
      return;
    }

    if (newLang !== oldLang) {


      editForm.value.buildTool = ''
      editForm.value.framework = ''

      if (newLang !== 'JAVA' && newLang !== 'KOTLIN') {
        editForm.value.basePackage = ''
      } else {
        if (project.value?.projectName && !editForm.value.basePackage) {
          const suggestedPackage = `com.example.${project.value.projectName.toLowerCase().replace(/[^a-z0-9]/gi, '')}`
          editForm.value.basePackage = suggestedPackage
        }
      }

      if (newLang !== 'GO') {
        editForm.value.moduleName = ''
      } else {
        if (project.value?.projectName && !editForm.value.moduleName) {
          editForm.value.moduleName = project.value.projectName.toLowerCase().replace(/[^a-z0-9-]/gi, '')
        }
      }


      if (newLang === 'GO') {
        editForm.value.buildTool = 'GO_MODULES'
        editForm.value.framework = 'GIN'
      } else if (newLang === 'JAVA') {
        editForm.value.buildTool = 'MAVEN'
        editForm.value.framework = 'SPRING_BOOT'
      } else if (newLang === 'KOTLIN') {
        editForm.value.buildTool = 'GRADLE'
        editForm.value.framework = 'SPRING_BOOT'
      }
    }
  }, { immediate: false })


  onMounted(() => {
    fetchProject()
  })
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 174px);
}

.project-header {
  border: 1px solid rgba(93, 176, 168, 0.2);
  overflow: hidden;
}

.header-gradient {
  background: linear-gradient(to right, rgba(26, 26, 46, 0.9), rgba(31, 41, 55, 0.85));
  position: relative;
}

.project-avatar {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.download-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.project-settings-card {
  border: 1px solid rgba(93, 176, 168, 0.12);
}

.entity-card-col {
  margin-bottom: 16px;
}

.entity-card {
  border: 1px solid rgba(93, 176, 168, 0.12);
  transition: all 0.3s ease;
  overflow: hidden;
}

.entity-card.on-hover {
  border-color: rgba(93, 176, 168, 0.4);
  transform: translateY(-5px);
}

.entity-card-header {
  border-bottom: 1px solid rgba(93, 176, 168, 0.1);
  padding-bottom: 8px;
}

.entity-icon {
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.entity-card-content {
  background-color: rgba(26, 26, 46, 0.4);
}

.entity-stats {
  display: flex;
  justify-content: space-between;
}

.entity-stat {
  flex: 1;
  background-color: rgba(31, 41, 55, 0.6);
  border: 1px solid rgba(93, 176, 168, 0.15);
}

.entity-field {
  background-color: rgba(31, 41, 55, 0.7);
  border: 1px solid rgba(93, 176, 168, 0.1);
  margin-bottom: 4px;
}

.entity-field:last-child {
  margin-bottom: 0;
}

.field-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(93, 176, 168, 0.1);
}

code {
  background-color: rgba(31, 41, 55, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Mono', Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 0.85rem;
}

.entity-api-card {
  background-color: rgba(26, 26, 46, 0.4);
  border: 1px solid rgba(93, 176, 168, 0.15);
}

@media (max-width: 960px) {
  .project-meta {
    margin-bottom: 16px;
  }
}
</style>
