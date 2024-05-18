#!/bin/bash
# A wrapper script for the ShellBuddy Node.js CLI tool.
# This script reads arguments from the command line, prepares them for processing,
# and then passes them to the Node.js application.

# Enable debugging mode if a specific environment variable is set
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set -x  # Print commands and their arguments as they are executed
    echo "Debugging is enabled."
fi

# Initialize an empty array to store processed arguments
input_args=()
for arg in "$@"; do
    # For each argument, escape single quotes inside the argument
    # This substitution replaces each single quote (') with an escaped version (\'')
    safe_arg="${arg//\'/\'\\\'\'}"
    # Add the safely escaped argument to the input_args array
    input_args+=("$safe_arg")
done

# Combine all arguments into a single string with spaces between them
# This step is useful for debugging and logging purposes
input="${input_args[*]}"

# Print the processed input for debugging purposes
echo "Processed input: $input"

# Determine the directory in which this script is located
# The script assumes it is in the same directory as the Node.js project
SCRIPT_DIR="$( cd "$( dirname "$(readlink -f "${BASH_SOURCE[0]}")" )" && pwd )"

# Execute the Node.js script (index.js) located in the same directory as this script
# Pass all processed arguments to the Node.js script
node "$SCRIPT_DIR/index.js" "${input_args[@]}"

# If debugging was enabled, disable it now
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set +x  # Disable debugging mode
    echo "Debugging is disabled."
fi
