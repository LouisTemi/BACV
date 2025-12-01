#!/bin/bash

echo "Rolling back API URL changes..."

FILES=(
  "client/src/App.js"
  "client/src/pages/Dashboard.jsx"
  "client/src/pages/SubmitDoc.jsx"
  "client/src/pages/VerifyDoc.jsx"
  "client/src/pages/VerifyPage.jsx"
  "client/src/components/DeployPopup.jsx"
)

for file in "${FILES[@]}"; do
  if [ -f "${file}.backup" ]; then
    mv "${file}.backup" "$file"
    echo "Restored: $file"
  fi
done

echo "✅ Rollback complete!"
