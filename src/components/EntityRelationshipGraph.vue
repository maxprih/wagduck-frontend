<template>
  <v-card class="graph-card" elevation="0" style="height: 100%; display: flex; flex-direction: column;">
    <v-toolbar class="pr-2" color="transparent" density="compact" flat>
      <v-toolbar-title class="text-h6 font-weight-medium ml-2">Project Schema Graph</v-toolbar-title>
      <v-chip
        v-if="project"
        class="ml-2"
        color="primary"
        label
        size="small"
      >
        <v-icon start>mdi-folder-network-outline</v-icon> {{ project.projectName }}
      </v-chip>
      <v-spacer />
      <v-tooltip location="bottom" text="Recalculate Layout">
        <template #activator="{ props: tooltipProps }">
          <v-btn v-bind="tooltipProps" :disabled="isLoading || (nodes.length === 0 && edges.length === 0)" icon @click="applyLayout">
            <v-icon>mdi-refresh-circle</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip location="bottom" text="Fit View">
        <template #activator="{ props: tooltipProps }">
          <v-btn v-bind="tooltipProps" :disabled="isLoading || (nodes.length === 0 && edges.length === 0)" icon @click="fitGraphView">
            <v-icon>mdi-fit-to-page-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip location="bottom" text="Close">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon v-bind="tooltipProps" @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-toolbar>
    <v-divider />

    <div style="flex-grow: 1; position: relative; background-color: #f7f7f9;">
      <VueFlow
        v-model:edges="edges"
        v-model:nodes="nodes"
        class="schema-graph"
        :connect-on-init="false"
        :default-viewport="{ zoom: 0.8 }"
        :edges-updatable="false"
        :fit-view-on-init="true"
        :max-zoom="2"
        :min-zoom="0.1"
        :nodes-draggable="true"
        @pane-ready="onPaneReady"
      >
        <template #node-entity="{ data, id, selected }">
          <div
            :class="['entity-node', { selected }]"
            :title="`Click to view details for ${data.label}`"
            @click="handleNodeClick(id)"
          >
            <div class="node-header">
              <v-icon class="mr-2" color="primary" small>mdi-table-large</v-icon>
              <strong class="node-label">{{ data.label }}</strong>
            </div>
            <div v-if="data.tableName" class="node-sublabel">
              {{ data.tableName }}
            </div>
          </div>
        </template>

        <MiniMap
          :node-color="getMinimapNodeColor"
          :node-stroke-width="2"
          pannable
          position="bottom-right"
          style="background-color: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
          zoomable
        />
        <Controls position="bottom-left" :show-interactive="false" />
        <Background :gap="24" :size="1" :variant="BackgroundVariant.Dots" />
      </VueFlow>

      <div v-if="isLoading" class="overlay-content">
        <v-progress-circular color="primary" indeterminate size="64" width="5" />
        <p class="mt-4 text-subtitle-1 text-medium-emphasis">Loading graph data...</p>
      </div>
      <div v-else-if="error" class="overlay-content error-state">
        <v-icon class="mb-3" color="error" size="48">mdi-alert-circle-outline</v-icon>
        <p class="text-h6 mb-2">Failed to load graph</p>
        <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn color="primary" prepend-icon="mdi-refresh" variant="tonal" @click="fetchDataAndBuildGraph">Retry</v-btn>
      </div>
      <div v-else-if="!isLoading && nodes.length === 0" class="overlay-content">
        <v-icon class="mb-3" color="grey" size="64">mdi-vector-square-close</v-icon>
        <p class="text-h6 text-medium-emphasis">No entities found</p>
        <p class="text-body-1 text-grey-darken-1">This project doesn't have any entities to display in the graph.</p>
      </div>
    </div>
  </v-card>
</template>

<script setup>
  import { nextTick, onMounted, ref, watch } from 'vue'
  import { MarkerType, Position, useVueFlow, VueFlow } from '@vue-flow/core'
  import { MiniMap } from '@vue-flow/minimap'
  import { Controls } from '@vue-flow/controls'
  import { Background, BackgroundVariant } from '@vue-flow/background'
  import dagre from 'dagre'
  import { getAllEntitiesForProject, getProject, getRelationships } from '@/api/index.js'
  import { state as keycloakState } from '@/plugins/keycloak'


  const props = defineProps({
    projectId: {
      type: String,
      required: true,
    },
  })

  const emit = defineEmits(['close', 'navigate-to-entity'])

  const nodes = ref([])
  const edges = ref([])

  const isLoading = ref(true)
  const error = ref('')
  const project = ref(null)

  const { fitView, getNodes, getEdges, removeNodes, removeEdges, addNodes: vueFlowAddNodes, addEdges: vueFlowAddEdges } = useVueFlow()

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 120, marginx: 30, marginy: 30 })

  const nodeWidth = 180
  const nodeHeight = 70

  async function fetchDataAndBuildGraph () {
    isLoading.value = true
    error.value = ''

    const currentNodes = getNodes.value
    if (currentNodes.length > 0) {
      removeNodes(currentNodes.map(n => n.id), true)
    }
    const currentEdges = getEdges.value
    if (currentEdges.length > 0) {
      removeEdges(currentEdges.map(e => e.id), true)
    }
    nodes.value = []
    edges.value = []


    try {
      const userId = keycloakState.userProfile?.id
      if (userId) {
        const projectRes = await getProject(props.projectId, userId)
        project.value = projectRes.data
      }

      const entitiesResponse = await getAllEntitiesForProject(props.projectId)
      const allEntities = entitiesResponse.data || []


      if (allEntities.length === 0) {
        isLoading.value = false
        return
      }

      const entityMap = new Map(allEntities.map(e => [e.id, e]))


      const newNodesToCreate = allEntities.map(entity => ({
        id: entity.id,
        type: 'entity',
        label: entity.entityName,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: entity.entityName,
          tableName: entity.tableName,
        },
        width: nodeWidth,
        height: nodeHeight,
      }))

      vueFlowAddNodes(newNodesToCreate)
      await nextTick()


      const allProjectRelationships = []
      const relationshipPromises = allEntities.map(entity =>
        getRelationships(entity.id)
          .then(res => {

            return res.data || []
          })
          .catch(err => {
            console.warn(`Failed to fetch relationships for entity ${entity.id} (${entity.entityName}):`, err)
            return []
          })
      )
      const fetchedRelationshipArrays = await Promise.all(relationshipPromises)
      fetchedRelationshipArrays.forEach(relsForOneEntity => {
        allProjectRelationships.push(...relsForOneEntity)
      })


      const uniqueDisplayRelationships = [];
      const processedLinks = new Set();

      allProjectRelationships.sort((a, b) => {
        if (a.owningSide === true && b.owningSide !== true) return -1;
        if (a.owningSide !== true && b.owningSide === true) return 1;
        return (a.id || '').localeCompare(b.id || '');
      });

      for (const rel of allProjectRelationships) {
        const ids = [rel.sourceEntityId, rel.targetEntityId].sort();
        const linkKey = `${ids[0]}<-->${ids[1]}`;

        if (!processedLinks.has(linkKey)) {
          uniqueDisplayRelationships.push(rel);
          processedLinks.add(linkKey);
        }
      }


      const newEdgesToCreate = []
      uniqueDisplayRelationships.forEach(rel => {
        if (entityMap.has(rel.sourceEntityId) && entityMap.has(rel.targetEntityId)) {
          const sourceNodeExists = getNodes.value.find(n => n.id === rel.sourceEntityId);
          const targetNodeExists = getNodes.value.find(n => n.id === rel.targetEntityId);

          if(sourceNodeExists && targetNodeExists){
            const labelParts = [];
            labelParts.push(rel.relationshipType.replace(/_/g, ' '));
            if (rel.owningSide) {
              labelParts.push('(Owner)');
            }

            let fieldInfo = '';
            const sourceEntityName = entityMap.get(rel.sourceEntityId)?.entityName || 'Source';
            const targetEntityName = entityMap.get(rel.targetEntityId)?.entityName || 'Target';

            if (rel.sourceFieldName) {
              fieldInfo += `${sourceEntityName}.${rel.sourceFieldName}`;
            } else {
              fieldInfo += sourceEntityName;
            }
            fieldInfo += ` ➔ `;
            if (rel.targetFieldName) {
              fieldInfo += `${targetEntityName}.${rel.targetFieldName}`;
            } else {
              fieldInfo += targetEntityName;
            }
            if (fieldInfo.trim() !== '➔') labelParts.push(fieldInfo);

            const labelOffsetAmount = 350;
            const verticalLabelOffset = -350;

            newEdgesToCreate.push({
              id: `edge-${rel.id}`,
              source: rel.sourceEntityId,
              target: rel.targetEntityId,
              label: labelParts.join('\n'),
              labelStyle: { fill: '#343a40', fontWeight: 500, fontSize: '10.5px' },
              labelBgStyle: { fill: '#FF7F50', fillOpacity: 0.8, stroke: '#e9ecef', strokeWidth: 0.5 },

              labelBgBorderRadius: 3,
              offsetX: labelOffsetAmount,
              offsetY: verticalLabelOffset,
              markerEnd: { type: MarkerType.ArrowClosed, color: rel.owningSide ? '#0062cc' : '#5a6268', width:16, height:16 },
              style: { strokeWidth: 1.7, stroke: rel.owningSide ? '#0069d9' : '#545b62' },
              animated: rel.fetchType === 'EAGER',
              type: 'smoothstep',
              data: { ...rel },
            })
          } else {
            console.warn(`Skipping edge ${rel.id} due to missing source/target node IN VUEFLOW STATE. Source: ${rel.sourceEntityId}, Target: ${rel.targetEntityId}`);
          }
        } else {
          console.warn(`Skipping relationship ${rel.id} because source (${rel.sourceEntityId}) or target (${rel.targetEntityId}) entity not found in project entityMap.`);
        }
      })


      if (newEdgesToCreate.length > 0) {
        vueFlowAddEdges(newEdgesToCreate)
      }

      await nextTick()


      if (getNodes.value.length > 0) {
        applyLayout();
      } else {
        fitView({ padding: 0.2 });
      }

    } catch (e) {
      console.error('Failed to load or build graph:', e)
      error.value = e.response?.data?.message || e.message || 'An unknown error occurred.'
      nodes.value = []
      edges.value = []
    } finally {
      isLoading.value = false
    }
  }

  function applyLayout () {
    const currentFlowNodes = getNodes.value;
    if (currentFlowNodes.length === 0) {
      fitView({ padding: 0.2, duration: 200 });
      return;
    }
    isLoading.value = true;

    dagreGraph.nodes().forEach(n => dagreGraph.removeNode(n));
    dagreGraph.edges().forEach(e => dagreGraph.removeEdge(e.v, e.w, e.name));

    currentFlowNodes.forEach(node => {
      dagreGraph.setNode(node.id, { label: node.label, width: node.width || nodeWidth, height: node.height || nodeHeight });
    });

    getEdges.value.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = currentFlowNodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
          y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
        },
      };
    });
    nodes.value = layoutedNodes;

    nextTick(() => {
      fitView({ padding: 0.15, duration: 400 });
      isLoading.value = false;
    });
  }

  function onPaneReady () {
    if (getNodes.value.length > 0 && !isLoading.value) {
      fitView({ padding: 0.15 });
    }
  }

  function fitGraphView () {
    if (getNodes.value.length > 0 || getEdges.value.length > 0) {
      fitView({ padding: 0.15, duration: 500 });
    }
  }

  function getMinimapNodeColor (node) {
    return node.selected ? '#0056b3' : '#adb5bd';
  }

  function handleNodeClick (entityId) {
    emit('navigate-to-entity', entityId)
  }

  onMounted(() => {
    fetchDataAndBuildGraph()
  })

  watch(() => props.projectId, (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchDataAndBuildGraph()
    }
  })

</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

.schema-graph {
  width: 100%;
  height: 100%;
}

.graph-card .vue-flow__minimap {
  transform: scale(0.9);
  transform-origin: bottom right;
  border: 1px solid #dee2e6;
}

.entity-node {
  background-color: #ffffff;
  border: 1.5px solid #adb5bd;
  border-radius: 6px;
  padding: 12px 18px;
  min-width: 170px;
  max-width: 240px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  text-align: left;
}

.entity-node:hover {
  box-shadow: 0 3px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05);
  border-color: #007bff;
  transform: translateY(-2px);
}

.entity-node.selected {
  border-color: #0056b3;
  box-shadow: 0 0 0 3.5px rgba(0, 123, 255, 0.25);
}

.node-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.node-label {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.node-sublabel {
  font-size: 0.8rem;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(247, 247, 249, 0.92);
  z-index: 10;
  padding: 20px;
  text-align: center;
}

.overlay-content.error-state {
   background-color: rgba(255, 235, 238, 0.95);
}

.vue-flow__controls {
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  border-radius: 6px;
}
.vue-flow__controls .vue-flow__controls-button {
  background-color: #fff;
  border-bottom: 1px solid #f1f3f5;
  color: #495057;
}
.vue-flow__controls .vue-flow__controls-button:hover {
  background-color: #f8f9fa;
  color: #212529;
}

.vue-flow__edge-textbg {
  fill: rgba(145, 84, 20, 0.8);
  stroke: rgba(32, 89, 147, 0.4);
  stroke-width: 0.5px;
}
.vue-flow__edge-text {
  font-size: 10.5px;
  fill: #343a40;
}
</style>
