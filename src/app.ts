import express from 'express';
import 'dotenv/config';
import healthcheckRoutes from './controllers/healthcheckController';
import bookRoutes from './controllers/bookController';
import { getBooks } from './db';
import {sign, verify} from 'jsonwebtoken';
import fs from 'fs';
import {Strategy, ExtractJwt} from 'passport-jwt'
import passport from 'passport'

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
    return console.log(`Express is listening at http://localhost:${port}`);
});

app.use('/healthcheck', healthcheckRoutes);
app.use('/books', bookRoutes);
app.get('/', passport.authenticate("jwt", {session : false}), async (req, res) => {
    res.send(await getBooks());
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

