import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { Book, Counts, BorrowWithUser, Borrow } from '../db_types';
import passport from 'passport';
import {TYPES} from 'tedious';
import { strict as assert } from 'node:assert';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/all', passport.authenticate("jwt", {session : false}), this.getAllBooks.bind(this));
        this.router.get('/search', passport.authenticate("jwt", {session : false}), this.searchBooks.bind(this));
        this.router.get('/get', this.getBook.bind(this));
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

    createBook(req: Request, res: Response) {
        // TODO: implement functionality
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
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
        if (!isbn) {
            return res.status(400).send({"success":false, "message":"Bad Request"});
        } else {
            const query = "SELECT COUNT(username) AS borrowed, \
                           COUNT(COALESCE(username, '_')) AS total \
                           FROM borrow RIGHT JOIN book_copy ON borrow.copy_id = book_copy.copy_id \
                           WHERE book_copy.isbn = @isbn";
            
            const counts = await runQuery<Counts>(query, (columns) => {
                return {
                    borrowed: columns[0].value,
                    total: columns[1].value
                };
            }, [{name: "isbn", type: TYPES.BigInt, value: parseInt(isbn)}]);

            console.log(counts)
            assert(counts.length == 1);
            
            const total_copies = counts[0].total;
            const borrowed_copies = counts[0].borrowed;
            const avail_copies = counts[0].total - counts[0].borrowed;


            let borrows: BorrowWithUser[] = [];
            if (borrowed_copies > 0) {
                const query = "SELECT borrow.return_date, borrow.username \
                               FROM borrow JOIN book_copy ON borrow.copy_id = book_copy.copy_id\
                               WHERE book_copy.isbn = @isbn";
                borrows = await runQuery<BorrowWithUser>(query, (columns) => {
                    return {
                        user: columns[1].value,
                        return_date: columns[0].value
                    };
                }, [{name: "isbn", type: TYPES.BigInt, value: parseInt(isbn)}]);
            }
            
            return res.status(200).json({
                total_copies: total_copies,
                avail_copies: avail_copies,
                borrows: borrows
            });
        }
    }
}

export default new BookController().router;
