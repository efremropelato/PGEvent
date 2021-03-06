
const pg = require('pg'),
    conString = 'postgres://postgres:postgres@localhost:5432/PGEvent';

console.log('LISTEN myEvent');
const pgClient = new pg.Client(conString);
pgClient.connect();

pgClient.query('LISTEN "myEvent"');
pgClient.on('notification', (data) => {
    try {
        console.log(`[${new Date}] - payload =>`, JSON.parse(data.payload));
    } catch (error) {
        console.error(error)
    } finally {
        console.log("Complete Message=> ",data);
    }
});
