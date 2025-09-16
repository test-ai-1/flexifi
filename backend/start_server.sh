#!/bin/bash
echo "Starting FlexiFi Budget API Server..."
echo

# Activate virtual environment
source venv/bin/activate

# Start the server
python run_server.py
