## Chatbot Discord

Yes, You heard that right.

No paying, no credit card and You dont even have to pay a single dime money!

I'm not responsible for any damages and danger.

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
so you can use the `@`, For example: @Chatbot Hello!

But there's a problem, When you ping the bot and ask and even if you didn't reply or ping it will still answer your question so you would have to put your own chatbot in a specific channel to use from not all channels
And even if you're replying to someone else while you ping the bot it will still respond to you 
This thing cannot be fixed but if you can please try contacting me so I can replace the code
My username is `ron144` with no tags on discord.

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
The bot would actually have no rules and answer everything including dangerous questions. (Not really, but you havecto type more to make the bot jailbroken/understood.)


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

# Credits

* [05_4](https://github.com/05-4) - The one in [Vadrifts](https://discord.gg/vadrifts), Hes actually a cool guy ngl. (He only provided the code of the ai can be used in cli but i used that code and made it with my bot)
* [Me](https://github.com/revx0012) - For the whole thing.
* [MPT-30B-CHAT](https://huggingface.co/spaces/mosaicml/mpt-30b-chat) Used in AI API.
* [MIT License](https://opensource.org/license/mit/) For the License.

