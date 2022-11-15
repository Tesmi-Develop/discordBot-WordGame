import Game from "../Game.js";
import Bot from "../../main.js";

export default class Middle {
    constructor(game) {
        this.game = game;
    }
    cmd() {
        this.nextPlayer();

        const callback = (message) => {
            if(message.author.bot) return;
            if(message.channel !== this.game.channel) return;
            if(message.author.id !== this.game.getPlayer().id) return;

            const firstLetter = message.content[0].toLowerCase();
            const letter = message.content.slice(-1).toLowerCase();

            if (firstLetter !== this.game.letter) return;
            if (Game.blacklistLetters.indexOf(letter) !== -1) message.content.slice(-2);

            this.game.letter = letter
            this.game.words.push(message.content);
            this.nextPlayer();
        }

        Bot.client.on('messageCreate', callback)
    }

    nextPlayer() {
        this.game.playerIndex += 1;
        if (this.game.playerIndex === -1 || this.game.playerIndex >= this.game.players.length) this.game.playerIndex = 0;

        const player = this.game.players[this.game.playerIndex];

        this.game.channel.send({ embeds: [Bot.createEmbed()
                .setColor(0x00ffff)
                .setTitle(`${player.username}. Вам слово на ${this.game.letter}`)
                .setDescription(`<@${player.id}>`)
            ]})
    }
}