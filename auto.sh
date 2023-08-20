#!/bin/bash

# Check if the package manager is apt
if [ "$(dpkg -s apt 2>/dev/null | grep Status)" != "Status: install ok installed" ]; then
    echo -e "\033[0;31mYour package manager is not supported.\033[0m"
    exit 1
fi

# Check if the user is root
if [ "$(whoami)" = "root" ]; then
    apt update -y && apt install wget git sed -y
else
    sudo apt update -y && sudo apt install wget git sed -y
fi

echo "Installing, This should take a moment."

git clone https://github.com/revx0012/Chatbot-Discord.git &>/dev/null

# Check if the user is root
if [ "$(whoami)" = "root" ]; then
    apt install nodejs npm -y
else
    sudo apt install nodejs npm -y
fi

clear

read -p "Would you like us to install node version manager for you and change npm and node version? (y/n): " nvm_choice
while [ "$nvm_choice" != "y" ] && [ "$nvm_choice" != "n" ]; do
    echo "Wrong option, Please choose the correct option."
    read -p "Would you like us to install node version manager for you and change npm and node version? (y/n): " nvm_choice
done

if [ "$nvm_choice" = "y" ]; then
    echo "Installing and changing node and npm version.."
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash &>/dev/null
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    nvm install 18.12.1
    nvm use 18.12.1

    read -p "Should we change your npm version using -g option? (y/n): " npm_choice
    if [ "$npm_choice" = "y" ]; then
        npm install -g npm@8.19.2
    else
        npm install npm@8.19.2
    fi
else
    echo "Okay, we will use the current node and npm version then!"
fi

clear

cd Chatbot-Discord

read -p "Your bot token: " bot_token
sed -i "s/const TOKEN = process.env\['TOKEN'\];/const TOKEN = '$bot_token';/" index.js

read -p "Your bot ID: " bot_id
sed -i "s/const PREFIX = '<@1141993367169941504>';/const PREFIX = '<@$bot_id>';/" index.js

echo "Hey there! You have completed it here!!! Use 'cd Chatbot-Discord && node index.js' to begin your bot."

rm -rf auto.sh

