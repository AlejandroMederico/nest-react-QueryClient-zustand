import axios from 'axios';

import { ContactForm } from '../models/contact/ContactForm';

export async function sendContact(form: ContactForm) {
  const res = await axios.post('/api/v1/contact', form);
  return res.data;
}
