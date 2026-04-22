"use client"

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getRegulations, getAvailableJurisdictions } from '../api/client'
import { Search, Tag, Clock, ArrowUpRight, ChevronRight, Filter, Globe, ChevronDown } from 'lucide-react'
import RegulationDetail from './RegulationDetail'

function RegulationListContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [regulations, setRegulations] = useState([])
    const [jurisdictions, setJurisdictions] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedReg, setSelectedReg] = useState(null)

    // Parse URL params
    useEffect(() => {
        const juris = searchParams.get('jurisdiction')
        if (juris) {
            setSearch(juris.toUpperCase())
        }
    }, [searchParams])

    // Load Data
    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const juris = searchParams.get('jurisdiction')
                const [regRes, jurisRes] = await Promise.all([
                    getRegulations(juris ? { jurisdiction: juris.toUpperCase() } : {}),
                    getAvailableJurisdictions()
                ])
                setRegulations(regRes.data || [])
                setJurisdictions(jurisRes.data || [])
            } catch (err) {
                console.error('Data sync failure', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [searchParams])

    const filtered = useMemo(() => {
        if (!search) return regulations

        const term = search.trim()
        const termLower = term.toLowerCase()
        const isShortTerm = term.length <= 2

        return regulations.filter(r => {
            const jurisdictionMatch = r.jurisdiction?.toLowerCase().includes(termLower)

            let titleMatch = false
            if (isShortTerm) {
                const regex = new RegExp(`\\b${term}\\b`, 'i')
                titleMatch = regex.test(r.title || '')
            } else {
                titleMatch = r.title?.toLowerCase().includes(termLower)
            }

            const categoryMatch = r.category?.toLowerCase() === termLower
            return titleMatch || jurisdictionMatch || categoryMatch
        })
    }, [regulations, search])

    const handleJurisdictionChange = (id) => {
        if (id === 'all') {
            setSearch('')
            router.push('/regulations')
        } else {
            setSearch(id)
            router.push(`/regulations?jurisdiction=${id}`)
        }
    }

    if (loading && regulations.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 border-4 border-leagle-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold tracking-[0.3em] uppercase text-[10px]">Synchronizing Portfolio Intelligence...</p>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-5xl font-serif text-white tracking-tight italic">Jurisdictional Library</h2>
                        <div className="flex items-center gap-4 text-gray-500 font-medium uppercase text-[10px] tracking-widest">
                            <span>{filtered.length} Displayed Neurons</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span>Portfolio Depth: {regulations.length}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group/select">
                            <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-leagle-accent pointer-events-none" />
                            <select
                                className="pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-widest text-white appearance-none hover:border-leagle-accent transition-all cursor-pointer outline-none"
                                value={searchParams.get('jurisdiction') || 'all'}
                                onChange={(e) => handleJurisdictionChange(e.target.value)}
                            >
                                <option value="all">Global Oversight (All Regions)</option>
                                {jurisdictions.map(j => (
                                    <option key={j.id} value={j.id}>{j.id} (Market Mass: {j.count})</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover/select:text-leagle-accent pointer-events-none transition-colors" />
                        </div>

                        {search && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-leagle-accent/10 border border-leagle-accent/20 rounded-sm animate-in fade-in zoom-in duration-300">
                                <Filter size={10} className="text-leagle-accent" />
                                <span className="text-[9px] font-black text-leagle-accent uppercase tracking-widest">Active: {search}</span>
                                <button onClick={() => handleJurisdictionChange('all')} className="ml-2 hover:text-white text-leagle-accent/60 transition-colors">
                                    <ArrowUpRight size={10} className="rotate-45" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative w-full lg:w-[400px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-leagle-accent transition-colors" size={18} />
                    <input
                        type="search"
                        placeholder="Neural portfolio search..."
                        className="w-full pl-14 pr-8 py-4 bg-white/2 border border-white/5 rounded-sm text-gray-200 placeholder-gray-600 focus:border-leagle-accent transition-all outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/5 border border-white/5">
                {filtered.map((reg) => (
                    <div
                        key={reg.id}
                        onClick={() => setSelectedReg(reg)}
                        className="bg-[#050505] p-10 group hover:bg-white/[0.02] transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between h-full border-transparent hover:border-leagle-accent/20 ring-1 ring-white/5 hover:ring-leagle-accent/10"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-leagle-accent/10 to-transparent flex items-center justify-center translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform">
                            <ArrowUpRight className="text-leagle-accent opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                        </div>

                        <div className="space-y-7">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.3em] shadow-sm ${reg.jurisdiction === 'UK' || reg.jurisdiction === 'GB'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-leagle-accent/10 text-leagle-accent border border-leagle-accent/20'
                                    }`}>
                                    {reg.jurisdiction || 'Global'}
                                </span>
                                <span className="px-2.5 py-1 bg-white/2 border border-white/5 text-gray-500 rounded-sm text-[9px] font-black uppercase tracking-[0.3em]">
                                    {reg.category || 'General'}
                                </span>
                            </div>

                            <h3 className="text-2xl font-serif text-white group-hover:text-leagle-accent transition-colors leading-tight italic">
                                {reg.title}
                            </h3>

                            <p className="text-sm text-gray-500 font-medium line-clamp-2 italic leading-relaxed">
                                {reg.raw_text?.slice(0, 200)}...
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-white/5 mt-10">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                    <Tag size={12} className="text-leagle-accent/40" />
                                    {reg.id.slice(0, 8)}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                    <Clock size={12} className="text-leagle-accent/40" />
                                    {new Date(reg.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-leagle-accent font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                Evaluate Neuron <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedReg && (
                <RegulationDetail
                    regulation={selectedReg}
                    onClose={() => setSelectedReg(null)}
                />
            )}

            {filtered.length === 0 && (
                <div className="glass-card py-40 text-center space-y-6 bg-white/2 border-white/5">
                    <Search size={54} className="mx-auto text-leagle-accent/20 animate-pulse" />
                    <div className="space-y-2">
                        <p className="text-2xl font-black text-white italic">Zero Matches in Sector</p>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto text-sm italic leading-relaxed">The selected jurisdiction currently has no active parallels synced. Adjust global overview or trigger a deep-sector sync.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function RegulationList() {
    return (
        <Suspense fallback={<div>Loading Library...</div>}>
            <RegulationListContent />
        </Suspense>
    )
}
