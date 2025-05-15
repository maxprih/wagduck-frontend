<template>
  <v-container class="fill-height pa-md-6 pa-3" fluid>
    <v-row class="fill-height" justify="center">
      <v-col cols="12" lg="11" md="12" xl="9">
        <v-card
          v-if="props.entityId && props.projectId"
          class="entity-designer-card"
          elevation="6"
          rounded="lg"
        >
          <div class="entity-header pa-4">
            <div class="d-flex flex-column h-100 justify-space-between">
              <div class="d-flex align-center">
                <v-btn
                  class="me-3"
                  color="primary"
                  density="comfortable"
                  icon="mdi-arrow-left"
                  size="small"
                  variant="tonal"
                  @click="navigateToProject"
                />
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h4 font-weight-bold text-white mb-0">{{ entity?.entityName }}</h1>
                    <v-btn
                      class="ms-3"
                      color="primary"
                      density="comfortable"
                      icon="mdi-pencil"
                      size="small"
                      variant="tonal"
                      @click="openEditEntityDialog = true"
                    />
                  </div>
                  <div class="d-flex align-center mt-1 gap-3 text-medium-emphasis text-body-2 flex-wrap">
                    <div class="d-flex align-center">
                      <v-icon class="me-1" color="primary" size="small">mdi-table</v-icon>
                      <span>{{ entity?.tableName }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon class="me-1 ms-1" color="primary" size="small">mdi-calendar</v-icon>
                      <span>{{ formatDate(entity?.createdAt) }}</span>
                    </div>
                    <div v-if="attributes.length" class="d-flex align-center">
                      <v-icon class="me-1 ms-1" color="primary" size="small">mdi-format-list-bulleted</v-icon>
                      <span>{{ attributes.length }} Field{{ attributes.length !== 1 ? 's' : '' }}</span>
                    </div>
                    <div v-if="relationships.length" class="d-flex align-center">
                      <v-icon class="me-1 ms-1" color="primary" size="small">mdi-link-variant</v-icon>
                      <span>{{ relationships.length }} Relationship{{ relationships.length !== 1 ? 's' : '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template v-if="isLoading">
            <div class="pa-4">
              <v-skeleton-loader type="article" />
              <v-skeleton-loader type="list-item-three-line" />
              <v-skeleton-loader type="list-item-three-line" />
            </div>
          </template>

          <template v-else>
            <div class="px-4 pb-0 pt-5">
              <div class="d-flex justify-space-between align-center mb-3">
                <div class="d-flex align-center">
                  <v-icon class="me-2" color="primary" size="28">mdi-format-list-bulleted-square</v-icon>
                  <h2 class="text-h5 font-weight-bold mb-0">Fields</h2>
                </div>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  size="small"
                  @click="openAddAttributeDialogHandler"
                >
                  Add Field
                </v-btn>
              </div>

              <v-alert
                v-if="attributes.length === 0"
                border="start"
                class="mb-3"
                color="info"
                density="compact"
                icon="mdi-information-outline"
                variant="tonal"
              >
                No fields defined yet. Click "Add Field" to create your first one.
              </v-alert>

              <div v-else class="fields-wrapper pb-3">
                <v-row>
                  <v-col
                    v-for="attr in attributes"
                    :key="attr.id"
                    cols="12"
                    lg="4"
                    md="6"
                    sm="6"
                  >
                    <v-card
                      class="field-card"
                      :color="attr.isPrimaryKey ? 'primary-darken-3' : ''"
                      elevation="2"
                      height="100%"
                      rounded="lg"
                      variant="elevated"
                    >
                      <div class="field-card-content d-flex flex-column h-100">
                        <div class="field-card-header px-4 py-3">
                          <div class="d-flex justify-space-between">
                            <div class="d-flex align-center">
                              <v-icon
                                class="field-icon mr-2"
                                :color="getFieldTypeColor(attr.dataType)"
                                size="24"
                              >
                                {{ getFieldTypeIcon(attr.dataType) }}
                              </v-icon>
                              <h3 class="text-h6 font-weight-bold mb-0 text-truncate">{{ attr.attributeName }}</h3>
                            </div>
                            <div class="d-flex">
                              <v-icon
                                v-if="attr.isPrimaryKey"
                                class="ms-1"
                                color="amber-accent-3"
                                icon="mdi-key-variant"
                                size="18"
                              />
                            </div>
                          </div>
                        </div>

                        <div class="field-card-body px-4 py-2 flex-grow-1">
                          <div class="mb-2">
                            <v-chip
                              class="text-capitalize"
                              :color="getFieldTypeColor(attr.dataType)"
                              density="comfortable"
                              size="small"
                              variant="flat"
                            >
                              <span class="font-weight-medium">{{ attr.dataType }}</span>
                            </v-chip>
                          </div>

                          <div class="d-flex flex-wrap gap-1 mt-2">
                            <v-chip
                              v-if="attr.isRequired"
                              color="error"
                              density="comfortable"
                              size="small"
                              variant="outlined"
                            >
                              Required
                            </v-chip>
                            <v-chip
                              v-if="attr.isUnique"
                              color="info"
                              density="comfortable"
                              size="small"
                              variant="outlined"
                            >
                              Unique
                            </v-chip>
                          </div>

                          <div v-if="attr.defaultValue" class="mt-3 default-value">
                            <div class="text-caption text-medium-emphasis mb-1">Default Value:</div>
                            <div class="default-value-content px-2 py-1 rounded text-body-2">
                              {{ attr.defaultValue }}
                            </div>
                          </div>
                        </div>

                        <div class="field-card-actions px-2 py-2 d-flex justify-end">
                          <v-btn
                            color="primary"
                            density="comfortable"
                            icon="mdi-pencil"
                            size="small"
                            variant="text"
                            @click="editAttribute(attr)"
                          />
                          <v-btn
                            color="error"
                            density="comfortable"
                            icon="mdi-delete"
                            size="small"
                            variant="text"
                            @click="promptRemoveAttribute(attr.id)"
                          />
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </div>

            <div class="px-4 pb-4 pt-6">
              <div class="d-flex justify-space-between align-center mb-3">
                <div class="d-flex align-center">
                  <v-icon class="me-2" color="secondary" size="28">mdi-link-variant</v-icon>
                  <h2 class="text-h5 font-weight-bold mb-0">Relationships</h2>
                </div>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  size="small"
                  @click="openAddRelationshipDialogHandler"
                >
                  Add Relationship
                </v-btn>
              </div>

              <v-alert
                v-if="relationshipsWithTargetName.length === 0"
                border="start"
                class="mb-3"
                color="info"
                density="compact"
                icon="mdi-information-outline"
                variant="tonal"
              >
                No relationships defined yet. Click "Add Relationship" to link entities.
              </v-alert>

              <div v-else class="relationships-wrapper pb-3">
                <v-row>
                  <v-col
                    v-for="rel in relationshipsWithTargetName"
                    :key="rel.id"
                    cols="12"
                    lg="6"
                    md="6"
                  >
                    <v-card
                      class="relationship-card"
                      elevation="2"
                      height="100%"
                      rounded="lg"
                      variant="elevated"
                    >
                      <div class="relationship-card-content d-flex flex-column h-100">
                        <div
                          class="relationship-card-header px-4 py-3"
                          :class="getRelationshipHeaderClass(rel.relationshipType)"
                        >
                          <div class="d-flex justify-space-between align-center">
                            <div class="d-flex align-center flex-wrap">
                              <v-avatar
                                class="mr-3"
                                :color="getRelationshipColor(rel.relationshipType)"
                                size="42"
                              >
                                <v-icon color="white" size="24">
                                  {{ getRelationshipIcon(rel.relationshipType) }}
                                </v-icon>
                              </v-avatar>
                              <div>
                                <h3 class="text-h6 font-weight-bold mb-0">
                                  {{ formatRelationshipType(rel.relationshipType) }}
                                </h3>
                                <span class="text-body-2 text-medium-emphasis">
                                  {{ rel.owningSide ? 'Owning Side' : 'Inverse Side' }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="relationship-card-body px-4 py-3 flex-grow-1">
                          <div class="d-flex flex-column gap-2">
                            <div class="relationship-diagram pa-3 mb-2">
                              <div class="d-flex justify-space-between align-center">
                                <div class="entity-box source-entity pa-2 text-center">
                                  <div class="text-body-2 font-weight-bold">{{ entity?.entityName }}</div>
                                </div>
                                <div class="relationship-arrow px-2">
                                  <v-icon>{{ getRelationshipArrowIcon(rel.relationshipType) }}</v-icon>
                                </div>
                                <div class="entity-box target-entity pa-2 text-center">
                                  <div class="text-body-2 font-weight-bold">{{ rel.targetEntityNameDisplay }}</div>
                                </div>
                              </div>
                            </div>

                            <div class="field-mappings pa-3">
                              <div class="d-flex flex-column">
                                <div class="d-flex align-center mb-1">
                                  <v-icon class="me-1" color="primary" size="small">mdi-form-textbox</v-icon>
                                  <span class="text-body-2 font-weight-medium">Source Field:</span>
                                  <v-chip class="ms-2" size="x-small" variant="flat">{{ rel.sourceFieldName }}</v-chip>
                                </div>
                                <div v-if="rel.targetFieldName" class="d-flex align-center">
                                  <v-icon class="me-1" color="secondary" size="small">mdi-form-textbox</v-icon>
                                  <span class="text-body-2 font-weight-medium">Target Field:</span>
                                  <v-chip class="ms-2" size="x-small" variant="flat">{{ rel.targetFieldName }}</v-chip>
                                </div>
                              </div>
                            </div>

                            <div class="d-flex flex-wrap gap-2 mt-1">
                              <v-chip
                                :color="rel.fetchType === 'EAGER' ? 'orange' : 'grey'"
                                density="comfortable"
                                size="small"
                                variant="outlined"
                              >
                                <v-icon size="x-small" start>
                                  {{ rel.fetchType === 'EAGER' ? 'mdi-rocket-launch' : 'mdi-timer-sand' }}
                                </v-icon>
                                {{ rel.fetchType }}
                              </v-chip>
                              <v-chip
                                v-if="rel.cascadeType && rel.cascadeType.toUpperCase() !== 'NONE'"
                                color="teal"
                                density="comfortable"
                                size="small"
                                variant="outlined"
                              >
                                <v-icon size="x-small" start>mdi-waterfall</v-icon>
                                Cascade: {{ rel.cascadeType }}
                              </v-chip>
                            </div>
                          </div>
                        </div>

                        <div class="relationship-card-actions px-2 py-2 d-flex justify-end">
                          <v-btn
                            color="secondary"
                            density="comfortable"
                            icon="mdi-pencil"
                            size="small"
                            variant="text"
                            @click="editRelationship(rel)"
                          />
                          <v-btn
                            color="error"
                            density="comfortable"
                            icon="mdi-delete"
                            size="small"
                            variant="text"
                            @click="promptRemoveRelationship(rel.id)"
                          />
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div class="px-4 pb-4 pt-6">
              <div class="d-flex justify-space-between align-center mb-3">
                <div class="d-flex align-center">
                  <v-icon class="me-2" color="info" size="28">mdi-api</v-icon>
                  <h2 class="text-h5 font-weight-bold mb-0">API Endpoints</h2>
                </div>
              </div>

              <ApiEndpointsPanel
                :entity-id="props.entityId"
                @endpoints-updated="showSnackbar('API endpoints updated successfully', 'success')"
              />
            </div>
          </template>
        </v-card>

        <v-alert
          v-else
          class="ma-auto"
          color="info"
          icon="mdi-alert-circle-outline"
          prominent
          type="info"
          variant="tonal"
        >
          Entity Designer requires a Project ID and Entity ID to be provided. Please select a project and entity to proceed.
        </v-alert>
      </v-col>
    </v-row>

    <v-dialog v-model="openEditEntityDialog" max-width="500">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 px-4 py-3 bg-primary-darken-2">
          <v-icon class="me-2" color="primary">mdi-pencil</v-icon>
          Edit Entity
        </v-card-title>
        <v-card-text class="pa-4">
          <v-text-field v-model="editEntityName" density="compact" label="Entity Name" variant="outlined" />
          <v-text-field v-model="editTableName" density="compact" label="Table Name" variant="outlined" />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="openEditEntityDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="isSavingEntity"
            variant="elevated"
            @click="updateEntity"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="openAddAttributeDialog" max-width="550">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 px-4 py-3" :class="editingAttribute ? 'bg-primary-darken-3' : 'bg-primary-darken-2'">
          <v-icon class="me-2" :color="editingAttribute ? 'accent' : 'primary'">
            {{ editingAttribute ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          {{ editingAttribute ? 'Edit Field' : 'Add Field' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="attributeForm.attributeName"
                color="primary"
                density="comfortable"
                hint="Name of the field in your code"
                label="Field Name"
                placeholder="e.g. firstName, price, orderId"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="attributeForm.dataType"
                color="primary"
                density="comfortable"
                hint="Data type for this field"
                :items="dataTypes"
                label="Data Type"
                variant="outlined"
              />
            </v-col>
          </v-row>
          <v-card class="mt-3 pa-3" rounded="lg" variant="flat">
            <div class="text-subtitle-2 mb-2 text-primary-lighten-3">Field Properties</div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="attributeForm.isPrimaryKey"
                  color="warning"
                  density="comfortable"
                  hide-details
                  inset
                  label="Primary Key"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="attributeForm.isRequired"
                  color="error"
                  density="comfortable"
                  hide-details
                  inset
                  label="Required"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="attributeForm.isUnique"
                  color="info"
                  density="comfortable"
                  hide-details
                  inset
                  label="Unique"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeAttributeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="isSavingAttribute"
            variant="elevated"
            @click="saveAttribute"
          >
            {{ editingAttribute ? 'Update Field' : 'Add Field' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="openAddRelationshipDialog" max-width="650">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 px-4 py-3" :class="editingRelationship ? 'bg-secondary-darken-3' : 'bg-secondary-darken-2'">
          <v-icon class="me-2" :color="editingRelationship ? 'accent' : 'primary'">
            {{ editingRelationship ? 'mdi-pencil' : 'mdi-link-plus' }}
          </v-icon>
          {{ editingRelationship ? 'Edit Relationship' : 'Add Relationship' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                v-model="relationshipForm.relationshipType"
                color="primary"
                density="comfortable"
                hint="Type of relationship between entities"
                :items="relationshipTypes"
                label="Relationship Type"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="relationshipForm.targetEntityId"
                color="primary"
                density="comfortable"
                hint="Entity to link with"
                item-title="entityName"
                item-value="id"
                :items="otherEntities"
                label="Target Entity"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="relationshipForm.sourceFieldName"
                color="primary"
                density="comfortable"
                hint="Field name in source entity"
                label="Source Field Name"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="relationshipForm.targetFieldName"
                color="primary"
                density="comfortable"
                hint="Field name in target entity (optional)"
                label="Target Field Name"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-card class="mt-3 pa-3" rounded="lg" variant="flat">
            <div class="text-subtitle-2 mb-2 text-primary-lighten-3">Relationship Properties</div>
            <v-row dense>
              <v-col cols="12">
                <v-switch
                  v-model="relationshipForm.owningSide"
                  color="success"
                  density="comfortable"
                  hint="Whether this entity owns the relationship"
                  inset
                  label="Source Entity is Owning Side"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeRelationshipDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="isSavingRelationship"
            variant="elevated"
            @click="saveRelationship"
          >
            {{ editingRelationship ? 'Update Relationship' : 'Add Relationship' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 px-4 py-3 bg-error-darken-2">
          <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
          {{ confirmDialog.title }}
        </v-card-title>
        <v-card-text class="pa-4">
          {{ confirmDialog.message }}
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn :color="confirmDialog.color" variant="elevated" @click="confirmDialog.onConfirm">
            Confirm Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top end"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    createAttribute,
    createRelationship,
    deleteAttribute,
    deleteRelationship,
    getAttributes,
    getEntities,
    getEntity,
    getRelationships,
    putEntity,
    updateAttribute,
    updateRelationship,
  } from '@/api/index.js'
  import ApiEndpointsPanel from './ApiEndpointsPanel.vue'

  const props = defineProps({
    projectId: String,
    entityId: String,
  })

  const router = useRouter()
  const entity = ref(null)
  const attributes = ref([])
  const relationships = ref([])
  const allEntities = ref([])
  const isLoading = ref(false)
  const isSavingEntity = ref(false)
  const isSavingAttribute = ref(false)
  const isSavingRelationship = ref(false)

  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000,
  })

  const confirmDialog = ref({
    show: false,
    title: '',
    message: '',
    color: 'error',
    onConfirm: () => {},
  })

  const openEditEntityDialog = ref(false)
  const editEntityName = ref('')
  const editTableName = ref('')

  const openAddAttributeDialog = ref(false)
  const editingAttribute = ref(null)
  const attributeFormDefault = () => ({
    id: '',
    attributeName: '',
    dataType: 'String',
    isPrimaryKey: false,
    isRequired: false,
    isUnique: false,
    defaultValue: '',
  })
  const attributeForm = ref(attributeFormDefault())

  const openAddRelationshipDialog = ref(false)
  const editingRelationship = ref(null)
  const relationshipFormDefault = () => ({
    id: '',
    sourceFieldName: '',
    targetEntityId: '',
    relationshipType: 'ONE_TO_MANY',
    targetFieldName: '',
    fetchType: 'LAZY',
    cascadeType: 'NONE',
    owningSide: true,
  })
  const relationshipForm = ref(relationshipFormDefault())

  const dataTypes = [
    'String',
    'Integer',
    'Long',
    'Float',
    'Double',
    'Boolean',
    'UUID',
    'Date',
    'DateTime',
    'Text',
    'Blob',
    'Json',
    'Enum',
    'Decimal',
  ]

  const relationshipTypes = [
    'ONE_TO_ONE',
    'ONE_TO_MANY',
    'MANY_TO_ONE',
    'MANY_TO_MANY',
  ]

  function showSnackbar (text, color = 'success') {
    snackbar.value.text = text
    snackbar.value.color = color
    snackbar.value.show = true
  }

  function formatDate (dateString) {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
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
      'Long': 'info-darken-1',
      'Float': 'accent',
      'Double': 'accent-darken-1',
      'Boolean': 'success',
      'UUID': 'primary-lighten-1',
      'Date': 'warning',
      'DateTime': 'warning-darken-1',
      'Text': 'primary-lighten-2',
      'Blob': 'secondary',
      'Json': 'warning',
      'Enum': 'accent',
      'Decimal': 'success-lighten-1',
    }
    return colorMap[dataType] || 'secondary'
  }

  function getRelationshipColor (relType) {
    const colorMap = {
      'ONE_TO_ONE': 'primary',
      'ONE_TO_MANY': 'info',
      'MANY_TO_ONE': 'accent',
      'MANY_TO_MANY': 'success',
    }
    return colorMap[relType] || 'secondary'
  }

  function getRelationshipIcon (relType) {
    const typeMap = {
      'ONE_TO_ONE': 'mdi-link-variant',
      'ONE_TO_MANY': 'mdi-arrow-expand-right',
      'MANY_TO_ONE': 'mdi-arrow-expand-left',
      'MANY_TO_MANY': 'mdi-sync',
    }
    return typeMap[relType] || 'mdi-link-variant'
  }

  function getRelationshipHeaderClass (relType) {
    const classMap = {
      'ONE_TO_ONE': 'one-to-one-header',
      'ONE_TO_MANY': 'one-to-many-header',
      'MANY_TO_ONE': 'many-to-one-header',
      'MANY_TO_MANY': 'many-to-many-header',
    }
    return classMap[relType] || ''
  }

  function getRelationshipArrowIcon (relType) {
    const iconMap = {
      'ONE_TO_ONE': 'mdi-arrow-right',
      'ONE_TO_MANY': 'mdi-arrow-right',
      'MANY_TO_ONE': 'mdi-arrow-left',
      'MANY_TO_MANY': 'mdi-arrow-left-right',
    }
    return iconMap[relType] || 'mdi-arrow-right'
  }

  function formatRelationshipType (relType) {
    return relType.replace(/_/g, ' ').replace(/-/g, ' ')
  }

  function navigateToProject () {
    if (props.projectId) {
      router.push(`/project/${props.projectId}`)
    } else {
      showSnackbar('Project ID is missing, cannot navigate back.', 'error')
    }
  }

  const otherEntities = computed(() =>
    allEntities.value.filter(e => e.id !== props.entityId)
  )

  const relationshipsWithTargetName = computed(() =>
    relationships.value.map(r => ({
      ...r,
      targetEntityNameDisplay: allEntities.value.find(e => e.id === r.targetEntityId)?.entityName || r.targetEntityId,
    }))
  )

  async function loadCoreData () {
    if (!props.entityId || !props.projectId) {
      entity.value = null
      attributes.value = []
      relationships.value = []
      isLoading.value = false
      return
    }

    isLoading.value = true
    try {
      await loadEntity()

      await Promise.all([
        loadAttributes(),
        loadRelationships(),
        loadAllEntities(),
      ])
    } catch (error) {
      console.error('Error loading core data:', error)
      showSnackbar('Failed to load entity data. Please try again.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function loadEntity () {
    if (!props.entityId) return
    try {
      const res = await getEntity(props.entityId)
      entity.value = res.data
      if (res.data) {
        editEntityName.value = res.data.entityName
        editTableName.value = res.data.tableName
      }
    } catch (error) {
      console.error('Error loading entity:', error)
    }
  }

  async function loadAttributes () {
    if (!props.entityId) return
    try {
      const res = await getAttributes(props.entityId)
      attributes.value = res.data || []
    } catch (error) {
      console.error('Error loading attributes:', error)
      attributes.value = []
    }
  }

  async function loadRelationships () {
    if (!props.entityId) return
    try {
      const res = await getRelationships(props.entityId)
      relationships.value = res.data || []
    } catch (error) {
      console.error('Error loading relationships:', error)
      relationships.value = []
    }
  }

  async function loadAllEntities () {
    if (!props.projectId) return
    try {
      const res = await getEntities(props.projectId)
      allEntities.value = res.data || []
    } catch (error) {
      console.error('Error loading all entities:', error)
      allEntities.value = []
    }
  }

  async function updateEntity () {
    if (!entity.value || !props.projectId || !props.entityId) return

    isSavingEntity.value = true
    try {
      const res = await putEntity(props.entityId, {
        projectId: props.projectId,
        entityName: editEntityName.value,
        tableName: editTableName.value,
      })

      entity.value = res.data
      openEditEntityDialog.value = false
      showSnackbar('Entity updated successfully.', 'success')
      await loadAllEntities()
    } catch (error) {
      console.error('Error updating entity:', error)
      showSnackbar('Failed to update entity.', 'error')
    } finally {
      isSavingEntity.value = false
    }
  }

  function editAttribute (attr) {
    editingAttribute.value = attr
    attributeForm.value = { ...attr }
    openAddAttributeDialog.value = true
  }

  function closeAttributeDialog () {
    openAddAttributeDialog.value = false
    editingAttribute.value = null
    attributeForm.value = attributeFormDefault()
  }

  async function saveAttribute () {
    if (!attributeForm.value.attributeName || !attributeForm.value.dataType || !props.entityId) {
      showSnackbar('Field Name and Type are required.', 'error')
      return
    }

    isSavingAttribute.value = true
    try {
      const payload = {
        ...attributeForm.value,
        entityId: props.entityId,
      }

      if (editingAttribute.value) {
        await updateAttribute(editingAttribute.value.id, payload)
      } else {
        await createAttribute(payload)
      }

      await loadAttributes()
      closeAttributeDialog()
      showSnackbar(`Field ${editingAttribute.value ? 'updated' : 'added'} successfully.`, 'success')
    } catch (error) {
      console.error('Error saving attribute:', error)
      showSnackbar('Failed to save field.', 'error')
    } finally {
      isSavingAttribute.value = false
    }
  }

  function promptRemoveAttribute (attrId) {
    confirmDialog.value = {
      show: true,
      title: 'Delete Field',
      message: 'Are you sure you want to delete this field? This action cannot be undone.',
      color: 'error',
      onConfirm: () => removeAttribute(attrId),
    }
  }

  async function removeAttribute (attrId) {
    confirmDialog.value.show = false
    if (!props.entityId) return

    try {
      await deleteAttribute(attrId)
      showSnackbar('Field removed successfully.', 'success')
      await loadAttributes()
    } catch (error) {
      console.error('Error removing attribute:', error)
      showSnackbar('Failed to remove field.', 'error')
    }
  }

  function editRelationship (rel) {
    editingRelationship.value = rel
    relationshipForm.value = {
      ...rel,
      targetEntityId: rel.targetEntityId,
    }
    openAddRelationshipDialog.value = true
  }

  function closeRelationshipDialog () {
    openAddRelationshipDialog.value = false
    editingRelationship.value = null
    relationshipForm.value = relationshipFormDefault()
  }

  async function saveRelationship () {
    if (!relationshipForm.value.sourceFieldName || !relationshipForm.value.targetEntityId ||
      !relationshipForm.value.relationshipType || !props.entityId) {
      showSnackbar('Source Field, Target Entity, and Type are required.', 'error')
      return
    }

    isSavingRelationship.value = true
    try {
      const payload = {
        ...relationshipForm.value,
        sourceEntityId: props.entityId,
      }

      if (editingRelationship.value) {
        await updateRelationship(editingRelationship.value.id, payload)
      } else {
        await createRelationship(payload)
      }

      await loadRelationships()
      closeRelationshipDialog()
      showSnackbar(`Relationship ${editingRelationship.value ? 'updated' : 'added'} successfully.`, 'success')
    } catch (error) {
      console.error('Error saving relationship:', error)
      showSnackbar('Failed to save relationship.', 'error')
    } finally {
      isSavingRelationship.value = false
    }
  }

  function promptRemoveRelationship (relId) {
    confirmDialog.value = {
      show: true,
      title: 'Delete Relationship',
      message: 'Are you sure you want to delete this relationship? This action cannot be undone.',
      color: 'error',
      onConfirm: () => removeRelationship(relId),
    }
  }

  async function removeRelationship (relId) {
    confirmDialog.value.show = false
    if (!props.entityId) return

    try {
      await deleteRelationship(relId)
      showSnackbar('Relationship removed successfully.', 'success')
      await loadRelationships()
    } catch (error) {
      console.error('Error removing relationship:', error)
      showSnackbar('Failed to remove relationship.', 'error')
    }
  }

  function openAddAttributeDialogHandler () {
    attributeForm.value = attributeFormDefault();
    editingAttribute.value = null;
    openAddAttributeDialog.value = true;
  }

  function openAddRelationshipDialogHandler () {
    relationshipForm.value = relationshipFormDefault();
    editingRelationship.value = null;
    openAddRelationshipDialog.value = true;
  }

  onMounted(() => {
    if (props.entityId && props.projectId) {
      loadCoreData()
    }
  })

  watch(
    () => [props.entityId, props.projectId],
    ([newEntityId, newProjectId], [oldEntityId, oldProjectId]) => {
      if (newEntityId && newProjectId && (newEntityId !== oldEntityId || newProjectId !== oldProjectId)) {
        loadCoreData()
      } else if (!newEntityId || !newProjectId) {
        entity.value = null
        attributes.value = []
        relationships.value = []
        isLoading.value = false
      }
    }
  )
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}

.entity-designer-card {
  background-color: var(--v-background-base, #1A1A2E);
  border: 1px solid rgba(93, 176, 168, 0.15);
  position: relative;
  overflow: hidden;
}

.entity-header {
  position: relative;
  background: linear-gradient(to right, #1F2937, #2C3E50);
  border-bottom: 1px solid rgba(93, 176, 168, 0.2);
}

.fields-wrapper {
  margin: -8px;
  padding: 8px;
}

.field-card {
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  background-color: var(--v-surface-base, #1F2937);
  border: 1px solid rgba(93, 176, 168, 0.12);
}

.field-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.35) !important;
  border-color: #5DB0A8;
}

.field-card-header {
  border-bottom: 1px solid rgba(93, 176, 168, 0.15);
  background-color: rgba(44, 62, 80, 0.4);
}

.field-icon {
  padding: 5px;
  border-radius: 50%;
  background: rgba(93, 176, 168, 0.15);
}

.field-card-body {
  background-color: rgba(31, 41, 55, 0.7);
}

.default-value-content {
  background-color: rgba(26, 26, 46, 0.7);
  border: 1px solid rgba(93, 176, 168, 0.2);
  font-family: monospace;
}

.relationships-wrapper {
  margin: -8px;
  padding: 8px;
}

.relationship-card {
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  background-color: var(--v-surface-base, #1F2937);
  border: 1px solid rgba(93, 176, 168, 0.12);
}

.relationship-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.35) !important;
  border-color: #5DB0A8;
}

.relationship-card-header {
  border-bottom: 1px solid rgba(93, 176, 168, 0.15);
  background-color: rgba(44, 62, 80, 0.5);
}

.one-to-one-header {
  background: linear-gradient(to right, rgba(93, 176, 168, 0.2), transparent);
}

.one-to-many-header {
  background: linear-gradient(to right, rgba(33, 150, 243, 0.15), transparent);
}

.many-to-one-header {
  background: linear-gradient(to right, rgba(255, 138, 128, 0.15), transparent);
}

.many-to-many-header {
  background: linear-gradient(to right, rgba(102, 187, 106, 0.15), transparent);
}

.relationship-card-body {
  background-color: rgba(31, 41, 55, 0.7);
}

.relationship-diagram {
  background-color: rgba(26, 26, 46, 0.65);
  border-radius: 8px;
  border: 1px dashed rgba(93, 176, 168, 0.25);
}

.field-mappings {
  background-color: rgba(26, 26, 46, 0.45);
  border-radius: 8px;
  border: 1px solid rgba(93, 176, 168, 0.15);
}

.entity-box {
  background-color: rgba(31, 41, 55, 0.9);
  border-radius: 4px;
  min-width: 100px;
  border: 1px solid rgba(93, 176, 168, 0.3);
}

.source-entity {
  box-shadow: 0 0 0 1px rgba(93, 176, 168, 0.4);
}

.target-entity {
  box-shadow: 0 0 0 1px rgba(44, 62, 80, 0.6);
}

.relationship-arrow {
  flex: 1;
  text-align: center;
}
</style>
