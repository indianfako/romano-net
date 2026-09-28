import React from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { ProjectFile } from '../types';
import { MOCK_PROJECT_STRUCTURE, LICENSE_HOLDER } from '../constants';

interface FileNodeProps {
  item: ProjectFile;
  depth?: number;
}

const FileNode: React.FC<FileNodeProps> = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 hover:bg-slate-800 rounded cursor-pointer transition-colors`}
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={() => item.type === 'folder' && setIsOpen(!isOpen)}
      >
        <span className="mr-2 text-slate-400">
          {item.type === 'folder' ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <div className="w-[14px]" />}
        </span>
        
        <span className={`mr-2 ${item.type === 'folder' ? 'text-blue-400' : 'text-slate-300'}`}>
          {item.type === 'folder' ? <Folder size={16} /> : <FileText size={16} />}
        </span>
        
        <span className="text-sm font-medium text-slate-200">{item.name}</span>
        {item.description && (
          <span className="ml-auto text-xs text-slate-500 hidden sm:block">{item.description}</span>
        )}
      </div>
      
      {item.type === 'folder' && isOpen && item.children && (
        <div className="border-l border-slate-700 ml-4">
          {item.children.map((child, idx) => (
            <FileNode key={idx} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectView: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Project Structure</h1>
        <p className="text-slate-400">
          Configuration and source files for Romano-net Browser Android Project.
        </p>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 font-mono shadow-xl">
        {MOCK_PROJECT_STRUCTURE.map((file, idx) => (
          <FileNode key={idx} item={file} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h3 className="text-blue-400 font-bold mb-1">License Information</h3>
        <p className="text-sm text-blue-200">
          This project is licensed under the name <strong>{LICENSE_HOLDER}</strong>. All rights reserved.
        </p>
      </div>
    </div>
  );
};