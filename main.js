import process from 'node:process';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits} from 'discord.js';
import Command from './Command.js';
import config from './config.js';
import Data from './data.js';
import fs from 'fs';

export default class Bot {
  static client = new Client({
    intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.GuildMessageReactions, 
      GatewayIntentBits.MessageContent
    ]
  });

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
    const files = fs.readdirSync('./commands');

    for (const item of files) {
        await import(`./commands/${item}`);
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
        .setColor(0x444444)
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

  static createFields(fields) {
    let fieldsString = '';

    fields.forEach((element) => {
      fieldsString += `**${element.name}**\n${element.value}\n`
    })

    return fieldsString;
  }
}

Bot.init();
