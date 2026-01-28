import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import {
  Folder,
  File,
  ChevronRight,
  Grid,
  List,
  Search,
  Home,
  Download,
  FileText,
  Image,
  Code,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

type ViewMode = 'grid' | 'list';

export function FilesApp() {
  const { files } = useDesktopStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPath, setCurrentPath] = useState('/');
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (name: string, type: 'file' | 'folder') => {
    if (type === 'folder') return <Folder className="w-8 h-8 text-blue-400" />;
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'md':
      case 'txt':
        return <FileText className="w-8 h-8 text-gray-400" />;
      case 'png':
      case 'jpg':
      case 'svg':
        return <Image className="w-8 h-8 text-pink-400" />;
      case 'js':
      case 'ts':
      case 'json':
        return <Code className="w-8 h-8 text-yellow-400" />;
      default:
        return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 border-r border-white/10 p-3 bg-black/20">
        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-2">Favorites</p>
          <button
            onClick={() => setCurrentPath('/')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
              currentPath === '/' ? 'bg-blue-500/20 text-blue-400' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/5">
            <Folder className="w-4 h-4 text-blue-400" />
            Documents
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/5">
            <Download className="w-4 h-4 text-green-400" />
            Downloads
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/5">
            <Code className="w-4 h-4 text-yellow-400" />
            Projects
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-2">Storage</p>
          <div className="px-2">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-blue-500 rounded-full" />
            </div>
            <p className="text-xs text-white/40 mt-2">67 GB of 100 GB used</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm">
            <button className="text-white/50 hover:text-white transition-colors">root</button>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-white">Home</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-40 pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500/50"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Files */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {filteredFiles.map((file, index) => (
                <motion.button
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedFile(file.id)}
                  onDoubleClick={() => file.type === 'folder' && setCurrentPath(file.path)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    selectedFile === file.id
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    {getFileIcon(file.name, file.type)}
                  </div>
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {file.type === 'folder' ? 'Folder' : formatSize(file.size)}
                  </p>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-white/40 border-b border-white/10">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-1"></div>
              </div>

              {filteredFiles.map((file, index) => (
                <motion.button
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedFile(file.id)}
                  onDoubleClick={() => file.type === 'folder' && setCurrentPath(file.path)}
                  className={`w-full grid grid-cols-12 gap-4 px-4 py-2 rounded-lg text-left transition-all ${
                    selectedFile === file.id
                      ? 'bg-blue-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    {getFileIcon(file.name, file.type)}
                    <span className="text-sm text-white truncate">{file.name}</span>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-white/50">
                    {file.type === 'folder' ? '-' : formatSize(file.size)}
                  </div>
                  <div className="col-span-3 flex items-center text-sm text-white/50">
                    {format(file.modified, 'MMM d, yyyy')}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 border-t border-white/10 text-xs text-white/40">
          {filteredFiles.length} items
          {selectedFile && ` • 1 selected`}
        </div>
      </div>
    </div>
  );
}
