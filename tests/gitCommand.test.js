const { program, executeGitCommands } = require('../index'); // Adjust the path as needed
const { execSync } = require('child_process');
jest.mock('child_process');

describe('Commit Command', () => {
  let mockExecSync;

  beforeAll(() => {
    // Setup spy and mock implementation before all tests
    mockExecSync = jest.spyOn(require('child_process'), 'execSync');
    mockExecSync.mockImplementation((command, options) => {
      if (command === 'git add .') {
        return 'Staged files';
      } else if (command.startsWith('git commit')) {
        return 'Committed successfully';
      } else if (command === 'git push') {
        return 'Pushed to remote';
      } else {
        throw new Error(`Unknown command: ${command}`);
      }
    });
  });

  afterEach(() => {
    // Reset mocks after each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore the original implementation after all tests
    mockExecSync.mockRestore();
  });

  test('Executes Git commands correctly for commit', () => {
    const commitMessage = 'Test commit message';
    // Simulate command line input
    program.parse(['node', 'index.js', 'commit', commitMessage]);

    // Verify that execSync was called with the correct Git commands
    expect(mockExecSync).toHaveBeenCalledTimes(3);
    expect(mockExecSync).toHaveBeenCalledWith('git add .', { stdio: 'pipe', encoding: 'utf-8' });
    expect(mockExecSync).toHaveBeenCalledWith(`git commit -m "${commitMessage}"`, { stdio: 'pipe', encoding: 'utf-8' });
    expect(mockExecSync).toHaveBeenCalledWith('git push', { stdio: 'pipe', encoding: 'utf-8' });
  });
});
