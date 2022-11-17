import config from '../config/config.js';
import fs from 'fs';

export default class Data {
	static data = {};

	static addServer(serverId) {
		this.data[serverId] = {}
	}

	static getServer(serverId) { 
		return this.data[serverId]
	};

	/**
	 * @param {object} data
	 */
	static save() {
		fs.writeFileSync(config.pathData, JSON.stringify(this.data));
		console.log('Save data successful.')
	}

	static load() {
		console.log('Load data successful.')
		if (!fs.existsSync(config.pathData)) return this.data;
		return JSON.parse(fs.readFileSync(config.pathData));
	}
}
