const { initializeGitShellBuddy } = require('./index');

describe('gitshellbuddy CLI Tests', () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('Test Retrieving Existing Command', () => {
    const mockQuery = 'how to undo the last commit';
    const expectedCommand = 'git revert HEAD'; // Replace with the actual command from your DB

    initializeGitShellBuddy(['node', 'gitshellbuddy', ...mockQuery.split(' ')]);
  });
  describe('executeGitCommands', () => {
    it('should execute all commands successfully', () => {
      // When encoding is set, execSync returns a string
      execSync.mockImplementation(() => Buffer.from("Command executed successfully"));
  
      const commands = ['git status', 'git log'];
      console.log = jest.fn(); // Mock console.log to verify output
  
      executeGitCommands(commands);
  
      expect(execSync).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith('Executing: git status');
      expect(console.log).toHaveBeenCalledWith('Executing: git log');
      expect(console.log).toHaveBeenCalledWith('Command executed successfully');
    });
  
    it('should handle command execution failure', () => {
      const error = new Error('Command failed');
      error.cmd = 'git commit';
      // Simulate execSync throwing an error
      execSync.mockImplementation(() => { throw error; });
  
      console.error = jest.fn(); // Mock console.error to verify output
  
      executeGitCommands(['git commit']);
  
      expect(console.error).toHaveBeenCalledWith("Error executing command 'git commit': Error: Command failed");
    });
  
    it('should handle no changes to commit case', () => {
      const error = new Error('nothing to commit, working tree clean');
      error.cmd = 'git commit';
      error.stdout = Buffer.from('nothing to commit, working tree clean');
      // Simulate execSync throwing an error with specific stdout
      execSync.mockImplementation(() => { throw error; });
  
      console.log = jest.fn(); // Mock console.log to verify output
  
      executeGitCommands(['git commit']);
  
      expect(console.log).toHaveBeenCalledWith("No changes to commit. Proceeding with remaining commands.");
    });
  });
  

});
