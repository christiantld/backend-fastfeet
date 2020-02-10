/* eslint-disable object-curly-newline */
import { Op } from 'sequelize';
import {
  isAfter,
  isBefore,
  parseISO,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class DeliveryStartController {
  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(401).json({
        error: 'Delivery does not exist.',
      });
    }

    const delivery = await Order.findAll({
      where: {
        deliveryman_id: id,
        start_date: null,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'deliveryman_id', 'recipient_id'],
    });

    return res.json(delivery);
  }

  async update(req, res) {
    const startDate = parseISO(req.body.start_date);

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permitted',
      });
    }

    const startInterval = setMinutes(setHours(startDate, 8), 0);
    const endInterval = setMinutes(setHours(startDate, 18), 0);

    if (isAfter(startDate, endInterval) || isBefore(startDate, startInterval)) {
      return res.status(400).json({
        error: 'Orders pickup only between 08:00 and 18:00h',
      });
    }

    const { id, delId } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: {
        id,
      },
    });

    if (!deliveryman) {
      return res.status(400).json({
        error: 'Deliveryman does not exists',
      });
    }

    const delivery = await Order.findOne({
      where: {
        id: delId,
      },
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'Delivery does not exists',
      });
    }

    const deliveryBelongsToDeliveryman = await Order.findOne({
      where: {
        id: delId,
        deliveryman_id: id,
      },
    });

    if (!deliveryBelongsToDeliveryman) {
      return res.status(401).json({
        error: 'This Delivery does not belogs to Deliveryman',
      });
    }

    const ordersPickupInDay = await Order.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(startDate), endOfDay(startDate)],
        },
      },
    });

    const arrayOfIds = ordersPickupInDay.map((order) => order.id);

    if (ordersPickupInDay.length < 5 || arrayOfIds.includes(Number(delId))) {
      const data = await deliveryBelongsToDeliveryman.update(req.body, {
        attributes: ['id', 'product', 'recipient_id', 'start_date'],
      });

      return res.json(data);
    }

    return res.status(401).json({
      error: 'Limit of 5 withdrawals per day exceded',
    });
  }
}

export default new DeliveryStartController();
