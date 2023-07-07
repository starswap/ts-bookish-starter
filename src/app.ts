import express from 'express';
import 'dotenv/config';
import healthcheckRoutes from './controllers/healthcheckController';
import bookRoutes from './controllers/bookController';
import { getBooks } from './db';

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


