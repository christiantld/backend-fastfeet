import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  // Create
  async store(req, res) {
    // Validation of the req.body fields
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number()
        .positive()
        .required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.number()
        .positive()
        .min(8)
        .required(),
    });

    // if the req.body is not filled properly an error occurs
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    // zip_code is unique in the DB. Checks zip_code
    const RecipientExists = await Recipient.findOne({
      where: {
        zip_code: req.body.zip_code,
      },
    });

    if (RecipientExists) {
      return res.status(401).json({
        error: 'Recipient already exists',
      });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    });
  }

  // Update
  async update(req, res) {
    // Validation of the req.body fields
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { id } = req.params;
    const { zip_code } = req.body;

    // Checks if the id provided exists in the DB
    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(401).json({
        error: 'Recipient does not exists',
      });
    }

    const {
      name,
      street,
      number,
      complement,
      city,
      state,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    });
  }

  // Read All
  async index(req, res) {
    // List of all recipients
    const recipients = await Recipient.findAll();
    return res.json(recipients);
  }

  // Read one by id
  async show(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(401).json({
        error: 'User dos not exists',
      });
    }

    return res.json(recipient);
  }

  // Delete
  async delete(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(401).json({
        error: 'User dos not exists',
      });
    }

    await recipient.destroy();

    return res.json({
      message: 'Recipient has been deleted',
    });
  }
}

export default new RecipientController();
