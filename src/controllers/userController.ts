import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { strict as assert } from 'node:assert';
import { User, Borrow } from '../db_types';
import { createHash } from 'node:crypto'
import fs from 'fs';
import {sign} from 'jsonwebtoken';
import passport from 'passport';

class UserController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.post('/login', this.login.bind(this));
        this.router.get('/borrows/list', passport.authenticate("jwt", {session : false}), this.listBorrows.bind(this));
    }

    private sha256(content) {  
        return createHash('sha256').update(content).digest('hex')
    } 

    private async checkLogin(username: string, password_guess: string): Promise<boolean> {
        const users = await runQuery<User>("SELECT * FROM bookish_user WHERE username=@username;", (columns) => {
            return {
                username: columns[0].value,
                password_hash: columns[1].value
            };
        }, [{name: "username", value: username}]);
        
        assert(users.length <= 1);
        return (users.length == 1) && users[0].password_hash == this.sha256(password_guess);
    }

    async login(req: Request, res: Response) {
        const username = req.body["username"];
        const password = req.body["password"];
        if (!username || !password){
            res.status(400).send({success: false, message: "provide username and password fields"});
        } else if (!(await this.checkLogin(username, password))) {
            res.status(403).send({success: false, message: "unauthorised"})
        } else {
            const private_key_location = process.env["PRIV_KEY"] || "jwt-rs256.key";
            let privKey = fs.readFileSync(private_key_location);
            let token = sign({username : username}, privKey, {algorithm : 'RS256'});
            res.status(200).send({success: true, token : token});
        }
    }

    async listBorrows(req, res: Response) {
        const borrow_query = "SELECT book.title, borrow.return_date \
        FROM borrow \
        JOIN book_copy ON borrow.copy_id = book_copy.copy_id \
        JOIN book ON book_copy.isbn = book.isbn \
        WHERE borrow.username = @username";
        
        const borrows = await runQuery<Borrow>(borrow_query, (columns) => {
            return {
                title: columns[0].value,
                return_date: columns[1].value
            };
        }, [{name: "username", value: req.user}]);

        return res.status(200).send({"borrows":borrows});
    }
    
}

export default new UserController().router;
