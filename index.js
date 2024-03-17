#!/usr/bin/env node
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed

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

program
  .command('execute <query...>')
  .description("Execute a shell command for a given query")
  .action((queryWords) => {
    const query = queryWords.join(' ').toLowerCase().trim();
    if (query.startsWith("commit ")) {
      const commitMessage = query.substring(7);
      const commands = [
        "git add .",
        `git commit -m "${commitMessage}"`,
        "git push"
      ];
      executeGitCommands(commands);
    } else {
      const command = commandsDB.buddy[query];
      if (command) {
        executeGitCommands([command]);
      } else {
        console.log("Command not found for query:", query);
      }
    }
  });

program
  .command('help', { isDefault: true })
  .description('Display help for using ShellBuddy')
  .action(() => {
    program.outputHelp();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
