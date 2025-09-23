import { useEffect, useRef, useState } from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { shallow } from 'zustand/shallow';

import Layout from '../components/layout';
import Modal from '../components/shared/Modal';
import UsersTable from '../components/users/UsersTable';
import CreateUserRequest from '../models/user/CreateUserRequest';
import useUserStore from '../store/userStore';
import { toErrorMessage } from '../utils/errors';

export default function Users() {
  const [
    filtered,
    loading,
    error,
    setFilters,
    fetchUsers,
    addUser,
  ] = useUserStore(
    (s) => [
      s.filtered,
      s.loading,
      s.error,
      s.setFilters,
      s.fetchUsers,
      s.addUser,
    ],
    shallow,
  );

  // filtros UI
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const [addUserShow, setAddUserShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1) carga inicial (1 sola vez)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2) al cambiar inputs -> solo actualiza filtros locales (sin API)
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = (window.setTimeout(() => {
      setFilters({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
        role: role || undefined,
      });
      timerRef.current = null;
    }, 150) as unknown) as number;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [firstName, lastName, username, role, setFilters]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateUserRequest>();

  const saveUser = async (createUserRequest: CreateUserRequest) => {
    try {
      await addUser(createUserRequest); // re-sync con backend una vez
      setAddUserShow(false);
      setFormError(null);
      reset();
    } catch (e: unknown) {
      setFormError(toErrorMessage(e, 'Error creating user'));
    }
  };

  return (
    <Layout>
      <h1 className="font-semibold text-3xl mb-5">Manage Users</h1>
      <hr />
      <button
        className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
        onClick={() => setAddUserShow(true)}
      >
        <Plus /> Add User
      </button>

      {/* Filtros */}
      <div className="table-filter mt-2">
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            className="input w-1/2"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder="Username"
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

      <UsersTable isLoading={loading} users={filtered} />

      {/* Add User Modal */}
      <Modal show={addUserShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add User</h1>
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
              placeholder="First Name"
              required
              disabled={isSubmitting}
              {...register('firstName')}
            />
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="Last Name"
              required
              disabled={isSubmitting}
              {...register('lastName')}
            />
          </div>
          <input
            type="text"
            className="input"
            required
            placeholder="Username"
            disabled={isSubmitting}
            {...register('username')}
          />
          <input
            type="password"
            className="input"
            required
            placeholder="Password (min 6 characters)"
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
              'Save'
            )}
          </button>
          {formError ? (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {formError}
            </div>
          ) : null}
          {error && (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          )}
        </form>
      </Modal>
    </Layout>
  );
}
