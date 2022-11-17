import Command from '../../core/Command.js';
import Bot from '../../../main.js';
import Game from '../../core/game/Game.js';
import gameReplice from '../../../config/gameAnswer.js';
import Utility from '../../utilities/Utility.js';

const buttonId = {
  join: 'join',
  specialJoin: 'join-2',
  leave: 'leave',
  start: 'start',
  remove: 'remove'
}

const createActionRow = () => {
  return Bot.createActionRow().addComponents(
    Bot.createButton()
      .setCustomId(buttonId.join)
      .setLabel('Присоединиться'),
    Bot.createButton()
      .setCustomId(buttonId.specialJoin)
      .setLabel('Присоединиться как гей'),
    Bot.createButton()
      .setCustomId(buttonId.leave)
      .setLabel('Покинуть'),
    Bot.createButton()
      .setCustomId(buttonId.start)
      .setLabel('Начать'),
    Bot.createButton()
      .setCustomId(buttonId.remove)
      .setLabel('Удалить'),
  );
}

const createEmbedGame = (game) => {
  const listPlayers = game.convertPlayers();

  const embedDescription = Utility.createFields(
    {
      name: '➤ Владелец',
      value: `<@${game.playerOwner.id}>`
    },
    {
      name: '➤ Список игроков',
      value: listPlayers
    },
    {
      name: '➤ Уникальный номер',
      value: `**${game.id}**`
    }
  )

  return Bot.createEmbed()
    .setTitle('Игра успешно создана')
    .setDescription(embedDescription);
}

Command.add('создатьИгру', 'Команда создаёт новую игру', (client, message) => {
  const game = Game.create(message.channel, message.author)

  const row = createActionRow();
  const embed = createEmbedGame(game);
  const messageOptions = { embeds: [embed], components: [row] };

  message.reply(messageOptions)
    .then((reply) => {
      const collector = reply.createMessageComponentCollector();

      collector.on('collect', async (buttonInteraction) => {
        let error;
        const { customId, user } = buttonInteraction;
        const { channel } = reply;

        const updateMessage = () => {
          const embed = createEmbedGame(game);
          messageOptions.embeds = [embed];
          message.edit(messageOptions);
        }

        const sendMessageInfoToUser = (info) => {
          Bot.sendMessageInfoToUser(channel, user, info);
        }

        const sendMessageUserError = (error) => {
          Bot.sendMessageUserError(channel, user, error);
        }
        
        switch (customId) {
          case buttonId.join:
          case buttonId.specialJoin:
            error = game.join(user);
            if (error) {
              sendMessageUserError(error);
              break;
            }

            sendMessageInfoToUser(customId === buttonId.join ? gameReplice.join :gameReplice.specialJoin);
            updateMessage();
            break;
            
          case buttonId.leave:
            error = game.leave(user);
            if (error) {
              sendMessageUserError(error);
              break;
            }

            sendMessageInfoToUser(gameReplice.leave);
            updateMessage();
            break;
            
          case buttonId.remove:
            error = game.remove(user);
            if (error) {
              sendMessageUserError(error);
              break;
            }

            reply.delete();
            break;

          case buttonId.start:
            error = game.start(user);
            if (error) {
              sendMessageUserError(error);
            }
            break;
        }
      });
    })
})
