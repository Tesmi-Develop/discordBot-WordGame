import process from 'node:process';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits} from 'discord.js';
import Command from './src/core/Command.js';
import config from './config/config.js';
import Data from './data/Data.js';
import fs from 'fs';
import Utility from "./src/utilities/Utility.js";

export default class Bot {
  static client = new Client({
    intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.GuildMessageReactions, 
      GatewayIntentBits.MessageContent
    ]
  });

  static timeBeforeDeleteMessage = 5000;

  static async init() {
    await this.load();

    process.on('SIGINT', () => {
      console.log("Caught interrupt signal");
    
      process.exit();
    });
    
    process.on('exit', () => {
      Data.save();
    });

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });
    
    this.client.on('messageCreate', (message) => {
      const content = message.content;
      const prefix = config.default.prefix;
    
      if (!content.startsWith(prefix)) return;
      
      const args = content.split(' ');
      const name = args[0].substring(prefix.length).toLowerCase();
    
      console.log(`Get new command: ${name}`);
      Command.execute(name, this.client, message, ...args.slice(1))
    });
    
    await this.client.login(config.token);
    console.log('Login successful');
  }

  static async load() {
    const files = fs.readdirSync('./src/content/commands');

    for (const item of files) {
        await import(`./src/content/commands/${item}`);
    }
  }

  static get username() {
    return this.client.user.username; 
  }

  static get avatar() { 
    return this.client.user.avatarURL(); 
  }

  static createActionRow() {
    return new ActionRowBuilder();
  }

  static createEmbed() {
    return new EmbedBuilder()
        .setColor(0x641d90)
        .setTimestamp()
        .setFooter({ text: Bot.username, iconURL: Bot.avatar });
  }

  /**
   * @return {ButtonBuilder}
   */
  static createButton() {
    return new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary);
  } 

  static replyMessage(message, content) {
    message.reply(content);
    message.delete();
  }

  static sendMessageUserError(channel, user, userError) {
    channel.send({ embeds: [Bot.createEmbed()
        .setColor(Utility.colors.red)
        .setTitle(`${user.username}. ${userError}`)
        .setDescription(`<@${user.id}>`)
      ], ephemeral: true })
      .then((message) => {
        setTimeout(() => {
          message.delete();
        }, this.timeBeforeDeleteMessage);
      })
  }

  static sendMessageInfoToUser(channel, user, title) {
    channel.send({ embeds: [Bot.createEmbed()
        .setColor(Utility.colors.blue)
        .setTitle(title)
        .setDescription(`<@${user.id}>`)
      ], ephemeral: true })
      .then((message) => {
        setTimeout(() => {
          message.delete();
        }, this.timeBeforeDeleteMessage);
      })
  }
}

Bot.init();
