import { ProjectFile } from './types';
import { Layout, Globe, Search, Database, FileCode, Smartphone } from 'lucide-react';

export const APP_NAME = "Romano-net";
export const LICENSE_HOLDER = "Johan Fako";

export const MOCK_PROJECT_STRUCTURE: ProjectFile[] = [
  { name: '.idea', type: 'folder', description: 'IntelliJ IDEA Configuration' },
  { name: '.travis.yml', type: 'file', description: 'Travis CI Config' },
  { name: 'app', type: 'folder', description: 'Main App Directory' },
  { name: 'build.gradle', type: 'file', description: 'Gradle Build Script' },
  { 
    name: 'src/main', 
    type: 'folder', 
    children: [
      { name: 'AndroidManifest.xml', type: 'file', description: 'App Manifest' },
      { name: 'java/de/baumann/browser', type: 'folder', description: 'Java Sources' },
      { name: 'activity', type: 'folder', description: 'Browser Activities' },
      { name: 'browser', type: 'folder', description: 'Browser Components' },
      { name: 'database', type: 'folder', description: 'Database Helpers' },
      { name: 'dialogs', type: 'folder', description: 'Dialog Windows' },
      { name: 'fragment', type: 'folder', description: 'Settings Fragments' },
      { name: 'objects', type: 'folder', description: 'Helper Objects' },
    ]
  },
  { name: 'LICENSE', type: 'file', description: `Licensed to ${LICENSE_HOLDER}` },
];

export const QUICK_LINKS = [
  { name: "New Search", url: "about:newtab", icon: Search },
  { name: "Project Files", url: "romano://files", icon: FileCode },
  { name: "Dynamics 365", url: "romano://d365", icon: Layout },
  { name: "Web Sources", url: "romano://sources", icon: Globe },
];