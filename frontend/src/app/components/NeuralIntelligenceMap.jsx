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
    Wifi,
    ZoomIn,
    ZoomOut,
    X,
    TrendingUp,
    FileText
} from 'lucide-react'
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Line,
    ZoomableGroup
} from "react-simple-maps"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
const globeGeoUrl = "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"

// Dynamic import for Globe.gl
const Globe = dynamic(() => import('react-globe.gl'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[8px] tracking-[0.5em] uppercase">Booting Neural Core...</div>
})

export default function NeuralIntelligenceMap() {
    const globeRef = useRef()
    const [mode, setMode] = useState('3d')
    const [data, setData] = useState({ heatmap: {}, connections: [], summary: {} })
    const [loading, setLoading] = useState(true)
    const [zoom, setZoom] = useState(1)
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [countries, setCountries] = useState({ features: [] })

    useEffect(() => {
        // Load country boundaries for 3D globe
        fetch(globeGeoUrl).then(res => res.json()).then(setCountries)

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
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const globeData = useMemo(() => {
        if (!data.heatmap) return []
        return Object.values(data.heatmap).map(d => ({
            ...d,
            lat: coords[d.id]?.lat || 0,
            lng: coords[d.id]?.lng || 0,
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

    const coords = {
        'US': { lat: 37.0902, lng: -95.7129, iso2: 'US' },
        'GB': { lat: 55.3781, lng: -3.4360, iso2: 'GB' },
        'EU': { lat: 50.8503, lng: 4.3517, iso2: 'EU' },
        'IN': { lat: 20.5937, lng: 78.9629, iso2: 'IN' },
        'AU': { lat: -25.2744, lng: 133.7751, iso2: 'AU' },
        'CA': { lat: 56.1304, lng: -106.3468, iso2: 'CA' }
    }

    const handleCountryClick = (geo) => {
        const iso2 = geo.properties.ISO_A2 || geo.id
        const stats = data.heatmap[iso2] || {
            name: geo.properties.NAME || "Unknown Jurisdiction",
            count: 0,
            avg_risk: 0,
            color: "#333"
        }
        setSelectedCountry({ ...stats, id: iso2 })
    }

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

            {/* MODE TOGGLE */}
            <div className="absolute top-6 right-6 z-40 flex bg-black/60 backdrop-blur-md border border-white/10 p-0.5 shadow-2xl">
                <button
                    onClick={() => setMode('2d')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${mode === '2d' ? 'bg-leagle-accent text-black font-black' : 'text-slate-500 hover:text-white'}`}
                >
                    <MapIcon size={10} /> 2D Flat
                </button>
                <button
                    onClick={() => setMode('3d')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${mode === '3d' ? 'bg-leagle-accent text-black font-black' : 'text-slate-500 hover:text-white'}`}
                >
                    <GlobeIcon size={10} /> 3D Globe
                </button>
            </div>

            {/* Primary Visualizer */}
            <div className="w-full h-full flex items-center justify-center">
                {mode === '3d' ? (
                    <Globe
                        ref={globeRef}
                        backgroundColor="rgba(0,0,0,0)"
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                        polygonsData={countries.features}
                        polygonCapColor={() => 'rgba(255, 255, 255, 0.05)'}
                        polygonSideColor={() => 'rgba(255, 255, 255, 0.02)'}
                        polygonStrokeColor={() => '#333'}
                        polygonLabel={({ properties: d }) => `<b>${d.NAME}</b>`}
                        onPolygonClick={(poly) => handleCountryClick(poly)}

                        pointsData={globeData}
                        pointLat="lat"
                        pointLng="lng"
                        pointColor="color"
                        pointAltitude={0.01}
                        pointRadius={0.8}

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

                        width={1600}
                        height={1000}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center animate-in duration-500 bg-black/5">
                        <ComposableMap projectionConfig={{ scale: 140 }}>
                            <ZoomableGroup zoom={zoom} onMoveEnd={({ zoom }) => setZoom(zoom)} center={[0, 10]}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill="#050505"
                                                stroke="#222"
                                                strokeWidth={0.5}
                                                onClick={() => handleCountryClick(geo)}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { fill: "#111", stroke: "#444", outline: "none", cursor: "pointer" },
                                                    pressed: { fill: "#leagle-accent", outline: "none" },
                                                }}
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
                                        strokeWidth={0.8}
                                        strokeOpacity={0.3}
                                        strokeLinecap="round"
                                        className="neural-arc-2d"
                                    />
                                ))}
                                {globeData.map((d, i) => (
                                    <Marker key={i} coordinates={[d.lng, d.lat]}>
                                        <circle r={2.5} fill={d.color} stroke="#000" strokeWidth={0.5} />
                                        <circle r={6} fill={d.color} opacity={0.1} className="animate-pulse" />
                                    </Marker>
                                ))}
                            </ZoomableGroup>
                        </ComposableMap>
                        <style jsx global>{`
              .neural-arc-2d { stroke-dasharray: 5, 5; animation: arcFlow 30s linear infinite; }
              @keyframes arcFlow { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
            `}</style>
                    </div>
                )}
            </div>

            {/* JURISDICTION MODAL */}
            {selectedCountry && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-in zoom-in duration-300">
                    <div className="bg-black/90 backdrop-blur-3xl border border-white/10 p-8 min-w-[320px] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <button
                            onClick={() => setSelectedCountry(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-12" style={{ backgroundColor: selectedCountry.color }} />
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">{selectedCountry.name}</h2>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Intelligence Node: {selectedCountry.id}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Analyzed Assets</p>
                                    <div className="flex items-center gap-2">
                                        <FileText size={12} className="text-leagle-accent" />
                                        <span className="text-xl font-bold text-white">{selectedCountry.count || 0}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Aggregated Risk</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={12} style={{ color: selectedCountry.color }} />
                                        <span className="text-xl font-bold text-white" style={{ color: selectedCountry.color }}>
                                            {Math.round(selectedCountry.avg_risk || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                    Active semantic cross-referencing for {selectedCountry.name} shows elevated activity in sustainability and financial transparency protocols.
                                </p>
                            </div>

                            <button className="w-full py-3 bg-leagle-accent text-black text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-glow active:scale-95">
                                Drill Down into Node
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPACT HUD: Top Left */}
            <div className="absolute top-6 left-6 z-50 select-none">
                <div className="bg-black/80 backdrop-blur-2xl px-5 py-4 border border-white/10 space-y-3 min-w-[180px]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-0.5 h-4 bg-leagle-accent" />
                        <h2 className="text-[11px] font-black text-white tracking-[0.2em] uppercase italic leading-none">Neural Core</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 font-mono">
                        <div><p className="text-[11px] font-black text-white">{data.summary?.cross_border_parallels || 0}</p></div>
                        <div><p className="text-[11px] font-black text-emerald-500 tracking-tighter uppercase">Live</p></div>
                    </div>
                </div>
            </div>

            {/* ZOOM CONTROLS: Bottom Right */}
            <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2">
                <div className="flex bg-black/60 backdrop-blur-md border border-white/10 p-0.5 mr-2">
                    <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-2 text-slate-500 hover:text-white"><ZoomOut size={12} /></button>
                    <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="p-2 text-slate-500 hover:text-white border-l border-white/5"><ZoomIn size={12} /></button>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-1 flex gap-1">
                    {['US', 'UK', 'EU', 'IN', 'AU'].map(iso => (
                        <button
                            key={iso}
                            onClick={() => {
                                if (mode === '3d' && globeRef.current) {
                                    const target = coords[iso]
                                    globeRef.current.pointOfView({ lat: target.lat, lng: target.lng, altitude: 1.8 }, 1500)
                                }
                            }}
                            className="px-3 py-1 text-[8px] font-black text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            {iso}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    )
}
