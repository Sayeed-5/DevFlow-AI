import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { inviteService } from '../services/inviteService'
import { useAuthStore } from '../store/authStore'
import { useOrgStore } from '../store/orgStore'

export const InviteAcceptPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')
    const { isAuthenticated } = useAuthStore()
    const { fetchOrgs } = useOrgStore()

    const [status, setStatus] = useState('loading') // loading, success, requires_registration, error
    const [message, setMessage] = useState('')
    const [orgName, setOrgName] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Invalid or missing invitation link.')
            return
        }

        inviteService.acceptInvitation(token)
            .then(res => {
                if (res.requiresRegistration) {
                    setStatus('requires_registration')
                    setOrgName(res.orgName)
                    sessionStorage.setItem('invite_email', res.email)
                    sessionStorage.setItem('invite_token', res.token)
                } else {
                    setStatus('success')
                    setOrgName(res.orgName || res.org?.name)
                    if (isAuthenticated) {
                        fetchOrgs() // Refresh orgs to show the new one
                    } else {
                        // User exists and invite was accepted, but they are not logged in.
                        // Wait, if they are not authenticated on the frontend, let's keep the token
                        // so login page can re-trigger it or they can just log in and see it.
                    }
                }
            })
            .catch(err => {
                setStatus('error')
                setMessage(err.response?.data?.message || 'Failed to process invitation.')
            })
    }, [token, isAuthenticated, fetchOrgs])

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
            <div className="w-full max-w-md">
                <div className="rounded-2xl border p-8 text-center shadow-2xl" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                    {status === 'loading' && (
                        <div className="py-8">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: '#10b981' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#ededed' }}>Verifying Invitation...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#052e16' }}>
                                <CheckCircle2 className="w-7 h-7" style={{ color: '#10b981' }} />
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#ededed' }}>Invitation Accepted!</h2>
                            <p className="text-sm mb-8" style={{ color: '#737373' }}>
                                You are now a member of <span className="font-semibold" style={{ color: '#10b981' }}>{orgName}</span>.
                            </p>
                            <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all"
                                style={{ background: '#10b981', color: '#fff' }}>
                                {isAuthenticated ? 'Go to Dashboard' : 'Log In to Continue'}
                            </button>
                        </div>
                    )}

                    {status === 'requires_registration' && (
                        <div className="py-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#052e16' }}>
                                <Building2 className="w-7 h-7" style={{ color: '#10b981' }} />
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#ededed' }}>Join {orgName}</h2>
                            <p className="text-sm mb-8" style={{ color: '#737373' }}>
                                You've been invited to join <span className="font-semibold" style={{ color: '#10b981' }}>{orgName}</span>. Let's create your account first to access the workspace.
                            </p>
                            <button onClick={() => navigate('/register')}
                                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all mb-3"
                                style={{ background: '#10b981', color: '#fff' }}>
                                Create Account
                            </button>
                            <button onClick={() => navigate('/login')}
                                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all border"
                                style={{ borderColor: '#2a2a2a', color: '#ededed' }}>
                                Already have an account? Log in
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#2d0a0a' }}>
                                <AlertCircle className="w-7 h-7" style={{ color: '#ef4444' }} />
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#ededed' }}>Invitation Failed</h2>
                            <p className="text-sm mb-8" style={{ color: '#737373' }}>{message}</p>
                            <button onClick={() => navigate('/')}
                                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all border"
                                style={{ borderColor: '#2a2a2a', color: '#ededed' }}>
                                Go to Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
