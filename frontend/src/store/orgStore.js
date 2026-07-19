import { create } from 'zustand'
import { orgService } from '../services/orgService'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'

export const useOrgStore = create((set, get) => ({
    orgs: [],
    currentOrg: null,
    currentProject: null,
    projects: [],   // store projects for current org
    tasks: [],      // store tasks for current project
    loading: false,

    // ─── INITIALIZATION / FETCHING ──────────────────────────────────────────

    fetchOrgs: async () => {
        try {
            set({ loading: true })
            const orgs = await orgService.getMyOrgs()
            set({ orgs, loading: false })
            
            // Auto-select first org if none selected but available
            const { currentOrg } = get()
            if (!currentOrg && orgs.length > 0) {
                set({ currentOrg: orgs[0] })
                await get().fetchProjects(orgs[0]._id)
            }
        } catch (error) {
            console.error('Failed to fetch orgs:', error)
            set({ loading: false })
        }
    },

    fetchProjects: async (orgId) => {
        try {
            const projects = await projectService.getProjects(orgId)
            set({ projects })
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        }
    },

    fetchTasks: async (orgId, projectId) => {
        try {
            // Note: backend taskService takes projectId, not orgId
            const tasks = await taskService.getTasksByProject(projectId)
            set({ tasks })
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    },

    // ─── ACTIONS ─────────────────────────────────────────────────────────────

    setCurrentOrg: async (org) => {
        // use _id or id gracefully
        set({ currentOrg: org, currentProject: null, projects: [], tasks: [] })
        if (org) {
            await get().fetchProjects(org.id || org._id)
        }
    },

    setCurrentProject: async (project) => {
        set({ currentProject: project, tasks: [] })
        if (project) {
            const orgId = get().currentOrg?.id || get().currentOrg?._id || project.organization
            await get().fetchTasks(orgId, project.id || project._id)
        }
    },

    addOrg: async (orgData) => {
        // Note: the component should ideally call this, but if we do it in store:
        // Already handled locally by components usually (they call API, then fetchOrgs).
        // Let's implement full async wrappers here so components don't change much.
        const org = await orgService.createOrg(orgData)
        set(state => ({ orgs: [org, ...state.orgs], currentOrg: org, projects: [] }))
        return org
    },

    addProjectToOrg: async (orgId, projectData) => {
        const project = await projectService.createProject(orgId, projectData)
        set(state => ({ projects: [project, ...state.projects] }))
        return project
    },

    updateProjectInOrg: async (orgId, projectId, updateData) => {
        const updated = await projectService.updateProject(orgId, projectId, updateData)
        set(state => ({
            projects: state.projects.map(p => (p.id || p._id) === projectId ? updated : p),
            currentProject: (state.currentProject?.id || state.currentProject?._id) === projectId ? updated : state.currentProject
        }))
        return updated
    },

    addTaskToProject: async (projectId, taskData) => {
        const task = await taskService.createTask(projectId, taskData)
        set(state => ({ tasks: [task, ...state.tasks] }))
        return task
    },

    updateTaskInProject: async (projectId, taskId, updateData) => {
        const updated = await taskService.updateTask(projectId, taskId, updateData)
        set(state => ({
            tasks: state.tasks.map(t => (t.id || t._id) === taskId ? updated : t)
        }))
        return updated
    },

    deleteTaskFromProject: async (projectId, taskId) => {
        await taskService.deleteTask(projectId, taskId)
        set(state => ({
            tasks: state.tasks.filter(t => (t.id || t._id) !== taskId)
        }))
    },

    // Legacy sync methods just for safety (will fade out as we convert components)
    getProjectsForCurrentOrg: () => get().projects,
    
    clearOrg: () => set({ currentOrg: null, currentProject: null, projects: [], tasks: [] }),
}))
