'use client';

import LandingNavbar from '../components/LandingNavbar';
import { Show, SignInButton } from '@clerk/nextjs';
import { Terminal, BookOpen, Key, Link as LinkIcon, Shield, Zap, Check, Plus, Copy, RefreshCw, Search, ArrowRight, Play, Trash2, Lock, Code, Cpu, Activity, Globe, Database } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = '/api/v1/neural';
const PUBLIC_API_BASE = 'https://leagle-xi.vercel.app/api/v1/neural';

export default function APIPage() {
    const [keys, setKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('LGL_PROTOCOL_DEFAULT_SANDBOX');
    const [query, setQuery] = useState('UK financial compliance 2026');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingKeys, setIsFetchingKeys] = useState(true);
    const [copied, setCopied] = useState(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [manualKey, setManualKey] = useState('');
    const [useManualKey, setUseManualKey] = useState(false);
    const [activeSection, setActiveSection] = useState('docs');
    const [docSection, setDocSection] = useState('overview');

    useEffect(() => {
        fetchKeys();
    }, []);

    const navigateToDoc = (section) => {
        setActiveSection('docs');
        setDocSection(section);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchKeys = async () => {
        setIsFetchingKeys(true);
        try {
            const response = await axios.get(`${API_BASE}/keys`);
            setKeys(response.data);
        } catch (error) {
            console.error('Failed to fetch keys:', error);
        } finally {
            setIsFetchingKeys(false);
        }
    };

    const handleGenerateKey = async () => {
        if (!newKeyName) return;
        try {
            const response = await axios.post(`${API_BASE}/keys`, { name: newKeyName });
            setKeys([response.data, ...keys]);
            setNewKeyName('');
            setShowKeyModal(false);
        } catch (error) {
            console.error('Failed to generate key:', error);
        }
    };

    const handleDeleteKey = async (id) => {
        try {
            await axios.delete(`${API_BASE}/keys/${id}`);
            setKeys(keys.filter(k => k.id !== id));
            if (activeKey === keys.find(k => k.id === id)?.key) {
                setUseManualKey(false);
                setSelectedKey('LGL_PROTOCOL_DEFAULT_SANDBOX');
            }
        } catch (error) {
            console.error('Failed to delete key:', error);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const activeKey = useManualKey ? manualKey : selectedKey;

    const runNeuralTest = async () => {
        if (!activeKey) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/search?query=${encodeURIComponent(query)}&limit=3`, {
                headers: { 'X-Protocol-Key': activeKey }
            });
            setResults(response.data);
        } catch (error) {
            setResults(error.response?.data || { error: 'Neutral Link Failure' });
        } finally {
            setIsLoading(false);
        }
    };

    const getSnippets = () => {
        const keyToUse = activeKey || 'YOUR_PROTOCOL_KEY';
        const searchUrl = `${PUBLIC_API_BASE}/search?query=${encodeURIComponent(query)}`;
        return {
            curl: `curl -H "X-Protocol-Key: ${keyToUse}" "${searchUrl}"`,
            python: `import requests\n\nurl = "${searchUrl}"\nheaders = {"X-Protocol-Key": "${keyToUse}"}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`,
            javascript: `const response = await fetch("${searchUrl}", {\n  headers: { "X-Protocol-Key": "${keyToUse}" }\n});\nconst data = await response.json();\nconsole.log(data);`
        };
    };

    const categories = [
        {
            title: 'Introduction',
            items: [
                { id: 'overview', label: 'Overview' },
                { id: 'architecture', label: 'Architecture' },
                { id: 'concepts', label: 'Core Concepts' }
            ]
        },
        {
            title: 'Getting Started',
            items: [
                { id: 'quickstart', label: 'Quickstart Tutorial' },
                { id: 'auth-security', label: 'Auth & Security' },
                { id: 'first-search', label: 'Your First Search' }
            ]
        },
        {
            title: 'Advanced Guides',
            items: [
                { id: 'neural-search-deep', label: 'Neural Search Deep-Dive' },
                { id: 'key-lifecycle', label: 'Key Lifecycle' },
                { id: 'compliance-audit', label: 'Compliance Audit' }
            ]
        },
        {
            title: 'Reference',
            items: [
                { id: 'api-reference', label: 'API Reference' },
                { id: 'json-schema', label: 'JSON Schema' },
                { id: 'error-codes', label: 'Error Codes' },
                { id: 'rate-limits', label: 'Rate Limits' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 selection:bg-leagle-accent/30 selection:text-white pb-32">
            <LandingNavbar />

            {/* Content Layout */}
            <div className="max-w-[1400px] mx-auto px-6 pt-32 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-16">

                {/* STICKY SIDEBAR - High Density */}
                <aside className="hidden lg:block space-y-10 h-fit sticky top-32 overflow-y-auto max-h-[calc(100vh-160px)] pr-4 scrollbar-hide">
                    {categories.map((cat, idx) => (
                        <section key={idx} className="space-y-4">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 border-b border-white/5 pb-2">{cat.title}</h3>
                            <nav className="flex flex-col gap-1">
                                {cat.items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => navigateToDoc(item.id)}
                                        className={`text-sm font-serif italic text-left py-2 px-3 rounded-sm transition-all duration-300 border-l-2 ${activeSection === 'docs' && docSection === item.id ? 'text-white border-leagle-accent bg-white/[0.03] translate-x-1' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/[0.01]'}`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                            {cat.title === 'Reference' && (
                                <div className="pt-8 mt-8 border-t border-white/5">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-leagle-accent flex items-center gap-2 mb-4">
                                        <Activity size={12} /> Interactive
                                    </h3>
                                    <nav className="flex flex-col gap-1">
                                        <button onClick={() => setActiveSection('console')} className={`text-sm font-serif italic text-left py-2 px-3 border-l-2 transition-all ${activeSection === 'console' ? 'text-white border-leagle-accent bg-leagle-accent/5 translate-x-1' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/[0.01]'}`}>Developer Console</button>
                                        <button onClick={() => { setActiveSection('docs'); setDocSection('overview'); }} className={`text-sm font-serif italic text-left py-2 px-3 border-l-2 transition-all ${activeSection === 'docs' ? 'text-white border-leagle-accent bg-white/[0.03] translate-x-1' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/[0.01]'}`}>API Reference</button>
                                    </nav>
                                </div>
                            )}
                        </section>
                    ))}
                </aside>

                {/* MAIN CONTENT AREA */}
                <article className="space-y-32">

                    {activeSection === 'docs' ? (
                        <div className="space-y-40 pb-40">
                            {/* INTRODUCTION CATEGORY */}
                            {docSection === 'overview' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-6">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Globe size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol v4.2.0</span>
                                        </div>
                                        <h1 className="text-7xl font-serif italic text-white leading-[0.85] tracking-tighter">The Neural <span className="text-gradient">Interface</span></h1>
                                        <p className="text-xl text-gray-400 font-serif italic leading-relaxed max-w-2xl">
                                            A high-fidelity, institutional-grade protocol for programmatic regulatory inference and dynamic compliance automation.
                                        </p>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-serif italic text-white">Mission Statement</h3>
                                            <p className="text-gray-500 font-serif italic leading-relaxed text-sm">
                                                Leagle bridges the gap between static legal frameworks and active AI operations. Our protocol ensures that every automated decision is grounded in verifiable, multi-jurisdictional compliance data.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-serif italic text-white">Institutional Grade</h3>
                                            <p className="text-gray-500 font-serif italic leading-relaxed text-sm">
                                                Built for scale, security, and precision. We provide isolated vector environments and immutable audit trails for every inference request.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'architecture' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Cpu size={14} /> System Design
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Neural Core</h2>
                                    </header>
                                    <div className="space-y-16 pt-12 border-t border-white/5">
                                        <div className="space-y-6">
                                            <p className="text-gray-400 font-serif italic leading-relaxed">
                                                The Leagle architecture is centered around a multi-layered Neural Link that prioritizes citation accuracy over generative creativity.
                                            </p>
                                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-sm">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                                    <div className="text-center space-y-2">
                                                        <div className="text-leagle-accent text-xs font-black">REGULATORY FEED</div>
                                                        <div className="text-[10px] text-gray-600 font-mono">Real-time Updates</div>
                                                    </div>
                                                    <ArrowRight className="text-white/10 hidden md:block" />
                                                    <div className="text-center space-y-2 px-8 py-4 border border-leagle-accent/20 bg-leagle-accent/5 rounded-sm">
                                                        <div className="text-white text-xs font-black">VECTOR SYNC</div>
                                                        <div className="text-[10px] text-gray-400 font-mono italic whitespace-nowrap">Qdrant Neural Engine</div>
                                                    </div>
                                                    <ArrowRight className="text-white/10 hidden md:block" />
                                                    <div className="text-center space-y-2">
                                                        <div className="text-emerald-400 text-xs font-black">NEURAL API</div>
                                                        <div className="text-[10px] text-gray-600 font-mono">JSON Out</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-serif italic text-white">RAG Strategy</h3>
                                            <p className="text-gray-500 font-serif italic text-sm leading-relaxed">
                                                Every search request triggers a semantic retrieval from the active compliance vector space. The results are filtered through an institutional context mask before being presented to the API surface.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'concepts' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <BookOpen size={14} /> Fundamental
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Core Concepts</h2>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                                        {[
                                            { t: 'Neural Link', d: 'The bidirectional connection between your institutional tenant and our compliance vector engines.' },
                                            { t: 'Protocol Key', d: 'The unique institutional credential required to access specialized regulatory datasets.' },
                                            { t: 'Active Vector', d: 'The live-updated regulatory embedding that represents a specific jurisdiction or legal topic.' },
                                            { t: 'Audit Trail', d: 'An immutable log of every API interaction, ensuring full data sovereignty and accountability.' }
                                        ].map((c, i) => (
                                            <div key={i} className="p-8 bg-white/[0.01] border border-white/5 rounded-sm space-y-3">
                                                <h4 className="text-white font-serif italic font-bold">{c.t}</h4>
                                                <p className="text-gray-500 text-sm font-serif italic leading-relaxed">{c.d}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* GETTING STARTED CATEGORY */}
                            {docSection === 'quickstart' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Zap size={14} /> Get Up & Running
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white leading-tight">Quickstart <span className="text-gradient">Tutorial</span></h2>
                                    </header>
                                    <div className="space-y-20 pt-12 border-t border-white/5">
                                        <div className="flex gap-10">
                                            <div className="w-12 h-12 rounded-full border border-leagle-accent/30 flex items-center justify-center text-xs font-black text-leagle-accent shrink-0 mt-2">01</div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-serif italic text-white">Issue Your Institutional Key</h3>
                                                    <p className="text-gray-500 font-serif italic leading-relaxed">
                                                        Access the <button onClick={() => setActiveSection('console')} className="text-leagle-accent underline">Developer Console</button> and generate a new Protocol Key. This key is tied to your tenant and must be kept secure.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-10">
                                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xs font-black text-gray-500 shrink-0 mt-2">02</div>
                                            <div className="space-y-6 w-full">
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-serif italic text-white">Initialize Your First Link</h3>
                                                    <p className="text-gray-500 font-serif italic leading-relaxed">
                                                        Execute a semantic search against our UK Financial Compliance 2026 dataset using the following template.
                                                    </p>
                                                </div>
                                                <div className="p-6 bg-black border border-white/5 rounded-sm relative group">
                                                    <code className="text-xs font-mono text-indigo-400 whitespace-pre">
                                                        curl -H "X-Protocol-Key: YOUR_KEY" \<br />
                                                        "https://leagle-xi.vercel.app/api/v1/neural/search?query=2026%20compliance"
                                                    </code>
                                                    <button onClick={() => handleCopy('curl -H "X-Protocol-Key: YOUR_KEY" "https://leagle-xi.vercel.app/api/v1/neural/search?query=2026%20compliance"')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Copy size={14} className="text-gray-600 hover:text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-10">
                                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xs font-black text-gray-500 shrink-0 mt-2">03</div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-serif italic text-white">Parse Neural Data</h3>
                                                    <p className="text-gray-500 font-serif italic leading-relaxed">
                                                        Process the structured JSON response in your application. Each search result includes semantic scores and source metadata.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'auth-security' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Lock size={14} /> Protection
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Auth & Security</h2>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-serif italic text-white">Header Authentication</h3>
                                            <p className="text-gray-400 font-serif italic leading-relaxed">
                                                All requests to the Neural Interface MUST include the <code className="text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-400/10">X-Protocol-Key</code> header. We do not support Bearer tokens at this layer to maintain stateless institutional isolation.
                                            </p>
                                        </div>
                                        <div className="p-8 bg-amber-500/[0.03] border border-amber-500/20 rounded-sm flex gap-6">
                                            <Shield size={24} className="text-amber-500 shrink-0" />
                                            <div className="space-y-2">
                                                <h5 className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Security Advisory</h5>
                                                <p className="text-gray-500 text-xs font-serif italic leading-relaxed">
                                                    NEVER hardcode Protocol Keys in frontend applications. Use environment variables and server-side proxies to protect your credentials.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'first-search' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Search size={14} /> Validation
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Your First Search</h2>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <p className="text-gray-400 font-serif italic leading-relaxed">
                                            Let's run a test query to verify your Neural Link connectivity. Use the sample below to retrieve the latest regulatory updates.
                                        </p>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center px-4 py-2 bg-white/[0.02] border-x border-t border-white/5 rounded-t-sm">
                                                <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Template: Search Req</span>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 blink-slow" />
                                            </div>
                                            <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-b-sm">
                                                <pre className="text-xs font-mono text-indigo-400 leading-relaxed">
                                                    {`GET /api/v1/neural/search?query=FinReg%202026&limit=1 HTTP/1.1\nHost: leagle-xi.vercel.app\nX-Protocol-Key: LGL_PROTOCOL_SANDBOX`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ADVANCED GUIDES CATEGORY */}
                            {docSection === 'neural-search-deep' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Activity size={14} /> High Precision
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white leading-tight">Neural <span className="text-gradient">Deep-Dive</span></h2>
                                    </header>
                                    <div className="space-y-16 pt-12 border-t border-white/5">
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-serif italic text-white text-gradient">Understanding Relevance Scores</h3>
                                            <p className="text-gray-500 font-serif italic leading-relaxed">
                                                Matches returned by the Neural Engine include a precision score from 0.0 to 1.0. A score of 0.8+ indicates high semantic correspondence.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">0.85 - 1.0</div>
                                                <div className="text-sm font-serif italic font-medium text-white">Direct Compliance Match</div>
                                                <p className="text-gray-600 text-xs font-serif italic leading-relaxed">Explicit reference to the queried regulation or framework.</p>
                                            </div>
                                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">0.60 - 0.84</div>
                                                <div className="text-sm font-serif italic font-medium text-white">Contextual Association</div>
                                                <p className="text-gray-600 text-xs font-serif italic leading-relaxed">Relates to the core concept but requires expert review.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'key-lifecycle' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <RefreshCw size={14} /> Maintenance
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Key Lifecycle</h2>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-serif italic text-white italic">Automatic Expiry</h3>
                                            <p className="text-gray-400 font-serif italic leading-relaxed font-serif">
                                                Institutional keys are valid for 90 days. We recommend implementing a 7-day rotation window to ensure zero downtime during credential updates.
                                            </p>
                                        </div>
                                        <div className="p-6 bg-blue-500/[0.03] border border-blue-500/20 rounded-sm">
                                            <p className="text-gray-500 text-xs font-serif italic font-bold">PRO TIP: Use our Key API to automate rotations via internal cron jobs.</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'compliance-audit' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Shield size={14} /> Sovereignty
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white leading-tight">Compliance Audit</h2>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <p className="text-gray-400 font-serif italic leading-relaxed">
                                            Leagle ensures full observability into your AI-driven decision tree. Every request is immutably logged for audit purposes.
                                        </p>
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-serif italic text-white">Recorded Signal Metadata</h3>
                                            <ul className="space-y-3">
                                                {['Timestamp (ISO 8601)', 'Tenant Signature', 'Vector Workspace Scope', 'Inference latency', 'Semantic Relevance Hash'].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-serif italic">
                                                        <Check size={14} className="text-emerald-500" /> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* REFERENCE CATEGORY */}
                            {docSection === 'api-reference' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <LinkIcon size={14} /> Endpoints
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">API Reference</h2>
                                    </header>
                                    <div className="space-y-16 pt-12 border-t border-white/5">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4 group">
                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-sm">GET</span>
                                                <code className="text-lg font-mono text-white group-hover:text-leagle-accent transition-colors">/api/v1/neural/search</code>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Query Parameters</h4>
                                                <table className="w-full text-sm font-serif italic">
                                                    <thead className="border-b border-white/5">
                                                        <tr className="text-[10px] text-gray-600 uppercase font-black tracking-widest">
                                                            <th className="py-4 text-left">Key</th>
                                                            <th className="py-4 text-left">Description</th>
                                                            <th className="py-4 text-left">Rules</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        <tr><td className="py-4 text-white">query</td><td className="py-4 text-gray-500">Semantic search query string.</td><td className="py-4 text-indigo-400">Required</td></tr>
                                                        <tr><td className="py-4 text-white">limit</td><td className="py-4 text-gray-500">Number of results to skip.</td><td className="py-4 text-gray-600">Max 50</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'json-schema' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Database size={14} /> Data Model
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white leading-tight">JSON Schema</h2>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-sm">
                                            <pre className="text-xs font-mono text-indigo-400 leading-relaxed overflow-x-auto">
                                                {`{
  "protocol": "NEURAL_V4",
  "results": [
    {
      "id": "uuid",
      "content": "Regulatory snippet...",
      "score": 0.982,
      "metadata": {
        "source": "UK_FIN_2026",
        "chapter": "Compliance 12"
      }
    }
  ],
  "latency": "142ms",
  "audit_trail_id": "aud_123..."
}`}
                                            </pre>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'error-codes' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Shield size={14} /> Fault Tolerance
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Error Codes</h2>
                                    </header>
                                    <div className="space-y-8 pt-12 border-t border-white/5 italic">
                                        {[
                                            { c: '401', m: 'UNAUTHORIZED_LINK', d: 'Protocol Key is missing or invalid.' },
                                            { c: '403', m: 'INSTITUTIONAL_BLOCK', d: 'Endpoint restricted for current tenant scope.' },
                                            { c: '429', m: 'THROTTLING_ACTIVE', d: 'Resource threshold exceeded.' },
                                            { c: '503', m: 'NEURAL_LINK_FAILURE', d: 'Upstream vector engine unavailable.' }
                                        ].map((err, i) => (
                                            <div key={i} className="flex gap-8 group">
                                                <div className="w-16 font-mono text-red-500 font-bold group-hover:scale-110 transition-transform">{err.c}</div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="text-white text-sm font-black tracking-widest uppercase">{err.m}</div>
                                                    <p className="text-gray-500 text-xs font-serif leading-relaxed">{err.d}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {docSection === 'rate-limits' && (
                                <section className="space-y-12 max-w-4xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent text-[10px] font-black uppercase tracking-widest">
                                            <Zap size={14} /> Resource Quotas
                                        </div>
                                        <h2 className="text-5xl font-serif italic text-white">Rate Limits</h2>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5 flex flex-col font-serif italic">
                                        <p className="text-gray-400 font-serif italic leading-relaxed">
                                            To ensure protocol stability, we implement fair-use quotas based on your institutional tier.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { t: 'Sandbox', l: '100 requests / day', c: 'border-white/5 grayscale' },
                                                { t: 'Institutional', l: '50 req / second', c: 'border-leagle-accent/20 bg-leagle-accent/5' },
                                                { t: 'Enterprise', l: 'Unlimited Linkage', c: 'border-emerald-500/20 bg-emerald-500/5' }
                                            ].map((tier, i) => (
                                                <div key={i} className={`p-8 border rounded-sm space-y-4 ${tier.c}`}>
                                                    <h5 className="text-sm font-black uppercase tracking-widest text-white">{tier.t}</h5>
                                                    <div className="text-[10px] text-gray-500">{tier.l}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        /* INTERACTIVE CONSOLE SECTION */
                        <section className="space-y-24">
                            <Show when="signed-in">
                                <div className="space-y-16">
                                    <header>
                                        <h1 className="text-4xl font-serif italic text-white flex items-center gap-4">
                                            <Cpu className="text-leagle-accent" size={32} />
                                            Protocol <span className="text-gradient">Console</span>
                                        </h1>
                                        <p className="text-gray-500 font-serif italic mt-2">Interactive testing and credential management.</p>
                                    </header>

                                    {/* KEY TABLE - Minimalist */}
                                    <div className="bg-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden">
                                        <div className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Active Credentials</span>
                                            <button onClick={() => setShowKeyModal(true)} className="text-[9px] font-black uppercase tracking-widest text-leagle-accent hover:text-white transition-colors flex items-center gap-2">
                                                <Plus size={12} /> New Protocol
                                            </button>
                                        </div>
                                        <table className="w-full">
                                            <tbody className="divide-y divide-white/5">
                                                <tr className={`group ${selectedKey === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? 'bg-leagle-accent/5' : ''}`}>
                                                    <td className="px-8 py-6">
                                                        <div className="text-sm font-serif italic text-white">Public Sandbox</div>
                                                        <div className="text-[8px] text-gray-600 font-black tracking-widest mt-1">READ-ONLY ACCESS</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right space-x-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setSelectedKey('LGL_PROTOCOL_DEFAULT_SANDBOX')} className={`text-[8px] font-black uppercase tracking-widest ${selectedKey === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? 'text-leagle-accent' : 'text-gray-500 hover:text-white'}`}>
                                                            {selectedKey === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? 'Active' : 'Select'}
                                                        </button>
                                                        <button onClick={() => handleCopy('LGL_PROTOCOL_DEFAULT_SANDBOX')} className="text-gray-500 hover:text-white">
                                                            {copied === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {keys.map(k => (
                                                    <tr key={k.id} className={`group ${selectedKey === k.key ? 'bg-leagle-accent/5' : ''}`}>
                                                        <td className="px-8 py-6">
                                                            <div className="text-sm font-serif italic text-white">{k.name}</div>
                                                            <div className="text-[8px] text-gray-600 font-black tracking-widest mt-1">INSTITUTIONAL</div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right space-x-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => setSelectedKey(k.key)} className={`text-[8px] font-black uppercase tracking-widest ${selectedKey === k.key ? 'text-leagle-accent' : 'text-gray-500 hover:text-white'}`}>
                                                                {selectedKey === k.key ? 'Active' : 'Select'}
                                                            </button>
                                                            <button onClick={() => handleCopy(k.key)} className="text-gray-500 hover:text-white">
                                                                {copied === k.key ? <Check size={14} /> : <Copy size={14} />}
                                                            </button>
                                                            <button onClick={() => handleDeleteKey(k.id)} className="text-gray-500 hover:text-red-400">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* MODAL SIMULATED */}
                                    {showKeyModal && (
                                        <div className="p-8 border border-leagle-accent/30 bg-leagle-accent/5 rounded-sm flex items-center gap-6 animate-in slide-in-from-top-4">
                                            <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Key Identifier..." className="flex-1 bg-black/40 border border-white/10 rounded-sm py-3 px-4 text-sm font-serif italic focus:outline-none focus:border-leagle-accent" />
                                            <button onClick={handleGenerateKey} className="px-8 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-leagle-accent transition-all">Issue Key</button>
                                            <button onClick={() => setShowKeyModal(false)} className="text-[9px] font-black uppercase text-gray-500 hover:text-white">Cancel</button>
                                        </div>
                                    )}

                                    {/* PLAYGROUND - Cleaner */}
                                    <div className="space-y-8">
                                        <div className="relative group max-w-4xl">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-leagle-accent transition-colors" size={20} />
                                            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-[#0a0a0a] border-b border-white/10 py-8 pl-18 pr-40 text-2xl font-serif italic focus:outline-none focus:border-leagle-accent transition-all" placeholder="Neural Search..." />
                                            <button onClick={runNeuralTest} disabled={isLoading} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-leagle-accent hover:text-white transition-colors">
                                                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">Execute</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {Object.entries(getSnippets()).map(([lang, code]) => (
                                                <div key={lang} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-sm space-y-4">
                                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-600">
                                                        <span>{lang} Integration</span>
                                                        <button onClick={() => handleCopy(code)} className="hover:text-white transition-colors">{copied === code ? 'Copied' : 'Copy'}</button>
                                                    </div>
                                                    <pre className="text-[10px] font-mono text-indigo-400 overflow-x-auto whitespace-pre-wrap">{code}</pre>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-black border border-white/5 min-h-[300px] p-10 rounded-sm relative">
                                            <div className="absolute top-4 left-4 flex items-center gap-2 text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                                <Terminal size={10} /> Output Console
                                            </div>
                                            {results ? (
                                                <pre className="text-sm font-mono text-emerald-400/80 leading-relaxed whitespace-pre-wrap">
                                                    {JSON.stringify(results, null, 2)}
                                                </pre>
                                            ) : (
                                                <div className="h-full flex items-center justify-center grayscale opacity-10 py-20">
                                                    <Database size={64} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Show>

                            <Show when="signed-out">
                                <div className="p-20 border border-white/5 bg-white/[0.01] rounded-sm flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto grayscale group hover:grayscale-0 transition-all duration-1000">
                                    <Lock size={48} className="text-leagle-accent" />
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-serif italic text-white tracking-tight">Interactive Console Restricted</h2>
                                        <p className="text-gray-500 font-serif italic leading-relaxed">
                                            Real-time neural playgrounds and credential management are reserved for institutional partners.
                                        </p>
                                    </div>
                                    <SignInButton mode="modal">
                                        <button className="px-10 py-4 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Establish Session</button>
                                    </SignInButton>
                                </div>
                            </Show>
                        </section>
                    )}

                    {/* FOOTER NAV (Only for Docs Mode) */}
                    {activeSection === 'docs' && (
                        <nav className="pt-20 border-t border-white/5 flex justify-between items-center max-w-3xl">
                            <div className="grayscale opacity-30">Previous: Solutions</div>
                            <button onClick={() => setActiveSection('console')} className="group flex items-center gap-4 text-white text-right">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Next Up</div>
                                    <div className="text-xl font-serif italic group-hover:text-leagle-accent transition-colors">Developer Console</div>
                                </div>
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </nav>
                    )}
                </article>
            </div>
        </div>
    );
}
