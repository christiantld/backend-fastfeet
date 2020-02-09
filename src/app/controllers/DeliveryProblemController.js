import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async show(req, res) {
    const DeliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'description', 'createdAt'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'deliveryman_id', 'recipient_id'],
        },
      ],
    });

    if (!DeliveryProblems) {
      return res.status(400).json({
        error: 'No problems reported',
      });
    }

    return res.json(DeliveryProblems);
  }

  async index(req, res) {
    const { id } = req.params;

    const orderExists = await Order.findByPk(id);

    if (!orderExists) {
      return res.status(400).json({
        error: 'Delivery does not exists',
      });
    }

    const deliveryProblem = await DeliveryProblem.findAll({
      where: {
        order_id: id,
      },
      attributes: ['id', 'description', 'createdAt'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'deliveryman_id', 'recipient_id'],
        },
      ],
    });

    if (!DeliveryProblem) {
      return res.status(400).json({
        error: 'No problems reported',
      });
    }

    return res.json(deliveryProblem);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { id } = req.params;
    const { description } = req.body;

    const deliveryExists = await Order.findByPk(Number(id));

    if (!deliveryExists) {
      return res.status(400).json({
        error: 'Delivery does not exists',
      });
    }

    const deliveryProblem = await DeliveryProblem.create({
      description,
      order_id: id,
    });

    return res.json(deliveryProblem);
  }

  async update(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(id);

    if (!deliveryProblem) {
      return res.status(400).json({
        error: 'This problem was not reported',
      });
    }

    const order = await Order.findByPk(deliveryProblem.order_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'zip_code'],
        },
      ],
    });

    if (order.end_date !== null && order.signature_id !== null) {
      return res.status(400).json('Delivery accomplished');
    }

    order.update(
      {
        canceled_at: new Date(),
      },
      {
        where: {
          id: deliveryProblem.order_id,
        },
      }
    );

    await Queue.add(CancellationMail.key, {
      deliveryman: order.deliveryman,
      recipient: order.recipient,
      order,
      deliveryProblem,
    });

    return res.json({
      ok: 'Delivery Canceled',
    });
  }
}

export default new DeliveryProblemsController();
