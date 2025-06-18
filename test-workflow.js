#!/usr/bin/env node

/**
 * Test Script for Hercules VS Code Extension Workflow
 * 
 * This script demonstrates the new file-based workflow:
 * 1. Create .feature files
 * 2. Edit Gherkin content
 * 3. Run tests from files
 * 4. View results
 */

const fs = require('fs');
const path = require('path');

// Example test cases to demonstrate the workflow
const exampleTestCases = [
  {
    name: 'login-test',
    content: `Feature: Login Functionality
  As a user
  I want to log into the application
  So that I can access my account

Scenario: Successful Login
  Given I am on the login page
  When I enter valid username and password
  And I click the login button
  Then I should be logged in successfully
  And I should see the dashboard

Scenario: Failed Login
  Given I am on the login page
  When I enter invalid username and password
  And I click the login button
  Then I should see an error message
  And I should remain on the login page`
  },
  {
    name: 'user-registration',
    content: `Feature: User Registration
  As a new user
  I want to register for an account
  So that I can access the application

Scenario: Successful Registration
  Given I am on the registration page
  When I fill in valid registration details
  And I accept the terms and conditions
  And I click the register button
  Then I should be registered successfully
  And I should receive a confirmation email`
  },
  {
    name: 'api-endpoint-test',
    content: `Feature: API Endpoint Testing
  As a developer
  I want to test API endpoints
  So that I can ensure they work correctly

Scenario: GET Request Test
  Given I have a valid API endpoint
  When I send a GET request
  Then I should receive a 200 status code
  And the response should contain valid JSON data

Scenario: POST Request Test
  Given I have a valid API endpoint
  When I send a POST request with valid data
  Then I should receive a 201 status code
  And the resource should be created successfully`
  }
];

function createExampleFiles() {
  console.log('🚀 Creating example .feature files for testing...\n');
  
  exampleTestCases.forEach(testCase => {
    const fileName = `${testCase.name}.feature`;
    const filePath = path.join(process.cwd(), fileName);
    
    try {
      fs.writeFileSync(filePath, testCase.content, 'utf-8');
      console.log(`✅ Created: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to create ${fileName}:`, error.message);
    }
  });
  
  console.log('\n📝 Next Steps:');
  console.log('1. Open VS Code in this directory');
  console.log('2. Install the Hercules extension');
  console.log('3. Start the Hercules MCP server: cd mcp-server && npm run start:http');
  console.log('4. Press F5 to run the extension');
  console.log('5. Try the commands:');
  console.log('   - "Hercules: Run Current Feature File" (when .feature file is open)');
  console.log('   - "Hercules: Run Selected Feature File" (to pick from list)');
  console.log('   - "Hercules: List Test Cases" (to see all tests)');
}

function cleanupExampleFiles() {
  console.log('🧹 Cleaning up example .feature files...\n');
  
  exampleTestCases.forEach(testCase => {
    const fileName = `${testCase.name}.feature`;
    const filePath = path.join(process.cwd(), fileName);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed: ${fileName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to remove ${fileName}:`, error.message);
    }
  });
}

function showUsage() {
  console.log(`
🎯 Hercules VS Code Extension - Workflow Test Script

Usage:
  node test-workflow.js create    # Create example .feature files
  node test-workflow.js cleanup   # Remove example .feature files
  node test-workflow.js help      # Show this help message

Examples:
  node test-workflow.js create    # Creates login-test.feature, user-registration.feature, etc.
  node test-workflow.js cleanup   # Removes all example .feature files

Workflow:
  1. Run 'node test-workflow.js create' to create example files
  2. Open VS Code in this directory
  3. Start Hercules MCP server: cd mcp-server && npm run start:http
  4. Press F5 to run the extension
  5. Test the commands with the created .feature files
  6. Run 'node test-workflow.js cleanup' when done
`);
}

// Main execution
const command = process.argv[2] || 'help';

switch (command) {
  case 'create':
    createExampleFiles();
    break;
  case 'cleanup':
    cleanupExampleFiles();
    break;
  case 'help':
  default:
    showUsage();
    break;
} 