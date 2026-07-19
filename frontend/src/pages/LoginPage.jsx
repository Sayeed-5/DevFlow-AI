import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const inputStyle = {
    width: '100%',
    background: '#242424',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#ededed',
    outline: 'none',
    transition: 'border-color 0.15s',
}

export const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { login } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { user, token } = await authService.login(email, password)
            login(user, token)

            const inviteToken = sessionStorage.getItem('invite_token')
            if (inviteToken) {
                try {
                    const { inviteService } = await import('../services/inviteService')
                    await inviteService.acceptInvitation(inviteToken)
                } catch (e) { }
                sessionStorage.removeItem('invite_token')
                sessionStorage.removeItem('invite_email')
            }

            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#052e16' }}>
                        <CheckSquare className="w-5 h-5" style={{ color: '#10b981' }} />
                    </div>
                    <span className="font-bold text-xl" style={{ color: '#ededed' }}>DevFlow</span>
                </div>

                <div className="rounded-2xl border p-6" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                    <h2 className="text-lg font-semibold text-center mb-5" style={{ color: '#ededed' }}>Welcome back</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#2d0a0a', border: '1px solid #ef444433' }}>
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                            <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Email</label>
                            <input
                                type="email" required value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Password</label>
                            <input
                                type="password" required value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: loading ? '#059669' : '#10b981', color: '#fff', opacity: loading ? 0.85 : 1 }}
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-5" style={{ color: '#737373' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium" style={{ color: '#10b981' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
