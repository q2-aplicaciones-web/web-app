import { ref, readonly, computed } from 'vue'
import designLabService from '../services/design-lab.service.js'
import { authenticationService } from '../../iam/services/authentication.service.js'

/**
 * Composable for managing projects state and operations
 * API-first approach with reactive state management
 */
export function useProjects() {
  // Reactive state
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Service instance
  // const designLabService = new DesignLabService() // Already imported as singleton

  // Computed properties
  const hasProjects = computed(() => projects.value.length > 0)
  const currentProjectId = computed(() => currentProject.value?.id || null)
  const currentUserId = computed(() => authenticationService.currentUserId.value)

  /**
   * Load projects for the current authenticated user
   */
  async function loadProjects() {
    const userId = currentUserId.value
    
    if (!userId) {
      error.value = 'User must be authenticated'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await designLabService.getUserProjects(userId)
      projects.value = result || []
    } catch (err) {
      error.value = err.message || 'Failed to load projects'
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a specific project by ID
   * @param {string} projectId - Project ID
   */
  async function loadProject(projectId) {
    if (!projectId) {
      error.value = 'Project ID is required'
      return
    }

    loading.value = true
    error.value = null

    try {
      const project = await designLabService.getProject(projectId)
      currentProject.value = project
      
      // Also update in projects list if it exists
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = project
      }
    } catch (err) {
      error.value = err.message || 'Failed to load project'
      currentProject.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project creation data (without userId)
   */
  async function createProject(projectData) {
    if (!projectData) {
      error.value = 'Project data is required'
      return null
    }

    const userId = currentUserId.value
    
    if (!userId) {
      error.value = 'User must be authenticated to create projects'
      return null
    }

    loading.value = true
    error.value = null

    try {
      // Inject the authenticated user ID
      const projectDataWithUserId = {
        ...projectData,
        userId: userId
      }
      
      const newProject = await designLabService.createProject(projectDataWithUserId)
      
      // Add to projects list
      projects.value.unshift(newProject)
      
      // Set as current project
      currentProject.value = newProject
      
      return newProject
    } catch (err) {
      error.value = err.message || 'Failed to create project'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a project
   * @param {string} projectId - Project ID to delete
   */
  async function deleteProject(projectId) {
    if (!projectId) {
      error.value = 'Project ID is required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await designLabService.deleteProject(projectId)
      
      // Remove from projects list
      projects.value = projects.value.filter(p => p.id !== projectId)
      
      // Clear current project if it was deleted
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete project'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Update project details
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Update data
   */
  async function updateProjectDetails(projectId, updateData) {
    if (!projectId || !updateData) {
      error.value = 'Project ID and update data are required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await designLabService.updateProjectDetails(projectId, updateData)
      
      // Refresh the project to get updated data
      await loadProject(projectId)
      
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update project details'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Set current project (without API call)
   * @param {Object} project - Project object
   */
  function setCurrentProject(project) {
    currentProject.value = project
  }

  /**
   * Clear current project
   */
  function clearCurrentProject() {
    currentProject.value = null
  }

  /**
   * Clear all state
   */
  function clearProjects() {
    projects.value = []
    currentProject.value = null
    error.value = null
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // Readonly state
    projects: readonly(projects),
    currentProject: readonly(currentProject),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed properties
    hasProjects,
    currentProjectId,
    currentUserId,
    
    // Actions
    loadProjects,
    loadProject,
    createProject,
    deleteProject,
    updateProjectDetails,
    setCurrentProject,
    clearCurrentProject,
    clearProjects,
    clearError
  }
}
