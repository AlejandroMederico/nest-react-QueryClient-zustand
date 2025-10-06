import React, { useState } from 'react';
import { Loader } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import logo from '../assets/favicon.png';
import AuthLayout from '../components/layout/AuthLayout';
import LoginRequest from '../models/auth/LoginRequest';
import { authService } from '../services/AuthService';
import useAuth from '../store/authStore';

export default function Login() {
  const { t } = useTranslation();
  const { setAuthenticatedUser, setToken } = useAuth();
  const history = useHistory();

  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginRequest>();

  const onSubmit = async (loginRequest: LoginRequest) => {
    try {
      const data = await authService.login(loginRequest);
      setAuthenticatedUser(data.user);
      setToken(data.token);
      history.push('/');
    } catch (error) {
      const message =
        error?.response?.data?.message || 'An unexpected error occurred';
      setError(message);
    }
  };

  return (
    <AuthLayout>
      <div className="card shadow">
        <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-3" />
        <h1 className="mb-3 text-center font-semibold text-4xl">
          {t('login')}
        </h1>
        <hr />
        <form
          className="flex flex-col gap-5 mt-8 w-64"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            className="input sm:text-lg"
            placeholder={t('username')}
            required
            disabled={isSubmitting}
            {...register('username')}
          />
          <input
            type="password"
            className="input sm:text-lg"
            placeholder={t('password')}
            required
            disabled={isSubmitting}
            {...register('password')}
          />
          <button
            className="btn mt-3 sm:text-lg"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              t('login')
            )}
          </button>
          {error ? (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </AuthLayout>
  );
}
