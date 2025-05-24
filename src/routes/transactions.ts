import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '../middleware/checkSessionIdExists';

export async function transactionsRoutes(app: FastifyInstance) {

  app.get('/', {
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {

    const { sessionId } = req.cookies;

    const transactions = await knex('transactions').select().where('session_id', sessionId);

    res.status(200).send({
      transactions,
    });
  });

  app.get('/:id',{
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const { sessionId } = req.cookies;
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getTransactionParamsSchema.parse(req.params);

    const transaction = await knex('transactions').where({
      id,
      session_id: sessionId,
    }).first();

    res.status(200).send({
      transaction,
    });
  });

  app.get('/summary',{
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const { sessionId } = req.cookies;

    const summary = await knex('transactions').where({
      session_id: sessionId,
    }).sum('amount', { as: 'amount' }).first();

    res.status(200).send({
      summary,
    });
  });

  app.post('/', async (req, res) => {

    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { amount, title, type }  = createTransactionSchema.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if(!sessionId) {
      sessionId = randomUUID();
      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days,
      });
    }
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    res.status(201).send();
  });
}
