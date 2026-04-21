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

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 selection:bg-leagle-accent/30 selection:text-white pb-32">
            <LandingNavbar />

            {/* Content Layout */}
            <div className="max-w-[1400px] mx-auto px-6 pt-32 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">

                {/* STICKY SIDEBAR */}
                <aside className="hidden lg:block space-y-12 h-fit sticky top-32">
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Introduction</h3>
                        <nav className="flex flex-col gap-2">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'architecture', label: 'Architecture' },
                                { id: 'quickstart', label: 'Quickstart' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => navigateToDoc(item.id)}
                                    className={`text-sm font-serif italic text-left transition-all ${activeSection === 'docs' && docSection === item.id ? 'text-white translate-x-2' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Endpoints</h3>
                        <nav className="flex flex-col gap-2">
                            {[
                                { id: 'neural-search', label: 'Neural Search' },
                                { id: 'protocol-keys', label: 'Protocol Keys' },
                                { id: 'compliance-audit', label: 'Compliance Audit' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => navigateToDoc(item.id)}
                                    className={`text-sm font-serif italic text-left transition-all ${activeSection === 'docs' && docSection === item.id ? 'text-white translate-x-2' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-leagle-accent flex items-center gap-2">
                            <Activity size={12} /> Interactive
                        </h3>
                        <nav className="flex flex-col gap-2">
                            <button onClick={() => setActiveSection('console')} className={`text-sm font-serif italic text-left transition-all ${activeSection === 'console' ? 'text-white translate-x-2' : 'text-gray-500 hover:text-white'}`}>Developer Console</button>
                            <button onClick={() => { setActiveSection('docs'); setDocSection('overview'); }} className={`text-sm font-serif italic text-left transition-all ${activeSection === 'docs' ? 'text-white translate-x-2' : 'text-gray-500 hover:text-white'}`}>API Reference</button>
                        </nav>
                    </section>
                </aside>

                {/* MAIN CONTENT AREA */}
                <article className="space-y-32">

                    {activeSection === 'docs' ? (
                        <div className="space-y-32">
                            {docSection === 'overview' && (
                                <section className="space-y-8 max-w-3xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Globe size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Leagle Intelligence Protocol</span>
                                        </div>
                                        <h1 className="text-6xl font-serif italic text-white leading-[0.9] tracking-tighter">API <span className="text-gradient">Redefined</span></h1>
                                        <p className="text-lg text-gray-400 font-serif italic leading-relaxed">
                                            The Leagle Neural Interface provides programmatic access to our institutional-grade vector storage and regulatory inference engine.
                                        </p>
                                    </header>
                                    <div className="pt-12 border-t border-white/5 space-y-6">
                                        <h2 className="text-2xl font-serif italic text-white">The Mission</h2>
                                        <p className="text-gray-400 font-serif italic leading-relaxed">
                                            Our protocol is designed to bridge the gap between static regulatory frameworks and dynamic, AI-driven compliance operations. By leveraging a high-fidelity Neural Link, enterprises can automate complex regulatory analysis with millisecond latency.
                                        </p>
                                    </div>
                                </section>
                            )}

                            {docSection === 'architecture' && (
                                <section className="space-y-8 max-w-3xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Cpu size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Architecture</span>
                                        </div>
                                        <h1 className="text-5xl font-serif italic text-white leading-tight">Neural <span className="text-gradient">Core</span></h1>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-serif italic text-white">RAG-First Execution</h2>
                                            <p className="text-gray-400 font-serif italic leading-relaxed">
                                                Unlike general-purpose LLMs, the Leagle Neural Engine operates on a strict RAG (Retrieval-Augmented Generation) foundation. Every inference is grounded in the current multi-jurisdictional compliance database.
                                            </p>
                                        </div>
                                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm">
                                            <div className="grid grid-cols-3 gap-8 text-center">
                                                <div className="space-y-2">
                                                    <div className="text-leagle-accent font-black text-xs">INPUT</div>
                                                    <div className="text-[10px] text-gray-500 font-mono italic">Semantic Query</div>
                                                </div>
                                                <div className="space-y-2 border-x border-white/5">
                                                    <div className="text-white font-black text-xs">NEURAL LINK</div>
                                                    <div className="text-[10px] text-gray-500 font-mono italic">Vector Search</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-emerald-400 font-black text-xs">OUTPUT</div>
                                                    <div className="text-[10px] text-gray-500 font-mono italic">Compliance JSON</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'quickstart' && (
                                <section className="space-y-12 max-w-3xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Zap size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Getting Started</span>
                                        </div>
                                        <h1 className="text-5xl font-serif italic text-white leading-tight">Fast <span className="text-gradient">Integration</span></h1>
                                    </header>
                                    <div className="space-y-16 pt-12 border-t border-white/5">
                                        <div className="space-y-6">
                                            <div className="flex gap-6">
                                                <div className="w-8 h-8 rounded-full border border-leagle-accent/30 flex items-center justify-center text-xs font-black text-leagle-accent shrink-0">01</div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-serif italic text-white">Generate Protocol Key</h3>
                                                    <p className="text-gray-400 font-serif italic leading-relaxed">
                                                        Head to the <button onClick={() => setActiveSection('console')} className="text-leagle-accent underline">Developer Console</button> to issue your first institutional credential.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-black text-gray-600 shrink-0">02</div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-serif italic text-white">Configure Your Request</h3>
                                                    <p className="text-gray-400 font-serif italic leading-relaxed">
                                                        Prepare an HTTP GET request to our neural search endpoint using your unique key in the headers.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-black text-gray-600 shrink-0">03</div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-serif italic text-white">Handle Compliance Data</h3>
                                                    <p className="text-gray-400 font-serif italic leading-relaxed">
                                                        Our API returns structured JSON data ready to be consumed by your internal compliance dashboard or automated reporting systems.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'neural-search' && (
                                <section className="space-y-8 max-w-3xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Search size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Neural Search API</span>
                                        </div>
                                        <h1 className="text-5xl font-serif italic text-white leading-tight">Semantic <span className="text-gradient">Retrieval</span></h1>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-serif italic text-white">The Endpoint</h2>
                                            <div className="p-6 bg-black border border-white/5 rounded-sm flex justify-between items-center group">
                                                <code className="text-leagle-accent font-mono text-sm leading-none">GET /api/v1/neural/search</code>
                                                <button onClick={() => handleCopy('https://leagle-xi.vercel.app/api/v1/neural/search')} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Copy size={14} className="text-gray-500 hover:text-white" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-serif italic text-white">Parameters</h2>
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                        <th className="py-4 text-left">Parameter</th>
                                                        <th className="py-4 text-left">Type</th>
                                                        <th className="py-4 text-left">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-sm font-serif italic">
                                                    <tr>
                                                        <td className="py-4 text-white">query</td>
                                                        <td className="py-4 text-indigo-400 font-mono text-[10px]">string</td>
                                                        <td className="py-4 text-gray-500">The semantic query to execute against the neural link.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-4 text-white">limit</td>
                                                        <td className="py-4 text-indigo-400 font-mono text-[10px]">integer</td>
                                                        <td className="py-4 text-gray-500">Max results to return. Default: 5.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'protocol-keys' && (
                                <section className="space-y-8 max-w-3xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Key size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Keys</span>
                                        </div>
                                        <h1 className="text-5xl font-serif italic text-white leading-tight">Key <span className="text-gradient">Management</span></h1>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-serif italic text-white">Authentication Flow</h2>
                                            <p className="text-gray-400 font-serif italic leading-relaxed">
                                                All requests must include the <code className="text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">X-Protocol-Key</code> header. This key identifies your institutional tenancy and grants access to specific regulatory datasets.
                                            </p>
                                            <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-sm">
                                                <code className="text-xs font-mono text-gray-500">headers: &#123; "X-Protocol-Key": "LGL_PROTOCOL_..." &#125;</code>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {docSection === 'compliance-audit' && (
                                <section className="space-y-8 max-w-3xl animate-in fade-in duration-700">
                                    <header className="space-y-4">
                                        <div className="flex items-center gap-2 text-leagle-accent">
                                            <Shield size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Compliance Audit</span>
                                        </div>
                                        <h1 className="text-5xl font-serif italic text-white leading-tight">Audit <span className="text-gradient">Protocol</span></h1>
                                    </header>
                                    <div className="space-y-12 pt-12 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-serif italic text-white">Data Sovereignty</h2>
                                            <p className="text-gray-400 font-serif italic leading-relaxed">
                                                Every neural request is logged within your immutable audit trail. This ensures a transparent chain of custody for all regulatory decisions made via the Leagle platform.
                                            </p>
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
