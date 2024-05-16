#!/bin/bash
# A wrapper script for the ShellBuddy Node.js CLI tool.
# This script reads arguments from the command line, prepares them for processing,
# and then passes them to the Node.js application.

# Enable debugging mode if a specific environment variable is set
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set -x  # Print commands and their arguments as they are executed
    echo "Debugging is enabled."
fi

# Get all command line arguments as a single string
input="$*"

# Optional: Display the raw input for debugging purposes
echo "Original input: '$input'"

# Optional: Perform any needed sanitization on the input here
# For example, escaping specific characters (not usually needed for passing to Node.js)
# This is a placeholder for potential input modification
sanitized_input=$(echo "$input" | sed 's/[&;]/\\&/g')

# Display the sanitized input for debugging purposes
echo "Sanitized input: '$sanitized_input'"

# Pass the input arguments to the Node.js application
# Assuming the Node.js script is named 'buddy.js' and located in the same directory as this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
node "$DIR/buddy.js" "$sanitized_input"

# Disable debugging explicitly if it was enabled
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set +x
    echo "Debugging is disabled."
fi
