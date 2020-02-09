import Notification from '../schemas/notification';
import Deliveryman from '../models/Deliveryman';

class NotificationController {
  async index(req, res) {
    const deliverymanExists = await Deliveryman.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!deliverymanExists) {
      return res.status(401).json({
        error: "Deliveryman dosn't exists.",
      });
    }

    const notifications = await Notification.find({
      deliveryman: req.params.id,
    })
      .sort({
        createdAt: 'desc',
      })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notId,
      {
        read: true,
      },
      {
        new: true,
      }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
