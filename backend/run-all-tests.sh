#!/bin/bash

# Enable error handling for this master test runner
set -e

echo -e "\n🚀 Running all backend tests...\n"

# Run Calendar Events tests
echo -e "\n🗓️ Running Calendar Events tests..."
./backend/test-calendar-events.sh || echo "❌ Calendar Events tests failed"

# Run Category tests
echo -e "\n📂 Running Category tests..."
./backend/test-category.sh || echo "❌ Category tests failed"

# Run RPM Blocks tests
echo -e "\n📦 Running RPM Blocks tests..."
./backend/test-rpm-blocks.sh || echo "❌ RPM Blocks tests failed"

# Run Notes tests
echo -e "\n📝 Running Notes tests..."
./backend/test-notes.sh || echo "❌ Notes tests failed"

echo -e "\n✅ All test scripts executed!"