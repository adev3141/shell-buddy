#!/usr/bin/env node
//Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter, 
//allowing the script to be executed directly from the command line.
import { program } from 'commander';
import commandsDB from './git_commands.json' assert { type: 'json' };
import { execSync, spawn } from 'child_process';
import { promisify } from 'util';
import ollama from 'ollama';



program
  .name("shellbuddy")
  .description("CLI tool to provide git commands for common operations")
  .version("1.0.0-beta.1");

function executeGitCommit(commands) {
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

// Function to handle interaction with Llama2 using ollama
async function interactWithLlama3(prompt) {
  console.log(`Sending prompt to llama2: ${prompt}`);
  try {
    const response = await ollama.chat({
      model: 'llama2',
      messages: [{ role: 'user', content: prompt }],
    });
    console.log(response.messages[response.messages.length - 1].content);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
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
    executeGitCommit(commands);
  });

// Commander setup to handle CLI commands
program
  .command('llama')
  .description('Interact with local Llama model using ollama')
  .argument('<message...>', 'Message to send to llama')
  .action((messageParts) => {
      const message = messageParts.join(' ');
      interactWithLlama3(message);
  });
  
program.command('display')
  .description('Display all available commands')
  .action(() => {
    console.log('Available Commands:');
    for (const query in commandsDB.buddy) {
      console.log(`- ${query}`);
    }
  });

//system stats command
program.command('systemstats')
  .description("Run htop to view system statistics")
  .action(() => {
    console.log("buddy running htop...");
    try {
      const result = execSync('htop', { stdio: 'inherit' }); // Use stdio: 'inherit' to display the output in the console.
    } catch (error) {
      console.error(`Error executing htop: ${error.message}`);
    }
  });

program
  .command('help', { isDefault: true })
  .description('Display help for using ShellBuddy')
  .action(() => {
    program.outputHelp();
  });

console.log(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export { program, executeGitCommit };
