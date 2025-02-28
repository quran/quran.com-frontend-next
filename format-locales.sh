#!/bin/bash

# Default file name if not provided
DEFAULT_FILE="about.json"

# Path to locales directory
LOCALES_DIR="./locales"

# Get the file name from command line argument or use default
FILE_NAME=${1:-$DEFAULT_FILE}

echo "Using file name: $FILE_NAME"

# Find all language directories
LANG_DIRS=$(find "$LOCALES_DIR" -mindepth 1 -maxdepth 1 -type d)

for lang_dir in $LANG_DIRS; do
  file_path="$lang_dir/$FILE_NAME"

  # Check if the file exists
  if [ -f "$file_path" ]; then
    echo "Processing $file_path"

    # Format the file using jq
    jq . "$file_path" > "$file_path.tmp" && mv "$file_path.tmp" "$file_path"

    # Stage the file with Git
    git add "$file_path"
    echo "Formatted and staged $file_path"
  else
    echo "Skipping $file_path - file does not exist"
  fi
done

echo "All $FILE_NAME files have been formatted and staged"
