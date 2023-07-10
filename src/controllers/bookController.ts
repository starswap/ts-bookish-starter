import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { Book } from '../db_types';
import passport from 'passport';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/all', passport.authenticate("jwt", {session : false}), this.getAllBooks.bind(this));
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
        console.log("s")
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
    }

    createBook(req: Request, res: Response) {
        // TODO: implement functionality
        console.log("d")
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
    
}

export default new BookController().router;
