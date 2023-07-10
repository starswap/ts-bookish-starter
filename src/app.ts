import express from 'express';
import 'dotenv/config';
import healthcheckRoutes from './controllers/healthcheckController';
import bookRoutes from './controllers/bookController';
import {sign, verify} from 'jsonwebtoken';
import fs from 'fs';
import {Strategy, ExtractJwt} from 'passport-jwt'
import passport from 'passport'
import { runQuery } from './db';
import {Book} from './book';

function init_passport() {
    let pubKey = fs.readFileSync("jwt-rs256.pub");
    const ops = {
        jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey : pubKey,
        algorithms : ["RS256"] 
    }
    
    const strategy = new Strategy(ops, (payload, done)=>{
        done(null, payload.username)     
    })
    
    passport.use(strategy);
}
init_passport();

const port = process.env['PORT'] || 3000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.listen(port, () => {
    return console.log(`Bookish Library API is listening at http://localhost:${port}`);
});

async function getBooks(): Promise<Book[]> {
    const books = await runQuery<Book>("SELECT * FROM book;", (columns) => {
        return {
            title: columns[0].value,
            isbn: columns[1].value
        };
    });
    return books;
} 

app.use('/healthcheck', healthcheckRoutes);
app.use('/books', bookRoutes);
app.get('/', passport.authenticate("jwt", {session : false}), async (req, res) => {
    res.send({
        "books": await getBooks()
    });
});

app.post('/login', async (req, res) => {
    const username = req.body["username"];
    const password = req.body["password"];
    if (!username || !password){
        res.status(400).send({success: false, message: "provide username and password fields"});
    } else {
        let privKey = fs.readFileSync("jwt-rs256.key");
        let token = sign({username : username}, privKey, {algorithm : 'RS256'});
        res.send({token : token});
    }
});
