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

const createActionRow = () => {
  return Bot.createActionRow().addComponents(
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
      .setCustomId('remove')
      .setLabel('Удалить'),
  );
}

const createEmbedGame = (game, message) => {
  const listPlayers = getListPlayer(game.players);

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

  return Bot.createEmbed()
    .setTitle('Игра успешно создана')
    .setDescription(embedDescription);
}

const updateListPlayer = (buttonInteraction, embed, owner, game) => {
  embed
    .setDescription(Bot.createFields([
      {
        name: '➤ Владелец',
        value: `<@${owner.id}>`
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

  buttonInteraction.update({embeds: [embed]});
}

Command.add('создатьИгру', '', (client, message) => {
  Game.create(message.channel, message.author)
    .then((game) => {

      const row = createActionRow();
      const embed = createEmbedGame(game, message);

      message.reply({ embeds: [embed], components: [row] })
        .then((reply) => {
          const collector = reply.createMessageComponentCollector();

          const collectorHandler = async (buttonInteraction) => {
            switch (buttonInteraction.customId) {
              case 'join':
                game.joinPlayer(buttonInteraction.user)
                  .then(() => {
                    updateListPlayer(buttonInteraction, embed, message.author, game);
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'join-2':
                game.joinPlayer(buttonInteraction.user)
                  .then(() => {
                    updateListPlayer(buttonInteraction, embed, message.author, game);
                    sendSpecialMessageJoin(message.channel, buttonInteraction.user);
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'leave':
                game.leave(buttonInteraction.user)
                  .then(() => {
                    updateListPlayer(buttonInteraction, embed, message.author, game);
                    sendMessageLeave(message.channel, buttonInteraction.user);
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'remove':
                game.remove(buttonInteraction.user)
                  .then(() => {
                    collector.removeListener('collect', collectorHandler);
                    reply.delete();
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
              case 'start':
                game.start(buttonInteraction.user)
                  .then(() => {
                    console.log('Game starting');
                  })
                  .catch((error) => {
                    sendMessageError(message.channel, buttonInteraction.user, error);
                  });
                break;
            }
          }

          collector.on('collect', collectorHandler);
        })
    })
    .catch((error) => {
      message.reply({ embeds: [Bot.createEmbed()
          .setColor(0xff0000)
          .setTitle(error)
        ], ephemeral: true })
    })
})
