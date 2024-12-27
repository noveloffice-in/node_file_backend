#!/bin/bash

USER=$(whoami)

NODE_APP_PATH="/home/$USER/frappe_bench/ai_chat_assist/ai_chat_assist/node_file_backend"


cd $NODE_APP_PATH

node index.js