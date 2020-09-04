require('dotenv').config();

const { Client, MessageEmbed } = require('discord.js');
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
                data: `fields name,first_release_date,platforms.name,cover,summary;search "${args.join(' ')}";`
            })
            .then(response => {
                console.log(response.data);
                console.log(args.join(' '));
                // Convert Unix timestamp from release date to a readable format.
                let timestamp = Number(new Date(response.data[0].first_release_date * 1000));
                let date = new Date(timestamp).toDateString();
                // Sends the response as an embeded message.
                const embed = new MessageEmbed()
                .setTitle('Game info:')
                .setColor(0x1f436e)
                .setDescription(`
                **Game:** ${response.data[0].name} 
                **Release:** ${date}
                **Platform(s):** ${response.data[0].platforms.map(name => name.name).join(' / ')}`);

                message.channel.send(embed);
            })
            .catch(err => {
                console.log('e:', err);
            })
        }
    }
})

client.login(process.env.DISCORDJS_BOT_TOKEN);