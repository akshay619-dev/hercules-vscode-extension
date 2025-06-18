"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionConfig = void 0;
exports.loadConfig = loadConfig;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
const vscode = __importStar(require("vscode"));
// Load environment variables from .env file
dotenv_1.default.config();
function loadConfig() {
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
function validateConfig(config) {
    const errors = [];
    // Validate server URL
    try {
        new URL(config.serverUrl);
    }
    catch (error) {
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
exports.extensionConfig = loadConfig();
// Validate on load
try {
    validateConfig(exports.extensionConfig);
    console.log('✅ Extension configuration loaded successfully');
    console.log(`🌐 Server URL: ${exports.extensionConfig.serverUrl}`);
    console.log(`⏱️  Timeout: ${exports.extensionConfig.timeout}ms`);
    console.log(`🐛 Debug: ${exports.extensionConfig.enableDebugLogging}`);
}
catch (error) {
    console.error('❌ Extension configuration validation failed:', error);
    // Don't exit for extension, just log the error
}
//# sourceMappingURL=config.js.map