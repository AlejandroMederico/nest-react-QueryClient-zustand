import { useState } from 'react';
import React from 'react';
import { AlertTriangle, Edit2, Loader, Trash2, X } from 'react-feather';
import { useForm } from 'react-hook-form';

import type Content from '../../models/content/Content';
import type UpdateContentRequest from '../../models/content/UpdateContentRequest';
import useAuth from '../../store/authStore';
import useContentStore from '../../store/contentStore';
import { toErrorMessage } from '../../utils/errors';
import Modal from '../shared/Modal';
import Table from '../shared/Table';
import TableItem from '../shared/TableItem';

interface ContentsTableProps {
  contents: Content[];
  courseId: string;
  isLoading: boolean;
}

export default function ContentsTable({
  contents,
  isLoading,
  courseId,
}: ContentsTableProps) {
  const { authenticatedUser } = useAuth();

  const deleteContent = useContentStore((s) => s.deleteContent);
  const updateContent = useContentStore((s) => s.updateContent);
  const fetchContents = useContentStore((s) => s.fetchContents);

  const [deleteShow, setDeleteShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [updateShow, setUpdateShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<UpdateContentRequest>();

  const handleDelete = async () => {
    if (!selectedContentId) return;
    try {
      setIsDeleting(true);
      await deleteContent(courseId, selectedContentId);
      await fetchContents(courseId); // re-sync una vez
      setDeleteShow(false);
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error deleting content'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (payload: UpdateContentRequest) => {
    if (!selectedContentId) return;
    try {
      const body = Object.fromEntries(
        Object.entries(payload).filter(
          ([, v]) => v !== undefined && String(v).trim() !== '',
        ),
      ) as UpdateContentRequest;

      await updateContent(courseId, selectedContentId, body);
      await fetchContents(courseId); // re-sync
      setUpdateShow(false);
      reset();
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error updating content'));
    }
  };

  return (
    <>
      <div className="table-container">
        <Table columns={['Name', 'Description', 'Created', 'Actions']}>
          {isLoading
            ? null
            : contents.map(({ id, name, description, dateCreated }) => (
                <tr key={id}>
                  <TableItem>{name}</TableItem>
                  <TableItem>{description}</TableItem>
                  <TableItem>
                    {new Date(dateCreated).toLocaleDateString()}
                  </TableItem>
                  <TableItem>
                    {['admin', 'editor'].includes(authenticatedUser?.role) ? (
                      <button
                        className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                        onClick={() => {
                          setSelectedContentId(id);
                          setValue('name', name);
                          setValue('description', description);
                          setUpdateShow(true);
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                    ) : null}
                    {authenticatedUser?.role === 'admin' ? (
                      <button
                        className="text-red-600 hover:text-red-900 ml-3 focus:outline-none"
                        onClick={() => {
                          setSelectedContentId(id);
                          setDeleteShow(true);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : null}
                  </TableItem>
                </tr>
              ))}
        </Table>
        {!isLoading && contents.length < 1 ? (
          <div className="text-center my-5 text-gray-500">
            <h1>Empty</h1>
          </div>
        ) : null}
      </div>

      {/* Delete Content Modal */}
      <Modal show={deleteShow}>
        <AlertTriangle size={30} className="text-red-500 mr-5 fixed" />
        <div className="ml-10">
          <h3 className="mb-2 font-semibold">Delete Content</h3>
          <hr />
          <p className="mt-2">
            Are you sure you want to delete the content? All of content's data
            will be permanently removed.
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

      {/* Update Content Modal */}
      {selectedContentId ? (
        <Modal show={updateShow}>
          <div className="flex">
            <h1 className="font-semibold mb-3">Update Content</h1>
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
            <input
              type="text"
              className="input"
              placeholder="Name"
              required
              {...register('name')}
            />
            <input
              type="text"
              className="input"
              placeholder="Description"
              required
              {...register('description')}
            />
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
      ) : null}
    </>
  );
}
