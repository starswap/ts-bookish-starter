import {Param} from './db_types'

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
                reject(err);
            }
        });

        for (const {name: name, type: type, value: value} of params) {
            request.addParameter(name, type, value);
        }
    
        request.on('row', (columns: any[]) => {    
            rows.push(cb(columns));
        });

        request.on('requestCompleted', () => {
            resolve(rows)
        })

        connection.execSql(request);
    })
}
