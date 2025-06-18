export interface HerculesTestCase {
  id: string;
  name: string;
  gherkinContent: string;
  testDataPath?: string;
  outputPath?: string;
  llmModel?: string;
  llmApiKey?: string;
  status: 'draft' | 'ready' | 'running' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface HerculesTestResult {
  id: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  executionTime: number;
  costMetrics?: Record<string, any>;
  screenshots: string[];
  videos: string[];
  logs: string[];
  networkLogs: string[];
  junitXml: string;
  htmlReport: string;
  error?: string;
  timestamp: string;
}

export interface CreateTestCaseRequest {
  name: string;
  gherkinContent: string;
  testDataPath?: string;
  outputPath?: string;
  llmModel?: string;
  llmApiKey?: string;
}

export interface RunTestCaseRequest {
  testCaseId: string;
  llmModel?: string;
  llmApiKey?: string;
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
} 