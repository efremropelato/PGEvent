
import * as pg from 'pg';
const conString = 'postgres://postgres:postgres@localhost:5432/PGEvent';

console.log('LISTEN myEvent');
const pgClient = new pg.Client(conString);
pgClient.connect();

pgClient.query('LISTEN "myEvent"');
pgClient.on('notification', (data: any) => {
    try {
        data = {
            ...data,
            payload: JSON.parse(data.payload)
        }
        console.log(`Message =>`, data);
    } catch (error) {
        console.error(error)
    } finally {
        console.log("[${new Date}] - Complete");
    }
});

process.stdin.resume(); //so the program will not close instantly

const signalHandler = async (signal: AbortSignal) => {
    console.log("Close Message listen", signal);
    process.exit();
    // pgClient.release()
};

//do something when app is closing
process.on("EXIT", signalHandler);
//catches ctrl+c event
process.on("SIGINT", signalHandler);
process.on("SIGTERM", signalHandler);
process.on("SIGQUIT", signalHandler);
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", signalHandler);
process.on("SIGUSR2", signalHandler);
