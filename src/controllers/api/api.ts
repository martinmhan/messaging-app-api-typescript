import { Router } from 'express';

import authenticate from './authenticate';
import userRouter from './user';
import conversationRouter from './conversation';

const apiRouter = Router();
apiRouter.use('*', authenticate);
apiRouter.use('/user', userRouter);
apiRouter.use('/conversation', conversationRouter);

export default apiRouter;