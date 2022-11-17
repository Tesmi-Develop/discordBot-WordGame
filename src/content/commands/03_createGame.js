import Command from '../../core/Command.js';
import Bot from '../../../main.js';
import Game from '../../core/game/Game.js';
import titles from "../titles.js";
import Utility from "../../utilities/Utility.js";

const buttons = {
  join: 'join',
  specialJoin: 'join-2',
  leave: 'leave',
  start: 'start',
  remove: 'remove'
}

const createActionRow = () => {
  return Bot.createActionRow().addComponents(
    Bot.createButton()
      .setCustomId(buttons.join)
      .setLabel('Присоединиться'),
    Bot.createButton()
      .setCustomId(buttons.specialJoin)
      .setLabel('Присоединиться как гей'),
    Bot.createButton()
      .setCustomId(buttons.leave)
      .setLabel('Покинуть'),
    Bot.createButton()
      .setCustomId(buttons.start)
      .setLabel('Начать'),
    Bot.createButton()
      .setCustomId(buttons.remove)
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

const updatePlayers = (game, message, messageContent) => {
  const embed = createEmbedGame(game);
  messageContent.embeds = [embed];
  message.edit(messageContent);
}

Command.add('создатьИгру', 'Команда создаёт новую игру', (client, message) => {
  const game = Game.create(message.channel, message.author)

  const row = createActionRow();
  const embed = createEmbedGame(game, message);
  const messageContent = { embeds: [embed], components: [row] };

  message.reply(messageContent)
    .then((reply) => {
      const collector = reply.createMessageComponentCollector();

      collector.on('collect', async (buttonInteraction) => {
        let error;

        switch (buttonInteraction.customId) {
          case buttons.join:
            error = game.join(buttonInteraction.user);
            if (error) {
              Bot.sendMessageUserError(reply.channel, buttonInteraction.user, error);
              return;
            }

            Bot.sendMessageInfoToUser(reply.channel, buttonInteraction.user, titles.join);
            updatePlayers(game, reply, messageContent);

            break;
          case buttons.specialJoin:
            error = game.join(buttonInteraction.user);
            if (error) {
              Bot.sendMessageUserError(reply.channel, buttonInteraction.user, error);
              return;
            }

            Bot.sendMessageInfoToUser(reply.channel, buttonInteraction.user, titles.specialJoin);
            updatePlayers(game, reply, messageContent);

            break;
          case buttons.leave:
            error = game.leave(buttonInteraction.user);
            if (error) {
              Bot.sendMessageUserError(reply.channel, buttonInteraction.user, error);
              return;
            }

            Bot.sendMessageInfoToUser(reply.channel, buttonInteraction.user, titles.leave);
            updatePlayers(game, reply, messageContent);

            break;
          case buttons.remove:
            error = game.remove(buttonInteraction.user);
            if (error) {
              Bot.sendMessageUserError(reply.channel, buttonInteraction.user, error);
              return;
            }

            reply.delete();

            break;
          case buttons.start:
            error = game.start(buttonInteraction.user);
            if (error) {
              Bot.sendMessageUserError(reply.channel, buttonInteraction.user, error);
            }

            break;
        }
      });
    })
})
