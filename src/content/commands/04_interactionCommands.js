import Command from '../../core/Command.js';
import Bot from '../../../main.js';
import Game from '../../core/game/Game.js';
import userErrors from "../userErrors.js";
import titles from "../titles.js";

const description = 'Используя данную команду вы можете присоединиться к существующей игре введя уникальный номер игры';

Command.add('присоединиться', description, (client, message, gameId) => {
  if (gameId === undefined) {
    Bot.sendMessageUserError(message.channel, message.author, userErrors.notGameId);
    return;
  }

  const error = Game.joinPlayer(message.author, message.guildId, gameId);
  if (error) {
    Bot.sendMessageUserError(message.channel, message.author, error);
    return;
  }

  Bot.sendMessageInfoToUser(message.channel, message.author, titles.join);
})
