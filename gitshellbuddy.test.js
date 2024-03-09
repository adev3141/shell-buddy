const { program } = require('commander');
const commandsDB = require('./git_commands.json'); // Adjust path as needed
require('./path-to-gitshellbuddy'); // Adjust path as needed to import gitshellbuddy

describe('gitshellbuddy CLI Tests', () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('Test Initialization', () => {
    expect(program.name()).toBe('gitshellbuddy');
    expect(program.description()).toBe('CLI tool to provide shell commands for common questions');
    expect(program.version()).toBe('1.0.0');
  });

  test('Test Display All Commands', () => {
    process.argv = ['node', 'gitshellbuddy', 'display all commands'];
    program.parse(process.argv);
    Object.keys(commandsDB.buddy).forEach((query) => {
      expect(consoleLogSpy).toHaveBeenCalledWith(`- ${query}`);
    });
  });

  // Additional tests follow a similar pattern...
});

