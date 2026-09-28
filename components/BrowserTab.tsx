import React from 'react';
import { Tab, TabStatus } from '../types';
import { ProjectView } from './ProjectView';
import { Dynamics365View } from './Dynamics365View';
import { WebSourcesView } from './WebSourcesView';
import { Globe, ArrowRight, AlertCircle, Loader2, RotateCw, Sparkles, ExternalLink } from 'lucide-react';

interface BrowserTabProps {
  tab: Tab;
  onNavigate?: (query: string) => void;
  onRetry?: () => void;
}

export const BrowserTab: React.FC<BrowserTabProps> = ({ tab, onNavigate, onRetry }) => {
  // Internal Page Routing based on "URL"
  if (tab.url === 'romano://files') {
    return <div className="h-full overflow-y-auto bg-slate-950"><ProjectView /></div>;
  }

  if (tab.url === 'romano://d365') {
    return <div className="h-full overflow-y-auto bg-slate-950"><Dynamics365View onSearchQuery={onNavigate} /></div>;
  }

  if (tab.url === 'romano://sources') {
    return <div className="h-full overflow-y-auto bg-slate-950"><WebSourcesView onSearchQuery={onNavigate} /></div>;
  }

  if (tab.status === TabStatus.LOADING) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg font-medium text-slate-200">Searching Romano-net...</p>
        <p className="text-sm text-slate-500 mt-2">Connecting to Gemini Grounding (gemini-3.8-flash)</p>
        <p className="text-xs text-slate-600 mt-1 max-w-sm truncate font-mono">
          Query: "{tab.url}"
        </p>
      </div>
    );
  }

  if (tab.status === TabStatus.ERROR) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Search Could Not Complete</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          {tab.errorMessage || "Could not reach the search provider. Please check your query or API configuration."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              <RotateCw size={15} />
              <span>Retry Search</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('romano://d365')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
            >
              Explore Dynamics 365 AL
            </button>
          )}
        </div>
      </div>
    );
  }

  if (tab.status === TabStatus.IDLE || (tab.status === TabStatus.COMPLETE && !tab.content)) {
    const suggestions = [
      "Latest Microsoft Dynamics 365 Business Central release features",
      "How to set up launch.json and .alc in AL projects",
      "What are the benefits of Gemini Search Grounding?",
      "Johan Fako Romano-net project files"
    ];

    return (
      <div className="h-full overflow-y-auto flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-6 md:p-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/25">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight">
          Romano-net
        </h1>
        <p className="text-slate-400 text-sm md:text-base mb-8 text-center max-w-md">
          AI-powered web browser interface with Gemini Search Grounding
        </p>
        
        <div className="w-full max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Sparkles size={14} className="text-blue-400" />
            <span>Suggested Searches</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestions.map((query, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate && onNavigate(query)}
                className="p-3 text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all group flex items-start justify-between gap-2"
              >
                <span className="text-xs text-slate-300 group-hover:text-blue-300 leading-snug">
                  {query}
                </span>
                <ArrowRight size={13} className="text-slate-600 group-hover:text-blue-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => onNavigate && onNavigate('romano://d365')}
              className="hover:text-slate-300 underline underline-offset-4 transition-colors"
            >
              Dynamics 365 AL Template
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate && onNavigate('romano://files')}
              className="hover:text-slate-300 underline underline-offset-4 transition-colors"
            >
              Project Files
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate && onNavigate('romano://sources')}
              className="hover:text-slate-300 underline underline-offset-4 transition-colors"
            >
              Verified Web Sources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Result Header */}
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Globe size={14} />
            <span>Search Grounding Result</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{tab.title}</h2>
        </div>

        {/* AI Summary */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="prose prose-invert prose-blue max-w-none">
            <div className="whitespace-pre-line leading-relaxed text-slate-200 text-sm md:text-base">
              {tab.content?.summary}
            </div>
          </div>
        </div>

        {/* Sources */}
        {tab.content?.sources && tab.content.sources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Grounding Sources ({tab.content.sources.length})</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {tab.content.sources.map((source, idx) => {
                let domain = '';
                try {
                  domain = new URL(source.uri).hostname.replace(/^www\./, '');
                } catch {
                  domain = source.uri;
                }

                return (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-200 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-blue-400 truncate group-hover:text-blue-300 mb-1">
                          {source.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate font-mono flex items-center gap-1">
                          <span>{domain}</span>
                          <ExternalLink size={10} className="opacity-60" />
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 shrink-0 transform group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
