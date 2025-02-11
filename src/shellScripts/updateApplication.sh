#!/bin/bash

# Set the user variable (Replace 'your_user' with the actual username)
user=$(whoami)

# Navigate to the ai_chat_assist directory and pull the latest changes
cd /home/$user/frappe-bench/apps/ai_chat_assist && git pull

# Run Bench migrate
bench migrate

# Navigate to the supportify directory, install dependencies, and build
cd supportify && npm install && npm run build

# Navigate to the ai_chat_assist/node_file_backend and install dependencies (currently commented out in original script)
cd ../ai_chat_assist/node_file_backend && git pull && npm install

# Restart all supervisor processes with sudo
echo "$0ft%963$" | sudo -S supervisorctl restart all
