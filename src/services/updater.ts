export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes: string;
  publishedAt: string;
}

export interface UpdaterState {
  isChecking: boolean;
  lastChecked: Date | null;
  updateAvailable: UpdateInfo | null;
  error: string | null;
}

const GITHUB_REPO = 'moltbot/moltbot';
// API URL for fetching releases (used in production with real fetch calls)
const _GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
void _GITHUB_API_URL; // Silence unused warning (used in production)
const CHECK_INTERVAL = 30 * 60 * 1000; // Check every 30 minutes
const CURRENT_VERSION = '2025.1.28'; // This would be injected at build time

class UpdaterService {
  private static instance: UpdaterService;
  private listeners: Set<(state: UpdaterState) => void> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private state: UpdaterState = {
    isChecking: false,
    lastChecked: null,
    updateAvailable: null,
    error: null,
  };

  static getInstance(): UpdaterService {
    if (!UpdaterService.instance) {
      UpdaterService.instance = new UpdaterService();
    }
    return UpdaterService.instance;
  }

  // Start periodic update checks
  startPeriodicChecks(): void {
    // Check immediately on start
    this.checkForUpdates();

    // Set up periodic checks
    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => {
        this.checkForUpdates();
      }, CHECK_INTERVAL);
    }
  }

  // Stop periodic update checks
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check for updates from GitHub
  async checkForUpdates(): Promise<UpdateInfo | null> {
    this.updateState({ isChecking: true, error: null });

    try {
      // In a real implementation, we'd fetch from GitHub API
      // For demo purposes, we'll simulate the check
      const response = await this.fetchGitHubRelease();

      this.updateState({
        isChecking: false,
        lastChecked: new Date(),
        updateAvailable: response.hasUpdate ? response : null,
      });

      return response.hasUpdate ? response : null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check for updates';
      this.updateState({
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage,
      });
      return null;
    }
  }

  // Fetch latest release from GitHub
  private async fetchGitHubRelease(): Promise<UpdateInfo> {
    // Simulate network delay
    await this.delay(1000);

    // In production, this would be:
    // const response = await fetch(GITHUB_API_URL);
    // const data = await response.json();

    // Simulate GitHub API response
    // Randomly show an update available for demo purposes
    const simulateUpdate = Math.random() > 0.7; // 30% chance of update
    const mockLatestVersion = simulateUpdate ? '2025.1.30' : CURRENT_VERSION;

    return {
      hasUpdate: this.compareVersions(mockLatestVersion, CURRENT_VERSION) > 0,
      currentVersion: CURRENT_VERSION,
      latestVersion: mockLatestVersion,
      releaseUrl: `https://github.com/${GITHUB_REPO}/releases/tag/v${mockLatestVersion}`,
      releaseNotes: simulateUpdate ? `
## What's New in v${mockLatestVersion}

### Features
- 🚀 Improved performance for large workspaces
- 🎨 New theme options in Settings
- 🤖 Enhanced agent collaboration

### Bug Fixes
- Fixed memory leak in long-running sessions
- Resolved WebSocket reconnection issues
- Improved error handling in Terminal

### Security
- Updated dependencies to patch vulnerabilities
      `.trim() : '',
      publishedAt: new Date().toISOString(),
    };
  }

  // Compare semantic versions
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  // Trigger update (would launch update process in real app)
  async performUpdate(): Promise<boolean> {
    // In a real Electron/Tauri app, this would:
    // 1. Download the update
    // 2. Verify the signature
    // 3. Apply the update
    // 4. Restart the application

    // For browser demo, we'll just simulate and show instructions
    console.log('Update would be performed here in a native app');

    // Clear update state after "updating"
    await this.delay(2000);
    this.updateState({
      updateAvailable: null,
    });

    return true;
  }

  // Get installation command for manual update
  getUpdateCommand(): string {
    return 'npm install -g moltbot@latest && moltbot update';
  }

  // Subscribe to state changes
  subscribe(listener: (state: UpdaterState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): UpdaterState {
    return this.state;
  }

  // Get current version
  getCurrentVersion(): string {
    return CURRENT_VERSION;
  }

  private updateState(partial: Partial<UpdaterState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const updaterService = UpdaterService.getInstance();
