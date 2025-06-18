import { HerculesTestCase, HerculesTestResult, CreateTestCaseRequest, RunTestCaseRequest } from './types.js';
import { extensionConfig } from './config.js';

interface APIResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export class HerculesHTTPClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.timeout = extensionConfig.timeout;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async createTestCase(request: CreateTestCaseRequest): Promise<HerculesTestCase> {
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
          const errorData = await response.json() as APIResponse<any>;
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(`Failed to create test case: ${errorMessage}`);
      }

      const result = await response.json() as APIResponse<HerculesTestCase>;
      if (!result.testCase) {
        throw new Error('Invalid response: missing testCase data');
      }
      return result.testCase;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error creating test case: ${error}`);
    }
  }

  async runTestCase(request: RunTestCaseRequest): Promise<HerculesTestResult> {
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
          const errorData = await response.json() as APIResponse<any>;
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(`Failed to run test case: ${errorMessage}`);
      }

      const result = await response.json() as APIResponse<HerculesTestResult>;
      if (!result.result) {
        throw new Error('Invalid response: missing result data');
      }
      return result.result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error running test case: ${error}`);
    }
  }

  async listTestCases(): Promise<HerculesTestCase[]> {
    const response = await fetch(`${this.baseUrl}/tools/list_test_cases`);

    if (!response.ok) {
      const errorData = await response.json() as APIResponse<any>;
      throw new Error(errorData.error || 'Failed to list test cases');
    }

    const result = await response.json() as APIResponse<HerculesTestCase[]>;
    return result.testCases || [];
  }

  async getTestCase(testCaseId: string): Promise<HerculesTestCase | null> {
    const response = await fetch(`${this.baseUrl}/tools/get_test_case/${testCaseId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json() as APIResponse<any>;
      throw new Error(errorData.error || 'Failed to get test case');
    }

    const result = await response.json() as APIResponse<HerculesTestCase>;
    return result.testCase;
  }

  async getExecutionResults(testCaseId: string): Promise<HerculesTestResult | null> {
    try {
      // For now, we'll simulate getting execution results
      // In a real implementation, this would call a specific endpoint
      const response = await fetch(`${this.baseUrl}/tools/get_execution_results/${testCaseId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json() as APIResponse<any>;
        throw new Error(errorData.error || 'Failed to get execution results');
      }

      const result = await response.json() as APIResponse<HerculesTestResult>;
      return result.result;
    } catch (error) {
      // If the endpoint doesn't exist yet, return null
      console.log('Execution results endpoint not available:', error);
      return null;
    }
  }

  async listTools(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/tools`);

    if (!response.ok) {
      const errorData = await response.json() as APIResponse<any>;
      throw new Error(errorData.error || 'Failed to list tools');
    }

    const result = await response.json() as APIResponse<any[]>;
    return result.tools || [];
  }

  async listResources(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/resources`);

    if (!response.ok) {
      const errorData = await response.json() as APIResponse<any>;
      throw new Error(errorData.error || 'Failed to list resources');
    }

    const result = await response.json() as APIResponse<any[]>;
    return result.resources || [];
  }
} 