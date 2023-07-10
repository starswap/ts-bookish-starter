import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { strict as assert } from 'node:assert';
import { User } from '../db_types';
import { createHash } from 'node:crypto'
import fs from 'fs';
import {sign} from 'jsonwebtoken';

class UserController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.post('/login', this.login.bind(this));
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

    async login(req, res) {
        const username = req.body["username"];
        const password = req.body["password"];
        if (!username || !password){
            res.status(400).send({success: false, message: "provide username and password fields"});
        } else if (!(await this.checkLogin(username, password))) {
            res.status(403).send({success: false, message: "unauthorised"})
        } else {
            let privKey = fs.readFileSync("jwt-rs256.key");
            let token = sign({username : username}, privKey, {algorithm : 'RS256'});
            res.status(200).send({success: true, token : token});
        }
    }
    
}

export default new UserController().router;
