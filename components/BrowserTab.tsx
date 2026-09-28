import React from 'react';
import { Tab, TabStatus } from '../types';
import { ProjectView } from './ProjectView';
import { Globe, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface BrowserTabProps {
  tab: Tab;
}

export const BrowserTab: React.FC<BrowserTabProps> = ({ tab }) => {
  
  // Internal Page Routing based on "URL"
  if (tab.url === 'romano://files') {
    return <div className="h-full overflow-y-auto bg-slate-950"><ProjectView /></div>;
  }

  if (tab.status === TabStatus.LOADING) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg">Searching Romano-net...</p>
        <p className="text-sm text-slate-500 mt-2">Connecting to Gemini Grounding</p>
      </div>
    );
  }

  if (tab.status === TabStatus.ERROR) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-red-400">
        <AlertCircle className="w-16 h-16 mb-4 opacity-80" />
        <h2 className="text-xl font-bold">Connection Error</h2>
        <p className="mt-2 text-slate-400">Could not reach the search provider.</p>
      </div>
    );
  }

  if (tab.status === TabStatus.IDLE || (tab.status === TabStatus.COMPLETE && !tab.content)) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
          <Globe className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Romano-net</h1>
        <p className="text-slate-500 mb-8">Secure, AI-Powered Browsing</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
           {/* Hint text or empty state */}
           <div className="col-span-full text-center text-sm text-slate-600">
              Enter a search query or URL above to begin.
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Result Header */}
        <div className="mb-6">
          <h2 className="text-xl text-slate-400 mb-1">Results for:</h2>
          <div className="text-2xl font-bold text-white">{tab.title}</div>
        </div>

        {/* AI Summary */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg mb-8">
          <div className="prose prose-invert prose-blue max-w-none">
            <p className="whitespace-pre-line leading-relaxed text-slate-300">
              {tab.content?.summary}
            </p>
          </div>
        </div>

        {/* Sources */}
        {tab.content?.sources && tab.content.sources.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Sources
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {tab.content.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-blue-400 truncate group-hover:text-blue-300 mb-1">
                        {source.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate font-mono">
                        {new URL(source.uri).hostname}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};