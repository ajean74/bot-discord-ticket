const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('close')
      .setDescription('Ferme le ticket en cours'),
    async execute(interaction, client) {
        const embed = new client.discord.MessageEmbed()
        const guild = client.guilds.cache.get(interaction.guildId);
        const chan = guild.channels.cache.get(interaction.channelId);
        if (chan.name.includes('ticket')) {

          const row = new client.discord.MessageActionRow()
            .addComponents(
              new client.discord.MessageButton()
              .setCustomId('confirm-close')
              .setLabel('Fermer le ticket')
              .setStyle('DANGER'),
              new client.discord.MessageButton()
              .setCustomId('no')
              .setLabel('Annuler')
              .setStyle('SECONDARY'),
            );

          const verif = await interaction.reply({
            content: 'Êtes-vous sûr de vouloir fermer le ticket ?',
            components: [row]
          });

          const collector = interaction.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 10000
          });

          collector.on('collect', i => {
            if (i.customId == 'confirm-close') {
              interaction.editReply({
                content: `Le ticket a été fermé par <@!${interaction.user.id}>`,
                components: []
              });

              chan.edit({
                  name: `fermé-${chan.name}`,
                  permissionOverwrites: [
                    {
                      id: client.users.cache.get(chan.topic),
                      deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                    },
                    {
                      id: client.config.roleSupport,
                      allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                    },
                    {
                      id: interaction.guild.roles.everyone,
                      deny: ['VIEW_CHANNEL'],
                    },
                  ],
                })
                .then(async () => {
                  const embed = new client.discord.MessageEmbed()
                    .setColor('C13EA9')
                    .setAuthor('Ticket', ' ')
                    .setDescription('```Ticket sauvegardé```')
                    .setFooter('Système de tickets', ' ')
                    .setTimestamp();

                  const row = new client.discord.MessageActionRow()
                    .addComponents(
                      new client.discord.MessageButton()
                      .setCustomId('delete-ticket')
                      .setLabel('Supprimer le ticket')
                      .setEmoji('🗑️')
                      .setStyle('DANGER'),
                    );

                  chan.send({
                    embeds: [embed],
                    components: [row]
                  });
                });

              collector.stop();
            };
            if (i.customId == 'no') {
              interaction.editReply({
                content: 'Annulation de la fermeture du ticket.',
                components: []
              });
              collector.stop();
            };
          });

          if (interaction.customId == "delete-ticket") {
            const guild = client.guilds.cache.get(interaction.guildId);
            const chan = guild.channels.cache.get(interaction.channelId);

            interaction.reply({
              content: 'Fermeture du ticket...'
            });

            chan.messages.fetch().then(async (messages) => {
              let a = messages.filter(m => m.author.bot !== true).map(m =>
                `${new Date(m.createdTimestamp).toLocaleString('de-DE')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
              ).reverse().join('\n');
              if (a.length < 1) a = "Il n'y a aucun texte dans le ticket."
              hastebin.createPaste(a, {
                  contentType: 'text/plain',
                  server: 'https://hastebin.com'
                }, {})
                .then(function (urlToPaste) {
                  const embed = new client.discord.MessageEmbed()
                    .setAuthor('Logs du ticket', ' ')
                    .setDescription(`📋 Logs \`${chan.id}\` créé par <@!${chan.topic}> et supprimé par <@!${interaction.user.id}>\n\nLogs : [**Cliquez ici pour voir les logs**](${urlToPaste})`)
                    .setColor('C13EA9')
                    .setTimestamp();

                  /*const embed2 = new client.discord.MessageEmbed()
                    .setAuthor('Logs Ticket', ' ')
                    .setDescription(`📋 Logs de votre ticket \`${chan.id}\`: [**Cliquez ici pour voir les logs**](${urlToPaste})`)
                    .setColor('C13EA9')
                    .setTimestamp();*/

                  client.channels.cache.get(client.config.logsTicket).send({
                    embeds: [embed]
                  });
                  /*client.users.cache.get(chan.topic).send({
                    embeds: [embed2]
                  }).catch(() => {console.log("Je ne peux pas l'envoyer en DM")});
                  chan.send('Supprimer le canal.');*/

                  setTimeout(() => {
                    chan.delete();
                  }, 5000);
                });
            });
          };
        } else {
          interaction.reply({
            content: "Vous n'avez pas de ticket !",
            ephemeral: true
          });
        }; 
    },
};
