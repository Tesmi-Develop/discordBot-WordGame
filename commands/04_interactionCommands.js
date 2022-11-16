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

const sendMessageJoin = (channel, userJoined) => {
  channel.send({ embeds: [Bot.createEmbed()
      .setColor(0x00ffff)
      .setTitle(`Вы присоединились в игру`)
      .setDescription(`<@${userJoined.id}>`)
    ], ephemeral: true })
    .then((message) => {
      setTimeout(() => {
        message.delete();
      }, 10000);
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


Command.add('присоединиться', 'Используя данную команду вы можете присоединиться к существующей игре введя уникальный номер игры', (client, message, gameId) => {
  if (gameId === undefined) {
    message.reply('**Пожалуйста введите уникальный номер игры**');
    return;
  }

  Game.joinPlayer(message.author, message.guildId, gameId)
    .then(() => {
      sendMessageJoin(message.channel, message.author);
    })
    .catch((error) => {
      sendMessageError(message.channel, message.author, error);
    })
})
