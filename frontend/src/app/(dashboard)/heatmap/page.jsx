'use client'

import React from 'react'
import NeuralIntelligenceMap from '../../components/NeuralIntelligenceMap'
import { ShieldAlert, Globe, ArrowUpRight, Info, Maximize2, Layers } from 'lucide-react'

export default function HeatmapPage() {
    return (
        <div className="relative h-[calc(100vh-100px)] overflow-hidden animate-in fade-in duration-1000">

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

            {/* Dynamic Header Overlay */}
            <div className="absolute top-6 left-10 z-30 flex items-center gap-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-10 bg-leagle-accent rounded-full border border-leagle-accent/40 shadow-glow" />
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Neural Intelligence Center</h1>
                    </div>
                    <div className="flex items-center gap-2 ml-5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Regional Parallels Sync: <span className="text-emerald-500">Live</span></p>
                    </div>
                </div>

                <div className="h-12 w-px bg-white/10 hidden md:block" />

                <div className="hidden lg:flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Monitored Protocols</span>
                        <span className="text-xl font-bold text-white leading-tight">V3.1.2026</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Intelligence Fidelity</span>
                        <span className="text-xl font-bold text-leagle-accent leading-tight">99.4%</span>
                    </div>
                </div>
            </div>

            {/* Main Command Map */}
            <div className="w-full h-full p-2">
                <NeuralIntelligenceMap />
            </div>

            {/* Side HUD: Regional Breakdown (Floating) */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-6">
                <div className="bg-black/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 w-[320px] transition-all hover:border-leagle-accent/20 group">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Regional Volatility</h3>
                        <Maximize2 size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>

                    <div className="space-y-6">
                        <RegionStripe label="European Union" risk="High" perc={78} color="#ef4444" />
                        <RegionStripe label="United States" risk="Medium" perc={45} color="#f59e0b" />
                        <RegionStripe label="United Kingdom" risk="Low" perc={22} color="#22c55e" />
                        <RegionStripe label="Asia Pacific" risk="Medium" perc={56} color="#f59e0b" />
                    </div>

                    <button className="w-full mt-8 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                        <Layers size={14} />
                        Switch Data Layers
                    </button>
                </div>
            </div>

            {/* Bottom Information Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-black/60 backdrop-blur-2xl px-10 py-4 rounded-full border border-white/5 flex items-center gap-8 shadow-huge">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-leagle-accent shadow-glow" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Global Risk Index: <span className="text-white">Active</span></span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-[9px] font-bold text-slate-500 italic max-w-[400px]">
                        Real-time cross-referencing utilizes high-fidelity semantic parity analysis to detect legislative drift across 142 distinct regulatory categories.
                    </div>
                </div>
            </div>
        </div>
    )
}

function RegionStripe({ label, risk, perc, color }) {
    return (
        <div className="space-y-2 group/stripe">
            <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-white tracking-tight">{label}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60" style={{ color }}>{risk} Risk</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ width: `${perc}%`, backgroundColor: color }}
                />
            </div>
        </div>
    )
}
