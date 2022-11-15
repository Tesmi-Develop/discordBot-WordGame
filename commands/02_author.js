import Command from '../Command.js';

Command.add('авторы', 'Показывает авторов бота', (client, message) => {
    message.reply('> **Авторы**\n> -**Tesmi#204:**\n>   *YouTube*: https://www.youtube.com/channel/UC6reI1tVxc0IytdlpjgIFNQ\n>   *GitHub*: https://github.com/Tesmi-Devlop\n> -**TornadoTech#3699:**\n>   *Cite*: https://tornado-technology.github.io/Tornado-Technology/').then((botMessage) => {
        botMessage.suppressEmbeds();
    });
});