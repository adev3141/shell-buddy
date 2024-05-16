#!/bin/bash
# A wrapper script for the ShellBuddy Node.js CLI tool.
# This script reads arguments from the command line, prepares them for processing,
# and then passes them to the Node.js application.

# Enable debugging mode if a specific environment variable is set
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set -x  # Print commands and their arguments as they are executed
    echo "Debugging is enabled."
fi

# Concatenate all arguments into a single string
input="$*"

# Debug: show the input
echo "Original input: '$input'"

# Check for unbalanced single quotes
if [[ $(( $(tr -cd \' <<< "$*" | wc -c) % 2 )) -ne 0 ]]
then
    echo "Error: Unbalanced single quotes in input. Please enclose your entire input in double quotes if you're using single quotes."
    exit 1
fi

# Assuming index.js is in the same directory as this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/index.js" "$input"

# Disable debugging if it was enabled
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set +x
    echo "Debugging is disabled."
fi
