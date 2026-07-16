import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'

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
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            />
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />

                <Route path="/projects/create" element={
                    <ProtectedRoute>
                        <CreateProjectPage />
                    </ProtectedRoute>
                } />

                <Route path="/project/:projectId" element={
                    <ProtectedRoute>
                        <ProjectDetailPage />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
