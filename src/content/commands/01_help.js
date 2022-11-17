import Command from '../../core/Command.js';

Command.add('хелп', 'Отображает все команды и описание к ним.', (client, message) => {
    let replyMessage = '> **Список всех команд**\n\n';
    Command.list.forEach((command) => {
        replyMessage += `> **${command.name}** - *${command.description}*\n`;
    });
    message.reply(replyMessage);
});