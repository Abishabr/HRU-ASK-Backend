import express, { json } from 'express'
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/userRoutes.js'
import questionRouter from './routes/questionRoute.js'
import answerRouter from './routes/answerRoute.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express();

app.use(json());

const port = process.env.PORT || 3000;



app.use('/', userRouter)
app.use('/', questionRouter);
app.use('/', answerRouter);

// Error handler must be last
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});