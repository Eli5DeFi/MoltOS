import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import {
  Bot,
  Power,
  Activity,
  Clock,
  Play,
  Pause,
  Settings,
  Plus,
  Cpu,
  Zap,
  Shield,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const agentTypes = [
  { type: 'General Assistant', icon: <Bot className="w-5 h-5" />, color: 'blue' },
  { type: 'Development', icon: <Cpu className="w-5 h-5" />, color: 'purple' },
  { type: 'Research', icon: <Search className="w-5 h-5" />, color: 'green' },
  { type: 'Security', icon: <Shield className="w-5 h-5" />, color: 'red' },
];

export function AgentsApp() {
  const { agents, toggleAgentStatus } = useDesktopStore();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'idle': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-red-400 bg-red-400/20';
    }
  };

  const getAgentTypeConfig = (type: string) => {
    return agentTypes.find(t => t.type === type) || agentTypes[0];
  };

  return (
    <div className="flex h-full">
      {/* Agent List */}
      <div className="w-72 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Agents</h2>
            <button className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-white/50">Multi-agent management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/10">
          <div className="text-center">
            <p className="text-lg font-bold text-green-400">
              {agents.filter(a => a.status === 'active').length}
            </p>
            <p className="text-xs text-white/40">Active</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-400">
              {agents.filter(a => a.status === 'idle').length}
            </p>
            <p className="text-xs text-white/40">Idle</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-400">
              {agents.filter(a => a.status === 'offline').length}
            </p>
            <p className="text-xs text-white/40">Offline</p>
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto">
          {agents.map((agent, index) => {
            const typeConfig = getAgentTypeConfig(agent.type);
            return (
              <motion.button
                key={agent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full p-4 text-left border-b border-white/5 transition-colors ${
                  selectedAgent === agent.id ? 'bg-blue-500/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${typeConfig.color}-500/20 flex items-center justify-center text-${typeConfig.color}-400`}>
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium truncate">{agent.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{agent.type}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Agent Details */}
      <div className="flex-1 flex flex-col">
        {selectedAgentData ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${getAgentTypeConfig(selectedAgentData.type).color}-500/30 to-${getAgentTypeConfig(selectedAgentData.type).color}-600/30 flex items-center justify-center`}>
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedAgentData.name}</h2>
                    <p className="text-white/50">{selectedAgentData.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAgentStatus(selectedAgentData.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedAgentData.status === 'active'
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {selectedAgentData.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start
                      </>
                    )}
                  </button>
                  <button className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Status Card */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Power className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white/50">Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedAgentData.status === 'active' ? 'bg-green-400' :
                      selectedAgentData.status === 'idle' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-white font-medium capitalize">{selectedAgentData.status}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white/50">Last Active</span>
                  </div>
                  <span className="text-white font-medium">
                    {formatDistanceToNow(selectedAgentData.lastActive, { addSuffix: true })}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white/50">Tasks</span>
                  </div>
                  <span className="text-white font-medium">
                    {Math.floor(Math.random() * 100)} completed
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-2">Description</h3>
                <p className="text-white/60">{selectedAgentData.description}</p>
              </div>

              {/* Capabilities */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {['Code Generation', 'Text Analysis', 'Web Research', 'File Operations', 'API Integration'].map((cap, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-sm"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="text-white font-medium mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {[
                    { action: 'Completed task: Code review', time: '2 min ago' },
                    { action: 'Started task: Bug analysis', time: '5 min ago' },
                    { action: 'Deployed update', time: '15 min ago' },
                  ].map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white/70">{log.action}</span>
                      </div>
                      <span className="text-xs text-white/40">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Bot className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/50">Select an agent to view details</p>
            <p className="text-sm text-white/30 mt-1">Manage your AI workforce</p>
          </div>
        )}
      </div>
    </div>
  );
}
