import Bot from '../../main.js';
import Middle from  './Middle.js';
import Game from '../Game.js';
import Config from "../../config.js";

export default class Starting {
    callback = (message) => {
        if (message.author.bot) return;
        if (message.channel !== this.game.channel) return;
        if (message.content.startsWith(Config.comment)) return;

        let letter = message.content.slice(-1).toLowerCase();

        if (Game.blacklistLetters.indexOf(letter) !== -1) letter = message.content.slice(-2)[0];

        this.game.letter = letter
        Bot.client.removeListener('messageCreate', this.callback);
        this.game.words.push(message.content);
        this.game.playerIndex = this.game.findPlayer(message.author.id);
        this.game.changeState(Middle);
    }

    constructor(game) {
        this.game = game;
    }

    cmd() {
        Bot.client.on('messageCreate', this.callback)

        this.game.channel.send({ embeds: [Bot.createEmbed()
                .setColor(0x00ffff)
                .setTitle(`Введите первое слово`)
            ]})
    }

    destroy() {
        Bot.client.removeListener('messageCreate', this.callback);
    }
}