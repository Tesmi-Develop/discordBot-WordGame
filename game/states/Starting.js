import Bot from '../../main.js';
import Middle from  './Middle.js';
import Game from '../Game.js';

export default class Starting {
    constructor(game) {
        this.game = game;
    }
    cmd() {
        const callback = (message) => {
            if(message.author.bot) return;
            if(message.channel !== this.game.channel) return;

            const letter = message.content.slice(-1).toLowerCase();

            if (Game.blacklistLetters.indexOf(letter) !== -1) message.content.slice(-2);

            this.game.letter = letter
            Bot.client.removeListener('messageCreate', callback);
            this.game.words.push(message.content);
            this.game.changeState(Middle);
        }

        Bot.client.on('messageCreate', callback)

        this.game.channel.send({ embeds: [Bot.createEmbed()
                .setColor(0x00ffff)
                .setTitle(`Введите первое слово`)
            ]})
    }
}