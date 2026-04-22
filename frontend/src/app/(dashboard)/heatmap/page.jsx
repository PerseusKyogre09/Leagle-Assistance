'use client'

import React from 'react'
import NeuralIntelligenceMap from '../../components/NeuralIntelligenceMap'
import { ShieldAlert, Globe, Activity, Info, Maximize2, Layers, AlertTriangle } from 'lucide-react'

export default function HeatmapPage() {
    return (
        <div className="relative h-[calc(100vh-100px)] overflow-hidden animate-in fade-in duration-700 bg-leagle-bg">

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

            {/* Institutional Header */}
            <div className="absolute top-8 left-10 z-30 space-y-1">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-white shadow-glow" />
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Global Intelligence Hub</h1>
                </div>
                <div className="flex items-center gap-4 ml-6 uppercase tracking-[0.4em] font-black text-[9px]">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 shadow-glow animate-pulse" />
                        <span className="text-emerald-500">Neural Sync: Active</span>
                    </div>
                    <div className="w-px h-2 bg-white/20" />
                    <span className="text-slate-500">Directorate: Global Oversight</span>
                </div>
            </div>

            {/* Main Map Visualizer */}
            <div className="w-full h-full">
                <NeuralIntelligenceMap />
            </div>

            {/* Side HUD: Metric Overlays (Right) */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 z-30 space-y-6 hidden xl:block">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-10 min-w-[340px] shadow-heavy">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex justify-between items-center">
                        Regional Volatility
                        <Maximize2 size={12} className="text-slate-700" />
                    </h3>

                    <div className="space-y-8">
                        <RegionStripe label="European Union" risk="Critical" perc={82} color="#f87171" />
                        <RegionStripe label="United States" risk="Elevated" perc={54} color="#fbbf24" />
                        <RegionStripe label="Asia Pacific" risk="Stable" perc={31} color="#34d399" />
                        <RegionStripe label="United Kingdom" risk="Moderate" perc={47} color="#fbbf24" />
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20">
                            <AlertTriangle className="text-red-500" size={16} />
                            <div>
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">Critical Parallel</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">GDPR v2 Drift Detected in AU</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Intel Bar */}
            <div className="absolute bottom-6 left-10 z-30 flex items-center gap-8 bg-black/40 backdrop-blur-md border border-white/5 px-8 py-3 translate-y-[-2px]">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-leagle-accent/20 bg-leagle-accent/5 text-leagle-accent">
                        <ShieldCheck size={14} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Compliance Integrity: <span className="text-white">Optimal</span></p>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <p className="text-[9px] font-bold text-slate-500 italic uppercase tracking-[0.2em]">
                    Institutional-grade semantic synthesis active across all monitored legislative channels.
                </p>
            </div>
        </div>
    )
}

function RegionStripe({ label, risk, perc, color }) {
    return (
        <div className="space-y-3 group">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="group-hover:text-white transition-colors">{label}</span>
                <span style={{ color }} className="text-[8px] italic">{risk}</span>
            </div>
            <div className="w-full h-0.5 bg-white/5">
                <div
                    className="h-full transition-all duration-[2000ms] ease-in-out shadow-glow"
                    style={{ width: `${perc}%`, backgroundColor: color }}
                />
            </div>
        </div>
    )
}

function ShieldCheck({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
