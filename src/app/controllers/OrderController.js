import * as Yup from 'yup';
import Order from '../models/Order';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Notification from '../schemas/notification';
import NewOrderMail from '../jobs/NewOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'city',
            'state',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number()
        .required()
        .min(1),
      deliveryman_id: Yup.number()
        .required()
        .min(1),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation Fails',
      });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({
        error: 'Deliveryman does not exists',
      });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({
        error: 'Recipient does not exists',
      });
    }

    const { id, product } = await Order.create(req.body);

    // Notificar o entregador

    await Notification.create({
      content: `Olá ${deliveryman.name}, você tem uma nova encomenda disponível para retirada`,
      deliveryman: deliveryman_id,
    });

    // Enviar Email com dados da encomenda para o entregador

    await Queue.add(NewOrderMail.key, {
      deliveryman,
      recipient,
      product,
    });

    return res.json({
      id,
      product,
      deliveryman_id,
      recipient_id,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
      signature_id: Yup.number(),
      canceled_at: Yup.string(),
      start_date: Yup.string(),
      end_date: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation Fails',
      });
    }

    const id = Number(req.params.id);

    const delivery = await Order.findByPk(id);

    if (!delivery) {
      return res.status(401).json({
        error: 'Delivery not found',
      });
    }

    const deliveryUpdate = await delivery.update(req.body);

    return res.json(deliveryUpdate);
  }

  async delete(req, res) {
    const delivery = await Order.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({
        error: 'Delivery does not exist.',
      });
    }

    await delivery.destroy();

    return res.json({
      message: 'Delivery deleted',
    });
  }
}

export default new OrderController();
