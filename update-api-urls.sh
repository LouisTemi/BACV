#!/bin/bash

echo "Updating API URLs in React app..."

# Define the backend URL
BACKEND_URL="https://bacv-backend.onrender.com"

# Files to update
FILES=(
  "client/src/App.js"
  "client/src/pages/Dashboard.jsx"
  "client/src/pages/SubmitDoc.jsx"
  "client/src/pages/VerifyDoc.jsx"
  "client/src/pages/VerifyPage.jsx"
  "client/src/components/DeployPopup.jsx"
)

# Backup original files
echo "Creating backups..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "${file}.backup"
    echo "Backed up: $file"
  fi
done

# Replace fetch calls
echo "Updating fetch calls..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Replace fetch('/api/ with fetch('https://bacv-backend.onrender.com/api/
    sed -i '' "s|fetch('/api/|fetch('${BACKEND_URL}/api/|g" "$file"
    sed -i '' 's|fetch("/api/|fetch("'"${BACKEND_URL}"'/api/|g' "$file"
    sed -i '' 's|fetch(`/api/|fetch(`'"${BACKEND_URL}"'/api/|g' "$file"
    echo "Updated: $file"
  fi
done

echo "✅ All files updated!"
echo "Original files backed up with .backup extension"
echo ""
echo "To rollback, run: ./rollback-api-urls.sh"
