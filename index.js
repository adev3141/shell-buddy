#!/usr/bin/env node
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed
const { execSync } = require('child_process');


function executeGitCommands(commands) {
  try {
    commands.forEach(command => {
      console.log(`Executing: ${command}`);
      const result = execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
      console.log(result);
    });
  } catch (error) {
    // Only log an error if the command really failed
    if (!error.stdout.toString().includes("nothing to commit, working tree clean")) {
      console.error(`Error executing command '${error.cmd}': ${error.message}`);
    } else {
      console.log("No changes to commit. Proceeding with remaining commands.");
    }
  }
}

function setupGitShellBuddy(args = process.argv) {

  program
    .name("gitshellbuddy")
    .description("CLI tool to provide git commands for common operations")
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

  // Command to get a specific shell command for a query or git commit
  program
    .arguments('<query...>')
    .description("Get the shell command for a query")
    .action((queryWords) => {
      const query = queryWords.join(' ').toLowerCase().trim();
      
      if (query.startsWith("commit ")) {
        const commitMessage = query.substring(7); // Extract commit message
        const commands = [
          "git add .",
          `git commit -m "${commitMessage}"`,
          "git push"
        ];
        executeGitCommands(commands);
      } else {
        const command = commandsDB.buddy[query];
        if (command) {
          console.log(command);
        } else {
          console.log("Command not found for query:", query);
        }
      }
    });

  // Help command
  program
    .command('help')
    .description('Display help for the usage ShellBuddy')
    .action(() => {
      console.log('Usage: call me like this: buddy <query>');
      console.log('Example: buddy how to undo the last commit');
    });

    

  program.parse(args);
  // Display help if no command is given.
  if (!process.argv.slice(2).length) {
  program.outputHelp();
}
}

function initializeGitShellBuddy(args = process.argv) {
  program.parse(args);
}


// If this script is run directly, initialize with process.argv
// Only call setup if this is the main module
if (require.main === module) {
  setupGitShellBuddy();
  initializeGitShellBuddy();
}


module.exports = { initializeGitShellBuddy, setupGitShellBuddy, executeGitCommands };
