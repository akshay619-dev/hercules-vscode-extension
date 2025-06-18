"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const child_process_1 = require("child_process");
class MCPClient {
    constructor(serverPath) {
        this.serverPath = serverPath;
        this.process = null;
        this.messageId = 0;
        this.pendingRequests = new Map();
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.process = (0, child_process_1.spawn)('node', [this.serverPath], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            this.process.stdout?.on('data', (data) => {
                const messages = data.toString().split('\n').filter((line) => line.trim());
                for (const messageStr of messages) {
                    try {
                        const message = JSON.parse(messageStr);
                        this.handleMessage(message);
                    }
                    catch (error) {
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
    async disconnect() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
    handleMessage(message) {
        if (message.id && this.pendingRequests.has(message.id)) {
            const { resolve, reject } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            if (message.error) {
                reject(new Error(message.error.message));
            }
            else {
                resolve(message.result);
            }
        }
    }
    async sendRequest(method, params) {
        if (!this.process) {
            throw new Error('MCP client not connected');
        }
        const id = ++this.messageId;
        const message = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject });
            this.process.stdin?.write(JSON.stringify(message) + '\n');
        });
    }
    async listTools() {
        const response = await this.sendRequest('tools/list');
        return response.tools || [];
    }
    async callTool(name, arguments_) {
        const response = await this.sendRequest('tools/call', {
            name,
            arguments: arguments_
        });
        return response;
    }
    async listResources() {
        const response = await this.sendRequest('resources/list');
        return response.resources || [];
    }
    async readResource(uri) {
        const response = await this.sendRequest('resources/read', { uri });
        return response;
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=mcp-client.js.map