import express from 'express';
import 'dotenv/config';
import healthcheckRoutes from './controllers/healthcheckController';
import bookRoutes from './controllers/bookController';
import { getBooks } from './db';
import {sign, verify} from 'jsonwebtoken';
import fs from 'fs';

const port = process.env['PORT'] || 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

app.use('/healthcheck', healthcheckRoutes);
app.use('/books', bookRoutes);
app.get('/', async (req, res) => {
    res.send(await getBooks());
});
app.post('/login', async (req, res) => {
 //   req.body.username;


    const username = req.body["username"];
    const password = req.body["password"];
    if (!username){
        res.status(400).send("No username")
        return;
    }
    if (!password){
        res.status(400).send("No password")
        return;
    }
    let privKey = fs.readFileSync("jwt-rs256.key");
    let token = sign({username : username}, privKey, {algorithm : 'RS256'});

    res.send({token : token});


});

