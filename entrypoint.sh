#!/bin/sh
set -e

echo "Checking dependencies..."
npm install

echo "Starting dev server..."
exec npx ng serve --host 0.0.0.0 --poll 2000
