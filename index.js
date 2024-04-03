#!/usr/bin/env node
require('dotenv').config();
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed
const { queryOpenAI, processAIResponse } = require('./LLMController');
const { execSync } = require('child_process');

function executeGitCommands(commands) {
  commands.forEach(command => {
    console.log(`Executing: ${command}`);
    try {
      const result = execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
      console.log(result);
    } catch (error) {
      console.error(`Error executing command '${error.cmd}': ${error.message}`);
    }
  });
}

program
  .name("gitshellbuddy")
  .description("CLI tool to provide git commands for common operations")
  .version("1.0.0-beta.1");

program.command('display')
  .description('Display all available commands')
  .action(() => {
    console.log('Available Commands:');
    for (const query in commandsDB.buddy) {
      console.log(`- ${query}`);
    }
  });

// Specific command for handling commits
program.command('commit <message...>')
  .description("Commit changes with a message")
  .action((messageParts) => {
    const commitMessage = messageParts.join(' '); // Correctly join the commit message parts.
    const commands = [
      "git add .",
      `git commit -m "${commitMessage}"`,
      "git push"
    ];
    executeGitCommands(commands);
  });

program
  .command('help', { isDefault: true })
  .description('Display help for using ShellBuddy')
  .action(() => {
    program.outputHelp();
  });

program.command('how to <query...>')
  .description('Ask a Git related question')
  .action(async (...args) => {
      const queryParts = args.slice(0, -1); // Removes the last argument (command object)
      console.log('queryParts:', queryParts);
      const query = queryParts.join(' ');
      const aiResponse = await queryOpenAI(`Git: ${query}`);
      processAIResponse(aiResponse);
  });



program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
