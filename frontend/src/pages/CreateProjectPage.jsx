import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, FolderPlus, CheckCircle2 } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { projectService } from '../services/projectService'
import toast from 'react-hot-toast'

export const CreateProjectPage = () => {
    const [step, setStep] = useState(1)
    const [ideaText, setIdeaText] = useState('')
    const [type, setType] = useState('Web App')
    const [teamSize, setTeamSize] = useState('Solo')
    const [loading, setLoading] = useState(false)
    const [aiOutput, setAiOutput] = useState(null)

    const navigate = useNavigate()

    const handleAnalyze = async () => {
        if (!ideaText.trim()) return toast.error('Please describe your idea')
        setLoading(true)
        try {
            const data = await projectService.analyzeIdea(ideaText, type, teamSize)
            setAiOutput(data)
            setStep(2)
            toast.success('Analysis complete!')
        } catch (err) {
            toast.error('Failed to analyze idea')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        setLoading(true)
        try {
            const project = await projectService.createProject({ aiOutput, ideaText })
            toast.success('Project created successfully!')
            navigate(`/project/${project.id || project._id}`)
        } catch (err) {
            toast.error('Failed to create project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Sidebar />
            <Navbar title="New Project" />

            <main className="ml-[220px] pt-14 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-white">New Project</h2>
                    </div>

                    {step === 1 ? (
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Spinner className="w-10 h-10 text-indigo-500" />
                                    <p className="text-neutral-400">AI is analyzing your idea...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Describe your project idea</label>
                                        <textarea
                                            value={ideaText}
                                            onChange={e => setIdeaText(e.target.value)}
                                            className="w-full min-h-[140px] bg-[#242424] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                                            placeholder="e.g. I want to build a food delivery app where restaurants can list their menu and customers can order with real-time tracking..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-neutral-400 mb-1">Project Type</label>
                                            <select
                                                value={type}
                                                onChange={e => setType(e.target.value)}
                                                className="w-full bg-[#242424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
                                            >
                                                <option>Web App</option>
                                                <option>Mobile App</option>
                                                <option>API</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-neutral-400 mb-1">Team Size</label>
                                            <select
                                                value={teamSize}
                                                onChange={e => setTeamSize(e.target.value)}
                                                className="w-full bg-[#242424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
                                            >
                                                <option>Solo</option>
                                                <option>2-5 people</option>
                                                <option>6-15 people</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Button onClick={handleAnalyze} className="w-full py-3" disabled={loading}>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Analyze with AI
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">{aiOutput?.summary}</p>
                            </div>

                            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
                                <ul className="list-decimal list-inside space-y-2 text-sm text-neutral-400">
                                    {aiOutput?.requirements?.map((req, i) => (
                                        <li key={i}>{req}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {aiOutput?.features?.map((f, i) => (
                                        <div key={i} className="bg-[#242424] border border-white/5 rounded-lg p-4">
                                            <p className="font-bold text-white text-sm mb-1">{f.name}</p>
                                            <p className="text-xs text-neutral-500">{f.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Generated Tasks</h3>
                                <div className="space-y-3">
                                    {aiOutput?.tasks?.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between bg-[#242424] border border-white/5 rounded-lg p-3">
                                            <div>
                                                <p className="text-sm font-medium text-white">{t.title}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{t.category}</p>
                                            </div>
                                            <Badge variant={t.priority}>{t.priority}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Testing Checklist</h3>
                                    <div className="space-y-3">
                                        {aiOutput?.testing_checklist?.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-neutral-400">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Deployment Checklist</h3>
                                    <div className="space-y-3">
                                        {aiOutput?.deployment_checklist?.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-neutral-400">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-3" disabled={loading}>
                                    Edit Idea
                                </Button>
                                <Button onClick={handleCreate} className="flex-1 py-3" disabled={loading}>
                                    {loading ? <Spinner /> : (
                                        <>
                                            <FolderPlus className="w-4 h-4 mr-2" />
                                            Create Project
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
