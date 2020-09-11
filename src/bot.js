require('dotenv').config();

const { Client, MessageEmbed } = require('discord.js');
const axios = require('axios');
const moment = require('moment');
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
            // const proxyUrl = 'https://cors-anywhere.herokuapp.com/'

            axios({
                url: `https://api-v3.igdb.com/games`,
                method: 'POST',
                headers: {
                    // 'Origin': 'https://api-v3.igdb.com/games',
                    'Accept': 'application/json',
                    'user-key': process.env.IGDB_USER_KEY
                },
                data: `fields name,first_release_date,platforms.name,cover.url,summary;search "${args.join(' ')}";limit 1;` // Sort doesn't seem to work with the search field
            })
            .then(response => {
                console.log(response.data);
                const game = response.data[0];

                // Convert Unix timestamp from release date to a readable format.
                let timestamp = Number(new Date(game.first_release_date * 1000));
                let date = new Date(timestamp);
                let dateFormat = moment(date).format('MMM YYYY');

                // Determine if the game is 15 years old or older.
                const eligible = () => {
                    if (moment(date).format('YYYY') <= new Date().getFullYear() - 15) {
                        return '✅';
                    } else {
                        return '🚫'
                    }
                };
            
                // Sends the game along with relevant information as an embeded message.
                const embed = new MessageEmbed()
                    .setTitle(game.name)
                    .setColor(0x1f436e)
                    .setImage(`https:${game.cover.url}`)
                    .setDescription(`
                    **Release:** ${dateFormat};
                    **Platform(s):** ${game.platforms.map(name => name.name).join(' / ')};
                    **Eligible**: ${eligible()}`);
                

                message.channel.send(embed);
            })
            .catch(err => {
                console.log('e:', err);
                message.channel.send('I could not find that game.')
            })
        }
    }
})

client.login(process.env.DISCORDJS_BOT_TOKEN);