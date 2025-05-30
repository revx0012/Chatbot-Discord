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
cd web

echo "Hey, You should be now done here, Congratulations!"
echo "Now make sure you are in the Chat-Bot-Discord Directory and now the last step is to do the below command to get the web started:"
echo "cd web && node server.js"
echo "You can do 'cd web/public && nano client.js' to do some configuration like rules"
