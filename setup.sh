# script to automatically create .env file and symlink it to all apps and packages

#!/bin/bash

if [ -f ".env" ]; then
  echo ".env file exists. ✅"
else
  echo ".env file does not exist."
  cp .env.example .env
fi

for dir in apps/* packages/*; do
  if [ -d "$dir" ]; then
    target="$dir/.env"
    
    # Forcefully create a symbolic link, replacing any existing file
    ln -sf "$(pwd)/.env" "$target"
    echo "Synced .env to $target"
  fi
done