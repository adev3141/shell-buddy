#!/usr/bin/env node
//Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter, 
//allowing the script to be executed directly from the command line.
const { CohereClient } = require('cohere-ai');
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed
const { execSync } = require('child_process');
const { spawn } = require('child_process');


const cohereClient = new CohereClient({
  token: 'tkhCHTdt5MtuFdc7uB7o1XrhHJFFrY6nt63DpsC6'
});

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

  program
  .command('llama <message>')
  .description('Interact with local Llama model using ollama')
  .action((message) => {
    try {
      // Create a child process to run 'ollama run llama3'
      const ollamaProcess = spawn('ollama', ['run', 'llama3'], { shell: true });

      // Initialize a buffer to collect stdout data
      let outputBuffer = '';

      // Handle the standard output from the process
      ollamaProcess.stdout.on('data', (data) => {
        outputBuffer += data.toString();
      });

      ollamaProcess.stderr.on('data', (data) => {
        const output = data.toString();
        // Filtering out spinner characters
        if (!output.match(/[⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋]/)) {
          console.error(`Error from llama3: ${output}`);
        }
      });

      ollamaProcess.on('close', (code) => {
        console.log(`ollama process exited with code ${code}`);
        // Output all collected data at once to avoid piecemeal logging
        console.log(outputBuffer);
      });

      // Send the message to llama3 via stdin
      ollamaProcess.stdin.write(`${message}\n`);
      ollamaProcess.stdin.end();
    } catch (error) {
      console.error('Error interacting with local llama3:', error.message);
    }
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
