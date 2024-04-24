const { execSync } = require('child_process');

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

  module.exports = {
    executeGitCommands: executeGitCommands
};