import { useState } from 'react';
import React from 'react';
import { AlertTriangle, Edit2, Loader, Trash2, X } from 'react-feather';
import { useWatch } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { useDeleteUser, useUpdateUser } from '../../features/users/users.hooks';
import type { UsersListParams } from '../../lib/queryKeys';
import type UpdateUserRequest from '../../models/user/UpdateUserRequest';
import type User from '../../models/user/User';
import { toErrorMessage } from '../../utils/errors';
import Modal from '../shared/Modal';
import Table from '../shared/Table';
import TableItem from '../shared/TableItem';

interface UsersTableProps {
  isLoading: boolean;
  users: User[];
  visibleParams: UsersListParams;
  total?: number;
  onPageChange?: (n: number) => void;
}

export default function UsersTable({
  isLoading,
  users,
  visibleParams,
  total,
  onPageChange,
}: UsersTableProps) {
  const [deleteShow, setDeleteShow] = useState(false);
  const [updateShow, setUpdateShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  // ✅ Mutations (invalidan usando los params visibles)
  const deleteM = useDeleteUser(visibleParams);
  const updateM = useUpdateUser(visibleParams);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    control,
  } = useForm<UpdateUserRequest>();
  const isActiveValue = useWatch({ control, name: 'isActive' });

  const handleDelete = async () => {
    if (!selectedUserId) return;
    try {
      setIsDeleting(true);
      await deleteM.mutateAsync(selectedUserId);
      setDeleteShow(false);
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error deleting user'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (payload: UpdateUserRequest) => {
    if (!selectedUserId) return;
    try {
      const fixedPayload = {
        ...payload,
        isActive: Boolean(payload.isActive),
      };
      const body = Object.fromEntries(
        Object.entries(fixedPayload).filter(
          ([, v]) => v !== undefined && String(v).trim() !== '',
        ),
      ) as UpdateUserRequest;

      await updateM.mutateAsync({ id: selectedUserId, payload: body });
      setUpdateShow(false);
      reset();
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error updating user'));
    }
  };

  return (
    <>
      <div className="table-container">
        <Table columns={['Name', 'Username', 'Status', 'Role', 'Actions']}>
          {isLoading
            ? null
            : users.map(
                ({ id, firstName, lastName, role, isActive, username }) => (
                  <tr key={id}>
                    <TableItem>{`${firstName} ${lastName}`}</TableItem>
                    <TableItem>{username}</TableItem>
                    <TableItem>
                      {isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </TableItem>
                    <TableItem>{role}</TableItem>
                    <TableItem className="text-right">
                      <div className="flex items-center gap-4 whitespace-nowrap">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          onClick={() => {
                            setSelectedUserId(id);
                            setValue('firstName', firstName);
                            setValue('lastName', lastName);
                            setValue('username', username);
                            setValue('role', role);
                            setValue('isActive', isActive);
                            setUpdateShow(true);
                          }}
                          aria-label="Edit user"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                          onClick={() => {
                            setSelectedUserId(id);
                            setDeleteShow(true);
                          }}
                          aria-label="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableItem>
                  </tr>
                ),
              )}
        </Table>

        {!isLoading && users.length < 1 ? (
          <div className="text-center my-5 text-gray-500">
            <h1>Empty</h1>
          </div>
        ) : null}

        {/* Paginación */}
        {typeof total === 'number' && onPageChange && (
          <div className="flex justify-center my-4 gap-2">
            {Array.from(
              { length: Math.ceil(total / (visibleParams.limit || 10)) },
              (_, i) => (
                <button
                  key={i + 1}
                  className={`btn px-3 py-1 ${
                    visibleParams.page === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                  onClick={() => onPageChange(i + 1)}
                  disabled={visibleParams.page === i + 1}
                >
                  {i + 1}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      <Modal show={deleteShow}>
        <AlertTriangle size={30} className="text-red-500 mr-5 fixed" />
        <div className="ml-10">
          <h3 className="mb-2 font-semibold">Delete User</h3>
          <hr />
          <p className="mt-2">
            Are you sure you want to delete the user? All of user's data will be
            permanently removed.
            <br />
            This action cannot be undone.
          </p>
        </div>
        <div className="flex flex-row gap-3 justify-end mt-5">
          <button
            className="btn"
            onClick={() => {
              setError(null);
              setDeleteShow(false);
            }}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader className="mx-auto animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
        {error ? (
          <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
            {error}
          </div>
        ) : null}
      </Modal>

      {/* Update User Modal */}
      <Modal show={updateShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Update User</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              setUpdateShow(false);
              setError(null);
              reset();
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(handleUpdate)}
        >
          <div className="flex flex-col gap-5 sm:flex-row">
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="First Name"
              {...register('firstName')}
            />
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="Last Name"
              {...register('lastName')}
            />
          </div>
          <input
            type="text"
            className="input"
            placeholder="Username"
            {...register('username')}
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            {...register('password')}
          />
          <select className="input" {...register('role')}>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <div>
            <label className="font-semibold mr-3">Active</label>
            <input
              type="checkbox"
              className="input w-5 h-5"
              {...register('isActive')}
              checked={!!isActiveValue}
              onChange={(e) => setValue('isActive', e.target.checked)}
            />
          </div>
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              'Save'
            )}
          </button>
          {error ? (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
