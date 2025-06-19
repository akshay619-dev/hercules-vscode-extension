# Hercules MCP Server & VS Code Extension

A Model Context Protocol (MCP) server and VS Code extension that provides seamless integration with Hercules test automation framework. This project enables developers to write, trigger, and view Hercules test cases directly from VS Code.




### VS Code Extension
- **Test Case Creation**: Create new test cases through intuitive UI
- **Test Execution**: Run tests with a single click
- **Results Viewer**: View test results, screenshots, and logs in VS Code
- **Test Case Explorer**: Browse all test cases in a dedicated sidebar
- **Real-time Updates**: Live status updates during test execution

## 📁 Project Structure

├── hercules-vscode-extension/     # VS Code extension
│   ├── src/
│   │   ├── types.ts      # Extension type definitions
│   │   ├── mcp-client.ts # MCP client for extension
│   │   └── extension.ts  # Main extension code
│   ├── package.json      # Extension manifest
│   └── tsconfig.json     # TypeScript configuration





## 🛠️ Installation & Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **Hercules Framework** (installed in `../your_path/testzeus-hercules`)
4. **VS Code** (v1.85 or higher)


1. Navigate to the extension directory:
   ```bash
   git clone git@github.com:akshay619-dev/hercules-vscode-extension.git
   cd hercules-vscode-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run compile
   ```

4. Open the extension in VS Code:
   ```bash
   code .
   ```

5. Press `F5` to run the extension in a new VS Code window

## 🎯 Usage

### Commands to use

1. Hercules: Run Current Feature File
2. Hercules: Run Selected Feature File
3. Hercules: List Test Cases
4. Hercules: View Test Results
5. Hercules: View Execution Results


### Creating a Test Case

1. Open VS Code with the Hercules extension
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Hercules: Create Test Case"
4. Enter the test case name
5. Enter the Gherkin feature content

Example Gherkin content:
```gherkin
Feature: Login Functionality
Scenario: Successful Login
  Given I am on the login page
  When I enter valid credentials
  And I click the login button
  Then I should be logged in successfully
```

### Running a Test Case

1. Open the Hercules sidebar (Hercules icon in the activity bar)
2. Right-click on a test case
3. Select "Run Test Case"
4. Monitor the progress in the output channel

### Viewing Results

1. After test execution, right-click on the test case
2. Select "View Results"
3. Review the test results, logs, and screenshots


### VS Code Extension Configuration

The extension automatically connects to the MCP server. The server path is configured in `hercules-vscode-extension/src/extension.ts`:

```typescript
const serverPath = path.join(__dirname, '..', '..', 'hercules-mcp-server', 'dist', 'index.js');
```

## 🧪 Testing

### Test the VS Code Extension

1. Open the extension in VS Code
2. Use the command palette to test all commands
3. Check the output channel for logs and errors

## 🔍 Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   - Ensure the Hercules framework is installed and accessible
   - Check that the server path is correct
   - Verify Python environment and dependencies

2. **Test Execution Fails**
   - Check Hercules framework logs
   - Verify LLM API key configuration
   - Ensure test data files are accessible

3. **Extension Not Loading**
   - Check VS Code console for errors
   - Verify TypeScript compilation
   - Ensure all dependencies are installed

### Debug Mode

To enable debug logging:

1. Set environment variable: `DEBUG=hercules:*`
2. Check VS Code Developer Tools console
3. Monitor the Hercules output channel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Hercules Framework](https://github.com/test-zeus-ai/testzeus-hercules) - The underlying test automation framework
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [VS Code Extension API](https://code.visualstudio.com/api) - The extension development framework 