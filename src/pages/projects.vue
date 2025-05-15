<template>
  <v-container class="py-6" fluid>
    <v-card class="projects-header mb-6" color="surface" elevation="3" rounded="lg">
      <div class="hero-gradient px-6 py-5">
        <v-row align="center" justify="space-between" no-gutters>
          <v-col class="d-flex align-center" cols="auto">
            <v-avatar class="mr-5 header-icon" color="primary" size="64">
              <v-icon color="white" size="36">mdi-folder-multiple</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h3 font-weight-bold mb-1">Your Projects</h1>
              <div class="d-flex align-center text-medium-emphasis">
                <span class="text-subtitle-1">Manage and create your codebases</span>
                <v-chip
                  v-if="projects.length > 0"
                  class="ml-3"
                  color="primary"
                  size="small"
                  variant="flat"
                >
                  {{ projects.length }} Project{{ projects.length !== 1 ? 's' : '' }}
                </v-chip>
              </div>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-btn
              class="create-btn"
              color="primary"
              prepend-icon="mdi-plus"
              size="large"
              variant="elevated"
              @click="openCreateDialogHandler"
            >
              New Project
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <v-card
      v-if="projects.length > 3"
      class="mb-6 filter-card"
      color="surface"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="py-3 px-6">
        <v-row align="center">
          <v-col cols="12" sm="auto">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-filter-variant</v-icon>
              <span class="text-body-1">Filter:</span>
            </div>
          </v-col>
          <v-col cols="12" sm="auto">
            <v-select
              v-model="languageFilter"
              chips
              clearable
              color="primary"
              density="comfortable"
              hide-details
              :items="availableLanguages"
              label="Language"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" sm="auto">
            <v-select
              v-model="frameworkFilter"
              chips
              clearable
              color="primary"
              density="comfortable"
              hide-details
              :items="availableFrameworks"
              label="Framework"
              variant="outlined"
            />
          </v-col>
          <v-spacer />
          <v-col cols="12" sm="auto">
            <v-text-field
              v-model="searchQuery"
              clearable
              color="primary"
              density="comfortable"
              hide-details
              label="Search projects"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-if="loading" class="loading-container pa-8">
      <v-row>
        <v-col
          v-for="n in 4"
          :key="`skeleton-${n}`"
          cols="12"
          lg="3"
          md="4"
          sm="6"
        >
          <v-card class="project-card-skeleton" elevation="1" height="340">
            <div class="skeleton-header" />
            <v-card-text>
              <v-skeleton-loader type="heading, list-item-three-line" />
            </v-card-text>
            <v-card-actions class="justify-center pa-4">
              <v-skeleton-loader type="button" width="120" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-card
      v-else-if="fetchError"
      class="mx-auto my-12 error-state"
      color="surface"
      elevation="2"
      max-width="700"
      rounded="lg"
    >
      <v-card-text class="text-center pa-8">
        <v-avatar class="mb-5 error-avatar" color="error" size="80">
          <v-icon color="white" size="40">mdi-alert</v-icon>
        </v-avatar>
        <h3 class="text-h4 mb-3">Error Loading Projects</h3>
        <p class="text-body-1 mb-6">{{ fetchError }}</p>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          size="large"
          variant="elevated"
          @click="fetchProjects"
        >
          Try Again
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card
      v-else-if="projects.length === 0"
      class="mx-auto my-12 empty-state"
      color="surface"
      elevation="2"
      max-width="700"
      rounded="lg"
    >
      <v-card-text class="text-center pa-8">
        <v-avatar class="mb-6 empty-avatar" color="primary" size="96">
          <v-icon color="white" size="48">mdi-folder-plus</v-icon>
        </v-avatar>
        <h3 class="text-h4 mb-3">No Projects Yet</h3>
        <p class="text-body-1 mb-6">
          It looks like you haven't created any projects yet.<br>
          Get started by creating your first project and bring your ideas to life!
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="x-large"
          variant="elevated"
          @click="openCreateDialogHandler"
        >
          Create First Project
        </v-btn>
      </v-card-text>
    </v-card>

    <v-row v-else>
      <v-col
        v-for="project in filteredProjects"
        :key="project.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            class="project-card h-100 d-flex flex-column"
            :class="{ 'on-hover': isHovering }"
            color="background"
            elevation="2"
            rounded="lg"
          >
            <div class="project-card-header" :style="headerGradient(getProjectColor(project.projectName))">
              <div class="d-flex align-center pa-4">
                <v-avatar class="project-icon" :color="getProjectColor(project.projectName)" size="56">
                  <v-icon color="white" size="28">{{ getProjectIcon(project.language) }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1 overflow-hidden">
                  <h3 class="text-h5 font-weight-bold text-white text-truncate mb-1" :title="project.projectName">
                    {{ project.projectName }}
                  </h3>
                  <div class="d-flex align-center">
                    <v-chip
                      class="text-white"
                      :color="getProjectColor(project.projectName)"
                      label
                      size="small"
                      variant="flat"
                    >
                      {{ project.language || "Unknown" }}
                    </v-chip>
                  </div>
                </div>
                <v-menu location="bottom end">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      class="menu-btn"
                      color="white"
                      density="comfortable"
                      icon="mdi-dots-vertical"
                      variant="text"
                      v-bind="menuProps"
                      @click.stop
                    />
                  </template>
                  <v-list>
                    <v-list-item prepend-icon="mdi-pencil" @click.stop="openEditDialogHandler(project)">
                      <v-list-item-title>Edit Project</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-download" @click.stop="openProject(project)">
                      <v-list-item-title>Open Project</v-list-item-title>
                    </v-list-item>
                    <v-divider class="my-2" />
                    <v-list-item
                      class="text-error"
                      prepend-icon="mdi-delete"
                      @click.stop="confirmDeleteProject(project)"
                    >
                      <v-list-item-title>Delete Project</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <v-card-text class="pt-4 flex-grow-1">
              <div class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2" color="primary" size="20">mdi-stack-overflow</v-icon>
                  <span class="text-subtitle-1 font-weight-medium">Tech Stack</span>
                </div>
                <div class="tech-stack-chips">
                  <v-chip
                    v-if="project.buildTool"
                    class="ma-1"
                    color="warning"
                    size="small"
                    variant="flat"
                  >
                    <v-icon class="mr-1" size="12">mdi-tools</v-icon>
                    {{ project.buildTool }}
                  </v-chip>
                  <v-chip
                    v-if="project.databaseType && project.databaseType !== 'NONE'"
                    class="ma-1"
                    color="success"
                    size="small"
                    variant="flat"
                  >
                    <v-icon class="mr-1" size="12">mdi-database</v-icon>
                    {{ project.databaseType }}
                  </v-chip>

                  <v-chip
                    v-if="project.framework"
                    class="ma-1"
                    color="info"
                    size="small"
                    variant="flat"
                  >
                    <v-icon class="mr-1" size="12">mdi-puzzle</v-icon>
                    {{ project.framework }}
                  </v-chip>
                </div>
              </div>

              <div class="project-details mb-3">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2" color="primary" size="20">mdi-information-variant</v-icon>
                  <span class="text-subtitle-1 font-weight-medium">Details</span>
                </div>

                <div v-if="project.basePackage" class="detail-row d-flex align-center mb-1">
                  <v-icon class="mr-2" color="info" size="16">mdi-package-variant</v-icon>
                  <div class="text-caption">Base package:</div>
                  <div class="text-caption font-weight-medium text-code ml-1">{{ project.basePackage }}</div>
                </div>

                <div v-if="project.moduleName && project.language=='GO'" class="detail-row d-flex align-center mb-1">
                  <v-icon class="mr-2" color="info" size="16">mdi-graph</v-icon>
                  <div class="text-caption">Module:</div>
                  <div class="text-caption font-weight-medium text-code ml-1">{{ project.moduleName }}</div>
                </div>

                <div class="detail-row d-flex align-center">
                  <v-icon class="mr-2" color="info" size="16">mdi-calendar</v-icon>
                  <div class="text-caption">Created:</div>
                  <div class="text-caption ml-1">{{ formatDate(project.createdAt) }}</div>
                </div>
              </div>
            </v-card-text>


            <v-card-actions class="pa-4 pt-2">
              <v-btn
                block
                color="primary"
                prepend-icon="mdi-folder-open"
                rounded="lg"
                size="large"
                variant="elevated"
                @click="openProject(project)"
              >
                Open Project
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <v-dialog v-model="openCreateDialog" max-width="600">
      <v-card color="surface" rounded="lg">
        <v-card-title class="d-flex align-center px-4 py-3 bg-primary-darken-2">
          <v-icon class="mr-2" color="primary" size="24">mdi-folder-plus</v-icon>
          <span class="text-h6">Create New Project</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            v-if="dialogError"
            border="start"
            class="mb-4"
            closable
            color="error"
            density="compact"
            variant="tonal"
            @click:close="dialogError = ''"
          >{{ dialogError }}</v-alert>

          <v-form ref="createFormRef">
            <v-text-field
              v-model="form.projectName"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="Choose a descriptive name for your project"
              label="Project Name"
              persistent-hint
              placeholder="My Awesome Project"
              prepend-inner-icon="mdi-rename"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-select
              v-model="form.language"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="Select the primary language for your project"
              item-title="name"
              item-value="value"
              :items="languages"
              label="Language"
              persistent-hint
              prepend-inner-icon="mdi-code-tags"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-text-field
              v-if="form.language === 'JAVA' || form.language === 'KOTLIN'"
              v-model="form.basePackage"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="e.g., com.example.app"
              label="Base Package"
              persistent-hint
              prepend-inner-icon="mdi-package-variant"
              required
              :rules="[rules.required, rules.basePackage]"
              variant="outlined"
            />

            <v-text-field
              v-if="form.language === 'GO'"
              v-model="form.moduleName"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="e.g., myproject"
              label="Module Name"
              persistent-hint
              prepend-inner-icon="mdi-graph"
              required
              :rules="[rules.required, rules.moduleName]"
              variant="outlined"
            />

            <v-select
              v-model="form.framework"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="Select a framework for your project"
              :items="frameworksByLanguage"
              label="Framework"
              persistent-hint
              prepend-inner-icon="mdi-layers"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-select
              v-model="form.databaseType"
              class="mb-4"
              color="primary"
              density="comfortable"
              hint="Select the database type for your project"
              :items="databaseTypes"
              label="Database"
              persistent-hint
              prepend-inner-icon="mdi-database"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-select
              v-model="form.buildTool"
              color="primary"
              density="comfortable"
              hint="Select the build tool for your project"
              :items="buildToolsByLanguage"
              label="Build Tool"
              persistent-hint
              prepend-inner-icon="mdi-tools"
              required
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeCreateDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="creating"
            variant="elevated"
            @click="createProjectHandler"
          >
            Create Project
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="openEditDialog" max-width="600">
      <v-card color="surface" rounded="lg">
        <v-card-title class="d-flex align-center px-4 py-3 bg-warning-darken-2">
          <v-icon class="mr-2" color="warning" size="24">mdi-pencil</v-icon>
          <span class="text-h6">Edit Project</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            v-if="dialogError"
            border="start"
            class="mb-4"
            closable
            color="error"
            density="compact"
            variant="tonal"
            @click:close="dialogError = ''"
          >{{ dialogError }}</v-alert>

          <v-form ref="editFormRef">
            <v-text-field
              v-model="form.projectName"
              class="mb-4"
              color="warning"
              density="comfortable"
              hint="Choose a descriptive name for your project"
              label="Project Name"
              persistent-hint
              placeholder="My Awesome Project"
              prepend-inner-icon="mdi-rename"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-select
              v-model="form.language"
              class="mb-4"
              color="warning"
              density="comfortable"
              hint="Select the primary language for your project"
              item-title="name"
              item-value="value"
              :items="languages"
              label="Language"
              persistent-hint
              prepend-inner-icon="mdi-code-tags"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-text-field
              v-if="form.language === 'JAVA' || form.language === 'KOTLIN'"
              v-model="form.basePackage"
              class="mb-4"
              color="warning"
              density="comfortable"
              hint="e.g., com.example.app"
              label="Base Package"
              persistent-hint
              prepend-inner-icon="mdi-package-variant"
              required
              :rules="[rules.required, rules.basePackage]"
              variant="outlined"
            />

            <v-text-field
              v-if="form.language === 'GO'"
              v-model="form.moduleName"
              class="mb-4"
              color="warning"
              density="comfortable"
              hint="e.g., myproject"
              label="Module Name"
              persistent-hint
              prepend-inner-icon="mdi-graph"
              required
              :rules="[rules.required, rules.moduleName]"
              variant="outlined"
            />

            <v-select
              v-model="form.framework"
              class="mb-4"
              color="warning"
              density="comfortable"
              hint="Select a framework for your project"
              :items="frameworksByLanguage"
              label="Framework"
              persistent-hint
              prepend-inner-icon="mdi-layers"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-select
              v-model="form.databaseType"
              class="mb-4"
              color="warning"
              density="comfortable"
              hint="Select the database type for your project"
              :items="databaseTypes"
              label="Database"
              persistent-hint
              prepend-inner-icon="mdi-database"
              required
              :rules="[rules.required]"
              variant="outlined"
            />

            <v-select
              v-model="form.buildTool"
              color="warning"
              density="comfortable"
              hint="Select the build tool for your project"
              :items="buildToolsByLanguage"
              label="Build Tool"
              persistent-hint
              prepend-inner-icon="mdi-tools"
              required
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeEditDialog">Cancel</v-btn>
          <v-btn
            color="warning"
            :loading="updating"
            variant="elevated"
            @click="updateProjectHandler"
          >
            Update Project
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="openConfirmDeleteDialog" max-width="450">
      <v-card color="surface" rounded="lg">
        <v-card-title class="px-4 py-3 bg-error-darken-2">
          <v-icon class="mr-2" color="error" size="24">mdi-delete-alert</v-icon>
          <span class="text-h6">Confirm Deletion</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            v-if="dialogError"
            border="start"
            class="mb-4"
            closable
            color="error"
            density="compact"
            variant="tonal"
            @click:close="dialogError = ''"
          >{{ dialogError }}</v-alert>

          <p class="text-body-1 mb-2">Are you sure you want to delete:</p>
          <v-chip
            class="mb-4 font-weight-bold"
            color="error"
            label
            size="large"
            variant="outlined"
          >
            {{ projectToDelete?.projectName }}
          </v-chip>

          <p class="text-body-2 text-medium-emphasis">
            This action cannot be undone and will remove all entities, relationships, and configurations associated with this project.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="openConfirmDeleteDialog = false; dialogError=''">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            variant="elevated"
            @click="deleteProjectConfirmedHandler"
          >
            Delete Forever
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    createProject as createProjectApi,
    deleteProject as deleteProjectApi,
    getAllProjectsForUser,
    updateProject as updateProjectApi,
  } from '@/api/index.js'
  import { state as keycloakState } from '@/plugins/keycloak'

  const router = useRouter()

  const projects = ref([])
  const loading = ref(true)
  const fetchError = ref('')
  const dialogError = ref('')

  const openCreateDialog = ref(false)
  const openEditDialog = ref(false)
  const openConfirmDeleteDialog = ref(false)

  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)
  const isInitializing = ref(true);
  const isPopulatingForm = ref(false);

  const editingProject = ref(null)
  const projectToDelete = ref(null)

  const searchQuery = ref('')
  const languageFilter = ref(null)
  const frameworkFilter = ref(null)

  const createFormRef = ref(null)
  const editFormRef = ref(null)

  const form = ref({
    projectName: '',
    language: '',
    basePackage: '',
    moduleName: '',
    framework: '',
    databaseType: '',
    buildTool: '',
  })

  const languages = [
    { name: 'Java', value: 'JAVA' },
    { name: 'Kotlin', value: 'KOTLIN' },
    { name: 'Go', value: 'GO' },
  ]
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
    return form.value.language ? allFrameworks[form.value.language] || [] : []
  })

  const buildToolsByLanguage = computed(() => {
    return form.value.language ? allBuildTools[form.value.language] || [] : []
  })

  const availableLanguages = computed(() => {
    const langs = new Set(projects.value.map(p => p.language).filter(Boolean))
    return Array.from(langs)
  })

  const availableFrameworks = computed(() => {
    const frameworks = new Set(projects.value.map(p => p.framework).filter(Boolean))
    return Array.from(frameworks)
  })

  const filteredProjects = computed(() => {
    let result = [...projects.value]

    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase()
      result = result.filter(p =>
        p.projectName?.toLowerCase().includes(search) ||
        p.basePackage?.toLowerCase().includes(search) ||
        p.moduleName?.toLowerCase().includes(search)
      )
    }

    if (languageFilter.value) {
      result = result.filter(p => p.language === languageFilter.value)
    }

    if (frameworkFilter.value) {
      result = result.filter(p => p.framework === frameworkFilter.value)
    }

    return result
  })

  const rules = {
    required: value => !!value || 'This field is required.',
    basePackage: value => (/^([a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*)$/.test(value) || 'Invalid package name (e.g., com.example.app)'),
    moduleName: value => (/^[a-zA-Z0-9_./-]+$/.test(value) || 'Invalid module name (e.g., myproject or github.com/user/project)'),
  }

  function headerGradient (color) {
    return {
      background: `linear-gradient(45deg, ${color}dd, ${color}99)`,
    }
  }

  const projectColors = [
    '#5DB0A8',
    '#FF8A80',
    '#66BB6A',
    '#FFA726',
    '#2196F3',
    '#E91E63',
    '#9C27B0',
    '#607D8B',
    '#795548',
    '#FFC107',
  ]

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
      default: return 'mdi-code-tags';
    }
  }

  function formatDate (date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function fetchProjects () {
    isInitializing.value = true;
    loading.value = true
    fetchError.value = ''
    try {
      const userId = keycloakState.userProfile?.id
      if (!userId) throw new Error('User not authenticated. Please login again.')

      const res = await getAllProjectsForUser(userId)
      projects.value = res.data || []
    } catch (e) {
      console.error('Error fetching projects:', e)
      fetchError.value = e.message || 'Failed to load projects'
    } finally {
      loading.value = false
      nextTick(() => {
        isInitializing.value = false;
      });
    }
  }

  function resetForm () {
    form.value = {
      projectName: '',
      language: '',
      basePackage: '',
      moduleName: '',
      framework: '',
      databaseType: '',
      buildTool: '',
    }

    if (createFormRef.value) createFormRef.value.resetValidation();
    if (editFormRef.value) editFormRef.value.resetValidation();
  }

  function openCreateDialogHandler () {
    resetForm();
    dialogError.value = '';
    openCreateDialog.value = true;
  }

  function closeCreateDialog () {
    openCreateDialog.value = false
    resetForm()
  }

  function openEditDialogHandler (project) {
    isPopulatingForm.value = true;
    editingProject.value = project;
    dialogError.value = '';

    form.value = {
      projectName: project.projectName || '',
      language: project.language || '',
      framework: project.framework || '',
      databaseType: project.databaseType || '',
      buildTool: project.buildTool || '',
      basePackage: project.basePackage || '',
      moduleName: project.moduleName || '',
    };

    if (editFormRef.value) editFormRef.value.resetValidation();
    openEditDialog.value = true;

    nextTick(() => {
      isPopulatingForm.value = false;
    });
  }

  function closeEditDialog () {
    openEditDialog.value = false;
    editingProject.value = null;
    resetForm();
  }

  async function validateForm (formRef) {
    if (!formRef || !formRef.value) return true;
    const { valid } = await formRef.value.validate();
    return valid;
  }

  async function createProjectHandler () {
    dialogError.value = '';
    const isValid = await validateForm(createFormRef);

    if (!isValid) {
      dialogError.value = 'Please correct the errors in the form.';
      return;
    }

    if ((form.value.language === 'JAVA' || form.value.language === 'KOTLIN') && !form.value.basePackage) {
      dialogError.value = 'Base Package is required for Java/Kotlin.';
      return;
    }

    if (form.value.language === 'GO' && !form.value.moduleName) {
      dialogError.value = 'Module Name is required for Go.';
      return;
    }

    creating.value = true;
    try {
      const userId = keycloakState.userProfile?.id;
      if (!userId) throw new Error('User not authenticated.');

      const payload = { ...form.value };
      if (form.value.language !== 'JAVA' && form.value.language !== 'KOTLIN') {
        delete payload.basePackage;
      }

      if (form.value.language !== 'GO') {
        delete payload.moduleName;
      }

      const res = await createProjectApi(payload);
      projects.value.unshift(res.data);
      closeCreateDialog();
    } catch (e) {
      console.error('Error creating project:', e);
      dialogError.value = e.response?.data?.message || e.message || 'Failed to create project';
    } finally {
      creating.value = false;
    }
  }

  async function updateProjectHandler () {
    dialogError.value = '';
    const isValid = await validateForm(editFormRef);

    if (!isValid) {
      dialogError.value = 'Please correct the errors in the form.';
      return;
    }

    updating.value = true;
    try {
      const userId = keycloakState.userProfile?.id;
      if (!userId || !editingProject.value) {
        throw new Error('User not authenticated or project not selected.');
      }

      const payload = { ...form.value };
      if (form.value.language !== 'JAVA' && form.value.language !== 'KOTLIN') {
        delete payload.basePackage;
      }

      if (form.value.language !== 'GO') {
        delete payload.moduleName;
      }

      const res = await updateProjectApi(editingProject.value.id, userId, payload);
      const index = projects.value.findIndex(p => p.id === editingProject.value.id);

      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...res.data };
      }

      closeEditDialog();
    } catch (e) {
      console.error('Error updating project:', e);
      dialogError.value = e.response?.data?.message || e.message || 'Failed to update project';
    } finally {
      updating.value = false;
    }
  }

  function confirmDeleteProject (project) {
    projectToDelete.value = project;
    dialogError.value = '';
    openConfirmDeleteDialog.value = true;
  }

  async function deleteProjectConfirmedHandler () {
    if (!projectToDelete.value) return;

    deleting.value = true;
    dialogError.value = '';

    try {
      const userId = keycloakState.userProfile?.id;
      if (!userId) throw new Error('User not authenticated.');

      await deleteProjectApi(projectToDelete.value.id);
      projects.value = projects.value.filter(p => p.id !== projectToDelete.value.id);
      openConfirmDeleteDialog.value = false;
      projectToDelete.value = null;
    } catch (e) {
      console.error('Error deleting project:', e);
      dialogError.value = e.response?.data?.message || e.message || 'Failed to delete project';
    } finally {
      deleting.value = false;
    }
  }

  function openProject (project) {
    router.push(`/project/${project.id}`);
  }

  watch(() => form.value.language, (newLang, oldLang) => {
    if (isInitializing.value || isPopulatingForm.value) {
      return;
    }
    if (newLang !== oldLang) {
      form.value.framework = '';
      form.value.buildTool = '';

      if (newLang !== 'JAVA' && newLang !== 'KOTLIN') {
        form.value.basePackage = '';
      } else {
        if (form.value.projectName && !form.value.basePackage) {
          const suggestedPackage = `com.example.${form.value.projectName.toLowerCase().replace(/[^a-z0-9]/gi, '')}`;
          form.value.basePackage = suggestedPackage;
        }
      }

      if (newLang !== 'GO') {
        form.value.moduleName = '';
      } else {
        if (form.value.projectName && !form.value.moduleName) {
          form.value.moduleName = form.value.projectName.toLowerCase().replace(/[^a-z0-9-]/gi, '');
        }
      }

      if (newLang === 'GO') {
        form.value.buildTool = 'GO_MODULES';
        form.value.framework = 'GIN';
      } else if (newLang === 'JAVA') {
        form.value.buildTool = 'MAVEN';
        form.value.framework = 'SPRING_BOOT';
      } else if (newLang === 'KOTLIN') {
        form.value.buildTool = 'GRADLE';
        form.value.framework = 'SPRING_BOOT';
      }
    }
  }, { immediate: false });

  onMounted(() => {
    fetchProjects();
  });
</script>

<style scoped>
.projects-header {
  border: 1px solid rgba(93, 176, 168, 0.2);
  overflow: hidden;
}

.hero-gradient {
  background: linear-gradient(to right, rgba(26, 26, 46, 0.98), rgba(31, 41, 55, 0.95));
  position: relative;
}

.header-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.create-btn {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.filter-card {
  border: 1px solid rgba(93, 176, 168, 0.1);
}

.loading-container {
  min-height: 400px;
}

.project-card-skeleton {
  border: 1px solid rgba(93, 176, 168, 0.1);
  overflow: hidden;
}

.skeleton-header {
  height: 100px;
  background: linear-gradient(45deg, rgba(93, 176, 168, 0.2), rgba(44, 62, 80, 0.3));
}

.error-state, .empty-state {
  border: 1px solid rgba(93, 176, 168, 0.1);
}

.error-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.empty-avatar {
  border: 2px solid rgba(93, 176, 168, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.project-card {
  border: 1px solid rgba(93, 176, 168, 0.12);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.project-card.on-hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25) !important;
  border-color: rgba(93, 176, 168, 0.4);
}

.project-card-header {
  position: relative;
  color: white;
  overflow: hidden;
}

.project-icon {
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.menu-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tech-stack-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.project-details {
  background-color: rgba(31, 41, 55, 0.3);
  border: 1px solid rgba(93, 176, 168, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.detail-row {
  opacity: 0.9;
}

.text-code {
  font-family: 'Fira Mono', 'Consolas', monospace;
  background-color: rgba(31, 41, 55, 0.6);
  border-radius: 3px;
  padding: 0 4px;
}

.project-activity {
  padding-top: 8px;
  padding-bottom: 8px;
}

.activity-bar {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 6px;
}

.high-activity {
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  width: 100%;
}

.medium-activity {
  background: linear-gradient(to right, #FFC107, #FFEB3B);
  width: 70%;
  margin-left: 15%;
}

.low-activity {
  background: linear-gradient(to right, #E91E63, #F48FB1);
  width: 40%;
  margin-left: 30%;
}

.v-dialog .v-card {
  border: 1px solid rgba(93, 176, 168, 0.15);
}

@media (max-width: 600px) {
  .header-icon {
    display: none;
  }

  .hero-gradient {
    padding: 16px !important;
  }

  .project-card.on-hover {
    transform: none;
  }
}
</style>
