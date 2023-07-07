import Book from './book'

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

export function getBooks(): Promise<Book[]> {

    return new Promise((resolve, reject) => {

        const books: Book[] = [];
        const request = new Request('select * from book', (err: Error, rowCount: number) => {
            if (err) {
                throw err;
            }
            console.log('DONE!');
        });

        request.on('row', (columns: any[]) => {
            const book: Book  = {
                name: columns[0].value, 
                ISBN: columns[1].value
            };
            books.push(book);
        });

        request.on('doneInProc', (rowCount: number) => {
            console.log('Done is called!');
            resolve(books);
        });

        connection.execSql(request);
    })
}

