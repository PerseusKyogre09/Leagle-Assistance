"use client"

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { getRegulations } from '../api/client'
import { Search, Tag, Clock, ArrowUpRight, ChevronRight, Filter } from 'lucide-react'
import RegulationDetail from './RegulationDetail'

function RegulationListContent() {
    const searchParams = useSearchParams()
    const [regulations, setRegulations] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedReg, setSelectedReg] = useState(null)

    useEffect(() => {
        const jurisdiction = searchParams.get('jurisdiction')
        if (jurisdiction) {
            setSearch(jurisdiction.toUpperCase())
        }
    }, [searchParams])

    useEffect(() => {
        async function fetchRegs() {
            setLoading(true)
            try {
                const jurisdiction = searchParams.get('jurisdiction')
                const params = jurisdiction ? { jurisdiction: jurisdiction.toUpperCase() } : {}
                const { data } = await getRegulations(params)
                setRegulations(data || [])
            } catch (err) {
                console.error('Error fetching regulations', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRegs()
    }, [searchParams])

    const filtered = useMemo(() => {
        if (!search) return regulations

        const term = search.trim()
        const termLower = term.toLowerCase()

        return regulations.filter(r => {
            // Precise matching for 2-letter ISO codes (e.g. "IN" shouldn't match "Influenza")
            const isShortTerm = term.length <= 2

            const jurisdictionMatch = r.jurisdiction?.toLowerCase().includes(termLower)

            let titleMatch = false
            if (isShortTerm) {
                // Use word boundary for short terms to avoid interior substring noise
                const regex = new RegExp(`\\b${term}\\b`, 'i')
                titleMatch = regex.test(r.title || '')
            } else {
                titleMatch = r.title?.toLowerCase().includes(termLower)
            }

            const categoryMatch = r.category?.toLowerCase() === termLower

            return titleMatch || jurisdictionMatch || categoryMatch
        })
    }, [regulations, search])

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-10 h-10 border-4 border-leagle-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Loading target intelligence...</p>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-serif text-white tracking-tight italic">Jurisdictional Library</h2>
                        <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest leading-none">
                            {filtered.length} of {regulations.length} Records in Portfolio
                        </p>
                    </div>
                    {search && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-leagle-accent/10 border border-leagle-accent/20 rounded-sm w-fit animate-in fade-in slide-in-from-left-2 duration-300">
                            <Filter size={10} className="text-leagle-accent" />
                            <span className="text-[9px] font-black text-leagle-accent uppercase tracking-widest">Active Focus: {search}</span>
                            <button onClick={() => setSearch('')} className="ml-2 hover:text-white text-leagle-accent/60 transition-colors">
                                <ArrowUpRight size={10} className="rotate-45" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative w-full lg:w-[450px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-leagle-accent transition-colors" size={20} />
                    <input
                        type="search"
                        placeholder="Search portfolio..."
                        className="w-full pl-14 pr-8 py-5 bg-white/2 border border-white/5 rounded-sm text-gray-200 placeholder-gray-600 focus:border-leagle-accent transition-all outline-none"
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
                        className="bg-leagle-bg p-8 group hover:bg-white/[0.02] transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between h-full border-transparent hover:border-leagle-accent/20"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-leagle-accent/10 to-transparent flex items-center justify-center translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform">
                            <ArrowUpRight className="text-leagle-accent opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${reg.jurisdiction === 'UK' || reg.jurisdiction === 'GB'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-leagle-accent/10 text-leagle-accent border border-leagle-accent/20'
                                    }`}>
                                    {reg.jurisdiction || 'Global'}
                                </span>
                                <span className="px-2.5 py-1 bg-white/2 border border-white/5 text-gray-500 rounded-sm text-[9px] font-black uppercase tracking-[0.2em]">
                                    {reg.category || 'General'}
                                </span>
                            </div>

                            <h3 className="text-xl font-serif text-white group-hover:text-leagle-accent transition-colors leading-tight line-clamp-2 italic">
                                {reg.title}
                            </h3>

                            <p className="text-sm text-gray-500 font-medium line-clamp-2 italic leading-relaxed">
                                {reg.raw_text?.slice(0, 180)}...
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-8">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                    <Tag size={12} className="text-leagle-accent opacity-60" />
                                    {reg.id.slice(0, 8)}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                    <Clock size={12} className="text-leagle-accent opacity-60" />
                                    {new Date(reg.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-leagle-accent font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                View Details <ChevronRight size={14} />
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
                <div className="glass-card py-32 text-center space-y-4 bg-white/2 border-white/5">
                    <Search size={44} className="mx-auto text-leagle-accent/40" />
                    <div className="space-y-1">
                        <p className="text-xl font-black text-white">No Matching Records</p>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm italic">Adjust focus or initiate manual neural sync.</p>
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
