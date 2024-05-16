#!/bin/bash
# A wrapper script for the ShellBuddy Node.js CLI tool.
# This script preprocesses command line arguments for special characters and passes them to Node.js.

# Check if debugging is enabled
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set -x  # Print commands and their arguments as they are executed
    echo "Debugging is enabled."
fi

# Process each argument to escape single quotes and concatenate them
processed_args=()
for arg in "$@"; do
    processed_args+=("$(echo "$arg" | sed "s/'/'\\\\''/g")")
done

# Join all processed arguments into a single string to pass to Node.js
input="${processed_args[*]}"

# Debug: show processed input
echo "Processed input: $input"

# Assuming index.js is in the same directory as this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/index.js" "$input"

# Disable debugging if it was enabled
if [[ "$SHELLBUDDY_DEBUG" == "1" ]]; then
    set +x
    echo "Debugging is disabled."
fi
