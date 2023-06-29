import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/connect.js';
import router from './router/route.js'

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');

const port = 8000;
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
})

app.use('/api', router)

connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log("Unable to connect to the server")
    }
}).catch(error => {
    console.log(error);
    console.log("invalid database connection")
})

