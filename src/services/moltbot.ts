import type { MoltBotConfig, MoltBotStatus, MoltBotInstallStatus } from '@/types';

const GATEWAY_DEFAULT_PORT = 18789;
const GATEWAY_URL = `ws://127.0.0.1:${GATEWAY_DEFAULT_PORT}`;
const CONFIG_PATH = '~/.clawdbot/moltbot.json';

// Simulated check results for browser environment
// In a real Electron/Tauri app, these would use native APIs
let mockInstallState: MoltBotInstallStatus = 'not_installed';
let mockConfig: MoltBotConfig | null = null;

export class MoltBotService {
  private static instance: MoltBotService;
  private ws: WebSocket | null = null;
  private listeners: Set<(status: MoltBotStatus) => void> = new Set();

  static getInstance(): MoltBotService {
    if (!MoltBotService.instance) {
      MoltBotService.instance = new MoltBotService();
    }
    return MoltBotService.instance;
  }

  // Check if MoltBot is installed by looking for config file
  async checkInstallation(): Promise<MoltBotStatus> {
    // In a browser environment, we simulate the check
    // In Electron/Tauri, we would use fs APIs to check ~/.clawdbot/moltbot.json

    // Simulate checking delay
    await this.delay(500);

    // Check localStorage for simulated install state
    const savedState = localStorage.getItem('moltbot_install_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      mockInstallState = parsed.status;
      mockConfig = parsed.config;
    }

    if (mockInstallState === 'not_installed') {
      return {
        installStatus: 'not_installed',
        isGatewayRunning: false,
      };
    }

    // If installed, try to connect to gateway
    const isGatewayRunning = await this.checkGateway();

    return {
      installStatus: isGatewayRunning ? 'connected' : 'configured',
      isGatewayRunning,
      version: mockConfig?.version || '2025.1.28',
      model: mockConfig?.model || 'anthropic/claude-opus-4-5',
    };
  }

  // Check if the gateway is running
  async checkGateway(): Promise<boolean> {
    // In a real implementation, we'd try to connect to the WebSocket
    // For demo purposes, we simulate based on stored state
    const savedState = localStorage.getItem('moltbot_gateway_running');
    return savedState === 'true';
  }

  // Connect to the MoltBot Gateway via WebSocket
  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // In production, this would be a real WebSocket connection
        // this.ws = new WebSocket(GATEWAY_URL);

        // Simulate connection
        setTimeout(() => {
          localStorage.setItem('moltbot_gateway_running', 'true');
          this.notifyListeners({
            installStatus: 'connected',
            isGatewayRunning: true,
            version: mockConfig?.version || '2025.1.28',
            model: mockConfig?.model || 'anthropic/claude-opus-4-5',
          });
          resolve(true);
        }, 1000);
      } catch {
        resolve(false);
      }
    });
  }

  // Simulate installation process
  async install(
    _method: 'npm' | 'script' | 'manual',
    onProgress: (progress: number, message: string) => void
  ): Promise<boolean> {
    const steps = [
      { progress: 10, message: 'Checking system requirements...' },
      { progress: 20, message: 'Downloading MoltBot...' },
      { progress: 40, message: 'Installing dependencies...' },
      { progress: 60, message: 'Setting up MoltBot...' },
      { progress: 75, message: 'Installing daemon service...' },
      { progress: 85, message: 'Configuring gateway...' },
      { progress: 95, message: 'Running moltbot doctor...' },
      { progress: 100, message: 'Installation complete!' },
    ];

    for (const step of steps) {
      await this.delay(800 + Math.random() * 400);
      onProgress(step.progress, step.message);
    }

    // Save installation state
    const config: MoltBotConfig = {
      installed: true,
      version: '2025.1.28',
      gatewayPort: GATEWAY_DEFAULT_PORT,
      gatewayUrl: GATEWAY_URL,
      model: 'anthropic/claude-opus-4-5',
      workspace: '~/clawd',
      configPath: CONFIG_PATH,
    };

    mockInstallState = 'configured';
    mockConfig = config;

    localStorage.setItem('moltbot_install_state', JSON.stringify({
      status: 'configured',
      config,
    }));

    return true;
  }

  // Configure MoltBot with user preferences
  async configure(options: Partial<MoltBotConfig>): Promise<boolean> {
    await this.delay(500);

    if (mockConfig) {
      mockConfig = { ...mockConfig, ...options };
      localStorage.setItem('moltbot_install_state', JSON.stringify({
        status: 'configured',
        config: mockConfig,
      }));
    }

    return true;
  }

  // Start the gateway daemon
  async startGateway(): Promise<boolean> {
    await this.delay(1000);
    localStorage.setItem('moltbot_gateway_running', 'true');
    return true;
  }

  // Stop the gateway daemon
  async stopGateway(): Promise<boolean> {
    await this.delay(500);
    localStorage.setItem('moltbot_gateway_running', 'false');
    this.ws?.close();
    this.ws = null;
    return true;
  }

  // Send a message to MoltBot
  async sendMessage(message: string): Promise<string> {
    // In production, this would send via WebSocket
    await this.delay(500 + Math.random() * 1000);

    // Simulate response
    const responses = [
      `I understand you're asking about "${message.slice(0, 30)}...". Let me help you with that.`,
      `Great question! Here's what I found...`,
      `I've processed your request. Here's the result...`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get installation commands for display
  getInstallCommands(method: 'npm' | 'script' | 'manual'): string[] {
    switch (method) {
      case 'npm':
        return [
          'npm install -g moltbot@latest',
          'moltbot onboard --install-daemon',
        ];
      case 'script':
        return [
          'curl -fsSL https://molt.bot/install-cli.sh | bash',
          'moltbot onboard --install-daemon',
        ];
      case 'manual':
        return [
          'git clone https://github.com/moltbot/moltbot.git',
          'cd moltbot',
          'pnpm install && pnpm build',
          'pnpm moltbot onboard --install-daemon',
        ];
    }
  }

  // Subscribe to status updates
  subscribe(listener: (status: MoltBotStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(status: MoltBotStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset installation (for testing)
  async reset(): Promise<void> {
    localStorage.removeItem('moltbot_install_state');
    localStorage.removeItem('moltbot_gateway_running');
    mockInstallState = 'not_installed';
    mockConfig = null;
  }
}

export const moltbotService = MoltBotService.getInstance();
