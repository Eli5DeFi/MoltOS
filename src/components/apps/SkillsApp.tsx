import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Power,
  Download,
  Star,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Filter,
  Sparkles,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { clawdHubService, type ClawdHubSkill } from '@/services/clawdhub';

export function SkillsApp() {
  const [skills, setSkills] = useState<ClawdHubSkill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<ClawdHubSkill[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<ClawdHubSkill | null>(null);

  // Fetch skills on mount
  useEffect(() => {
    loadSkills();
  }, []);

  // Filter skills when search or category changes
  useEffect(() => {
    let result = skills;

    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    setFilteredSkills(result);
  }, [skills, search, selectedCategory]);

  const loadSkills = async () => {
    setLoading(true);
    const response = await clawdHubService.fetchSkills();
    setSkills(response.skills);
    setCategories(response.categories);
    setLoading(false);
  };

  const handleInstall = async (skill: ClawdHubSkill) => {
    setInstalling(skill.id);
    if (skill.installed) {
      await clawdHubService.uninstallSkill(skill.id);
    } else {
      await clawdHubService.installSkill(skill.id);
    }
    // Refresh skills
    const response = await clawdHubService.fetchSkills();
    setSkills(response.skills);
    setInstalling(null);
  };

  const installedCount = skills.filter(s => s.installed).length;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ClawdHub Skills</h2>
              <p className="text-xs text-white/50">Enhance your MoltBot with powerful skills</p>
            </div>
          </div>
          <button
            onClick={loadSkills}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-purple-500/50 appearance-none cursor-pointer transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-white/50 text-sm">Loading skills from ClawdHub...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SkillCard
                  skill={skill}
                  onInstall={() => handleInstall(skill)}
                  onSelect={() => setSelectedSkill(skill)}
                  isInstalling={installing === skill.id}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredSkills.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-white/50">
            <Search className="w-12 h-12 mb-3 opacity-30" />
            <p>No skills found matching your criteria</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-white/50">
              <span className="text-white font-medium">{installedCount}</span> of {skills.length} installed
            </span>
            <span className="text-white/30">•</span>
            <a
              href="https://clawdhub.com/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              Browse on ClawdHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-3">
            {categories.slice(1, 5).map(cat => (
              <span key={cat} className="text-white/40">
                {cat}: {skills.filter(s => s.category === cat).length}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onInstall={() => handleInstall(selectedSkill)}
            isInstalling={installing === selectedSkill.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Skill Card Component
interface SkillCardProps {
  skill: ClawdHubSkill;
  onInstall: () => void;
  onSelect: () => void;
  isInstalling: boolean;
}

function SkillCard({ skill, onInstall, onSelect, isInstalling }: SkillCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Development: 'from-blue-500 to-cyan-500',
      Security: 'from-red-500 to-orange-500',
      Creative: 'from-pink-500 to-purple-500',
      Research: 'from-green-500 to-emerald-500',
      System: 'from-gray-500 to-gray-600',
      Analytics: 'from-yellow-500 to-orange-500',
      Data: 'from-indigo-500 to-purple-500',
      Productivity: 'from-teal-500 to-cyan-500',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div
      className="group relative rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onSelect}
    >
      {/* Featured Badge */}
      {skill.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <TrendingUp className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-yellow-400 font-medium">Featured</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(skill.category)} flex items-center justify-center text-2xl shadow-lg`}
            style={{
              boxShadow: `0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            {/* iOS 4 style glossy effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-1/2"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
                }}
              />
            </div>
            <span className="relative z-10">{skill.icon}</span>
          </div>

          {/* Title & Category */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">
              {skill.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/40">{skill.category}</span>
              <span className="text-white/20">•</span>
              <span className="text-xs text-white/40">v{skill.version}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/60 line-clamp-2 mb-3 min-h-[40px]">
          {skill.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {skill.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40"
            >
              #{tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-white/30">
              +{skill.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3 text-white/30" />
              <span className="text-xs text-white/50">
                {clawdHubService.formatDownloads(skill.downloads)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-white/50">{skill.rating}</span>
            </div>
          </div>

          {/* Install Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onInstall(); }}
            disabled={isInstalling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              skill.installed
                ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
            }`}
          >
            {isInstalling ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                {skill.installed ? 'Removing...' : 'Installing...'}
              </>
            ) : skill.installed ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Installed
              </>
            ) : (
              <>
                <Power className="w-3 h-3" />
                Install
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
      </div>
    </div>
  );
}

// Skill Detail Modal
interface SkillDetailModalProps {
  skill: ClawdHubSkill;
  onClose: () => void;
  onInstall: () => void;
  isInstalling: boolean;
}

function SkillDetailModal({ skill, onClose, onInstall, isInstalling }: SkillDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
              {skill.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{skill.name}</h2>
                {skill.featured && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {skill.author}
                </div>
                <span>v{skill.version}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs">
                  {skill.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Description</h3>
            <p className="text-sm text-white/60">{skill.description}</p>
          </div>

          {/* Usage */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Usage</h3>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-sm">
              <span className="text-green-400">$</span>
              <span className="text-white ml-2">{skill.usage}</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">
                {clawdHubService.formatDownloads(skill.downloads)} downloads
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/60">{skill.rating} rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">Updated {skill.updatedAt}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onInstall}
            disabled={isInstalling}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              skill.installed
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isInstalling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {skill.installed ? 'Uninstalling...' : 'Installing...'}
              </>
            ) : skill.installed ? (
              <>
                <Power className="w-4 h-4" />
                Uninstall
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Install Skill
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
