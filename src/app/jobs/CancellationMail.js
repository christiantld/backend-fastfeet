import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, order, deliveryProblem } = data;
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda Cancelada',
      template: 'cancellation',
      context: {
        deliveryman_name: deliveryman.name,
        order_product: order.product,
        recipient_name: recipient.name,
        recipient_zipCode: recipient.zip_code,
        deliveryProblem_description: deliveryProblem.description,
      },
    });
  }
}

export default new CancellationMail();
