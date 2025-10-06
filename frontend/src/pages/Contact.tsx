import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import logo from '../assets/favicon.png';
import { ContactForm } from '../models/contact/ContactForm';
import { sendContact } from '../services/ContactService';

export default function ContactPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactForm>();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ContactForm) => {
    setSuccess(null);
    setError(null);
    try {
      const res = await sendContact(data);
      res.success
        ? setSuccess(t('message_sent_successfully'))
        : setError(t('error_sending_mail'));
      setTimeout(() => {
        history.push('/login');
      }, 4000);
    } catch (error: unknown) {
      error
        ? setError(t('error_sending_mail'))
        : setError(t('an_unexpected_error_occurred'));
      setTimeout(() => {
        setError(null);
        reset();
      }, 3000);
    }
  };

  return (
    <div className="h-full flex justify-center items-center">
      <div className="card shadow w-full max-w-lg sm:max-w-xl md:max-w-2xl p-6 sm:p-10">
        <img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mx-auto mb-3 cursor-pointer"
          onClick={() => history.push('/login')}
        />
        <h1 className="mb-3 text-center font-semibold text-4xl">
          {t('contact_link')}
        </h1>
        <hr />
        <form
          className="flex flex-col gap-5 mt-8 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className="input sm:text-lg"
            placeholder={t('name')}
            {...register('name', { required: true })}
            disabled={isSubmitting}
          />
          <input
            className="input sm:text-lg"
            placeholder={t('email')}
            type="email"
            {...register('email', { required: true })}
            disabled={isSubmitting}
          />
          <textarea
            className="input sm:text-lg resize-none"
            placeholder={t('message')}
            rows={5}
            {...register('message', { required: true })}
            disabled={isSubmitting}
          />
          <button
            className="btn mt-3 sm:text-lg"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('sending') : t('send')}
          </button>
          {success && (
            <div className="text-green-600 p-3 font-semibold border rounded-md bg-green-50 text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50 text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
