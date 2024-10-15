#!/usr/bin/env node
// Shebang line: #!/usr/bin/env node - This line specifies the path to the Node.js interpreter,
// allowing the script to be executed directly from the command line..
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { program } from 'commander';
import { execSync } from 'child_process';
import shell from 'shelljs';
import chalk from 'chalk';
import { GeminiModel } from './GeminiModel.js';
import inquirer from 'inquirer';
import { exec} from 'child_process';
import path from 'path'; // <-- Make sure to import the path module



dotenv.config();  // Load environment variables from .env file

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
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
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
        if (error.stderr) {
          console.error(`Standard: ${error.stderr.trim()}`);
        }
        return false; // Stop executing further commands if an error occurs
      }
    }
    return true; // All commands executed successfully
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

  program
  .command('build')
  .description("Build the project based on the environment (dotnet, node, react)")
  .action(async () => {
    const currentDir = process.cwd();

    // Check for dotnet solution (.sln) files
    const dotnetSolutionFiles = await findFilesByExtension(currentDir, '.sln');
    if (dotnetSolutionFiles.length === 1) {
      console.log(`Building .NET solution: ${dotnetSolutionFiles[0]}`);
      executeBuildCommand(`dotnet build ${dotnetSolutionFiles[0]}`);
      return;
    } else if (dotnetSolutionFiles.length > 1) {
      console.log("There is more than 1 solution file. The potential executables for building are:");
      dotnetSolutionFiles.forEach(file => console.log(file));
      return;
    }
    else {
      // Check for Node.js and React projects (using package.json)
      const nodeProjects = await findFilesByName(currentDir, 'package.json');
      if (nodeProjects.length === 1) {
        const packageJsonPath = nodeProjects[0];
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

        // Check if it's a React project (presence of react-scripts)
        if (packageJson.dependencies && packageJson.dependencies['react-scripts']) {
          console.log('Building React project...');
          executeBuildCommand('npm run build');
        } else {
          // Otherwise, assume it's a Node.js project
          console.log('Building Node.js project...');
          executeBuildCommand('npm run build'); // Fallback to npm run build for Node.js
        }
      } else if (nodeProjects.length > 1) {
        console.log("There is more than 1 project file. The potential executables for building are:");
        nodeProjects.forEach(file => console.log(file));
      } else {
        console.log("No project files found to build.");
      }
    }
  });

// Helper functions

async function findFilesByExtension(dir, extension) {
  let results = [];
  const files = await fs.readdir(dir);  // Ensure you're awaiting this

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);  // Ensure you're awaiting this

    if (stat.isDirectory()) {
      results = results.concat(await findFilesByExtension(filePath, extension));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  }

  return results;
}

async function findFilesByName(dir, filename) {
  let results = [];
  const files = await fs.readdir(dir);  // Ensure you're awaiting this

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);  // Ensure you're awaiting this

    if (stat.isDirectory()) {
      results = results.concat(await findFilesByName(filePath, filename));
    } else if (file === filename) {
      results.push(filePath);
    }
  }

  return results;
}

function executeBuildCommand(command) {
  try {
    const result = execSync(command, { stdio: 'inherit' });
    console.log(result.toString());
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
  }
}


//commit command
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

        const allCommandsExecuted = executeGitCommit(commands);
        if (!allCommandsExecuted) {
          console.error("Execution stopped due to an error.");
        }      } else {
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

program
  .command('how')
  .description('Display interactive git command menu')
  .action(() => {
    const commands = {
      "how to undo the last commit": "git revert HEAD",
        "commit": "composite command",
        "how do i check the status of my repo": "git status",
        "how can i see recent commits": "git log",
        "how do i switch to another branch": "git checkout [branch-name]",
        "how to create a new branch": "git branch [new-branch]",
        "how do i merge a branch into the current branch": "git merge [branch-name]",
        "how to discard changes in the working directory": "git checkout -- [file-name]",
        "how do i add a file to the staging area": "git add [file-name]",
        "how to commit changes with a message": "git commit -m \"[commit message]\"",
        "how do i push changes to a remote repository": "git push origin [branch-name]",
        "how to pull updates from a remote repository": "git pull",
        "how do i clone a repository": "git clone [repository-url]",
        "how to view changes since last commit": "git diff",
        "how do i list all branches": "git branch -a",
        "how to delete a branch": "git branch -d [branch-name]",
        "how do i stash my changes": "git stash",
        "how to apply stashed changes": "git stash pop",
        "how do i rename a branch": "git branch -m [new-branch-name]",
        "how to show the commit history as a graph": "git log --graph",
        "how do i see changes in a particular file": "git log -p [file-name]",
        "how to create a tag for a commit": "git tag [tag-name] [commit-hash]",
        "how do i fetch updates from a remote but not merge": "git fetch origin",
        "how to rebase the current branch": "git rebase [base-branch-name]",
        "how do i resolve merge conflicts": "Manual process, then git add [resolved-file], and git commit",
        "how to show remote repositories": "git remote -v",
        "how do i add a remote repository": "git remote add [name] [url]",
        "how to remove a remote repository": "git remote remove [name]",
        "how do i show changes made by a specific commit": "git show [commit-hash]",
        "how to reset to a specific commit": "git reset [commit-hash]",
        "how do i update my fork with changes from the original repository": "git fetch upstream; git merge upstream/[branch-name]",
        "how to see who changed what and when in a file": "git blame [file-name]",
        "how do i list all the files that have been modified": "git ls-files -m",
        "how to compare two branches": "git diff [branch1]..[branch2]",
        "how do i continue rebase after resolving conflicts": "git rebase --continue",
        "how to abort a rebase": "git rebase --abort",
        "how do i set a new remote URL": "git remote set-url origin [new-url]",
        "how to create and checkout a new branch simultaneously": "git checkout -b [new-branch]",
        "how do i show the history of a specific file": "git log -- [file-name]",
        "how to include a subproject in the repository": "git submodule add [url] [path]",
        "how do i initialize a new git repository": "git init",
        "how to make git ignore certain files": "Create a .gitignore file",
        "how do i change the message of my last commit": "git commit --amend -m \"[new message]\"",
        "how to show the stash list": "git stash list",
        "how do i remove files from the staging area": "git reset HEAD [file-name]",
        "how to cherry-pick a commit to the current branch": "git cherry-pick [commit-hash]",
        "how do i find a commit where a bug was introduced": "git bisect start; git bisect bad; git bisect good [commit-hash]",
        "how to create a patch from a commit": "git format-patch -1 [commit-hash]",
        "how do i apply a patch file": "git apply [patch-file]",
        "how to show a list of all ignored files": "git ls-files --others --ignored --exclude-standard",
        "how do i find out the current branch": "git branch --show-current"
    };

    const choices = Object.keys(commands);

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'command',
          message: 'Select a command:',
          choices: choices
        }
      ])
      .then(answers => {
        const selectedCommand = commands[answers.command];
        console.log(`You selected: ${answers.command}`);
        console.log(`Running: ${selectedCommand}`);
        
        exec(selectedCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
        });
      });
  });

  program.on('command:*', async (operands) => {
    const commandString = operands.join(' ');    
    try {
      await geminiModel.initializeModel();
      const response = await geminiModel.generateContent(commandString);
      console.log(response);
    } catch (error) {
      console.error('An error occurred with the request:', error);
    }
  });
  

// Handle no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
program.parse(process.argv);
