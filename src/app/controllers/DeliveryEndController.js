import { Op } from 'sequelize';
import { parseISO, isBefore } from 'date-fns';
import Order from '../models/Order';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class DeliveryEndController {
  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(401).json({
        error: 'Deliveryman does not exist.',
      });
    }

    const delivery = await Order.findAll({
      where: {
        deliveryman_id: id,
        start_date: {
          [Op.ne]: null,
        },
        end_date: {
          [Op.ne]: null,
        },
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'deliveryman_id',
        'recipient_id',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'path', 'name'],
        },
      ],
    });

    return res.json(delivery);
  }

  async update(req, res) {
    const { id, delId } = req.params;

    const endDate = parseISO(req.body.end_date);
    if (isBefore(endDate, new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permitted',
      });
    }

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(401).json({
        error: 'Deliveryman does not exist.',
      });
    }

    const delivery = await Order.findOne({
      where: {
        id: delId,
        end_date: null,
        canceled_at: null,
        start_date: {
          [Op.ne]: null,
        },
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'recipient_id',
        'deliveryman_id',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'path', 'name'],
        },
      ],
    });

    if (!delivery) {
      return res.status(401).json({
        error: 'Delivery not eligeble to be finished or does not exists.',
      });
    }
    const startDate = delivery.start_date;
    if (isBefore(endDate, startDate)) {
      return res.status(400).json({
        error: 'Delivery date must be after the withdrawal date',
      });
    }

    const { signature_id } = req.body;

    delivery.update({
      end_date: endDate,
      signature_id,
    });

    return res.json(delivery);
  }
}

export default new DeliveryEndController();
