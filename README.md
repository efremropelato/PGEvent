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
     CREATE OR REPLACE FUNCTION NOTIFY() RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
    $$
    BEGIN
        IF(TG_OP = 'DELETE') THEN
            PERFORM PG_NOTIFY('myEvent', '{"data": ' || ROW_TO_JSON(OLD)::TEXT || ', "type": "'::TEXT || TG_OP::TEXT|| '", "schemaName":"' ||  TG_TABLE_SCHEMA || '", "tableName":"' ||  TG_TABLE_NAME || '"}');
            RETURN OLD;
        ELSEIF(TG_OP = 'TRUNCATE') THEN
            PERFORM PG_NOTIFY('myEvent', '{"data": null, "type": "'::TEXT || TG_OP::TEXT|| '", "schemaName":"' ||  TG_TABLE_SCHEMA || '", "tableName":"' ||  TG_TABLE_NAME || '"}');
            RETURN NEW;
        ELSE
            PERFORM PG_NOTIFY('myEvent', '{"data": ' || ROW_TO_JSON(NEW)::TEXT || ', "type": "'::TEXT || TG_OP::TEXT|| '", "schemaName":"' ||  TG_TABLE_SCHEMA || '", "tableName":"' ||  TG_TABLE_NAME || '"}');
            RETURN NEW;
        END IF;
    END;
    $$;
    
    ALTER FUNCTION NOTIFY() OWNER TO POSTGRES;
     ```

	- Create a trigger to our table:

     ```sql
     CREATE TRIGGER TBLEXAMPLE_AFTER_STATEMENT
    AFTER INSERT OR UPDATE OR DELETE
    ON TBLEXAMPLE
    FOR EACH ROW
    EXECUTE PROCEDURE NOTIFY();

    CREATE TRIGGER TBLEXAMPLE_BEFORE_TRUNCATE
        BEFORE TRUNCATE
        ON TBLEXAMPLE
        FOR EACH STATEMENT
    EXECUTE PROCEDURE NOTIFY();
     ```

2. Init a npm project:

	- add dependencies: ```npm i -S pg```
	- create a index.js:
	```javascript
    var pg = require('pg'),
    conString = 'postgres://postgres:postgres@localhost:5432/PGEvent',
    pgClient;

    console.log('LISTEN myEvent');
    pgClient = new pg.Client(conString);
    pgClient.connect();

    pgClient.query('LISTEN "myEvent"');
    pgClient.on('notification', function (data) {
        try {
            console.log(`[${new Date}] - payload =>`, JSON.parse(data.payload));
        } catch (error) {
            console.error(error)
        } finally {
            console.log("Complete Message=> ",data);
        }
    });
  ```