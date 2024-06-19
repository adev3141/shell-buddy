#!/usr/bin/env node
// Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter,
// allowing the script to be executed directly from the command line..

import { program } from 'commander';
import { execSync } from 'child_process';
import ollama from 'ollama';
import shell from 'shelljs';
import pty from 'node-pty';


program
  .name("shellbuddy")
  .description("CLI tool to provide git commands for common operations")
  .version("1.0.0-beta.1");

  function executeGitCommit(commands) {
    commands.forEach(command => {
      console.log(`Executing command: ${command}`);
      try {
        const result = execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
        console.log(`Command executed successfully: ${command}`);
        if (result.trim()) {
          console.log(`Output: ${result.trim()}`);
        } else {
          console.log('No output generated.');
        }
      } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(`Error message: ${error.message}`);
        if (error.stderr) {
          console.error(`Standard Error: ${error.stderr.trim()}`);
        }
      }
    });
  }
  
  program
  .command('virtualenv open')
  .description('Create and start a virtual environment')
  .action(() => {
    const checkVenvInstalled = 'python3 -m venv --help';
    const venvDir = 'venv';

    try {
      console.log('Checking if venv is installed...');
      execSync(checkVenvInstalled, { stdio: 'pipe' });

      if (shell.test('-d', venvDir)) {
        console.log('Virtual environment already exists. Activating it...');
        activateVirtualEnv(venvDir);
      } else {
        console.log('Creating a new virtual environment...');
        shell.exec(`python3 -m venv ${venvDir}`);
        console.log('Virtual environment created. Activating it...');
        activateVirtualEnv(venvDir);
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (error.stderr) {
        console.error('Standard Error:', error.stderr.trim());
      }
    }
  });

function activateVirtualEnv(venvDir) {
  const shellPath = shell.which('sh') || '/bin/sh';
  const ptyProcess = pty.spawn(shellPath, [], {
    name: 'xterm-color',
    cols: process.stdout.columns,
    rows: process.stdout.rows,
    cwd: process.cwd(),
    env: process.env
  });

  ptyProcess.on('data', data => {
    process.stdout.write(data);
  });

  ptyProcess.write(`source ${venvDir}/bin/activate\n`);
  ptyProcess.write(`exec ${process.env.SHELL}\n`);
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

  program
  .command('commit <message...>')
  .description("Commit changes with a message")
  .option('-t, --tag [tag]', 'Optional tag name')
  .action((messageParts, options) => {
    const message = messageParts.join(' ')
    const commands = [
      "git add .",
      `git commit -m "${message}"`
    ];

    if (options.tag) {
      commands.push(`git tag ${options.tag}`);
      commands.push("git push --follow-tags");
    } else {
      commands.push("git push");
    }

    executeGitCommit(commands);
  });

  program
  .command('display')
  .description('Display all available commands')
  .action(() => {
    console.log('Available Commands:');
    console.log('- systemstats');
    console.log('- commit <message...> [options]');
    console.log('  Options:');
    console.log('    -t, --tag [tag]  Optional tag name');
    console.log('- show last commit');
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

  program
  .command('show last commit')
  .description('Show details of the last commit')
  .action(() => {
    try {
      const commitDetails = execSync('git log -1 --pretty=format:"%h - %an, %ar : %s"', { encoding: 'utf-8' }).trim();
      const commitTags = execSync('git tag --contains HEAD', { encoding: 'utf-8' }).trim();
      const commitFiles = execSync('git show --name-only --oneline HEAD', { encoding: 'utf-8' }).split('\n').slice(1).join('\n').trim();

      console.log('Last Commit Details:');
      console.log(commitDetails);
      if (commitTags) {
        console.log(`Tags: ${commitTags}`);
      }
      if (commitFiles) {
        console.log('Files changed:');
        console.log(commitFiles);
      }
    } catch (error) {
      console.error('Error fetching commit details:', error.message);
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
