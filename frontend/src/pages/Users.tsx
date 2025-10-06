import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Layout from '../components/layout';
import Modal from '../components/shared/Modal';
import UsersTable from '../components/users/UsersTable';
import { useCreateUser, useUsersList } from '../features/users/users.hooks';
import CreateUserRequest from '../models/user/CreateUserRequest';
import { toErrorMessage } from '../utils/errors';

export default function Users() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const terms = [firstName, lastName, username].filter(Boolean).join(' ');
      setQ(terms);
      timerRef.current = null;
    }, 300) as unknown as number;
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [firstName, lastName, username]);

  // --- Params server-side ---
  const [page, setPage] = useState(1);
  const limit = 10;
  const params = {
    page,
    limit,
    sort: 'createdAt',
    order: 'desc' as const,
    q,
    role,
  };

  // --- Data + Mutations ---
  const { data, isFetching, isError, error, refetch } = useUsersList(params);
  const createM = useCreateUser(params);

  // --- Modal "Add" ---
  const [addUserShow, setAddUserShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateUserRequest>();

  const saveUser = async (payload: CreateUserRequest) => {
    try {
      await createM.mutateAsync(payload);
      setAddUserShow(false);
      setFormError(null);
      reset();
    } catch (e: unknown) {
      setFormError(toErrorMessage(e, 'Error creating user'));
    }
  };

  return (
    <Layout>
      <h1 className="font-semibold text-3xl mb-5">{t('manage_users')}</h1>
      <hr />
      <div className="my-5 flex gap-2 w-full sm:w-auto">
        <button className="btn flex gap-2" onClick={() => setAddUserShow(true)}>
          <Plus /> {t('add_user')}
        </button>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? t('updating') : t('refresh')}
        </button>
      </div>

      {/* Filtros */}
      <div className="table-filter mt-2">
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder={t('first_name')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            className="input w-1/2"
            placeholder={t('last_name')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select
            className="input w-1/2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isError && (
        <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
          {(error as Error).message}
        </div>
      )}
      <UsersTable
        isLoading={isFetching}
        users={data?.data ?? []}
        visibleParams={params}
        total={data?.meta?.total ?? 0}
        onPageChange={setPage}
        refetch={refetch}
      />

      {/* Add User Modal */}
      <Modal show={addUserShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">{t('add_user')}</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setFormError(null);
              setAddUserShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveUser)}
        >
          <div className="flex flex-col gap-5 sm:flex-row">
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder={t('first_name')}
              required
              disabled={isSubmitting}
              {...register('firstName')}
            />
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder={t('last_name')}
              required
              disabled={isSubmitting}
              {...register('lastName')}
            />
          </div>
          <input
            type="text"
            className="input"
            required
            placeholder={t('username')}
            disabled={isSubmitting}
            {...register('username')}
          />
          <input
            type="password"
            className="input"
            required
            placeholder={t('password_placeholder')}
            disabled={isSubmitting}
            {...register('password')}
          />
          <select
            className="input"
            required
            {...register('role')}
            disabled={isSubmitting}
          >
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              t('save')
            )}
          </button>
          {formError && (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {formError}
            </div>
          )}
        </form>
      </Modal>
    </Layout>
  );
}
