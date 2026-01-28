import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import { Search, Star, Download, Check, ExternalLink } from 'lucide-react';

const categories = ['All', 'Development', 'Productivity', 'Utilities', 'Security', 'System'];

export function AppsApp() {
  const { appStoreItems, toggleAppInstall } = useDesktopStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredApps = appStoreItems.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                         app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/10 p-4 bg-black/20">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Clawdhub</h2>
          <p className="text-xs text-white/50">App Store for AI Skills</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Categories */}
        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-2">Categories</p>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {selectedCategory === 'All' ? 'All Apps' : selectedCategory}
          </h3>
          <span className="text-sm text-white/50">{filteredApps.length} apps</span>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
              {/* App Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{app.name}</h4>
                  <p className="text-xs text-white/50">{app.developer}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white/70">{app.rating}</span>
                    <span className="text-xs text-white/40 ml-2">{app.downloads}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/60 mb-4 line-clamp-2">{app.description}</p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAppInstall(app.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    app.installed
                      ? 'bg-white/10 text-white/70 hover:bg-white/15'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {app.installed ? (
                    <>
                      <Check className="w-4 h-4" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Install
                    </>
                  )}
                </button>
                <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Category Tag */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-xs text-white/40 px-2 py-1 rounded-full bg-white/5">
                  {app.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/50">No apps found</p>
            <p className="text-sm text-white/30">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
