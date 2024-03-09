#!/usr/bin/env node
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Your commands JSON file

program
  .name("shellbuddy")
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
    const query = queryWords.join(' ').toLowerCase();
    const command = commandsDB.buddy[query];
    if (command) {
      console.log(command);
    } else {
      console.log("Command not found for query:", query);
    }
  });

program.parse(process.argv);
