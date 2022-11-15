import { EventEmitter } from 'node:events';
import Starting from "./states/Starting.js";

export default class Game extends EventEmitter {
  static #freeId = 0;
  static games = {};
  static blacklistLetters = ['ь', 'ъ', 'й'];
  playerIndex = -1;
  words = [];
  letter = '';
  is_starting = false;

  /**
   * @param {Channel} channel
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

  joinPlayer(player) {
    return new Promise((resolve, reject) => {
      if (this.findPlayer(player.id) !== -1) return reject('Вы уже находитесь в этой игре');
      if (Game.findPlayer(player.id) !== -1) return reject('Вы уже находитесь в другой игре');
      this.players.push(player);

      resolve();
    })
  }

  findPlayer(playerId) {
    return this.players.findIndex((value) => value.id === playerId);
  }

  /**
   * @param {User} player
   * @param {User} playerOnKick
   */
  kickPlayer(player, playerOnKick) {
    return new Promise((resolve, reject) => {
      if (this.playerOwner.id !== player.id) return reject('Вы не владелец игры');
      if (this.findPlayer(playerOnKick.id) === -1) reject('Данного игрока нет в игре');
      if (this.playerOwner.id === playerOnKick.id) reject('Вы не можете кикнуть сами себя');

      const indexPlayer = this.findPlayer(playerOnKick.id);

      this.players.splice(indexPlayer, 1);

      resolve();
    })
  }

  /**
   * @param {User} playerOnLeave
   */
  leave(playerOnLeave) {
    return new Promise((resolve, reject) => {
      if (this.playerOwner.id === playerOnLeave.id) return reject('Вы владелец игры. Вы можете только удалить текущую игру');
      if (this.findPlayer(playerOnLeave.id) === -1) reject('Данного игрока нет в игре');

      const indexPlayer = this.findPlayer(playerOnLeave.id);

      this.players.splice(indexPlayer, 1);

      resolve();
    })
  }

  start(player) {
    return new Promise((resolve, reject) => {
      if (player.id !== this.playerOwner.id) reject('Вы не владелец игры');
      if (this.is_starting) {
        reject('Игра уже началась');
        return;
      }

      this.changeState(Starting);
      this.is_starting = true;

      resolve();
    })
  }

  changeState(newState) {
    this.state = new newState();
    this.state.game = this;
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

  /**
   * @param {TextChannel} channel
   * @param {User} owner
   */
  static create(channel, owner) {
    return new Promise((resolve, reject) => {
      if (this.findPlayer(owner.id) !== -1) reject('Вы уже находитесь в другой игре');

      const instance = new Game(channel, owner);
      this.#addGame(channel.guildId, instance);

      resolve(instance);
    })
  }
}
