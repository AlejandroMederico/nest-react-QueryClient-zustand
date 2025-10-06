import React, { useState } from 'react';
import { Loader } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import UpdateUserRequest from '../../models/user/UpdateUserRequest';
import { userService } from '../../services/UserService';
import useAuth from '../../store/authStore';

interface UpdateProfileProps {
  onClose?: () => void;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { authenticatedUser } = useAuth();
  const [error, setError] = useState<string>();

  const { data, isLoading, refetch } = useQuery(
    `user-${authenticatedUser.id}`,
    () => userService.findOne(authenticatedUser.id),
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<UpdateUserRequest>();

  const handleUpdateUser = async (updateUserRequest: UpdateUserRequest) => {
    try {
      if (updateUserRequest.username === data.username) {
        delete updateUserRequest.username;
      }
      await userService.updateUser(authenticatedUser.id, updateUserRequest);
      setError(null);
      setValue('password', '');
      refetch();
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  if (!isLoading) {
    return (
      <div className="card shadow max-w-lg mx-auto p-8">
        <form
          className="flex flex-col gap-6 justify-center w-full items-center"
          onSubmit={handleSubmit(handleUpdateUser)}
        >
          <h1 className="font-semibold text-4xl mb-8 text-center">
            {t('welcome') + ' ' + data.firstName}
          </h1>
          <hr />
          <div className="flex gap-4 w-full">
            <div className="w-1/2 flex flex-col gap-2">
              <label className="font-semibold">{t('first_name')}</label>
              <input
                type="text"
                className="input w-full mt-1"
                defaultValue={data.firstName}
                disabled={isSubmitting}
                placeholder="First Name"
                {...register('firstName')}
              />
            </div>
            <div className="w-1/2 flex flex-col gap-2">
              <label className="font-semibold">{t('last_name')}</label>
              <input
                type="text"
                className="input w-full mt-1"
                defaultValue={data.lastName}
                disabled={isSubmitting}
                placeholder="Last Name"
                {...register('lastName')}
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <label className="font-semibold">{t('username')}</label>
            <input
              type="text"
              className="input w-full mt-1"
              defaultValue={data.username}
              disabled={isSubmitting}
              placeholder="Username"
              {...register('username')}
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <label className="font-semibold">{t('password')}</label>
            <input
              type="password"
              className="input w-full mt-1"
              placeholder="Password (min 6 characters)"
              disabled={isSubmitting}
              {...register('password')}
            />
          </div>
          <button className="btn w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              'Update'
            )}
          </button>
          {error ? (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    );
  }

  return null;
};

export default UpdateProfile;
