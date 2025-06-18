import dotenv from 'dotenv';
import * as vscode from 'vscode';

// Load environment variables from .env file
dotenv.config();

export interface ExtensionConfig {
  serverUrl: string;
  serverPort: number;
  serverHost: string;
  timeout: number;
  enableDebugLogging: boolean;
  autoConnect: boolean;
}

export function loadConfig(): ExtensionConfig {
  // Get configuration from VS Code settings first, then fall back to environment variables
  const config = vscode.workspace.getConfiguration('hercules');
  
  return {
    serverUrl: config.get('serverUrl') || 
               process.env.HERCULES_SERVER_URL || 
               `http://${process.env.HERCULES_SERVER_HOST || 'localhost'}:${process.env.HERCULES_SERVER_PORT || '3000'}`,
    serverPort: parseInt(process.env.HERCULES_SERVER_PORT || '3000', 10),
    serverHost: process.env.HERCULES_SERVER_HOST || 'localhost',
    timeout: parseInt(process.env.HERCULES_TIMEOUT || '30000', 10),
    enableDebugLogging: process.env.HERCULES_DEBUG === 'true' || config.get('debug', false),
    autoConnect: config.get('autoConnect', true)
  };
}

export function validateConfig(config: ExtensionConfig): void {
  const errors: string[] = [];

  // Validate server URL
  try {
    new URL(config.serverUrl);
  } catch (error) {
    errors.push(`Invalid server URL: ${config.serverUrl}`);
  }

  // Validate port
  if (config.serverPort < 1 || config.serverPort > 65535) {
    errors.push(`Invalid server port: ${config.serverPort}`);
  }

  // Validate timeout
  if (config.timeout < 1000) {
    errors.push(`Timeout too low: ${config.timeout}ms`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Export a singleton config instance
export const extensionConfig = loadConfig();

// Validate on load
try {
  validateConfig(extensionConfig);
  console.log('✅ Extension configuration loaded successfully');
  console.log(`🌐 Server URL: ${extensionConfig.serverUrl}`);
  console.log(`⏱️  Timeout: ${extensionConfig.timeout}ms`);
  console.log(`🐛 Debug: ${extensionConfig.enableDebugLogging}`);
} catch (error) {
  console.error('❌ Extension configuration validation failed:', error);
  // Don't exit for extension, just log the error
} 