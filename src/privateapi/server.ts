import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import join from '../privateapi/routes/join';
import * as Logger from '../utility/logger';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(join);
app.listen(5007, () => {
    Logger.info('Private API Server is running on port 5007');
});
