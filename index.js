#!/usr/bin/env node
// Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter,
// allowing the script to be executed directly from the command line.

import { program } from 'commander';
import { execSync } from 'child_process';
import ollama from 'ollama';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

async function initPipeline() {
  const pipe = await pipeline('text2text-generation', 'Salesforce/codegen-350M-mono');
  return pipe;
}

// Function to add comments to the file
async function addCommentsToFile(filePath, pipe) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');
  
  let commentedCode = '';

  for (const line of lines) {
    if (line.trim()) {
      const output = await pipe(line);
      const comment = output[0].generated_text.trim();
      if (comment) {
        commentedCode += `// ${comment}\n${line}\n`;
      } else {
        commentedCode += `${line}\n`;
      }
    } else {
      commentedCode += `${line}\n`;
    }
  }

  fs.writeFileSync(filePath, commentedCode, 'utf-8');
}

// Define the document command
program
  .command('document <file>')
  .description('Add comments to a code file')
  .action(async (file) => {
    const filePath = path.resolve(file);
    if (fs.existsSync(filePath)) {
      const pipe = await initPipeline();
      await addCommentsToFile(filePath, pipe);
      console.log(`Comments added to ${file}`);
    } else {
      console.error(`File not found: ${filePath}`);
    }
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

async function interactWithLlama3(prompt) {
  console.log(`Sending prompt to Llama model: ${prompt}`);
  try {
    const response = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
    });
    console.log('Response received:', response);
    if (response.message) {
      console.log(response.message.content);
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

// Handle unknown commands
program.on('command:*', (operands) => {
  const commandString = operands.join(' ');
  interactWithLlama3(commandString);
});

program.parse(process.argv);

// Handle no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
