import { spawn, ChildProcess } from 'child_process';
import { MCPMessage } from './types.js';

export class MCPClient {
  private process: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests = new Map<string | number, { resolve: (value: any) => void; reject: (error: any) => void }>();

  constructor(private serverPath: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.stdout?.on('data', (data) => {
        const messages = data.toString().split('\n').filter((line: string) => line.trim());
        
        for (const messageStr of messages) {
          try {
            const message: MCPMessage = JSON.parse(messageStr);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse MCP message:', messageStr, error);
          }
        }
      });

      this.process.stderr?.on('data', (data) => {
        console.error('MCP Server stderr:', data.toString());
      });

      this.process.on('error', (error) => {
        reject(error);
      });

      this.process.on('close', (code) => {
        console.log(`MCP Server process exited with code ${code}`);
      });

      // Wait a bit for the server to initialize
      setTimeout(resolve, 1000);
    });
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  private handleMessage(message: MCPMessage): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
    }
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.process) {
      throw new Error('MCP client not connected');
    }

    const id = ++this.messageId;
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      this.process!.stdin?.write(JSON.stringify(message) + '\n');
    });
  }

  async listTools(): Promise<any[]> {
    const response = await this.sendRequest('tools/list');
    return response.tools || [];
  }

  async callTool(name: string, arguments_: any): Promise<any> {
    const response = await this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    });
    return response;
  }

  async listResources(): Promise<any[]> {
    const response = await this.sendRequest('resources/list');
    return response.resources || [];
  }

  async readResource(uri: string): Promise<any> {
    const response = await this.sendRequest('resources/read', { uri });
    return response;
  }
} 