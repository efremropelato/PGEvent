# PGEvent
Example of using pg_notify into Nodejs project

1. Create a new test database and execute script.sql:

	- First we create a table:

     ```sql
     CREATE TABLE PUBLIC.TBLEXAMPLE
     (
         KEY1 CHARACTER VARYING(10) NOT NULL,
         KEY2 CHARACTER VARYING(14) NOT NULL,
         VALUE1 CHARACTER VARYING(20),
         VALUE2 CHARACTER VARYING(20) NOT NULL,
         CONSTRAINT TBLEXAMPLE_PKEY PRIMARY KEY (KEY1, KEY2)
     )
     ```

	- Create a function:

     ```sql
     CREATE OR REPLACE FUNCTION PUBLIC.NOTIFY() RETURNS trigger AS
     $BODY$
     BEGIN
         PERFORM pg_notify('myEvent', row_to_json(NEW)::text);
         RETURN new;
     END;
     $BODY$
     LANGUAGE 'plpgsql' VOLATILE COST 100;
     ```

	- Create a trigger to our table:

     ```sql
     CREATE TRIGGER TBLEXAMPLE_AFTER
     AFTER INSERT
     ON PUBLIC.TBLEXAMPLE
     FOR EACH ROW
     EXECUTE PROCEDURE PUBLIC.NOTIFY();
     ```

2. Init a npm project:

	- add dependencies: ```npm i -S pg```
	- create a index.js:
	```javascript
    var pg = require('pg'),
    conString = 'postgres://postgres:postgres@localhost:5432/TEST',
    pgClient;

    console.log('LISTEN myEvent');
    pgClient = new pg.Client(conString);
    pgClient.connect();

    pgClient.query('LISTEN "myEvent"');
    pgClient.on('notification', function (data) {
        console.log("\033[34m" + new Date + '-\033[0m payload', data.payload);
    });
  ```