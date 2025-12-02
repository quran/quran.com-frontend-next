#!/bin/sh

# Default file name if requested
DEFAULT_FILE="about.json"

# Path to locales directory
LOCALES_DIR="./locales"

FILE_MODE="single"

print_usage() {
  cat <<'EOF'
Usage: sh format-locales.sh [filename]

Formats locale JSON files using jq and stages changes with Git.

Examples:
  sh format-locales.sh             Format every JSON file across all locales
  sh format-locales.sh ""          Same as above when an empty argument is provided
  sh format-locales.sh about.json  Format a specific file (about.json) in each locale
  sh format-locales.sh --default   Shortcut for formatting the default about.json file
  sh format-locales.sh --help      Show this help message

When a filename is supplied, the script formats only that file for each locale.
When run with no arguments or an empty string, every JSON file in each locale is formatted.
EOF
}

if [ "$#" -eq 0 ]; then
  FILE_MODE="all"
  echo "Formatting all JSON files in $LOCALES_DIR"
elif [ -z "$1" ]; then
  FILE_MODE="all"
  echo "Formatting all JSON files in $LOCALES_DIR"
else
  if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    print_usage
    exit 0
  fi

  if [ "$1" = "--default" ]; then
    TARGET_FILE=$DEFAULT_FILE
  else
    TARGET_FILE=$1
  fi
  echo "Using file name: $TARGET_FILE"
fi

format_file() {
  file_path=$1

  if [ ! -f "$file_path" ]; then
    echo "Skipping $file_path - file does not exist"
    return
  fi

  echo "Processing $file_path"

  if jq . "$file_path" > "$file_path.tmp"; then
    mv "$file_path.tmp" "$file_path"
    git add "$file_path"
    echo "Formatted and staged $file_path"
  else
    echo "Failed to format $file_path"
    rm -f "$file_path.tmp"
  fi
}

find "$LOCALES_DIR" -mindepth 1 -maxdepth 1 -type d -print | while IFS= read -r lang_dir; do
  if [ "$FILE_MODE" = "all" ]; then
    find "$lang_dir" -maxdepth 1 -type f -name "*.json" -print | while IFS= read -r file_path; do
      format_file "$file_path"
    done
  else
    format_file "$lang_dir/$TARGET_FILE"
  fi
done

if [ "$FILE_MODE" = "all" ]; then
  echo "All locale JSON files have been formatted and staged"
else
  echo "All $TARGET_FILE files have been formatted and staged"
fi
