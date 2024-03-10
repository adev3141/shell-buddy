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


});
