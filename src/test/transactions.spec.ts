import { afterAll, beforeAll, expect, test, describe } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { beforeEach } from 'node:test';
import { execSync } from 'child_process';

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:roolback --all');
    execSync('npm run knex migrate:latest');
  });

  test('should be create transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freelancer',
        amount: 8000,
        type: 'credit',
      }).expect(201);
  });

  test('should be list transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freelancer',
        amount: 8000,
        type: 'credit',
      }).expect(201);

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions').set('Cookie', cookies ?? [])
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      {
        id: expect.any(String),
        title: 'Freelancer',
        amount: 8000,
        session_id: expect.any(String),
        created_at: expect.any(String),
      },
    ]);
  });

  test('should be able to get specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freelancer',
        amount: 8000,
        type: 'credit',
      }).expect(201);

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions').set('Cookie', cookies ?? [])
      .expect(200);

    const id = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies ?? []);

    expect(getTransactionResponse.body.transaction).toEqual({
      id: expect.any(String),
      title: 'Freelancer',
      amount: 8000,
      session_id: expect.any(String),
      created_at: expect.any(String),
    });
  });

  test('should be able to get the summary', async () => {
    const VALUE_TRANSACTION_ONE = 8000;
    const VALUE_TRANSACTION_TWO = 3000;
    const createFirstTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freelancer',
        amount: VALUE_TRANSACTION_ONE,
        type: 'credit',
      }).expect(201);

    const cookies = createFirstTransactionResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies ?? [])
      .send({
        title: 'Freelancer',
        amount: VALUE_TRANSACTION_TWO,
        type: 'debit',
      }).expect(201);

    const listTransactionsResponse = await request(app.server)
      .get('/transactions').set('Cookie', cookies ?? [])
      .expect(200);

    const summaryTransactionsResponse = await request(app.server)
      .get('/transactions/summary').set('Cookie', cookies??[]);

    expect(summaryTransactionsResponse.body.summary).toEqual({
      amount: VALUE_TRANSACTION_ONE - VALUE_TRANSACTION_TWO,
    });
  });
});

