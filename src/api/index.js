import axios from 'axios'
import { state as keycloakState } from '@/plugins/keycloak'

const api = axios.create({
  baseURL: 'http://localhost:8088/api',
})

api.interceptors.request.use(config => {
  const token = keycloakState.token
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      if (keycloakState.keycloak && typeof keycloakState.keycloak.login === 'function') {
        keycloakState.keycloak.login();
      } else {
        console.error('Keycloak instance not available for login redirect.');
      }
    }
    return Promise.reject(error);
  }
);

// Entities
export function getEntities (projectId) {
  return api.get('/v1/entity', { params: { projectId } })
}
export function getEntity (entityId) {
  return api.get(`/v1/entity/${entityId}`)
}
export function createEntity (data) {
  return api.post('/v1/entity', data)
}
export function putEntity (entityId, data) {
  return api.put(`/v1/entity/${entityId}`, data)
}
export function deleteEntity (entityId) {
  return api.delete(`/v1/entity/${entityId}`)
}

export const getAllEntitiesForProject = getEntities

export function getAttributes (entityId) {
  return api.get('/v1/attribute', { params: { entityId } })
}
export function createAttribute (data) {
  return api.post('/v1/attribute', data)
}
export function updateAttribute (attributeId, data) {
  return api.put(`/v1/attribute/${attributeId}`, data)
}
export function deleteAttribute (attributeId) {
  return api.delete(`/v1/attribute/${attributeId}`)
}

export function getRelationships (entityId) {
  return api.get('/v1/relationships', { params: { entityId } })
}
export function createRelationship (data) {
  return api.post('/v1/relationships', data)
}
export function updateRelationship (relationshipId, data) {
  return api.put(`/v1/relationships/${relationshipId}`, data)
}
export function deleteRelationship (relationshipId) {
  return api.delete(`/v1/relationships/${relationshipId}`)
}

export function getAllProjectsForUser (userId) {
  return api.get('/v1/project', { params: { userId } })
}

export function createProject (data) {
  return api.post('/v1/project', data)
}

export function getProject (projectId, userId) {
  return api.get(`/v1/project/${projectId}`, { params: { userId } })
}

export function updateProject (projectId, userId, data) {
  return api.put(`/v1/project/${projectId}`, data, { params: { userId } })
}

export function deleteProject (projectId, userId) {
  return api.delete(`/v1/project/${projectId}`, { params: { userId } });
}

export function generateProject (projectId, ownerId) {
  return api.post(`/v1/project/${projectId}/generate`, null, { params: { ownerId }, responseType: 'blob' })
}

export function getApiEndpoints (entityId) {
  return api.get(`/v1/entity/${entityId}/api-endpoints`)
}

export function updateApiEndpoints (entityId, data) {
  return api.put(`/v1/entity/${entityId}/api-endpoints`, data)
}
