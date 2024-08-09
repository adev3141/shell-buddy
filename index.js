#!/usr/bin/env node
// Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter,
// allowing the script to be executed directly from the command line..
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { program } from 'commander';
import { execSync } from 'child_process';
import ollama from 'ollama';
import shell from 'shelljs';
import pty from 'node-pty';
import chalk from 'chalk';
import { GeminiModel } from './GeminiModel.js';

dotenv.config();

const geminiModel = new GeminiModel(process.env.GOOGLE_GEMINI_API_KEY);

program
  .name("shellbuddy")
  .description("CLI tool to provide git commands for common operations")
  .version("1.0.0-beta.1");

  function executeCommand(command, description) {
    console.log(chalk.blue(`\n${description}:`));
    try {
      const result = execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
      if (result) {
        console.log(result);
      } else {
        console.log(chalk.green('No issues found.'));
      }
    } catch (error) {
      console.error(chalk.red(`Error executing command: ${command}`));
      console.error(chalk.red(error.message));
    }
  }

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
  
  const virtualenv = program
  .command('virtualenv')
  .description('Manage virtual environments');

virtualenv
  .command('open')
  .description('Create and start a virtual environment')
  .action(() => {
    const checkVenvInstalled = 'python3 -m venv --help';
    const venvDir = 'venv';

    try {
      console.log('Checking if venv is installed...');
      execSync(checkVenvInstalled, { stdio: 'pipe' });

      if (shell.test('-d', venvDir)) {
        console.log('Virtual environment already exists.');
      } else {
        console.log('Creating a new virtual environment...');
        shell.exec(`python3 -m venv ${venvDir}`);
        console.log('Virtual environment created.');
      }

      console.log('To activate the virtual environment, run:');
      console.log(`source ${venvDir}/bin/activate`);
    } catch (error) {
      console.error('Error:', error.message);
      if (error.stderr) {
        console.error('Standard Error:', error.stderr.trim());
      }
    }
  });

virtualenv
  .command('close')
  .description('Deactivate the virtual environment')
  .action(() => {
    try {
      console.log('To deactivate the virtual environment, run:');
      console.log('deactivate');
    } catch (error) {
      console.error('Error:', error.message);
      if (error.stderr) {
        console.error('Standard Error:', error.stderr.trim());
      }
    }
  });

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
  const message = messageParts.join(' ');

  try {
      // Check if there are changes to commit
      const statusOutput = execSync("git status --porcelain", { stdio: 'pipe', encoding: 'utf-8' });

      if (statusOutput.trim()) {
        const commands = [
          "git add -A",
          `git commit -m "${message}"`
        ];

        if (options.tag) {
          commands.push(`git tag ${options.tag}`);
          commands.push("git push --follow-tags");
        } else {
          commands.push("git push");
        }

        executeGitCommit(commands);
      } else {
        console.log("No changes to commit.");
      }
    } catch (error) {
      console.error("Error checking git status:", error.message);
    }
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
    console.log('- history [number]');
    console.log('- show last commit');
    console.log('- help');
    console.log('- virtualenv open/close');
    console.log('- buddy status');
  });

  program
  .command('env')
  .description('Read the environment and dependencies and provide commands to run the application')
  .action(async () => {
    try {
      // Asynchronously reading package.json to get dependencies and main entry point
      const packageJsonData = await fs.readFile('package.json', 'utf-8');
      const packageJson = JSON.parse(packageJsonData);
      const dependenciesList = Object.keys(packageJson.dependencies).join(', ');
      const mainFile = packageJson.main;

      // Initialize the Gemini model (if not already initialized)
      await geminiModel.initializeModel();

      // Prepare the prompt
      const prompt = `Given the dependencies: ${dependenciesList}, what are the general commands to run an application with these dependencies using the main entry point file ${mainFile}? Please provide accurate and precise commands directly without writing how you've done it in bullet points format: 1. ... ;`;

      // Generate content from the Gemini model
      const response = await geminiModel.generateContent(prompt);

      // Output the response
      console.log(response);
    } catch (error) {
      console.error('Error reading environment or interacting with the Gemini model:', error.message);
    }
  });


  program
  .command('status')
  .description('Show a comprehensive status of the repository and environment')
  .action(() => {
    // Git status
    executeCommand('git status -s', 'Git Status');

    // Current branch
    executeCommand('git rev-parse --abbrev-ref HEAD', 'Current Branch');

    // Recent commits
    executeCommand('git log -5 --pretty=format:"%h - %an, %ar : %s"', 'Recent Commits');

    // Uncommitted changes
    executeCommand('git diff --name-only', 'Uncommitted Changes (Unstaged)');
    executeCommand('git diff --cached --name-only', 'Uncommitted Changes (Staged)');

    // Untracked files
    executeCommand('git ls-files --others --exclude-standard', 'Untracked Files');

    // Stash list
    executeCommand('git stash list', 'Stash List');

    // Linter results (assuming ESLint is used)
    console.log(chalk.blue('\nLinter Results:'));
    try {
      const lintResult = execSync('eslint .', { stdio: 'pipe', encoding: 'utf-8' }).trim();
      console.log(lintResult || chalk.green('No linting issues found.'));
    } catch (error) {
      console.error(chalk.red('Error running linter:'), chalk.red(error.message));
    }

    // Test summary (assuming Jest is used)
    console.log(chalk.blue('\nTest Summary:'));
    try {
      const testResult = execSync('jest --coverage', { stdio: 'pipe', encoding: 'utf-8' }).trim();
      console.log(testResult);
    } catch (error) {
      console.error(chalk.red('Error running tests:'), chalk.red(error.message));
    }

    // Dependency status (assuming npm is used)
    console.log(chalk.blue('\nOutdated Dependencies:'));
    try {
      const outdatedResult = execSync('npm outdated', { stdio: 'pipe', encoding: 'utf-8' }).trim();
      console.log(outdatedResult || chalk.green('All dependencies are up-to-date.'));
    } catch (error) {
      console.error(chalk.red('Error checking outdated dependencies:'), chalk.red(error.message));
    }

    // Suggest actions
    console.log(chalk.blue('\nSuggested Actions:'));
    console.log(chalk.yellow('1. Review and commit your changes.'));
    console.log(chalk.yellow('2. Push your changes to the remote repository.'));
    console.log(chalk.yellow('3. Resolve any linting or testing issues.'));
    console.log(chalk.yellow('4. Update outdated dependencies if any.'));
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
  .command('history [number]')
  .description('Show details of the last [number] commits')
  .action((number) => {
    const commitCount = number || 1;
    try {
      const commitDetails = execSync(`git log -${commitCount} --pretty=format:"%h - %an, %ar : %s"`, { encoding: 'utf-8' }).trim();
      const commitFiles = execSync(`git log -${commitCount} --name-only --oneline`, { encoding: 'utf-8' });

      console.log('Commit History:');
      console.log(commitDetails);
      if (commitFiles) {
        console.log('Files changed:');
        console.log(commitFiles.split('\n').slice(1).join('\n').trim());
      }
    } catch (error) {
      console.error('Error fetching commit history:', error.message);
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
