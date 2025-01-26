import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';

const app: Express = express();
const port = 5005;
app.use(bodyParser.json());

// include routes and middlewares

app.get('/', (_: Request, res: Response) => {
  res.send('Welcome to Ai Agents');
});

app.use((_: Request, res: Response, next: NextFunction) => {
  res.status(404).send('404 - Not Found');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
