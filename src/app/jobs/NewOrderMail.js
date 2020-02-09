import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'newOrderMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda para retirada',
      template: 'newOrder',
      context: {
        deliveryman: deliveryman.name,
        product,
        recipient_name: recipient.name,
        recipient_street: recipient.street,
        recipient_number: recipient.number,
        recipient_complement: recipient.complement,
        recipient_city: recipient.city,
        recipient_state: recipient.state,
        recipient_zipCode: recipient.zip_code,
      },
    });
  }
}

export default new NewOrderMail();
