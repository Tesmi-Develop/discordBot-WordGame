import Command from '../../core/Command.js';
import Bot from '../../../main.js';
import Game from '../../core/game/Game.js';
import gameError from '../../../config/gameError.js';
import gameAnswer from '../../../config/gameAnswer.js';

const description = 'Используя данную команду вы можете присоединиться к существующей игре введя уникальный номер игры';

Command.add('присоединиться', description, (client, message, gameId) => {
  const { channel, author, guildId } = message;

  if (gameId === undefined) {
    Bot.sendMessageUserError(channel, author, gameError.notGameId);
    return;
  }

  const error = Game.joinPlayer(author, guildId, gameId);
  if (error) {
    Bot.sendMessageUserError(channel, author, error);
    return;
  }

  Bot.sendMessageInfoToUser(channel, author, gameAnswer.join);
})
