#!/bin/bash

# Script to run the FastAPI server
echo "Starting ZoopJobs API server..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "No virtual environment found. Creating one..."
    python -m venv venv
    source venv/bin/activate
fi

# Check if requirements are installed
if ! python -c "import uvicorn" &> /dev/null; then
    echo "Installing required packages..."
    pip install -r requirements.txt
fi

# Run the server using uvicorn
echo "Starting server on port 8028..."
uvicorn main:app --reload --host 0.0.0.0 --port 8028

# Note: The --reload flag enables auto-reload on code changes
# Remove it in production for better performance 