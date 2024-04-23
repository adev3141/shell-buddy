#!/usr/bin/env node
//Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter, 
//allowing the script to be executed directly from the command line.
const { CohereClient } = require('cohere-ai');
const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust the path as needed
const axios = require('axios');
const { execSync } = require('child_process');

const cohereClient = new CohereClient({
  auth: {
    // Replace with your actual Cohere API key
    apiKey: 'tkhCHTdt5MtuFdc7uB7o1XrhHJFFrY6nt63DpsC6'
  }
});

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

// Command for interacting with Cohere LLM
program
  .command('cohere <query> [model] [stream]')
  .description('Interact with Cohere LLM. Optional parameters: model, stream')
  .action(async (query, model = 'command-r-plus', stream = false) => {
    const params = {
      message: query,
      model: model,
      stream: stream,
      preamble: 'You are helpful.',
    };

    try {
      const response = await cohereClient.chat(params);

      if (response.toolCalls.length > 0) {
        console.log('Tool Calls:');
        for (const tool of response.toolCalls) {
          console.log(`- ${tool.name}`, tool.parameters);
        }
      } else {
        console.log('Response:', response.generations[0].text);
      }

    } catch (error) {
      console.error('Error interacting with Cohere LLM:', error.message);
    }
  });

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

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
