#!/usr/bin/env node

const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Your commands JSON file

program
  .name("buddy")
  .description("CLI tool to provide shell commands for common questions")
  .version("1.0.0");

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
