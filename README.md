ShellBuddy

ShellBuddy is your command-line companion for quick and easy access to Git commands and more. It translates plain language questions into precise shell commands, streamlining your workflow and boosting your productivity.

Installation

Install ShellBuddy globally via npm:

bash
Copy code
npm install -g shellbuddy@beta
This will install the beta version of ShellBuddy and add it to your system path, making it available from any terminal.

Usage

Once installed, you can start using ShellBuddy by entering queries like so:

buddy how to undo the last commit
Output: git revert HEAD
Display All Commands
To list all available commands that ShellBuddy recognizes:

buddy display all commands

Features

Natural Language Processing: Understands and interprets plain English questions.
Comprehensive Git Command Library: Wide range of pre-configured Git commands.
Extendable: Add your custom commands to the library for personalized usage.
Contributing

I welcome contributions from the community! To contribute to ShellBuddy and test your changes locally, follow these steps:

Fork the repository.
Clone your fork (git clone url-of-your-fork).

Create a new branch (git checkout -b feature-branch).

Make your changes and add them (git add .).

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature-branch).

Create a new Pull Request.

Testing Locally with npm link

For local testing of your changes, use npm link:

Navigate to your local ShellBuddy directory.

Run npm link. This creates a symbolic link to your global node_modules directory.

You can now use the buddy command globally which will reflect your local changes.

After testing, run npm unlink to remove the global symlink.

Please ensure to update tests as appropriate and adhere to the Conventional Commits guideline.

License

Distributed under the MIT License.
