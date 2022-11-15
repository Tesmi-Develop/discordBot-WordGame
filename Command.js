export default class Command {
    static #list = [];
    static get list() {
        return this.#list;
    };

    /**
     * @param {string} name
     * @param {string} description
     * @param {function} callback
     */
    constructor(name, description, callback) {
        this.name = name;
        this.description = description;
        this.callback = callback;
    }

    /**
     * @param {Command} command
     */
    static #addInArray(command) {
        this.#list.push(command);
    }

    /**
     * @param {string} name
     */
    static find(name) {
        return this.#list.find((command) => command.name.toLowerCase() === name);
    }

    /**
     * @param {string} name
     * @param {Client} client
     * @param {Message} message
     * @param {...string} args
     */
    static execute(name, client, message, ...args) {
        const command = this.find(name);

        if (command === undefined) return;

        command.callback(client, message, ...args);
    }

    /**
     * @param {string} name
     * @param {string} description
     * @param {function} callback
     */
    static add(name, description, callback) {
        this.#addInArray(new this(name, description, callback));
    }
}
