"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HerculesHTTPClient = void 0;
const config_js_1 = require("./config.js");
class HerculesHTTPClient {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.timeout = config_js_1.extensionConfig.timeout;
    }
    async healthCheck() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            const response = await fetch(`${this.baseUrl}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    async createTestCase(request) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            const response = await fetch(`${this.baseUrl}/tools/create_test_case`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                }
                catch (parseError) {
                    // If we can't parse the error response, use the status text
                }
                throw new Error(`Failed to create test case: ${errorMessage}`);
            }
            const result = await response.json();
            if (!result.testCase) {
                throw new Error('Invalid response: missing testCase data');
            }
            return result.testCase;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Network error creating test case: ${error}`);
        }
    }
    async runTestCase(request) {
        try {
            const response = await fetch(`${this.baseUrl}/tools/run_test_case`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                }
                catch (parseError) {
                    // If we can't parse the error response, use the status text
                }
                throw new Error(`Failed to run test case: ${errorMessage}`);
            }
            const result = await response.json();
            if (!result.result) {
                throw new Error('Invalid response: missing result data');
            }
            return result.result;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Network error running test case: ${error}`);
        }
    }
    async listTestCases() {
        const response = await fetch(`${this.baseUrl}/tools/list_test_cases`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to list test cases');
        }
        const result = await response.json();
        return result.testCases || [];
    }
    async getTestCase(testCaseId) {
        const response = await fetch(`${this.baseUrl}/tools/get_test_case/${testCaseId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get test case');
        }
        const result = await response.json();
        return result.testCase;
    }
    async getExecutionResults(testCaseId) {
        try {
            // For now, we'll simulate getting execution results
            // In a real implementation, this would call a specific endpoint
            const response = await fetch(`${this.baseUrl}/tools/get_execution_results/${testCaseId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get execution results');
            }
            const result = await response.json();
            return result.result;
        }
        catch (error) {
            // If the endpoint doesn't exist yet, return null
            console.log('Execution results endpoint not available:', error);
            return null;
        }
    }
    async listTools() {
        const response = await fetch(`${this.baseUrl}/tools`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to list tools');
        }
        const result = await response.json();
        return result.tools || [];
    }
    async listResources() {
        const response = await fetch(`${this.baseUrl}/resources`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to list resources');
        }
        const result = await response.json();
        return result.resources || [];
    }
}
exports.HerculesHTTPClient = HerculesHTTPClient;
//# sourceMappingURL=http-client.js.map