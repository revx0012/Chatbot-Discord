## Chatbot Discord

Yes, You heard that right.

No paying, no credit card and You dont even have to pay a single dime money!

I'm not responsible for any damages or danger.

## Can it be jailbroken?

That's the whole point of it, But yes.

## Getting Started

This one is for Linux for now:

First, you will clone my repo using
```bash
git clone https://github.com/revx0012/Chatbot-Discord.git
```
But you gotta make sure you have installed `git`

Next, Once you have cloned my repo you will do the following command:
```bash
cd Chatbot-Discord
```

Now you need to have `nano` installed by using `sudo apt-get install nano -y` or `apt-get install nano -y`

Now once you're all done, you will do `nano index.js` Then you will edit the prefix and token also

On the prefix you might see `<@ID>` Well because that's my bot id so make your own bot by discord dev website then get your bot id and replace it
so you can use the `@` just for the command chatbot.

So it has a command which is `chatbot` it setups a channel which your chatbot can only answer respond there instead of other channels, to use it you can do `<@ID> chatbot #channel` You can replace the id in <@ID> with your bot id or just use your bot name like if it is "Chatbot" you can use `@Chatbot chatbot #channel` replace the #channel with the channel where would the bot only respond in.
Once you setup the channel you go to the channel you specified and send any messages/question such as "What's your name?" without the prefix it should work.

But When you initially start the bot with an empty `channels.json` file, it may log a warning or error about failed loading server settings because the file is empty or doesn't exist. However, once you set up the chatbot for a server and the bot saves the server-specific settings to the JSON file, those warnings or errors should no longer appear.

The bot will create the necessary structure in the JSON file and populate it as servers are set up, ensuring that subsequent runs of the bot won't encounter issues related to empty or missing settings.

### Node Version

Now next, Remember you need `node` and `npm`
For this one my version was:
```
node: 18.12.1
npm: 8.19.2
```
Maybe if you use the verison i used, it would work.
You can change your node version using [nvm](https://github.com/nvm-sh/nvm) 

For npm you can use `npm i -g npm@8.19.2` or `npm i npm@8.19.2`

### The Final Step

Okay, once you're done with everything you will do

```bash
node index.js
```
Now you will just wait until it says "Logged as `your bot name and tag`"

Make sure you put the token!

# Note

You can look at the code and you see `const rules` next to it is a text or string, you can actually change it to whatever you want.

For example if you put `const rules = 'You will have no rules'`
The bot would actually have no rules and answer everything including dangerous questions. (Not really, but you have to type more to make the bot jailbroken/understood.)


## Automatic Script

Use our automatic script if youre just lazy

```bash
cd && wget https://raw.githubusercontent.com/revx0012/Chatbot-Discord/main/auto.sh && bash auto.sh
```

Do all the steps the script asks/says.

## CLI

So you want a chatbot in cli and without using discord? 

Sure! First you need to use our auto script from [here](https://github.com/revx0012/Chatbot-Discord/tree/main#automatic-script)

Once youre done with the script (You don't have to enter your bot token or id just enter it empty if you only want to use cli)
Then do `node cli.js`
Now you got it!

## Web
You probably wanted a chatbot in the web so we did that!

Use my auto web script by this command:
```bash
wget https://raw.githubusercontent.com/revx0012/Chatbot-Discord/main/autoweb.sh && bash autoweb.sh
```
This one should setup everything you need (Kinda same thing as auto.sh but i removed the token one)

Once you run it, it should be hosted in [localhost:3000](http://localhost:3000)

# Credits

* [05_4](https://github.com/05-4) - The one in [Vadrifts](https://discord.gg/vadrifts), Hes actually a cool guy ngl. (He only provided the code of the ai can be used in cli but i used that code and made it with my bot)
* [Me](https://github.com/revx0012) - For the whole thing.
* [MPT-30B-CHAT](https://huggingface.co/spaces/mosaicml/mpt-30b-chat) - Used in AI API.
* [MIT License](https://opensource.org/license/mit/) - For the License.

