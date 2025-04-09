#!/bin/bash

# Exit on error
set -e

# Set environment variables for testing
export TESTING=1
export DATABASE_URL="sqlite:///./test.db"

# Ensure we're in the fastapi-server directory
cd "$(dirname "$0")"

# Run tests
echo "Running unit tests..."
python -m pytest tests/unit

echo "Running integration tests..."
python -m pytest tests/integration

echo "Running all tests with coverage..."
python -m pytest

echo "Tests completed successfully." 