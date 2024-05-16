#!/bin/bash
# A wrapper script for the ShellBuddy Node.js CLI tool.
# This script reads arguments from the command line, prepares them for processing,
# and then passes them to the Node.js application.

# Enable debugging mode if a specific environment variable is set
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set -x  # Print commands and their arguments as they are executed
    echo "Debugging is enabled."
fi

# Process arguments to handle special characters properly
input_args=()
for arg in "$@"; do
    # Escape single quotes inside the argument
    safe_arg="${arg//\'/\'\\\'\'}"
    input_args+=("$safe_arg")
done

# Join all arguments into a single string with escaped single quotes
input="${input_args[*]}"

# Debug: show the input
echo "Processed input: $input"

# Find the directory of this script, which is assumed to be in the same directory as the Node.js project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Assuming index.js is in the same directory as this script
node "$SCRIPT_DIR/index.js" "$input"

# Disable debugging if it was enabled
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set +x
    echo "Debugging is disabled."
fi
