import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOrgStore = create(persist((set, get) => ({
    orgs: [],
    currentOrg: null,
    currentProject: null,

    setOrgs: (orgs) => set({ orgs }),

    addOrg: (org) => set((state) => ({ orgs: [...state.orgs, org] })),

    setCurrentOrg: (org) => set({ currentOrg: org, currentProject: null }),

    setCurrentProject: (project) => set({ currentProject: project }),

    updateProjectInOrg: (updatedProject) => set((state) => ({
        orgs: state.orgs.map(org =>
            org.id === updatedProject.orgId
                ? { ...org, projects: org.projects.map(p => p.id === updatedProject.id ? updatedProject : p) }
                : org
        ),
        currentProject: state.currentProject?.id === updatedProject.id ? updatedProject : state.currentProject
    })),

    addProjectToOrg: (project) => set((state) => ({
        orgs: state.orgs.map(org =>
            org.id === project.orgId
                ? { ...org, projects: [...(org.projects || []), project] }
                : org
        )
    })),

    getProjectsForCurrentOrg: () => {
        const { orgs, currentOrg } = get()
        if (!currentOrg) return []
        const org = orgs.find(o => o.id === currentOrg.id)
        return org?.projects || []
    },

    inviteMember: (orgId, email) => set((state) => ({
        orgs: state.orgs.map(org =>
            org.id === orgId
                ? { ...org, members: [...(org.members || []), { email, role: 'member', id: Date.now().toString() }] }
                : org
        )
    })),

    clearOrg: () => set({ currentOrg: null, currentProject: null }),

    updateTaskInProject: (projectId, updatedTask) => set((state) => {
        const newOrgs = state.orgs.map(org => ({
            ...org,
            projects: (org.projects || []).map(proj =>
                proj.id === projectId
                    ? { ...proj, tasks: (proj.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) }
                    : proj
            )
        }))
        const currentProject = state.currentProject?.id === projectId
            ? { ...state.currentProject, tasks: (state.currentProject.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) }
            : state.currentProject
        return { orgs: newOrgs, currentProject }
    }),

    addTaskToProject: (projectId, task) => set((state) => {
        const newOrgs = state.orgs.map(org => ({
            ...org,
            projects: (org.projects || []).map(proj =>
                proj.id === projectId
                    ? { ...proj, tasks: [...(proj.tasks || []), task] }
                    : proj
            )
        }))
        const currentProject = state.currentProject?.id === projectId
            ? { ...state.currentProject, tasks: [...(state.currentProject.tasks || []), task] }
            : state.currentProject
        return { orgs: newOrgs, currentProject }
    }),

    deleteTaskFromProject: (projectId, taskId) => set((state) => {
        const newOrgs = state.orgs.map(org => ({
            ...org,
            projects: (org.projects || []).map(proj =>
                proj.id === projectId
                    ? { ...proj, tasks: (proj.tasks || []).filter(t => t.id !== taskId) }
                    : proj
            )
        }))
        const currentProject = state.currentProject?.id === projectId
            ? { ...state.currentProject, tasks: (state.currentProject.tasks || []).filter(t => t.id !== taskId) }
            : state.currentProject
        return { orgs: newOrgs, currentProject }
    }),
}), { name: 'org-storage' }))
