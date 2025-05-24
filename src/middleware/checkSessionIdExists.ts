import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';

export const checkSessionIdExists = (req: FastifyRequest, res: FastifyReply, done: DoneFuncWithErrOrRes) => {
  const sessionId = req.cookies.sessionId;
  if(!sessionId) {
    return res.status(401).send({
      error: 'Unauthorized',
    });
  }
  done();
};
