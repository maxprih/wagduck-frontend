<template>
  <EntityDesigner :entity-id="entityId" :project-id="projectId" />
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import EntityDesigner from '@/components/EntityDesigner.vue'

  const route = useRoute()
  const projectId = computed(() => route.query.projectId || '')
  const entityId = computed(() => route.params.entityId)
</script>
