'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { scaleLinear } from 'd3-scale'
import {
    Zap,
    Map as MapIcon,
    Globe as GlobeIcon,
    Activity,
    ShieldCheck,
    AlertCircle,
    Maximize2,
    ChevronRight,
    Crosshair
} from 'lucide-react'
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Line
} from "react-simple-maps"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Dynamic import for Globe.gl
const Globe = dynamic(() => import('react-globe.gl'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px] tracking-[0.5em] uppercase">Booting Neural Core...</div>
})

export default function NeuralIntelligenceMap() {
    const globeRef = useRef()
    const [mode, setMode] = useState('3d') // '2d' or '3d'
    const [data, setData] = useState({ heatmap: {}, connections: [], summary: {} })
    const [loading, setLoading] = useState(true)

    const coords = {
        'US': { lat: 37.0902, lng: -95.7129 },
        'GB': { lat: 55.3781, lng: -3.4360 },
        'EU': { lat: 50.8503, lng: 4.3517 },
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
            size: 0.8, // Fixed subtle size
            radius: 0.5,
            color: d.color
        }))
    }, [data.heatmap])

    const arcsData = useMemo(() => {
        if (!data.connections) return []
        return data.connections.map(conn => ({
            startLat: coords[conn.startId]?.lat || 0,
            startLng: coords[conn.startId]?.lng || 0,
            endLat: coords[conn.endId]?.lat || 0,
            endLng: coords[conn.endId]?.lng || 0,
            color: ['#0ea5e9', '#6366f1', '#22c55e'][Math.floor(Math.random() * 3)],
            name: conn.label
        }))
    }, [data.connections])

    if (loading) return (
        <div className="w-full h-full min-h-[700px] flex items-center justify-center bg-black/40 border border-white/5">
            <div className="flex flex-col items-center gap-4">
                <Activity className="animate-pulse text-leagle-accent" size={32} />
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">Synchronizing Global Parallels</p>
            </div>
        </div>
    )

    return (
        <div className="relative w-full h-[800px] bg-leagle-bg border border-white/5 overflow-hidden transition-all duration-700">

            {/* 2D/3D Mode Toggle */}
            <div className="absolute top-8 right-10 z-40 flex bg-black/40 backdrop-blur-md border border-white/10 p-1">
                <button
                    onClick={() => setMode('2d')}
                    className={`flex items-center gap-2 px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${mode === '2d' ? 'bg-leagle-accent text-black' : 'text-slate-500 hover:text-white'}`}
                >
                    <MapIcon size={12} /> 2D Flat
                </button>
                <button
                    onClick={() => setMode('3d')}
                    className={`flex items-center gap-2 px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${mode === '3d' ? 'bg-leagle-accent text-black' : 'text-slate-500 hover:text-white'}`}
                >
                    <GlobeIcon size={12} /> 3D Globe
                </button>
            </div>

            {/* Primary Visualizer Container */}
            <div className="w-full h-full">
                {mode === '3d' ? (
                    <Globe
                        ref={globeRef}
                        backgroundColor="rgba(0,0,0,0)"
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                        pointsData={globeData}
                        pointLat="lat"
                        pointLng="lng"
                        pointColor="color"
                        pointAltitude={0.01}
                        pointRadius={0.6}

                        arcsData={arcsData}
                        arcStartLat="startLat"
                        arcStartLng="startLng"
                        arcEndLat="endLat"
                        arcEndLng="endLng"
                        arcColor="color"
                        arcDashLength={0.5}
                        arcDashGap={2}
                        arcDashAnimateTime={3000}
                        arcStroke={0.4}

                        width={1200}
                        height={850}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-20 animate-in fade-in duration-500 bg-black/10">
                        <ComposableMap projectionConfig={{ scale: 200 }}>
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#111"
                                            stroke="#333"
                                            strokeWidth={0.5}
                                        />
                                    ))
                                }
                            </Geographies>
                            {arcsData.map((arc, i) => (
                                <Line
                                    key={i}
                                    from={[arc.startLng, arc.startLat]}
                                    to={[arc.endLng, arc.endLat]}
                                    stroke={arc.color}
                                    strokeWidth={1}
                                    strokeLinecap="round"
                                />
                            ))}
                            {globeData.map((d, i) => (
                                <Marker key={i} coordinates={[d.lng, d.lat]}>
                                    <circle r={4} fill={d.color} stroke="#000" strokeWidth={1} />
                                    <circle r={8} fill={d.color} opacity={0.2} className="animate-ping" />
                                </Marker>
                            ))}
                        </ComposableMap>
                    </div>
                )}
            </div>

            {/* Minimalism HUD: Top Left */}
            <div className="absolute top-10 left-10 z-30 select-none pointer-events-none">
                <div className="bg-black/40 backdrop-blur-xl p-8 border border-white/5 space-y-6 min-w-[280px]">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-leagle-accent shadow-glow" />
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tighter uppercase italic leading-none">Neural Core</h2>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Status: Operational</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5 pointer-events-auto">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Parallels</span>
                            <span className="text-lg font-bold text-white">{data.summary?.cross_border_parallels || 0}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sync Integrity</span>
                            <span className="text-lg font-bold text-leagle-accent">99%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stream Overlay: Bottom Left */}
            <div className="absolute bottom-10 left-10 z-30 max-w-[300px] pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-md p-6 border border-white/5 space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
                        <Activity size={10} className="text-emerald-500" />
                        Intelligence Stream
                    </h3>
                    <div className="space-y-3">
                        {arcsData.slice(0, 3).map((arc, i) => (
                            <div key={i} className="group cursor-help border-l border-white/5 pl-4 py-1 hover:border-leagle-accent transition-all">
                                <p className="text-[10px] text-slate-400 font-medium leading-tight group-hover:text-white transition-colors uppercase tracking-tight">
                                    Parallel Detected: <span className="text-leagle-accent italic">{arc.name}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Control Strip: Bottom Center */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-black/40 backdrop-blur-xl border border-white/10 p-2 flex gap-2 overflow-hideen">
                {['US', 'UK', 'EU', 'IN', 'AU'].map(iso => (
                    <button
                        key={iso}
                        onClick={() => {
                            if (mode === '3d' && globeRef.current) {
                                globeRef.current.pointOfView({ lat: coords[iso].lat, lng: coords[iso].lng, altitude: 2 }, 1000)
                            }
                        }}
                        className="px-6 py-2 text-[10px] font-black text-slate-500 hover:text-white border border-white/5 hover:border-leagle-accent hover:bg-leagle-accent hover:text-black transition-all uppercase tracking-widest"
                    >
                        {iso}
                    </button>
                ))}
            </div>

        </div>
    )
}
