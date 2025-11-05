import express, { json } from 'express'
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/userRoutes.js'

const app = express();

app.use(json());

const port = process.env.PORT || 3000;



app.use('/', userRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});