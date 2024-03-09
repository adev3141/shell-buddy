#!/usr/bin/env node
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed

program
  .name("gitshellbuddy")
  .description("CLI tool to provide shell commands for common questions")
  .version("1.0.0");

// Command to display all available commands
program.command('display all commands')
  .description('Display all available commands')
  .action(() => {
    console.log('Available Commands:');
    for (const query in commandsDB.buddy) {
      console.log(`- ${query}`);
    }
  });

// Command to get a specific shell command for a query
program
  .arguments('<query...>')
  .description("Get the shell command for a query")
  .action((queryWords) => {
    const query = queryWords.join(' ').toLowerCase().trim();
    const command = commandsDB.buddy[query];
    if (command) {
      console.log(command);
    } else {
      console.log("Command not found for query:", query);
    }
  });

// Help command
program
  .command('help')
  .description('Display help for using ShellBuddy')
  .action(() => {
    console.log('Usage: buddy <query>');
    console.log('Example: buddy how to undo the last commit');
    // Add more detailed help instructions as needed
  });

program.parse(process.argv);
