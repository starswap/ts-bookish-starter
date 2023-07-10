import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { Book, Counts, BorrowWithUser, Borrow } from '../db_types';
import passport from 'passport';
import { TYPES, RequestError } from 'tedious';
import { strict as assert } from 'node:assert';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/all', passport.authenticate("jwt", {session : false}), this.getAllBooks.bind(this));
        this.router.get('/search', passport.authenticate("jwt", {session : false}), this.searchBooks.bind(this));
        this.router.get('/get', this.getBook.bind(this));
        this.router.post('/add', this.createBook.bind(this));
    }

    private async getBooksFromDB(): Promise<Book[]> {
        const books = await runQuery<Book>("SELECT * FROM book;", (columns) => {
            return {
                title: columns[0].value,
                isbn: columns[1].value
            };
        });
        return books;
    }

    private async getBorrowCounts(isbn: number) {
        const query = "SELECT COUNT(username) AS borrowed, \
                        COUNT(COALESCE(username, '_')) AS total \
                        FROM borrow RIGHT JOIN book_copy ON borrow.copy_id = book_copy.copy_id \
                        WHERE book_copy.isbn = @isbn";
        
        const counts = await runQuery<Counts>(query, (columns) => {
            return {
                borrowed: columns[0].value,
                total: columns[1].value
            };
        }, [{name: "isbn", type: TYPES.BigInt, value: isbn}]);

        assert(counts.length == 1); // should only receive one row of counts
        
        return counts[0];
    }

    private async getCurrentBorrows(isbn: number) {
        const query = "SELECT borrow.return_date, borrow.username \
        FROM borrow JOIN book_copy ON borrow.copy_id = book_copy.copy_id\
        WHERE book_copy.isbn = @isbn";
        return await runQuery<BorrowWithUser>(query, (columns) => {
                return {
                    user: columns[1].value,
                    return_date: columns[0].value
                };
            }, [{name: "isbn", type: TYPES.BigInt, value: isbn}]);

    }

    async createBook(req: Request, res: Response) {
        if (!req.body.isbn || !req.body.title || !req.body.authors || Number.isNaN(parseInt(req.body.isbn) || !req.body.authors.all((x) => typeof(x) == 'number'))) {
            return res.status(400).send({success: false, message: "Invalid Request"})
        } else {
            let allAuthorsExist = true;
            const query = `SELECT COUNT(author_name) FROM author WHERE author_id IN (${req.body.authors.map((x) => x.toString()).join(',')})`;
            await runQuery(query, 
                (columns) => {
                    allAuthorsExist = (columns[0].value == req.body.authors.length);
                }
            );
            
            if (!allAuthorsExist) {
                return res.status(400).send({success: false, message: "All authors must be numeric author ids which are present in the DB"})
            } else {
                const isbn_num = parseInt(req.body.isbn);

                try {
                    // Create the new book
                    await runQuery("INSERT INTO book(title, isbn) VALUES (@title, @isbn)", 
                                    () => {},
                                    [{name: "title", type: TYPES.VarChar, value: req.body.title},
                                    {name: "isbn", type: TYPES.BigInt, value: isbn_num}]);
                } catch (e) {
                    if (e instanceof RequestError) {
                        return res.status(409).send({success: false, message: "Failed to re-create book which already exists."});
                    } else {
                        throw(e);
                    }
                } 
                // Add the authors who wrote it:
                let query = "INSERT INTO wrote(isbn, author_id) VALUES ";
                let params = [{name: "isbn", type: TYPES.BigInt, value: isbn_num }]
                for (let i = 0; i < req.body.authors.length; ++i) {
                    query = query.concat(`(@isbn,@author${i}),`);
                    params.push({name: `author${i}`, type: TYPES.BigInt, value: req.body.authors[i] });
                }
                query = query.substring(0, query.length - 1); // remove trailing comma
                await runQuery(query, () => {}, params);
    
                // Add copies
                query = "INSERT INTO book_copy(isbn) VALUES ";
                for (let i = 0; i < req.body.number_of_copies; ++i) {
                    query = query.concat("(@isbn),");
                }
                query = query.substring(0, query.length - 1); // remove trailing comma

                await runQuery(query, () => {}, [{name: "isbn", type: TYPES.BigInt, value: isbn_num}]);
    
                return res.status(200).json({
                    success: true,
                    message: "New book(s) added."
                });    
            }
        }
    }

    async getAllBooks(req: Request, res: Response) {
        return res.status(200).send({
            "books": await this.getBooksFromDB()
        });
    };

    async searchBooks(req, res: Response) {
        const authorid = req.query["authorid"];
        const name = req.query["name"];

        let query = "SELECT DISTINCT title, book.isbn FROM book JOIN wrote ON book.isbn = wrote.isbn ".concat(name || authorid ? "WHERE " : "")
                                        .concat(name ? "title LIKE @search " : "")
                                        .concat(name && authorid ? "AND " : "")
                                        .concat(authorid ? "author_id=@authorid" : "");
        const books = await runQuery<Book>(query, (columns) => {
            return {
                title: columns[0].value,
                isbn: columns[1].value
            };
        }, [{name: "authorid", type: TYPES.BigInt, value: parseInt(authorid || '0')},
            {name: "search", type: TYPES.VarChar, value: '%'.concat(name).concat('%')}]);

        return res.status(200).send({
            "books": books
        });
    };

    async getBook(req, res: Response) {
        const isbn = req.query["isbn"];
        if (!isbn || Number.isNaN(parseInt(isbn))) {
            return res.status(400).send({"success":false, "message":"Bad Request"});
        } else {
            const isbn_num = parseInt(isbn);

            const borrow_counts = await this.getBorrowCounts(isbn_num);
            const total_copies = borrow_counts.total;
            const borrowed_copies = borrow_counts.borrowed;
            const avail_copies = borrow_counts.total - borrow_counts.borrowed;

            return res.status(200).json({
                total_copies: total_copies,
                avail_copies: avail_copies,
                borrows: (borrowed_copies > 0) ? await this.getCurrentBorrows(isbn_num) : []
            });
        }
    }
}

export default new BookController().router;
