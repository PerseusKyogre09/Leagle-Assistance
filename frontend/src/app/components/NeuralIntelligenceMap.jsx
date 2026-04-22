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
    Crosshair,
    Wifi
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
    loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[8px] tracking-[0.5em] uppercase">Booting Neural Core...</div>
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
        const interval = setInterval(fetchData, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const globeData = useMemo(() => {
        if (!data.heatmap) return []
        return Object.values(data.heatmap).map(d => ({
            ...d,
            lat: coords[d.id]?.lat || 0,
            lng: coords[d.id]?.lng || 0,
            size: 0.8,
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
                <Activity className="animate-pulse text-leagle-accent" size={24} />
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">Synchronizing Global Parallels</p>
            </div>
        </div>
    )

    return (
        <div className="relative w-full h-full min-h-[800px] bg-leagle-bg overflow-hidden transition-all duration-700">

            {/* 2D/3D Mode Toggle - Repositioned for less obstruction */}
            <div className="absolute top-6 right-6 z-40 flex bg-black/60 backdrop-blur-md border border-white/10 p-0.5">
                <button
                    onClick={() => setMode('2d')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${mode === '2d' ? 'bg-leagle-accent text-black' : 'text-slate-500 hover:text-white'}`}
                >
                    <MapIcon size={10} /> 2D
                </button>
                <button
                    onClick={() => setMode('3d')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${mode === '3d' ? 'bg-leagle-accent text-black' : 'text-slate-500 hover:text-white'}`}
                >
                    <GlobeIcon size={10} /> 3D
                </button>
            </div>

            {/* Primary Visualizer Container */}
            <div className="w-full h-full flex items-center justify-center">
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
                        pointRadius={0.7}

                        arcsData={arcsData}
                        arcStartLat="startLat"
                        arcStartLng="startLng"
                        arcEndLat="endLat"
                        arcEndLng="endLng"
                        arcColor="color"
                        arcDashLength={0.6}
                        arcDashGap={1.5}
                        arcDashAnimateTime={4000}
                        arcStroke={0.5}

                        animateIn={true}
                        width={1600}
                        height={1000}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-20 animate-in zoom-in duration-500 bg-black/10">
                        <ComposableMap projectionConfig={{ scale: 220 }}>
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#0a0a0a"
                                            stroke="#1a1a1a"
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
                                    strokeWidth={1.5}
                                    strokeOpacity={0.6}
                                    strokeLinecap="butt"
                                />
                            ))}
                            {globeData.map((d, i) => (
                                <Marker key={i} coordinates={[d.lng, d.lat]}>
                                    <circle r={3} fill={d.color} stroke="#000" strokeWidth={0.5} />
                                    <circle r={6} fill={d.color} opacity={0.15} className="animate-pulse" />
                                </Marker>
                            ))}
                        </ComposableMap>
                    </div>
                )}
            </div>

            {/* COMPACT HUD: Top Left - Fixed Overlap */}
            <div className="absolute top-6 left-6 z-50 select-none">
                <div className="bg-black/80 backdrop-blur-2xl px-6 py-5 border border-white/10 space-y-4 min-w-[220px]">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-leagle-accent shadow-glow" />
                        <div className="flex flex-col">
                            <h2 className="text-[14px] font-black text-white tracking-widest uppercase italic leading-none">Neural Core</h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Wifi size={8} className="text-emerald-500" />
                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Active Synthesis</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div>
                            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Parallels</p>
                            <p className="text-[14px] font-black text-white">{data.summary?.cross_border_parallels || 0}</p>
                        </div>
                        <div>
                            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Fidelity</p>
                            <p className="text-[14px] font-black text-leagle-accent">99.4%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* STREAM OVERLAY: Bottom Left - More Compact */}
            <div className="absolute bottom-6 left-6 z-30 max-w-[260px] pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-xl p-4 border border-white/5 space-y-3">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Activity size={10} className="text-leagle-accent" />
                        Intelligence Stream
                    </h3>
                    <div className="space-y-2 max-h-[120px] overflow-hidden">
                        {arcsData.slice(0, 4).map((arc, i) => (
                            <div key={i} className="group border-l border-white/10 pl-3 py-0.5 hover:border-leagle-accent transition-all">
                                <p className="text-[9px] text-slate-400 font-medium leading-tight group-hover:text-white transition-colors uppercase tracking-tight">
                                    <span className="text-leagle-accent opacity-50 mr-1">»</span> {arc.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTROL STRIP: Bottom Right - Moved to avoid Bottom Center clutter */}
            <div className="absolute bottom-6 right-6 z-40 bg-black/60 backdrop-blur-md border border-white/10 p-1 flex gap-1">
                {['US', 'UK', 'EU', 'IN', 'AU'].map(iso => (
                    <button
                        key={iso}
                        onClick={() => {
                            if (mode === '3d' && globeRef.current) {
                                const target = coords[iso]
                                globeRef.current.pointOfView({ lat: target.lat, lng: target.lng, altitude: 1.8 }, 1500)
                            }
                        }}
                        className="px-4 py-1.5 text-[9px] font-black text-slate-400 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest"
                    >
                        {iso}
                    </button>
                ))}
            </div>

        </div>
    )
}
