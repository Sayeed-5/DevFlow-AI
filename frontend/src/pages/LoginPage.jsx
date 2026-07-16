import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

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
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                    <span className="font-bold text-2xl text-white">PlanAI</span>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">Welcome back</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Email</label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Password</label>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Spinner /> : 'Sign In'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-neutral-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
