#!/usr/bin/env node
//Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter, 
//allowing the script to be executed directly from the command line.
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed
const { execSync } = require('child_process');
const { spawn } = require('child_process');
const { promisify } = require('util');
const ollama = require('ollama');

const delay = promisify(setTimeout);

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

// Function to handle interaction with llama3 using ollama
async function interactWithLlama3(prompt) {
  console.log(`Sending prompt to llama3: ${prompt}`);

  // Set a timeout to abort the request if it takes too long (e.g., 10 seconds)
  const timeoutId = setTimeout(() => {
      console.log('\nAborting request due to timeout...\n');
      ollama.abort();
  }, 10000);

  try {
      // Streaming response from llama3
      const stream = await ollama.generate({
          model: 'llama3',
          prompt: prompt,
          stream: true,
          keep_alive: 300  // Optional: adjust keep_alive time as needed
      });

      // Processing each part of the stream
      for await (const chunk of stream) {
          process.stdout.write(chunk.response);
      }
  } catch (error) {
      if (error.name === 'AbortError') {
          console.log('The request was aborted.');
      } else {
          console.error('An error occurred:', error);
      }
  } finally {
      clearTimeout(timeoutId);  // Clear the timeout
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

module.exports = { program, executeGitCommit };