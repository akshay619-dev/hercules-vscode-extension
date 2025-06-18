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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HerculesExtension = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const http_client_js_1 = require("./http-client.js");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_js_1 = require("./config.js");
class HerculesExtension {
    constructor() {
        this.httpClient = new http_client_js_1.HerculesHTTPClient(config_js_1.extensionConfig.serverUrl);
        this.testCasesProvider = new TestCasesProvider(this.httpClient);
        this.outputChannel = vscode.window.createOutputChannel('Hercules');
    }
    async activate(context) {
        try {
            // Check if server is running
            const isHealthy = await this.httpClient.healthCheck();
            if (!isHealthy) {
                throw new Error('Hercules MCP Server is not running. Please start it with: cd mcp-server && npm run start:http');
            }
            this.outputChannel.appendLine('Connected to Hercules MCP Server');
            // Register commands
            context.subscriptions.push(vscode.commands.registerCommand('hercules.createTestCase', () => this.createTestCase()), vscode.commands.registerCommand('hercules.runCurrentFile', () => this.runCurrentFile()), vscode.commands.registerCommand('hercules.runSelectedFile', () => this.runSelectedFile()), vscode.commands.registerCommand('hercules.listTestCases', () => this.listTestCases()), vscode.commands.registerCommand('hercules.viewResults', (testCaseOrItem) => {
                // Handle both direct test case and tree item with test case data
                let testCase;
                if (testCaseOrItem) {
                    if ('testCase' in testCaseOrItem) {
                        // It's a TestCaseItem with test case data
                        testCase = testCaseOrItem.testCase;
                    }
                    else {
                        // It's a direct HerculesTestCase
                        testCase = testCaseOrItem;
                    }
                }
                return this.viewResults(testCase);
            }), vscode.commands.registerCommand('hercules.viewExecutionResults', (testCaseOrItem) => {
                // Handle both direct test case and tree item with test case data
                let testCase;
                if (testCaseOrItem) {
                    if ('testCase' in testCaseOrItem) {
                        // It's a TestCaseItem with test case data
                        testCase = testCaseOrItem.testCase;
                    }
                    else {
                        // It's a direct HerculesTestCase
                        testCase = testCaseOrItem;
                    }
                }
                return this.viewExecutionResults(testCase);
            }));
            // Register tree data provider
            vscode.window.registerTreeDataProvider('herculesTestCases', this.testCasesProvider);
            // Refresh test cases periodically
            setInterval(() => {
                this.testCasesProvider.refresh();
            }, 30000); // Refresh every 30 seconds
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to connect to Hercules MCP Server: ${error}`);
        }
    }
    async deactivate() {
        // No cleanup needed for HTTP client
    }
    async createTestCase() {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter test case name',
            placeHolder: 'e.g., login-test'
        });
        if (!name)
            return;
        try {
            // Create the feature file name
            const fileName = `${name.replace(/\s+/g, '-').toLowerCase()}.feature`;
            // Get workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder found. Please open a folder in VS Code.');
                return;
            }
            const workspaceFolder = workspaceFolders[0];
            const filePath = path.join(workspaceFolder.uri.fsPath, fileName);
            // Check if file already exists
            if (fs.existsSync(filePath)) {
                const overwrite = await vscode.window.showWarningMessage(`File ${fileName} already exists. Do you want to overwrite it?`, 'Yes', 'No');
                if (overwrite !== 'Yes') {
                    return;
                }
            }
            // Create default Gherkin content
            const defaultContent = `Feature: ${name}
  As a user
  I want to ${name.replace(/-/g, ' ')}
  So that I can test the functionality

Scenario: ${name.replace(/-/g, ' ')}
  Given I am on the application
  When I perform the action
  Then I should see the expected result`;
            // Create the file
            fs.writeFileSync(filePath, defaultContent, 'utf-8');
            // Open the file in the editor
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
            vscode.window.showInformationMessage(`Test case file "${fileName}" created successfully!`);
            this.outputChannel.appendLine(`Created test case file: ${fileName}`);
            // Refresh the test cases view
            this.testCasesProvider.refresh();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create test case file: ${error}`);
            this.outputChannel.appendLine(`Error creating test case file: ${error}`);
        }
    }
    async runCurrentFile() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active file. Please open a .feature file.');
            return;
        }
        const document = activeEditor.document;
        if (document.languageId !== 'gherkin' && !document.fileName.endsWith('.feature')) {
            vscode.window.showErrorMessage('Current file is not a .feature file. Please open a .feature file to run tests.');
            return;
        }
        await this.runFeatureFile(document.fileName, document.getText());
    }
    async runSelectedFile() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }
        const workspaceFolder = workspaceFolders[0];
        // Find all .feature files in the workspace
        const featureFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(workspaceFolder, '**/*.feature'));
        if (featureFiles.length === 0) {
            vscode.window.showErrorMessage('No .feature files found in the workspace.');
            return;
        }
        // Show file picker
        const fileNames = featureFiles.map(file => path.relative(workspaceFolder.uri.fsPath, file.fsPath));
        const selectedFile = await vscode.window.showQuickPick(fileNames, {
            placeHolder: 'Select a .feature file to run'
        });
        if (!selectedFile)
            return;
        const selectedFilePath = path.join(workspaceFolder.uri.fsPath, selectedFile);
        const document = await vscode.workspace.openTextDocument(selectedFilePath);
        await this.runFeatureFile(selectedFilePath, document.getText());
    }
    async runFeatureFile(filePath, gherkinContent) {
        try {
            const fileName = path.basename(filePath, '.feature');
            vscode.window.showInformationMessage(`Running test from file: ${fileName}...`);
            this.outputChannel.appendLine(`Starting test from file: ${fileName}`);
            // First, check if server is still healthy
            const isHealthy = await this.httpClient.healthCheck();
            if (!isHealthy) {
                throw new Error('Hercules MCP Server is not responding. Please ensure it is running.');
            }
            this.outputChannel.appendLine(`Server health check passed`);
            // Create test case if it doesn't exist
            let testCase;
            try {
                this.outputChannel.appendLine(`Creating test case: ${fileName}`);
                testCase = await this.httpClient.createTestCase({
                    name: fileName,
                    gherkinContent
                });
                this.outputChannel.appendLine(`Test case created successfully: ${testCase.id}`);
            }
            catch (error) {
                this.outputChannel.appendLine(`Failed to create test case: ${error}`);
                // Test case might already exist, try to get it
                this.outputChannel.appendLine(`Attempting to find existing test case: ${fileName}`);
                const testCases = await this.httpClient.listTestCases();
                const existingTestCase = testCases.find(tc => tc.name === fileName);
                if (!existingTestCase) {
                    throw new Error(`Failed to create or find test case: ${fileName}. Error: ${error}`);
                }
                testCase = existingTestCase;
                this.outputChannel.appendLine(`Found existing test case: ${testCase.id}`);
            }
            // Run the test case
            this.outputChannel.appendLine(`Running test case: ${testCase.id}`);
            const result = await this.httpClient.runTestCase({
                testCaseId: testCase.id
            });
            const status = result.status || 'Unknown status';
            vscode.window.showInformationMessage(`Test completed: ${status}`);
            this.outputChannel.appendLine(`Test completed: ${status}`);
            // Show results
            await this.showTestResults(result, fileName);
            // Refresh the test cases view
            this.testCasesProvider.refresh();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to run test: ${errorMessage}`);
            this.outputChannel.appendLine(`Error running test: ${errorMessage}`);
            this.outputChannel.appendLine(`Stack trace: ${error instanceof Error ? error.stack : 'No stack trace'}`);
        }
    }
    async showTestResults(result, fileName) {
        const resultsContent = `Test Results for: ${fileName}
Status: ${result.status}
Execution Time: ${result.executionTime}ms
Timestamp: ${result.timestamp}

${result.error ? `Error: ${result.error}\n` : ''}

Screenshots: ${result.screenshots.length}
Videos: ${result.videos.length}
Logs: ${result.logs.length}
Network Logs: ${result.networkLogs.length}

${result.junitXml ? `JUnit XML: ${result.junitXml}\n` : ''}
${result.htmlReport ? `HTML Report: ${result.htmlReport}\n` : ''}`;
        const document = await vscode.workspace.openTextDocument({
            content: resultsContent,
            language: 'plaintext'
        });
        await vscode.window.showTextDocument(document);
    }
    async listTestCases() {
        try {
            const testCases = await this.httpClient.listTestCases();
            const testCaseList = testCases.map(tc => `- ${tc.name} (ID: ${tc.id}, Status: ${tc.status})`).join('\n');
            const content = testCaseList || 'No test cases found';
            const document = await vscode.workspace.openTextDocument({
                content,
                language: 'plaintext'
            });
            await vscode.window.showTextDocument(document);
            this.outputChannel.appendLine('Listed test cases');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to list test cases: ${error}`);
            this.outputChannel.appendLine(`Error listing test cases: ${error}`);
        }
    }
    async viewResults(testCase) {
        try {
            // If no testCase is provided, show a list to select from
            if (!testCase) {
                const testCases = await this.httpClient.listTestCases();
                if (testCases.length === 0) {
                    vscode.window.showInformationMessage('No test cases found. Please create and run a test case first.');
                    return;
                }
                // Show quick pick to select a test case
                const testCaseNames = testCases.map(tc => tc.name);
                const selectedName = await vscode.window.showQuickPick(testCaseNames, {
                    placeHolder: 'Select a test case to view results'
                });
                if (!selectedName) {
                    return; // User cancelled
                }
                testCase = testCases.find(tc => tc.name === selectedName);
                if (!testCase) {
                    vscode.window.showErrorMessage('Selected test case not found.');
                    return;
                }
            }
            // Validate testCase has required properties
            if (!testCase.id) {
                vscode.window.showErrorMessage('Invalid test case: missing ID');
                return;
            }
            this.outputChannel.appendLine(`Fetching details for test case: ${testCase.id}`);
            const testCaseDetails = await this.httpClient.getTestCase(testCase.id);
            if (!testCaseDetails) {
                vscode.window.showErrorMessage(`Test case not found: ${testCase.id}`);
                return;
            }
            const details = `Test Case: ${testCaseDetails.name}
ID: ${testCaseDetails.id}
Status: ${testCaseDetails.status}
Created: ${testCaseDetails.createdAt}
Updated: ${testCaseDetails.updatedAt}

Gherkin Content:
${testCaseDetails.gherkinContent}`;
            const document = await vscode.workspace.openTextDocument({
                content: details,
                language: 'plaintext'
            });
            await vscode.window.showTextDocument(document);
            this.outputChannel.appendLine(`Viewed results for: ${testCase.name}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to view results: ${errorMessage}`);
            this.outputChannel.appendLine(`Error viewing results: ${errorMessage}`);
        }
    }
    async viewExecutionResults(testCase) {
        try {
            // If no testCase is provided, show a list to select from
            if (!testCase) {
                const testCases = await this.httpClient.listTestCases();
                if (testCases.length === 0) {
                    vscode.window.showInformationMessage('No test cases found. Please create and run a test case first.');
                    return;
                }
                // Show quick pick to select a test case
                const testCaseNames = testCases.map(tc => tc.name);
                const selectedName = await vscode.window.showQuickPick(testCaseNames, {
                    placeHolder: 'Select a test case to view execution results'
                });
                if (!selectedName) {
                    return; // User cancelled
                }
                testCase = testCases.find(tc => tc.name === selectedName);
                if (!testCase) {
                    vscode.window.showErrorMessage('Selected test case not found.');
                    return;
                }
            }
            // Validate testCase has required properties
            if (!testCase.id) {
                vscode.window.showErrorMessage('Invalid test case: missing ID');
                return;
            }
            this.outputChannel.appendLine(`Fetching execution results for test case: ${testCase.id}`);
            const executionResults = await this.httpClient.getExecutionResults(testCase.id);
            if (!executionResults) {
                // Show a more helpful message
                const message = `No execution results found for test case "${testCase.name}". 
        
This could mean:
1. The test case hasn't been executed yet
2. The test execution failed
3. The results were cleared

To get execution results, please run the test case first using "Hercules: Run Current Feature File" or "Hercules: Run Selected Feature File".`;
                const document = await vscode.workspace.openTextDocument({
                    content: message,
                    language: 'plaintext'
                });
                await vscode.window.showTextDocument(document);
                return;
            }
            const resultsContent = `Execution Results for: ${testCase.name}
Status: ${executionResults.status}
Execution Time: ${executionResults.executionTime}ms
Timestamp: ${executionResults.timestamp}

${executionResults.error ? `Error: ${executionResults.error}\n` : ''}

Screenshots: ${executionResults.screenshots.length}
${executionResults.screenshots.length > 0 ? `Screenshot Files:\n${executionResults.screenshots.map(s => `  - ${s}`).join('\n')}\n` : ''}

Videos: ${executionResults.videos.length}
${executionResults.videos.length > 0 ? `Video Files:\n${executionResults.videos.map(v => `  - ${v}`).join('\n')}\n` : ''}

Logs: ${executionResults.logs.length}
${executionResults.logs.length > 0 ? `Log Files:\n${executionResults.logs.map(l => `  - ${l}`).join('\n')}\n` : ''}

Network Logs: ${executionResults.networkLogs.length}
${executionResults.networkLogs.length > 0 ? `Network Log Files:\n${executionResults.networkLogs.map(n => `  - ${n}`).join('\n')}\n` : ''}

${executionResults.junitXml ? `JUnit XML Report: ${executionResults.junitXml}\n` : ''}
${executionResults.htmlReport ? `HTML Report: ${executionResults.htmlReport}\n` : ''}

${executionResults.screenshots.length === 0 && executionResults.logs.length === 0 ?
                'Note: No output files found. This might indicate the test was executed but no artifacts were generated, or the test is using mock implementation.' : ''}`;
            const document = await vscode.workspace.openTextDocument({
                content: resultsContent,
                language: 'plaintext'
            });
            await vscode.window.showTextDocument(document);
            this.outputChannel.appendLine(`Viewed execution results for: ${testCase.name}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to view execution results: ${errorMessage}`);
            this.outputChannel.appendLine(`Error viewing execution results: ${errorMessage}`);
        }
    }
}
exports.HerculesExtension = HerculesExtension;
class TestCasesProvider {
    constructor(httpClient) {
        this.httpClient = httpClient;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (element) {
            return [];
        }
        try {
            const testCases = await this.httpClient.listTestCases();
            return testCases.map(tc => {
                const item = new TestCaseItem(tc.name, tc.id, tc.status);
                // Store the full test case data for context menu actions
                item.testCase = tc;
                return item;
            });
        }
        catch (error) {
            console.error('Failed to get test cases:', error);
            return [];
        }
    }
}
class TestCaseItem extends vscode.TreeItem {
    constructor(name, id, status) {
        super(name, vscode.TreeItemCollapsibleState.None);
        this.name = name;
        this.id = id;
        this.status = status;
        this.tooltip = `${name} (${status})`;
        this.description = status;
        // Store test case data for context menu actions
        this.contextValue = 'testCase';
        // Set icon based on status
        switch (status) {
            case 'ready':
                this.iconPath = new vscode.ThemeIcon('circle-outline');
                break;
            case 'running':
                this.iconPath = new vscode.ThemeIcon('sync~spin');
                break;
            case 'completed':
                this.iconPath = new vscode.ThemeIcon('check');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('file');
        }
    }
}
function activate(context) {
    const extension = new HerculesExtension();
    extension.activate(context);
    context.subscriptions.push({
        dispose: () => extension.deactivate()
    });
}
function deactivate() {
    // Cleanup is handled in the extension class
}
//# sourceMappingURL=extension.js.map