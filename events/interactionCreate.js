let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Vous avez déjà un ticket ouvert.',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Le ticket a été créé <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('C13EA9')
          .setAuthor('Raison', ' ')
          .setDescription('Choisissez une raison pour laquelle vous ouvrez ce ticket sinon celui se fermera automatiquement.')
          .setFooter('Système de tickets', ' ')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Choisir une raison pour laquelle vous ouvrez un ticket')
            .addOptions([{
                label: 'Modération',
                value: 'Modération',
                emoji: { name: '⚔️' }
              },
              {
                label: 'Technique',
                value: 'Technique',
                emoji: { name: '🔧' }
              },
              {
                label: 'Suggestion',
                value: 'Suggestion',
                emoji: { name: '💡' }
              },
              {
                label: 'Question',
                value: 'Question',
                emoji: { name: '❓' }
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 70000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('C13EA9')
                  .setAuthor('Ticket', ' ')
                  .setDescription(`<@!${interaction.user.id}> a créé un **Ticket** avec la raison suivante・ ${i.values[0]} \n\n Nous allons te répondre au plus vite !`)
                  .setFooter('Système de tickets', ' ')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Fermer le ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'Modération') {
              c.edit({
                parent: client.config.parentModerator
              });
            };
            if (i.values[0] == 'Technique') {
              c.edit({
                parent: client.config.parentTechnical
              });
            };
            if (i.values[0] == 'Suggestion') {
              c.edit({
                parent: client.config.parentSuggested
              });
            };
            if (i.values[0] == 'Question') {
              c.edit({
                parent: client.config.parentIssue
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Il n'y a pas de raison, le ticket sera fermé.`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

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

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Fermeture du ticket annulée',
            components: []
          });
        };
      });
    };

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
  },
};
