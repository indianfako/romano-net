import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  Settings, 
  Copy, 
  Check, 
  Layers, 
  Database, 
  FileText,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface AlFileItem {
  name: string;
  type: 'folder' | 'file';
  description?: string;
  code?: string;
  children?: AlFileItem[];
}

const AL_PROJECT_FILES: AlFileItem[] = [
  {
    name: '.vscode',
    type: 'folder',
    description: 'Visual Studio Code configurations',
    children: [
      {
        name: 'launch.json',
        type: 'file',
        description: 'D365 BC debugger and deployment config',
        code: `{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Cloud Sandbox (Dynamics 365 Business Central)",
      "type": "al",
      "request": "launch",
      "environmentType": "Sandbox",
      "environmentName": "ProductionCopy",
      "server": "https://businesscentral.dynamics.com",
      "authentication": "UserPassword",
      "startupObjectId": 22,
      "startupObjectType": "Page",
      "breakOnError": true,
      "launchBrowser": true,
      "enableLongRunningSqlStatements": true,
      "enableSqlInformationDebugger": true
    }
  ]
}`
      },
      {
        name: 'settings.json',
        type: 'file',
        description: 'AL workspace linter and compile settings',
        code: `{
  "al.assemblyProbingPaths": [
    "./.netpackages"
  ],
  "al.enableCodeAnalysis": true,
  "al.codeAnalyzers": [
    "\${AppSourceCop}",
    "\${CodeCop}",
    "\${PerTenantExtensionCop}",
    "\${UICop}"
  ],
  "al.packageCachePath": "./.alc"
}`
      }
    ]
  },
  {
    name: '.alc',
    type: 'folder',
    description: 'Symbols & dependency cache directory (.alc)',
    children: [
      {
        name: 'Microsoft_System_24.0.0.0.app',
        type: 'file',
        description: 'Standard System application symbols'
      },
      {
        name: 'Microsoft_Base Application_24.0.0.0.app',
        type: 'file',
        description: 'Base Application symbols cache'
      }
    ]
  },
  {
    name: 'app.json',
    type: 'file',
    description: 'AL Extension Manifest',
    code: `{
  "id": "e159960a-933c-4bab-be69-6f8ba3b45258",
  "name": "RomanoNetBCIntegration",
  "publisher": "Johan Fako",
  "version": "1.0.0.0",
  "brief": "Romano-net Dynamics 365 Business Central Extension",
  "description": "Template AL project for Dynamics 365 Business Central with search & browsing capabilities.",
  "privacyStatement": "https://romano-net.io/privacy",
  "target": "Cloud",
  "platform": "24.0.0.0",
  "application": "24.0.0.0",
  "idRanges": [
    {
      "from": 50100,
      "to": 50149
    }
  ],
  "runtime": "13.0"
}`
  },
  {
    name: 'src',
    type: 'folder',
    description: 'AL Source Objects',
    children: [
      {
        name: 'Tables',
        type: 'folder',
        children: [
          {
            name: 'Tab50100.RomanoSearchLog.al',
            type: 'file',
            description: 'Table for storing browsing & grounding audit records',
            code: `table 50100 "Romano Search Log"
{
    DataClassification = CustomerContent;
    Caption = 'Romano Search Log';

    fields
    {
        field(1; "Entry No."; Integer)
        {
            Caption = 'Entry No.';
            AutoIncrement = true;
        }
        field(2; "Query Text"; Text[250])
        {
            Caption = 'Search Query';
        }
        field(3; "Result Summary"; Text[2048])
        {
            Caption = 'Grounding Result';
        }
        field(4; "User ID"; Code[50])
        {
            Caption = 'User ID';
            DataClassification = EndUserIdentifiableInformation;
        }
        field(5; "Timestamp"; DateTime)
        {
            Caption = 'Created DateTime';
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;
        }
    }
}`
          }
        ]
      },
      {
        name: 'Pages',
        type: 'folder',
        children: [
          {
            name: 'Pag50100.RomanoSearchList.al',
            type: 'file',
            description: 'List page for reviewing search query logs in D365 BC',
            code: `page 50100 "Romano Search List"
{
    PageType = List;
    ApplicationArea = All;
    UsageCategory = Lists;
    SourceTable = "Romano Search Log";
    Caption = 'Romano Search Activity Logs';
    CardPageId = "Romano Search Card";

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field("Entry No."; Rec."Entry No.") { ApplicationArea = All; }
                field("Query Text"; Rec."Query Text") { ApplicationArea = All; }
                field("User ID"; Rec."User ID") { ApplicationArea = All; }
                field("Timestamp"; Rec."Timestamp") { ApplicationArea = All; }
            }
        }
    }
}`
          }
        ]
      },
      {
        name: 'Codeunits',
        type: 'folder',
        children: [
          {
            name: 'Cod50100.RomanoGroundingMgt.al',
            type: 'file',
            description: 'AL Codeunit for communicating with Gemini Grounding API',
            code: `codeunit 50100 "Romano Grounding Mgt."
{
    procedure ExecuteQuery(SearchQuery: Text): Text
    var
        Client: HttpClient;
        ResponseMessage: HttpResponseMessage;
        ResponseText: Text;
    begin
        // Integration point with Romano-net Grounding API
        if Client.Get('https://api.romano-net.io/v1/search?q=' + SearchQuery, ResponseMessage) then begin
            if ResponseMessage.IsSuccessStatusCode() then begin
                ResponseMessage.Content().ReadAs(ResponseText);
                exit(ResponseText);
            end;
        end;
        exit('Unable to fetch grounding results.');
    end;
}`
          }
        ]
      }
    ]
  }
];

export const Dynamics365View: React.FC<{ onSearchQuery?: (q: string) => void }> = ({ onSearchQuery }) => {
  const [selectedFile, setSelectedFile] = useState<AlFileItem>(
    AL_PROJECT_FILES[0].children?.[0] || AL_PROJECT_FILES[2]
  );
  const [copied, setCopied] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    '.vscode': true,
    '.alc': true,
    'src': true,
    'Tables': true,
    'Pages': true,
    'Codeunits': true
  });

  const toggleFolder = (name: string) => {
    setOpenFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (items: AlFileItem[], path = '') => {
    return items.map((item) => {
      const fullPath = `${path}/${item.name}`;
      if (item.type === 'folder') {
        const isOpen = openFolders[item.name] ?? false;
        return (
          <div key={fullPath} className="space-y-0.5">
            <button
              onClick={() => toggleFolder(item.name)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors text-left"
            >
              {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              <Folder size={14} className="text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-200">{item.name}</span>
              {item.description && (
                <span className="text-slate-500 text-[10px] ml-auto hidden md:inline truncate">{item.description}</span>
              )}
            </button>
            {isOpen && item.children && (
              <div className="pl-4 border-l border-slate-800 ml-3 space-y-0.5">
                {renderTree(item.children, fullPath)}
              </div>
            )}
          </div>
        );
      }

      const isSelected = selectedFile?.name === item.name;
      return (
        <button
          key={fullPath}
          onClick={() => setSelectedFile(item)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono transition-colors text-left ${
            isSelected 
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode size={14} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
          <span className="truncate">{item.name}</span>
        </button>
      );
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-4 md:p-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Dynamics 365 Business Central
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AL Language
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AL Project Template & Configuration
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Standard directory layout for Dynamics 365 Business Central extensions with launch.json and .alc cache.
            </p>
          </div>

          {onSearchQuery && (
            <button
              onClick={() => onSearchQuery('Dynamics 365 Business Central AL development best practices')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap self-start"
            >
              <span>Search D365 Docs</span>
              <ExternalLink size={14} />
            </button>
          )}
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
              <Settings size={16} />
              <span>.vscode/ Configs</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Includes launch.json debugger targets and workspace settings for AppSourceCop & UICop code analysis.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
              <Database size={16} />
              <span>.alc Package Cache</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stores pre-downloaded symbol packages (.app) for Microsoft System and Base Application dependencies.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
              <Layers size={16} />
              <span>AL Object Structure</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean separation of Tables, Pages, Codeunits, and Permissions with isolated ID ranges.
            </p>
          </div>
        </div>

        {/* Project Explorer & File Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* File Tree */}
          <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Explorer
              </span>
              <span className="text-[11px] text-slate-500 font-mono">D365BC_AL</span>
            </div>
            <div className="space-y-1">
              {renderTree(AL_PROJECT_FILES)}
            </div>
          </div>

          {/* Code & Content Preview */}
          <div className="lg:col-span-8 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode size={16} className="text-blue-400" />
                  <span className="font-mono text-sm font-semibold text-white">
                    {selectedFile.name}
                  </span>
                  {selectedFile.description && (
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      — {selectedFile.description}
                    </span>
                  )}
                </div>

                {selectedFile.code && (
                  <button
                    onClick={() => handleCopy(selectedFile.code!)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                    title="Copy code"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {selectedFile.code ? (
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800/80 overflow-x-auto">
                  <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                    <code>{selectedFile.code}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800/50">
                  <FileText size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-300">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedFile.description || 'Binary / Cache package file'}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>AL Language Extension v13.0+</span>
              <span>Johan Fako • Romano-net</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
