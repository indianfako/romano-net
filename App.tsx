import React, { useState, useEffect, useRef } from 'react';
import { Tab, TabStatus } from './types';
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
  Globe
} from 'lucide-react';

const INITIAL_TAB: Tab = {
  id: 'tab-1',
  title: 'New Tab',
  url: '',
  status: TabStatus.IDLE,
  content: null,
  timestamp: Date.now()
};

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([INITIAL_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input with active tab URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTabId]);

  const createTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: '',
      status: TabStatus.IDLE,
      content: null,
      timestamp: Date.now()
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('');
    // Focus input on new tab
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Don't close last tab, just reset it
      setTabs([{ ...INITIAL_TAB, id: `tab-${Date.now()}` }]);
      return;
    }
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleNavigate = async (query: string) => {
    if (!query.trim()) return;

    // Handle internal protocols/commands
    if (query.startsWith('romano://') || query === 'about:newtab') {
      updateTab(activeTabId, {
        url: query,
        title: query === 'romano://files' ? 'Project Files' : 'System',
        status: TabStatus.COMPLETE,
        content: null
      });
      return;
    }

    // Perform Search
    updateTab(activeTabId, {
      url: query,
      title: query,
      status: TabStatus.LOADING
    });

    try {
      const result = await performSearch(query);
      updateTab(activeTabId, {
        status: TabStatus.COMPLETE,
        content: result,
        title: query
      });
    } catch (error) {
      updateTab(activeTabId, {
        status: TabStatus.ERROR,
        title: 'Error'
      });
    }
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate(urlInput);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100 overflow-hidden">
      
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
                 <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <Globe size={14} className={activeTabId === tab.id ? "text-blue-400" : "text-slate-500"} />
              )}
              <span className="text-sm truncate font-medium">{tab.title}</span>
            </div>
            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className={`ml-2 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${tabs.length === 1 ? 'hidden' : ''}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button 
          onClick={createTab}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-800 border-b border-slate-700 shadow-sm z-10">
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ArrowRight size={18} />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            onClick={() => handleNavigate(urlInput)}
          >
            <RotateCw size={16} className={activeTab.status === TabStatus.LOADING ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {activeTab.url.startsWith('romano://') ? <ShieldCheck size={16} className="text-green-500" /> : <Search size={16} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-slate-900 text-slate-100 pl-10 pr-4 py-2.5 rounded-full border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium shadow-inner placeholder-slate-600"
            placeholder="Search web or enter URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <button 
          className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${isSidebarOpen ? 'bg-slate-700 text-blue-400' : 'text-slate-400'}`}
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 bg-slate-950 relative">
          <BrowserTab tab={activeTab} />
        </div>

        {/* Sidebar */}
        <div 
          className={`
            absolute top-0 right-0 bottom-0 w-64 bg-slate-900 border-l border-slate-800 z-20 transform transition-transform duration-300 ease-in-out shadow-2xl
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Access</h3>
            <div className="space-y-1">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    updateTab(activeTabId, { url: link.url });
                    handleNavigate(link.url);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group"
                >
                  <link.icon size={16} className="text-slate-500 group-hover:text-blue-400" />
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setActiveTabId(activeTabId);
                  setUrlInput('');
                  updateTab(activeTabId, { url: '', status: TabStatus.IDLE, title: 'New Tab', content: null });
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group"
              >
                <Home size={16} className="text-slate-500 group-hover:text-blue-400" />
                Home
              </button>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-800">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">History</h3>
               <div className="text-xs text-slate-600 italic px-2">
                 History is cleared on session end.
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;