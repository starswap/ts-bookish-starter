import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { Book } from '../db_types';
import passport from 'passport';
import {TYPES} from 'tedious';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/all', passport.authenticate("jwt", {session : false}), this.getAllBooks.bind(this));
        this.router.get('/search', passport.authenticate("jwt", {session : false}), this.searchBooks.bind(this));
        this.router.get('/:id', this.getBook.bind(this));
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

    getBook(req: Request, res: Response) {
        // TODO: implement functionality
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
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
    
}

export default new BookController().router;
