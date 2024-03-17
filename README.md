# ShellBuddy

ShellBuddy is your command-line companion for quick and easy access to Git commands and more. It translates plain language questions into precise shell commands, streamlining your workflow and boosting your productivity..

## Installation

Install ShellBuddy globally via npm:

npm install -g shellbuddy@beta


This will install the beta version of ShellBuddy and add it to your system path, making it available from any terminal.

## Usage

Once installed, you can start using ShellBuddy by entering queries like:

buddy how to undo the last commit

**Output:** `git revert HEAD`

### Display All Commands

To list all available commands that ShellBuddy recognizes:

buddy display all commands

## Features

- **Natural Language Processing**: Understands and interprets plain English questions.
- **Comprehensive Git Command Library**: Wide range of pre-configured Git commands.
- **Extendable**: Add your custom commands to the library for personalized usage.

## Contributing

I welcome contributions from the community! To contribute to ShellBuddy and test your changes locally, follow these steps:

1. Fork the repository.
2. Clone your fork (`git clone url-of-your-fork`).
3. Create a new branch (`git checkout -b feature-branch`).
4. Make your changes and add them (`git add .`).
5. Commit your changes (`git commit -m 'Add some feature'`).
6. Push to the branch (`git push origin feature-branch`).
7. Create a new Pull Request.

### Testing Locally with npm link

For local testing of your changes, use `npm link`:

1. Navigate to your local ShellBuddy directory.
2. Run `npm link`. This creates a symbolic link to your global `node_modules` directory.
3. You can now use the `buddy` command globally which will reflect your local changes.
4. After testing, run `npm unlink` to remove the global symlink.

Please ensure to update tests as appropriate and adhere to the Conventional Commits guideline.

## License

Distributed under the MIT License.
