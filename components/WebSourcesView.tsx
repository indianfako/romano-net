import React from 'react';
import { Globe, ArrowRight, ExternalLink, ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface WebSourcesViewProps {
  onSearchQuery?: (q: string) => void;
}

const FEATURED_SOURCES = [
  {
    category: "Microsoft Dynamics 365 & AL",
    items: [
      {
        title: "Dynamics 365 Business Central Documentation",
        uri: "https://learn.microsoft.com/en-us/dynamics365/business-central/",
        desc: "Official Microsoft documentation, development guides, and AL object references."
      },
      {
        title: "AL Language Reference Guide",
        uri: "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-al-language",
        desc: "Syntax, methods, properties, and triggers for AL development."
      },
      {
        title: "Business Central Launch & ALC Configuration",
        uri: "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-json-files",
        desc: "Detailed instructions for launch.json, app.json, and the .alc symbol cache."
      }
    ]
  },
  {
    category: "Browser & AI Grounding Architecture",
    items: [
      {
        title: "Google GenAI Search Grounding Overview",
        uri: "https://ai.google.dev/gemini-api/docs/grounding",
        desc: "How real-time web search grounding retrieves verified sources and facts."
      },
      {
        title: "Romano-net Browser Architecture",
        uri: "romano://files",
        desc: "Project structure, activities, database helpers, and license information."
      }
    ]
  }
];

export const WebSourcesView: React.FC<WebSourcesViewProps> = ({ onSearchQuery }) => {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-4 md:p-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass size={16} />
            <span>Curated Directory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Web Sources & Knowledge Base
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Verified reference sources for Dynamics 365 Business Central, AL language, and Romano-net.
          </p>
        </div>

        <div className="space-y-8">
          {FEATURED_SOURCES.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {group.category}
              </h2>
              <div className="grid gap-3">
                {group.items.map((item, itemIdx) => {
                  const isInternal = item.uri.startsWith('romano://');
                  return (
                    <div
                      key={itemIdx}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Globe size={15} className="text-blue-400 shrink-0" />
                          <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 pl-6">{item.desc}</p>
                        <div className="text-[11px] text-slate-500 pl-6 font-mono truncate">
                          {item.uri}
                        </div>
                      </div>

                      <div className="pl-6 sm:pl-0 flex items-center gap-2">
                        {isInternal ? (
                          <button
                            onClick={() => onSearchQuery && onSearchQuery(item.uri)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors whitespace-nowrap"
                          >
                            <span>Open Project</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <>
                            <a
                              href={item.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors whitespace-nowrap"
                            >
                              <span>Visit</span>
                              <ExternalLink size={13} />
                            </a>
                            {onSearchQuery && (
                              <button
                                onClick={() => onSearchQuery(item.title)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs rounded-lg transition-colors whitespace-nowrap"
                              >
                                <Sparkles size={13} />
                                <span>Search Query</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
