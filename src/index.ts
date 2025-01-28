import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';

import agentRouter from './routes/agent.router';

const app: Express = express();
const port = 5005;
app.use(bodyParser.json());

// include routes and middlewares
app.use('/agent', agentRouter);

app.get('/stream', (req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  let count = 0;
  const interval = setInterval((): void => {
    count += 1;
    res.write(`Chunk ${count}\n`);

    if (count === 5) {
      clearInterval(interval);
      res.end('Done streaming!\n');
    }
  }, 1000);
});

app.get('/', (_: Request, res: Response) => {
  res.send('Welcome to Ai Agents');
});

app.use((_: Request, res: Response, next: NextFunction) => {
  res.status(404).send('404 - Not Found');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
