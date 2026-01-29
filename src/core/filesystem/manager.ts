import { EventEmitter } from 'events'
import { promises as fs } from 'fs'
import { join, dirname, extname, basename } from 'path'

export interface FileStats {
  name: string
  path: string
  size: number
  type: 'file' | 'directory'
  mimeType?: string
  modified: Date
  created: Date
  permissions: {
    read: boolean
    write: boolean
    execute: boolean
  }
  isHidden: boolean
}

export interface VirtualFileSystem {
  root: string
  mounted: Map<string, string>
  permissions: Map<string, string[]>
}

export class FileSystemManager extends EventEmitter {
  private vfs: VirtualFileSystem
  private watchers: Map<string, any>
  private allowedPaths: string[]

  constructor() {
    super()
    this.vfs = {
      root: process.cwd(),
      mounted: new Map(),
      permissions: new Map()
    }
    this.watchers = new Map()
    this.allowedPaths = [
      join(process.cwd(), 'user'),
      join(process.cwd(), 'downloads'),
      join(process.cwd(), 'documents'),
      join(process.cwd(), 'pictures'),
      join(process.cwd(), 'applications')
    ]
  }

  async initialize(): Promise<void> {
    console.log('📁 FileSystem Manager initializing...')
    
    await this.createDefaultDirectories()
    await this.setupVirtualMounts()
    await this.initializeWatchers()
    
    console.log('✅ FileSystem Manager initialized')
    this.emit('fs:ready')
  }

  private async createDefaultDirectories(): Promise<void> {
    const defaultDirs = [
      'user/Desktop',
      'user/Documents',
      'user/Downloads',
      'user/Pictures',
      'user/Music',
      'user/Movies',
      'applications',
      'system',
      'tmp'
    ]

    for (const dir of defaultDirs) {
      const fullPath = join(this.vfs.root, dir)
      try {
        await fs.mkdir(fullPath, { recursive: true })
      } catch (error) {
        console.warn(`Failed to create directory: ${fullPath}`, error)
      }
    }
  }

  private async setupVirtualMounts(): Promise<void> {
    // Mount system directories
    this.vfs.mounted.set('/Desktop', join(this.vfs.root, 'user/Desktop'))
    this.vfs.mounted.set('/Documents', join(this.vfs.root, 'user/Documents'))
    this.vfs.mounted.set('/Downloads', join(this.vfs.root, 'user/Downloads'))
    this.vfs.mounted.set('/Pictures', join(this.vfs.root, 'user/Pictures'))
    this.vfs.mounted.set('/Music', join(this.vfs.root, 'user/Music'))
    this.vfs.mounted.set('/Movies', join(this.vfs.root, 'user/Movies'))
    this.vfs.mounted.set('/Applications', join(this.vfs.root, 'applications'))
  }

  private async initializeWatchers(): Promise<void> {
    // Watch important directories for changes
    const watchPaths = [
      'user/Desktop',
      'user/Documents',
      'user/Downloads',
      'applications'
    ]

    for (const path of watchPaths) {
      try {
        const fullPath = join(this.vfs.root, path)
        const watcher = fs.watch(fullPath, (eventType, filename) => {
          this.emit('fs:change', { path, eventType, filename })
        })
        this.watchers.set(path, watcher)
      } catch (error) {
        console.warn(`Failed to watch directory: ${path}`, error)
      }
    }
  }

  private resolvePath(path: string): string {
    // Handle virtual mount points
    for (const [mountPoint, realPath] of this.vfs.mounted.entries()) {
      if (path.startsWith(mountPoint)) {
        return path.replace(mountPoint, realPath)
      }
    }
    
    // Default to user directory if relative path
    if (!path.startsWith('/') && !path.startsWith(this.vfs.root)) {
      return join(this.vfs.root, 'user', path)
    }
    
    return path
  }

  private checkPermissions(path: string, operation: 'read' | 'write' | 'execute'): boolean {
    const resolvedPath = this.resolvePath(path)
    
    // Check if path is in allowed directories
    const isAllowed = this.allowedPaths.some(allowedPath => 
      resolvedPath.startsWith(allowedPath)
    )
    
    if (!isAllowed) {
      console.warn(`Access denied: ${resolvedPath}`)
      return false
    }
    
    // Additional permission checks could go here
    return true
  }

  async readFile(path: string): Promise<string> {
    if (!this.checkPermissions(path, 'read')) {
      throw new Error('Permission denied')
    }
    
    try {
      const resolvedPath = this.resolvePath(path)
      const content = await fs.readFile(resolvedPath, 'utf-8')
      
      this.emit('fs:read', { path: resolvedPath })
      return content
    } catch (error) {
      console.error(`Failed to read file: ${path}`, error)
      throw error
    }
  }

  async writeFile(path: string, data: string): Promise<void> {
    if (!this.checkPermissions(path, 'write')) {
      throw new Error('Permission denied')
    }
    
    try {
      const resolvedPath = this.resolvePath(path)
      
      // Ensure directory exists
      await fs.mkdir(dirname(resolvedPath), { recursive: true })
      
      await fs.writeFile(resolvedPath, data, 'utf-8')
      
      this.emit('fs:write', { path: resolvedPath, size: data.length })
    } catch (error) {
      console.error(`Failed to write file: ${path}`, error)
      throw error
    }
  }

  async readDirectory(path: string): Promise<FileStats[]> {
    if (!this.checkPermissions(path, 'read')) {
      throw new Error('Permission denied')
    }
    
    try {
      const resolvedPath = this.resolvePath(path)
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true })
      
      const files: FileStats[] = []
      
      for (const entry of entries) {
        try {
          const filePath = join(resolvedPath, entry.name)
          const stats = await fs.stat(filePath)
          
          files.push({
            name: entry.name,
            path: filePath,
            size: stats.size,
            type: entry.isDirectory() ? 'directory' : 'file',
            mimeType: entry.isFile() ? this.getMimeType(entry.name) : undefined,
            modified: stats.mtime,
            created: stats.birthtime,
            permissions: {
              read: true,
              write: true,
              execute: entry.isDirectory()
            },
            isHidden: entry.name.startsWith('.')
          })
        } catch (error) {
          console.warn(`Failed to stat file: ${entry.name}`, error)
        }
      }
      
      this.emit('fs:list', { path: resolvedPath, count: files.length })
      return files.sort((a, b) => {
        // Directories first, then files, alphabetically
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      console.error(`Failed to read directory: ${path}`, error)
      throw error
    }
  }

  async createDirectory(path: string): Promise<void> {
    if (!this.checkPermissions(path, 'write')) {
      throw new Error('Permission denied')
    }
    
    try {
      const resolvedPath = this.resolvePath(path)
      await fs.mkdir(resolvedPath, { recursive: true })
      
      this.emit('fs:mkdir', { path: resolvedPath })
    } catch (error) {
      console.error(`Failed to create directory: ${path}`, error)
      throw error
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.checkPermissions(path, 'write')) {
      throw new Error('Permission denied')
    }
    
    try {
      const resolvedPath = this.resolvePath(path)
      const stats = await fs.stat(resolvedPath)
      
      if (stats.isDirectory()) {
        await fs.rmdir(resolvedPath, { recursive: true })
      } else {
        await fs.unlink(resolvedPath)
      }
      
      this.emit('fs:delete', { path: resolvedPath, type: stats.isDirectory() ? 'directory' : 'file' })
    } catch (error) {
      console.error(`Failed to delete file: ${path}`, error)
      throw error
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      const resolvedPath = this.resolvePath(path)
      await fs.access(resolvedPath)
      return true
    } catch {
      return false
    }
  }

  async moveFile(from: string, to: string): Promise<void> {
    if (!this.checkPermissions(from, 'write') || !this.checkPermissions(to, 'write')) {
      throw new Error('Permission denied')
    }
    
    try {
      const fromPath = this.resolvePath(from)
      const toPath = this.resolvePath(to)
      
      await fs.rename(fromPath, toPath)
      
      this.emit('fs:move', { from: fromPath, to: toPath })
    } catch (error) {
      console.error(`Failed to move file: ${from} -> ${to}`, error)
      throw error
    }
  }

  async copyFile(from: string, to: string): Promise<void> {
    if (!this.checkPermissions(from, 'read') || !this.checkPermissions(to, 'write')) {
      throw new Error('Permission denied')
    }
    
    try {
      const fromPath = this.resolvePath(from)
      const toPath = this.resolvePath(to)
      
      // Ensure target directory exists
      await fs.mkdir(dirname(toPath), { recursive: true })
      
      await fs.copyFile(fromPath, toPath)
      
      this.emit('fs:copy', { from: fromPath, to: toPath })
    } catch (error) {
      console.error(`Failed to copy file: ${from} -> ${to}`, error)
      throw error
    }
  }

  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.js': 'text/javascript',
      '.ts': 'text/typescript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime'
    }
    
    return mimeTypes[ext] || 'application/octet-stream'
  }

  getStorageInfo(): any {
    return {
      total: 1073741824000, // 1TB
      used: Math.random() * 500000000000, // Random usage up to 500GB
      available: 573741824000, // Remaining space
      mountPoints: Array.from(this.vfs.mounted.entries()),
      watchedPaths: Array.from(this.watchers.keys())
    }
  }

  async search(query: string, path?: string): Promise<FileStats[]> {
    const searchPath = path || '/Documents'
    
    if (!this.checkPermissions(searchPath, 'read')) {
      throw new Error('Permission denied')
    }
    
    try {
      const files = await this.readDirectory(searchPath)
      
      // Simple filename search
      const results = files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      )
      
      this.emit('fs:search', { query, path: searchPath, results: results.length })
      return results
    } catch (error) {
      console.error(`Search failed: ${query}`, error)
      throw error
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧹 FileSystem Manager cleaning up...')
    
    // Close all watchers
    for (const [path, watcher] of this.watchers.entries()) {
      try {
        watcher.close()
        console.log(`Closed watcher for: ${path}`)
      } catch (error) {
        console.warn(`Failed to close watcher for ${path}:`, error)
      }
    }
    
    this.watchers.clear()
    this.emit('fs:cleanup')
    
    console.log('✅ FileSystem Manager cleanup complete')
  }
}

export default FileSystemManager