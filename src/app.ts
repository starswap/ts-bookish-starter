import express from 'express';
import 'dotenv/config';
import userRoutes from './controllers/userController';
import healthcheckRoutes from './controllers/healthcheckController';
import bookRoutes from './controllers/bookController';
import fs from 'fs';
import { Strategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';

// Setup the passport authentication with JSON web tokens
function init_passport() {
    const public_key_location = process.env['PUB_KEY'] || "jwt-rs256.pub" ;
    let pubKey = fs.readFileSync(public_key_location);
    const ops = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: pubKey,
        algorithms: ["RS256"]
    }

    const strategy = new Strategy(ops, (payload, done) => {
        done(null, payload.username);
    })

    passport.use(strategy);
}

init_passport();

// Prepare the aplication
const port = process.env['PORT'] || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use('/healthcheck', healthcheckRoutes);
app.use('/books', bookRoutes);
app.use('/user', userRoutes);

// Run the app!
app.listen(port, () => {
    return console.log(`Bookish Library API is listening at http://localhost:${port}`);
});
