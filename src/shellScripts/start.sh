#!/bin/bash

USER=$(whoami)

NODE_APP_PATH="/home/$USER/frappe-bench/apps/ai_chat_assist/ai_chat_assist/node_file_backend"

# Find and kill any process using port 4040
PORT=4040
PID=$(lsof -t -i :$PORT)

if [ ! -z "$PID" ]; then
    echo "Killing process $PID using port $PORT..."
    kill -9 $PID
else
    echo "No process is using port $PORT."
fi

# Change to the application directory
cd $NODE_APP_PATH

# Start the Node.js application
node index.js
