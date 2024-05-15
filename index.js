#!/usr/bin/env node
//Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter, 
//allowing the script to be executed directly from the command line.
import { program } from 'commander';
import { execSync } from 'child_process';
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

// Function to handle interaction with Llama3 using ollama
async function interactWithLlama3(prompt) {
  console.log(`Sending prompt to Llama model: ${prompt}`);
  try {
    const response = await ollama.chat({
      model: 'llama3',  // Ensure this is the correct model name
      messages: [{ role: 'user', content: prompt }],
    });
    console.log('Response received:', response);  // Log the entire response object
    if (response.message) {
      console.log(response.message.content);  // Display the response message content
    } else {
      console.log('No message found in the response.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

program.command('commit <message...>')
  .description("Commit changes with a message")
  .action((messageParts) => {
    const commitMessage = messageParts.join(' '); 
    const commands = [
      "git add .",
      `git commit -m "${commitMessage}"`,
      "git push"
    ];
    executeGitCommit(commands);
  });

program.command('display')
  .description('Display all available commands')
  .action(() => {
    console.log('Available Commands:');
    console.log('- systemstats');
    console.log('- commit <message...>');
    console.log('- help');
  });

program.command('systemstats')
  .description("Run htop to view system statistics")
  .action(() => {
    console.log("buddy running htop...");
    try {
      const result = execSync('htop', { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing htop: ${error.message}`);
    }
  });

program.command('help')
  .description('Display help for using ShellBuddy')
  .action(() => {
    program.outputHelp();
  });

// Default command handling
program
  .argument('<command...>', 'Command to execute')
  .action((commandParts) => {
      const fullCommand = commandParts.join(' '); // Join all parts to form the full command
      interactWithLlama3(fullCommand);
  });


console.log(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export { program, executeGitCommit };
