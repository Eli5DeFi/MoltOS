import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import { Cpu, HardDrive, Wifi, Activity, Database, Cloud, RefreshCw } from 'lucide-react';

export function MonitorApp() {
  const { systemStatus } = useDesktopStore();
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(0));
  const [memoryHistory, setMemoryHistory] = useState<number[]>(Array(20).fill(0));

  useEffect(() => {
    setCpuHistory(prev => [...prev.slice(1), systemStatus.cpu]);
    setMemoryHistory(prev => [...prev.slice(1), systemStatus.memory]);
  }, [systemStatus.cpu, systemStatus.memory]);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">System Monitor</h2>
          <p className="text-sm text-white/50">Real-time performance + Crabwalk integration</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          systemStatus.clawdbotStatus === 'connected'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            systemStatus.clawdbotStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          Clawdbot {systemStatus.clawdbotStatus}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* CPU */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">CPU</span>
            </div>
            <span className="text-2xl font-bold text-white">{systemStatus.cpu}%</span>
          </div>
          <div className="h-16 flex items-end gap-1">
            {cpuHistory.map((value, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-blue-500/60 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Memory */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Memory</span>
            </div>
            <span className="text-2xl font-bold text-white">{systemStatus.memory}%</span>
          </div>
          <div className="h-16 flex items-end gap-1">
            {memoryHistory.map((value, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-purple-500/60 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {/* Disk */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-orange-400" />
            <span className="text-white/70 text-sm">Disk Usage</span>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${systemStatus.disk}%` }}
            />
          </div>
          <p className="text-right text-sm text-white/50 mt-2">{systemStatus.disk}%</p>
        </div>

        {/* Network Upload */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-4 h-4 text-green-400" />
            <span className="text-white/70 text-sm">Upload</span>
          </div>
          <p className="text-xl font-bold text-white">
            {systemStatus.network.upload.toFixed(1)}
            <span className="text-sm font-normal text-white/50 ml-1">MB/s</span>
          </p>
        </div>

        {/* Network Download */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-white/70 text-sm">Download</span>
          </div>
          <p className="text-xl font-bold text-white">
            {systemStatus.network.download.toFixed(1)}
            <span className="text-sm font-normal text-white/50 ml-1">MB/s</span>
          </p>
        </div>
      </div>

      {/* Crabwalk Integration */}
      <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-400" />
            <span className="text-white font-medium">Crabwalk Monitor</span>
          </div>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <RefreshCw className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-black/20">
            <p className="text-xs text-white/50 mb-1">Active Processes</p>
            <p className="text-lg font-semibold text-white">127</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20">
            <p className="text-xs text-white/50 mb-1">Threads</p>
            <p className="text-lg font-semibold text-white">1,024</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20">
            <p className="text-xs text-white/50 mb-1">Open Files</p>
            <p className="text-lg font-semibold text-white">3,847</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20">
            <p className="text-xs text-white/50 mb-1">Network Connections</p>
            <p className="text-lg font-semibold text-white">42</p>
          </div>
        </div>
      </div>
    </div>
  );
}
