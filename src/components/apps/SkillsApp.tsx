import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import { Search, Power, Info } from 'lucide-react';

export function SkillsApp() {
  const { skills, toggleSkillInstall } = useDesktopStore();
  const [search, setSearch] = useState('');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(search.toLowerCase()) ||
    skill.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFlip = (skillId: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Skills</h2>
          <p className="text-sm text-white/50">Click cards to see usage instructions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-48 pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flip-card h-48"
              style={{ perspective: '1000px' }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 cursor-pointer`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards.has(skill.id) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
                onClick={() => toggleFlip(skill.id)}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{skill.icon}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkillInstall(skill.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        skill.installed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{skill.name}</h3>
                  <p className="text-sm text-white/50 line-clamp-2">{skill.description}</p>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs text-white/40 px-2 py-1 rounded-full bg-white/5">
                      {skill.category}
                    </span>
                    <Info className="w-4 h-4 text-white/30" />
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-white font-semibold mb-2">How to use</h3>
                    <div className="flex-1">
                      <div className="bg-black/30 rounded-lg p-3 font-mono text-sm">
                        <span className="text-green-400">$</span>
                        <span className="text-white ml-2">{skill.usage}</span>
                      </div>
                      <p className="text-sm text-white/60 mt-3">{skill.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className={`text-xs ${skill.installed ? 'text-green-400' : 'text-white/40'}`}>
                        {skill.installed ? 'Installed' : 'Not installed'}
                      </span>
                      <span className="text-xs text-white/40">Click to flip back</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
        <span className="text-white/50">
          {skills.filter(s => s.installed).length} of {skills.length} skills installed
        </span>
        <div className="flex gap-4">
          {['Development', 'System', 'Research', 'Creative'].map(cat => (
            <span key={cat} className="text-white/40">
              {cat}: {skills.filter(s => s.category === cat).length}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
