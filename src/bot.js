require('dotenv').config();

const { Client } = require('discord.js');
const axios = require('axios');
const client = new Client();
const PREFIX = '$';

client.on('ready', () => {
    console.log(`${client.user.username} has logged in.`)
});

client.on('message', (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        
        if (CMD_NAME === 'search') {
            if (args.length === 0) return message.reply('Please provide a game.');
            
            // Perform a GET request from the IGDB API through the cors-anywhere proxy.
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'

            axios({
                url: `https://api-v3.igdb.com/games`,
                method: 'POST',
                headers: {
                    // 'Origin': 'https://api-v3.igdb.com/games',
                    'Accept': 'application/json',
                    'user-key': process.env.IGDB_USER_KEY
                },
                data: `fields name,first_release_date,platforms.name,cover,summary;search "${args}";`
            })
            .then(response => {
                console.log(response.data);
            })
            .catch(err => {
                console.log('e:', err.toJSON());
            })
        }
    }
})

client.login(process.env.DISCORDJS_BOT_TOKEN);