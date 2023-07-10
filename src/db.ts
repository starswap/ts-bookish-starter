import {Param} from './db_types'
import {TYPES} from 'tedious';

let Connection = require('tedious').Connection;
let Request = require('tedious').Request;

var config = {
    "server": "localhost",

    "authentication": {
        "type": "default",
        "options": {
            "userName": "bookish-user",
            "password": "password"
        }
    },
    "options": {
        "port": 1433,
        "trustServerCertificate": true,
        "database": "bookish"
    }
};

var connection = new Connection(config);

//Setup event handler when the connection is established. 
connection.on('connect', function (err: Error) {
    if (err) {
        console.log('Error: ', err)
    }
});

// Initialize the connection.

connection.connect();

export function runQuery<T>(query: string, cb: (columns: any[]) => T, params: Param[] = []): Promise<T[]> {

    return new Promise((resolve, reject) => {

        let rows: any[] = [];
        const request = new Request(query, (err: Error, rowCount: number) => {
            if (err) {
                throw err;
            }
        });

        for (const {name: name, value: value} of params) {
            request.addParameter(name, TYPES.VarChar, value);
        }

        request.on('row', (columns: any[]) => {    
            rows.push(cb(columns));
        });

        request.on('doneInProc', (rowCount: number) => {
            resolve(rows);
        });

        request.on('done', (rowCount: number) => {
            resolve(rows);
        });

        request.on('doneProc', (rowCount: number) => {
            resolve(rows);
        });

        connection.execSql(request);
    })
}
