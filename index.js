
var pg = require('pg'),
    conString = 'postgres://postgres:postgres@localhost:5432/PGEvent',
    pgClient;

console.log('LISTEN myEvent');
pgClient = new pg.Client(conString);
pgClient.connect();

pgClient.query('LISTEN "myEvent"');
pgClient.on('notification', function (data) {
    console.log("\033[34m" + new Date + '-\033[0m payload', data.payload);
    console.log("complete message=> ",data);
});
