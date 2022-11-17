import { EventEmitter } from 'node:events';
import Starting from "./states/Starting.js";
import userErrors from "../../content/userErrors.js";

export default class Game extends EventEmitter {
  static #freeId = 0;
  static games = {};
  static blacklistLetters = ['ь', 'ъ', 'й', 'ы'];
  playerIndex = -1;
  words = [];
  letter = '';
  is_starting = false;

  /**
   * @param {TextChannel} channel
   * @param {User} owner
   */
  constructor(channel, owner) {
    super();
    this.channel = channel;
    this.playerOwner = owner;
    this.players = [];
    this.players.push(owner);
  }

  getPlayer() {
    return this.players[this.playerIndex];
  }

  join(player) {
    if (this.findPlayer(player.id) !== -1) return userErrors.joinedInThisGame;
    if (Game.findPlayer(player.id) !== -1) return userErrors.joinedInGame;
    this.players.push(player);
  }

  findPlayer(playerId) {
    return this.players.findIndex((value) => value.id === playerId);
  }

  /**
   * @param {User} player
   * @param {User} playerOnKick
   */
  kick(player, playerOnKick) {
    if (this.playerOwner.id !== player.id) return userErrors.notOwner;
    if (this.findPlayer(playerOnKick.id) === -1) return userErrors.missingGame;
    if (this.playerOwner.id === playerOnKick.id) return userErrors.kickSelf;

    const indexPlayer = this.findPlayer(playerOnKick.id);

    this.players.splice(indexPlayer, 1);
  }

  /**
   * @param {User} playerOnLeave
   */
  leave(playerOnLeave) {
    if (this.playerOwner.id === playerOnLeave.id) return userErrors.cantLeaveHisGame;
    if (this.findPlayer(playerOnLeave.id) === -1) return userErrors.missingGame;

    const indexPlayer = this.findPlayer(playerOnLeave.id);

    this.players.splice(indexPlayer, 1);
  }

  start(player) {
    if (player.id !== this.playerOwner.id) return userErrors.notOwner ;
    if (this.is_starting) return userErrors.gameStarted;

    this.changeState(Starting);
    this.is_starting = true;
  }

  remove(player) {
    if (player.id !== this.playerOwner.id) return userErrors.notOwner;

    const index = Game.games[this.channel.guildId].indexOf(this);
    Game.games[this.channel.guildId].splice(index, 1);

    if (this.state !== undefined) this.state.destroy();
  }

  changeState(newState) {
    this.state = new newState(this);
    this.emit('changeState', newState);
    this.state.cmd();
  }

  static findPlayer(playerId) {
    const keys = Object.keys(this.games);

    for (let i = 0; i < keys.length; i++) {
      const games = this.games[keys[i]];

      for (let ii = 0; ii < games.length; ii++) {
        const playerIndex = games[ii].findPlayer(playerId);
        if (playerIndex !== -1) return games[ii][playerIndex];
      }
    }

    return -1;
  }

  static #addGame(serverId, game) {
    if (this.games[serverId] === undefined) {
      this.games[serverId] = [];
    }

    this.games[serverId].push(game);
    game.id = this.#freeId;
    this.#freeId += 1;
  }

  convertPlayers() {
    let listPlayers = '';

    this.players.forEach((element, index) => {
      if (index + 1 === this.players.length) {
        listPlayers += `<@${element.id}>`;
        return;
      }
      listPlayers += `<@${element.id}>\n`;
    });

    return listPlayers
  }

  /**
   * @param {TextChannel} channel
   * @param {User} owner
   */
  static create(channel, owner) {
    if (this.findPlayer(owner.id) !== -1) return userErrors.joinedInGame;

    const instance = new Game(channel, owner);
    this.#addGame(channel.guildId, instance);

    return  instance;
  }

  static findGameById(serverId, id) {
    if (this.games[serverId] === undefined) return -1;

    return this.games[serverId].findIndex((value) => value.id === id);
  }

  static joinPlayer(player, serverId, gameId) {
    const game = this.findGameById(serverId, gameId);

    if (game === -1) return userErrors.gameNotFounded;

    game.joinPlayer(player);
  }
}
