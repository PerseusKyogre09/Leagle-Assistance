'use client'

import React from 'react'
import DualModeHeatmap from '../../components/DualModeHeatmap'
import { ShieldAlert, Globe, ArrowUpRight, Info } from 'lucide-react'

export default function HeatmapPage() {
    return (
        <main className="p-10 overflow-auto">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">

                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-leagle-accent rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                            <h1 className="text-4xl font-bold text-white tracking-tight">Intelligence Heatmap</h1>
                        </div>
                        <p className="text-slate-400 font-medium ml-5">Global risk distribution and regulatory frequency analysis</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                            <ShieldAlert className="text-red-500" size={20} />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Alerts</span>
                                <span className="text-lg font-bold text-white">4 High Priority</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Visualizer */}
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <DualModeHeatmap />
                </section>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Broadest Reach</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The **European Union** continues to dominate global regulatory updates, accounting for 42% of all tracked compliance events in the last 30 days.
                        </p>
                        <button className="flex items-center gap-2 text-xs font-bold text-leagle-accent uppercase tracking-widest hover:gap-3 transition-all">
                            View EU Records <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Highest Severity</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            **India's** recent Digital Personal Data Protection updates have triggered the highest risk scores among all new legislative instruments.
                        </p>
                        <button className="flex items-center gap-2 text-xs font-bold text-leagle-accent uppercase tracking-widest hover:gap-3 transition-all">
                            Analyze Risk <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4 border-dashed">
                        <div className="flex flex-col gap-2">
                            <Info className="text-slate-500" size={20} />
                            <h3 className="text-lg font-bold text-slate-500">Mapping Protocol</h3>
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                Data is aggregated in real-time from official legislative journals. Values represent a composite score of operational disruption and legal liability.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
