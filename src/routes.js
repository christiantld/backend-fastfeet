import 'dotenv/config';

import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import UserController from './app/controllers/UserController';
import OrderController from './app/controllers/OrderController';
import NotificationController from './app/controllers/NotificationController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import DeliveryEndController from './app/controllers/DeliveryEndController';
import DeliveryStartController from './app/controllers/DeliveryStartController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// List Open Deliveries
routes.get('/deliveryman/:id/open-deliveries', DeliveryStartController.show);

// List Finished Deliveries
routes.get('/deliveryman/:id/closed-deliveries', DeliveryEndController.show);

// Start Delivery
routes.put(
  '/deliveryman/:id/start-delivery/:delId',
  DeliveryStartController.update
);

// End Delivery
routes.put(
  '/deliveryman/:id/end-delivery/:delId',
  DeliveryEndController.update
);
// Delivery problems
routes.get('/delivery/problems', DeliveryProblemController.show);
routes.get('/delivery/:id/problems', DeliveryProblemController.index);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);

// Abaixo todos as rotas usam o middleware global
routes.use(authMiddleware);

// User
routes.put('/users', UserController.update);
routes.delete('/users', UserController.delete);

// Recipient
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients/', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.delete('/recipients/:id', RecipientController.delete);

// Deliveryman
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.get('/deliveryman/', DeliverymanController.index);
routes.get('/deliveryman/:id', DeliverymanController.show);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

// Notifications

routes.get('/deliveryman/:id/notifications', NotificationController.index);
routes.put(
  '/deliveryman/:id/notifications/:notId',
  NotificationController.update
);
// Order
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.get('/orders/', OrderController.index);
// routes.get('/order/:id', OrderController.show);
routes.delete('/orders/:id', OrderController.delete);

// File upload
routes.post('/files', upload.single('file'), FileController.store);
export default routes;

// Cancel Delivery
routes.put('/problem/:id/cancel-delivery', DeliveryProblemController.update);
