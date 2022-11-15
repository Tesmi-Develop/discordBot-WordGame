import Command from '../Command.js';
import Bot from '../main.js';
import Game from '../game/Game.js';

const sendMessageError = (channel, user, error) => {
  channel.send({ embeds: [Bot.createEmbed()
      .setColor(0xff0000)
      .setTitle(`${user.username}. ` + error)
      .setDescription(`<@${user.id}>`)
    ], ephemeral: true })
    .then((message) => {
      setTimeout(() => {
        message.delete();
      }, 5000);
    })
}

const sendSpecialMessageJoin = (channel, userJoined) => {
  channel.send({ embeds: [Bot.createEmbed()
      .setColor(0x00ffff)
      .setTitle(`Вы присоединились как гей`)
      .setDescription(`<@${userJoined.id}>`)
    ], ephemeral: true })
    .then((message) => {
      setTimeout(() => {
        message.delete();
      }, 10000);
    })
}

const sendMessageLeave = (channel, userLeaved) => {
  channel.send({ embeds: [Bot.createEmbed()
      .setColor(0x00ffff)
      .setTitle(`Вы решили сдаться...`)
      .setDescription(`<@${userLeaved.id}>`)
    ], ephemeral: true })
    .then((message) => {
      setTimeout(() => {
        message.delete();
      }, 10000);
    })
}

const sendMessageKick = (channel, user, userKicked) => {
  channel.send({ embeds: [Bot.createEmbed()
      .setColor(0x00ffff)
      .setTitle(`Вас кикнули из игры...`)
      .setDescription(`<@${userKicked.id}>`)
    ], ephemeral: true })
    .then((message) => {
      setTimeout(() => {
        message.delete();
      }, 10000);
    })
}

const replyMessageError = (message, error) => {
  message.reply({ embeds: [Bot.createEmbed()
      .setColor(0xff0000)
      .setTitle(error)
    ], ephemeral: true })
}

const getListPlayer = (players) => {
  let listPlayers = '';

  players.forEach((element, index) => {
    if (index + 1 === players.length) {
      listPlayers += `<@${element.id}>`;
      return;
    }
    listPlayers += `<@${element.id}>\n`;
  });

  return listPlayers
}

Command.add('создатьИгру', 'Данная команда создаст новую игру.', (client, message) => {
  const channelId = message.channelId;

  Game.create(message.channel, message.author)
    .then((game) => {
      let listPlayers = getListPlayer(game.players);

      const row = Bot.createActionRow().addComponents(
        Bot.createButton()
          .setCustomId('join')
          .setLabel('Присоединиться'),
        Bot.createButton()
          .setCustomId('join-2')
          .setLabel('Присоединиться как гей'),
        Bot.createButton()
          .setCustomId('leave')
          .setLabel('Покинуть'),
        Bot.createButton()
          .setCustomId('start')
          .setLabel('Начать'),
        Bot.createButton()
          .setCustomId('delete')
          .setLabel('Удалить'),
      );

      const embedDescription = Bot.createFields([
        {
          name: '➤ Владелец',
          value: `<@${message.author.id}>`
        },
        {
          name: '➤ Список игроков',
          value: listPlayers
        },
        {
          name: '➤ Уникальный номер',
          value: `**${game.id}**`
        }
      ])

      const embed = Bot.createEmbed()
        .setTitle('Игра успешно создана')
        .setDescription(embedDescription);

      message.reply({ embeds: [embed], components: [row] })
        .then((reply) => {
          const collector = reply.createMessageComponentCollector();

          collector.on('collect', async (buttonInteraction) => {
            switch (buttonInteraction.customId) {
              case 'join':
                game.joinPlayer(buttonInteraction.user)
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'join-2':
                game.joinPlayer(buttonInteraction.user)
                  .then(() => {
                    sendSpecialMessageJoin(message.channel, buttonInteraction.user);
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'leave':
                game.leave(buttonInteraction.user)
                  .then(() => {
                    sendMessageLeave(message.channel, buttonInteraction.user);
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'start':
                game.start(buttonInteraction.user)
                    .catch((error) => {
                      sendMessageError(message.channel, buttonInteraction.user, error);
                    });
                break;
            }

            embed
              .setDescription(Bot.createFields([
                {
                  name: '➤ Владелец',
                  value: `<@${message.author.id}>`
                },
                {
                  name: '➤ Список игроков',
                  value: getListPlayer(game.players)
                },
                {
                  name: '➤ Уникальный номер',
                  value: `**${game.id}**`
                }
              ]));

            buttonInteraction.update({ embeds: [embed] });
          })
        })
    })
    .catch((error) => {
      message.reply({ embeds: [Bot.createEmbed()
          .setColor(0xff0000)
          .setTitle(error)
        ], ephemeral: true })
    })
});