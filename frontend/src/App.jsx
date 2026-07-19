import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useOrgStore } from './store/orgStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { OrganizationSelectPage } from './pages/OrganizationSelectPage'
import { ProjectSelectPage } from './pages/ProjectSelectPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { MyTasksPage } from './pages/MyTasksPage'

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return children
}

const App = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1c1c1c',
                        color: '#ededed',
                        border: '1px solid #2a2a2a',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#052e16' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#2d0a0a' } },
                }}
            />
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

                <Route path="/org-select" element={
                    <ProtectedRoute><OrganizationSelectPage /></ProtectedRoute>
                } />

                <Route path="/project-select" element={
                    <ProtectedRoute><ProjectSelectPage /></ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />

                <Route path="/my-tasks" element={
                    <ProtectedRoute><MyTasksPage /></ProtectedRoute>
                } />

                <Route path="/projects/create" element={
                    <ProtectedRoute><CreateProjectPage /></ProtectedRoute>
                } />

                <Route path="/project/:projectId" element={
                    <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
