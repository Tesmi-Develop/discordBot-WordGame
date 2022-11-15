import express from 'express';

export default class Site {
    static port = 3000;
    static app = express();

    static init() {
        this.app.get('/', (request, response) => {
            response.send('Бот активен')
        });

        this.app.listen(this.port, () => {
            console.log('Wed ready')
        })
    }
}

Site.init()
