'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { scaleLinear } from 'd3-scale'
import {
    Zap,
    Globe as GlobeIcon,
    Activity,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    Layers,
    ChevronRight
} from 'lucide-react'

// Dynamic import for Globe.gl
const Globe = dynamic(() => import('react-globe.gl'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse font-mono tracking-tighter">BOOTING NEURAL INTERFACE...</div>
})

export default function NeuralIntelligenceMap() {
    const globeRef = useRef()
    const [data, setData] = useState({ heatmap: {}, connections: [], summary: {} })
    const [loading, setLoading] = useState(true)
    const [hoveredArc, setHoveredArc] = useState(null)

    // Coordinates for major jurisdictions
    const coords = {
        'US': { lat: 37.0902, lng: -95.7129 },
        'GB': { lat: 55.3781, lng: -3.4360 },
        'EU': { lat: 50.8503, lng: 4.3517 }, // Brussels center
        'IN': { lat: 20.5937, lng: 78.9629 },
        'AU': { lat: -25.2744, lng: 133.7751 },
        'CA': { lat: 56.1304, lng: -106.3468 }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const resp = await fetch(`${API_BASE_URL}/api/analytics/risk-heatmap`)
                const result = await resp.json()
                setData(result)
            } catch (err) {
                console.error("Neural Map Sync Failed:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const globeData = useMemo(() => {
        if (!data.heatmap) return []
        return Object.values(data.heatmap).map(d => ({
            ...d,
            lat: coords[d.id]?.lat || 0,
            lng: coords[d.id]?.lng || 0,
            size: 0.1 + (d.intensity * 0.4),
            color: d.color,
            label: d.label
        }))
    }, [data.heatmap])

    const arcsData = useMemo(() => {
        if (!data.connections) return []
        return data.connections.map(conn => ({
            startLat: coords[conn.startId]?.lat || 0,
            startLng: coords[conn.startId]?.lng || 0,
            endLat: coords[conn.endId]?.lat || 0,
            endLng: coords[conn.endId]?.lng || 0,
            color: ['#38bdf8', '#818cf8', '#22c55e'][Math.floor(Math.random() * 3)],
            name: conn.label
        }))
    }, [data.connections])

    if (loading) {
        return (
            <div className="w-full h-full min-h-[700px] flex items-center justify-center bg-black/20 rounded-[40px] border border-white/5">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-t-2 border-leagle-accent rounded-full animate-spin" />
                        <div className="absolute inset-0 w-16 h-16 border-b-2 border-indigo-500 rounded-full animate-spin [animation-duration:1.5s]" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Syncing Neural Core</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[800px] bg-black/40 rounded-[40px] border border-white/5 overflow-hidden group">
            {/* Background stars effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.05)_0%,transparent_100%)]" />

            {/* Main HUD: Top Left */}
            <div className="absolute top-10 left-10 z-20 space-y-6">
                <div className="bg-black/40 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-4 max-w-[300px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-leagle-accent/10 border border-leagle-accent/20 flex items-center justify-center text-leagle-accent">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">Neural Pulse</h2>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Global Synthesis Active</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Connections</span>
                            <p className="text-lg font-bold text-white leading-none">{data.summary?.cross_border_parallels || 0}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Volatility</span>
                            <p className="text-lg font-bold text-amber-500 leading-none">High</p>
                        </div>
                    </div>
                </div>

                {/* Live Ticker */}
                <div className="bg-black/20 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 w-[300px] space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                        <Activity size={12} className="text-leagle-accent" />
                        Intelligence Stream
                    </h3>
                    <div className="space-y-4 max-h-[200px] overflow-hideen relative">
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none" />
                        <div className="space-y-3 animate-slide-up">
                            {arcsData.slice(0, 5).map((arc, i) => (
                                <div key={i} className="flex gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors cursor-default group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-leagle-accent mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed"> Parallel Directive Found: <span className="text-white italic">{arc.name}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main HUD: Bottom Right */}
            <div className="absolute bottom-10 right-10 z-20">
                <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-huge flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Institutional Insight</span>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border border-green-500/20 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-green-500/40 border-t-transparent animate-spin [animation-duration:4s]" />
                                    <ShieldCheck className="text-green-500" size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-white italic font-serif tracking-tight">Stable</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Compliance Health</span>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border border-red-500/20 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin [animation-duration:2s]" />
                                    <AlertCircle className="text-red-500" size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-white italic font-serif tracking-tight">Active</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Risk Signal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="bg-leagle-accent p-6 rounded-[2rem] text-black hover:scale-105 active:scale-95 transition-all shadow-glow hover:bg-white">
                        <ChevronRight size={32} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Interactive Globe */}
            <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Globe
                    ref={globeRef}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                    pointsData={globeData}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude="intensity"
                    pointRadius={1}
                    pointsMerge={true}

                    arcsData={arcsData}
                    arcStartLat="startLat"
                    arcStartLng="startLng"
                    arcEndLat="endLat"
                    arcEndLng="endLng"
                    arcColor="color"
                    arcDashLength={0.4}
                    arcDashGap={1}
                    arcDashAnimateTime={2000}
                    arcStroke={0.5}

                    hexBinPointsData={globeData}
                    hexBinPointWeight="count"
                    hexAltitude={d => d.sumWeight * 0.1 + 0.01}
                    hexBinResolution={4}
                    hexTopColor={d => "#38bdf8"}
                    hexSideColor={d => "rgba(56, 189, 248, 0.4)"}
                    hexBinMerge={true}

                    width={1200}
                    height={800}
                />
            </div>

            {/* Floating HUD Bottom Left */}
            <div className="absolute bottom-10 left-10 z-20 flex gap-4">
                {['US', 'UK', 'EU', 'IN', 'AU'].map(iso => (
                    <button key={iso} className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-400 hover:text-leagle-accent hover:border-leagle-accent/40 transition-all hover:-translate-y-2">
                        {iso}
                    </button>
                ))}
            </div>
        </div>
    )
}
