#!/bin/bash

# Fetch the current user dynamically
USER=$(whoami)

# Define the base path where your Node.js app is located
NODE_APP_PATH="/home/$USER/frappe_bench/ai_chat_assist/ai_chat_assist/node_file_backend"

# Define the supervisor configuration file path
SUPERVISOR_CONF_PATH="/etc/supervisor/conf.d/ai_chat_assist.conf"

# Check if supervisor configuration file exists, if not, create it
echo "Creating or updating supervisor configuration for ai_chat_assist..."

sudo bash -c "cat > $SUPERVISOR_CONF_PATH << EOF
[program:ai_chat_assist]
command=/home/$USER/frappe-bench/apps/ai_chat_assist/ai_chat_assist/node_file_backend/start.sh
autostart=true               # Ensure it starts on system boot
autorestart=true             # Restart if it crashes
startretries=3               # Retry 3 times if it fails to start
user=$USER                   # Run the script as the current user
stdout_logfile=/var/log/ai_chat_assist.log
stderr_logfile=/var/log/ai_chat_assist.err.log
environment=USER=$USER       # Set USER environment variable dynamically
EOF"

# Reload and update supervisor to apply the changes
echo "Reloading and updating supervisor..."
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart ai_chat_assist

# Confirm that everything is set up
echo "ai_chat_assist is now managed by supervisor."
