import React, { useState, useEffect, useRef } from 'react';
import { Tab, TabStatus, HistoryItem } from './types';
import { BrowserTab } from './components/BrowserTab';
import { performSearch } from './services/geminiService';
import { QUICK_LINKS } from './constants';
import { 
  Search, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  Home, 
  Menu,
  ShieldCheck,
  Globe,
  Clock,
  Trash2
} from 'lucide-react';

interface TabHistory {
  past: string[];
  future: string[];
}

const INITIAL_TAB: Tab = {
  id: 'tab-1',
  title: 'New Tab',
  url: '',
  status: TabStatus.IDLE,
  content: null,
  timestamp: Date.now()
};

const getInternalTitle = (url: string): string => {
  if (url === 'romano://files') return 'Project Files';
  if (url === 'romano://d365') return 'Dynamics 365 AL';
  if (url === 'romano://sources') return 'Web Sources';
  if (url === 'about:newtab') return 'New Tab';
  return 'System Page';
};

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([INITIAL_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tabHistories, setTabHistories] = useState<Record<string, TabHistory>>({
    'tab-1': { past: [], future: [] }
  });

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input with active tab URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTabId, activeTab?.url]);

  const createTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: 'New Tab',
      url: '',
      status: TabStatus.IDLE,
      content: null,
      timestamp: Date.now()
    };
    setTabs(prev => [...prev, newTab]);
    setTabHistories(prev => ({ ...prev, [newId]: { past: [], future: [] } }));
    setActiveTabId(newId);
    setUrlInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const resetId = `tab-${Date.now()}`;
      setTabs([{ ...INITIAL_TAB, id: resetId }]);
      setTabHistories({ [resetId]: { past: [], future: [] } });
      setActiveTabId(resetId);
      setUrlInput('');
      return;
    }
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const recordHistory = (title: string, url: string) => {
    if (!url.trim()) return;
    setHistory(prev => {
      const filtered = prev.filter(item => item.url !== url);
      return [{ id: `hist-${Date.now()}`, title, url, timestamp: Date.now() }, ...filtered].slice(0, 30);
    });
  };

  const handleNavigate = async (query: string, addToHistoryNav = true) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (addToHistoryNav && activeTab && activeTab.url && activeTab.url !== trimmed) {
      setTabHistories(prev => {
        const cur = prev[activeTabId] || { past: [], future: [] };
        return {
          ...prev,
          [activeTabId]: {
            past: [...cur.past, activeTab.url],
            future: []
          }
        };
      });
    }

    // Handle internal protocols/commands
    if (trimmed.startsWith('romano://') || trimmed === 'about:newtab') {
      const title = getInternalTitle(trimmed);
      updateTab(activeTabId, {
        url: trimmed,
        title,
        status: TabStatus.COMPLETE,
        content: null,
        errorMessage: undefined
      });
      setUrlInput(trimmed);
      recordHistory(title, trimmed);
      return;
    }

    // Perform Search
    updateTab(activeTabId, {
      url: trimmed,
      title: trimmed,
      status: TabStatus.LOADING,
      errorMessage: undefined
    });
    setUrlInput(trimmed);

    try {
      const result = await performSearch(trimmed);
      updateTab(activeTabId, {
        status: TabStatus.COMPLETE,
        content: result,
        title: trimmed,
        errorMessage: undefined
      });
      recordHistory(trimmed, trimmed);
    } catch (error: any) {
      console.error('Search error in App.tsx:', error);
      updateTab(activeTabId, {
        status: TabStatus.ERROR,
        title: `Error: ${trimmed}`,
        errorMessage: error?.message || 'Search grounding request failed. Please verify API model and connection.'
      });
    }
  };

  const handleBack = () => {
    const curHistory = tabHistories[activeTabId];
    if (!curHistory || curHistory.past.length === 0) return;
    const previousUrl = curHistory.past[curHistory.past.length - 1];
    const newPast = curHistory.past.slice(0, -1);
    const newFuture = [activeTab.url, ...curHistory.future];

    setTabHistories(prev => ({
      ...prev,
      [activeTabId]: { past: newPast, future: newFuture }
    }));

    handleNavigate(previousUrl, false);
  };

  const handleForward = () => {
    const curHistory = tabHistories[activeTabId];
    if (!curHistory || curHistory.future.length === 0) return;
    const nextUrl = curHistory.future[0];
    const newFuture = curHistory.future.slice(1);
    const newPast = [...curHistory.past, activeTab.url];

    setTabHistories(prev => ({
      ...prev,
      [activeTabId]: { past: newPast, future: newFuture }
    }));

    handleNavigate(nextUrl, false);
  };

  const handleRefresh = () => {
    if (activeTab.url) {
      handleNavigate(activeTab.url, false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate(urlInput);
    }
  };

  const canGoBack = (tabHistories[activeTabId]?.past.length ?? 0) > 0;
  const canGoForward = (tabHistories[activeTabId]?.future.length ?? 0) > 0;

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Bar: Tabs */}
      <div className="flex items-center pt-2 px-2 bg-slate-950 space-x-1 overflow-x-auto no-scrollbar border-b border-slate-800 select-none">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              group relative flex items-center min-w-[160px] max-w-[240px] h-10 px-4 rounded-t-lg cursor-pointer transition-all duration-200
              ${activeTabId === tab.id ? 'bg-slate-800 text-blue-100' : 'bg-slate-950 text-slate-400 hover:bg-slate-900'}
            `}
          >
            {activeTabId === tab.id && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            )}
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {tab.status === TabStatus.LOADING ? (
                 <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shrink-0" />
              ) : (
                <Globe size={14} className={activeTabId === tab.id ? "text-blue-400 shrink-0" : "text-slate-500 shrink-0"} />
              )}
              <span className="text-xs font-medium truncate">{tab.title}</span>
            </div>
            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className={`ml-2 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${tabs.length === 1 ? 'hidden' : ''}`}
              title="Close tab"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button 
          onClick={createTab}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          title="New Tab"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-800 border-b border-slate-700 shadow-sm z-10">
        <div className="flex items-center gap-1 text-slate-400">
          <button 
            onClick={handleBack}
            disabled={!canGoBack}
            className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <button 
            onClick={handleForward}
            disabled={!canGoForward}
            className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Forward"
          >
            <ArrowRight size={18} />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            onClick={handleRefresh}
            title="Reload"
          >
            <RotateCw size={16} className={activeTab.status === TabStatus.LOADING ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {activeTab.url.startsWith('romano://') ? <ShieldCheck size={16} className="text-emerald-400" /> : <Search size={16} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-slate-900 text-slate-100 pl-10 pr-4 py-2.5 rounded-full border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium shadow-inner placeholder-slate-600"
            placeholder="Search web or enter URL (e.g. romano://d365, romano://files)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <button 
          className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${isSidebarOpen ? 'bg-slate-700 text-blue-400' : 'text-slate-400'}`}
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <BrowserTab 
            tab={activeTab} 
            onNavigate={handleNavigate}
            onRetry={handleRefresh}
          />
        </div>

        {/* Sidebar */}
        <div 
          className={`
            absolute top-0 right-0 bottom-0 w-72 bg-slate-900 border-l border-slate-800 z-20 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col justify-between
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="p-4 overflow-y-auto flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Access</h3>
            <div className="space-y-1">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    handleNavigate(link.url);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group text-left"
                >
                  <link.icon size={16} className="text-slate-500 group-hover:text-blue-400 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setUrlInput('');
                  updateTab(activeTabId, { url: '', status: TabStatus.IDLE, title: 'New Tab', content: null, errorMessage: undefined });
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group text-left"
              >
                <Home size={16} className="text-slate-500 group-hover:text-blue-400 shrink-0" />
                <span>Home / New Tab</span>
              </button>
            </div>
            
            {/* History Section */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock size={13} />
                  <span>Recent History</span>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    title="Clear history"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-xs text-slate-600 italic px-2 py-3 bg-slate-950/50 rounded-lg text-center">
                  Searches and visited URLs will appear here.
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigate(item.url);
                        setSidebarOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors group"
                    >
                      <div className="font-medium truncate group-hover:text-blue-300">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{item.url}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Romano-net Browser</span>
            <span className="font-mono">gemini-3.8-flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
