import { Request, Response, Router } from 'express';

import { query } from '../agents/singleAgent';

const agentRouter = Router();

// create a post request to handle the query
// @ts-ignore
agentRouter.post('/', async (req: Request, res: Response) => {
  const { question, maxTurns } = req.body;

  if (!question || typeof question !== 'string') {
      return res.status(400).send('Invalid or missing "question" parameter.');
  }

  const turns = maxTurns ? parseInt(maxTurns as string, 10) : 5;

  try {
      const resultStream = await query(question, turns);

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Pipe the stream to the response
      resultStream.pipe(res);

      resultStream.on('error', (err) => {
          console.error(err);
          res.status(500).send('Error occurred during processing.');
      });

      resultStream.on('end', () => {
          res.end();
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Failed to process the query.');
  }
});

export default agentRouter;
