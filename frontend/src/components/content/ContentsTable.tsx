import React, { useCallback, useMemo, useState } from 'react';
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
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const ContentsTable: React.FC<ContentsTableProps> = ({
  contents,
  courseId,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
}) => {
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

  const canEdit = useMemo(
    () => ['admin', 'editor'].includes(authenticatedUser?.role ?? ''),
    [authenticatedUser?.role],
  );
  const canDelete = useMemo(
    () => authenticatedUser?.role === 'admin',
    [authenticatedUser?.role],
  );

  const openUpdate = useCallback(
    (c: Content) => {
      setSelectedContentId(c.id);
      setValue('name', c.name);
      setValue('description', c.description ?? '');
      setUpdateShow(true);
    },
    [setValue],
  );

  const openDelete = useCallback((id: string) => {
    setSelectedContentId(id);
    setDeleteShow(true);
  }, []);

  const closeUpdate = useCallback(() => {
    setUpdateShow(false);
    setError(null);
    reset();
  }, [reset]);

  const closeDelete = useCallback(() => {
    setDeleteShow(false);
    setError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedContentId) return;
    try {
      setIsDeleting(true);
      await deleteContent(courseId, selectedContentId);
      await fetchContents(courseId);
      setDeleteShow(false);
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error deleting content'));
    } finally {
      setIsDeleting(false);
    }
  }, [selectedContentId, courseId, deleteContent, fetchContents]);

  const handleUpdate = useCallback(
    async (payload: UpdateContentRequest) => {
      if (!selectedContentId) return;
      try {
        // Limpia campos vacíos/undefined para enviar solo cambios reales
        const body = Object.fromEntries(
          Object.entries(payload).filter(
            ([, v]) => v !== undefined && String(v).trim() !== '',
          ),
        ) as UpdateContentRequest;

        await updateContent(courseId, selectedContentId, body);
        await fetchContents(courseId);
        closeUpdate();
      } catch (e: unknown) {
        setError(toErrorMessage(e, 'Error updating content'));
      }
    },
    [selectedContentId, courseId, updateContent, fetchContents, closeUpdate],
  );

  return (
    <>
      <div className="table-container">
        <Table columns={['Name', 'Description', 'Created/Updated', 'Actions']}>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                Cargando…
              </td>
            </tr>
          ) : contents.length > 0 ? (
            contents.map((c) => (
              <tr key={c.id}>
                <TableItem>{c.name}</TableItem>
                <TableItem>{c.description}</TableItem>
                <TableItem>
                  {c.dateCreated
                    ? new Date(c.dateCreated).toLocaleDateString()
                    : '—'}
                </TableItem>
                <TableItem>
                  {canEdit && (
                    <button
                      type="button"
                      title="Editar"
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      onClick={() => openUpdate(c)}
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      title="Eliminar"
                      className="text-red-600 hover:text-red-900 ml-3 focus:outline-none"
                      onClick={() => openDelete(c.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </TableItem>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                Empty
              </td>
            </tr>
          )}
        </Table>

        {!isLoading && contents.length < 1 ? (
          <div className="text-center my-5 text-gray-500">
            <h1>Empty</h1>
          </div>
        ) : null}
      </div>
      {/* Paginación */}
      {typeof total === 'number' && total > limit && (
        <div className="flex justify-center my-4 gap-2">
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
            <button
              key={i + 1}
              className={`btn px-3 py-1 ${
                page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => onPageChange(i + 1)}
              disabled={page === i + 1}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal Eliminar */}
      <Modal show={deleteShow}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={30} className="text-red-500 flex-shrink-0" />
          <div>
            <h3 className="mb-2 font-semibold">Eliminar contenido</h3>
            <hr />
            <p className="mt-2">
              ¿Seguro que deseas eliminar este contenido? Esta acción no se
              puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 justify-end mt-5">
          <button
            className="btn"
            onClick={closeDelete}
            disabled={isDeleting}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="btn danger"
            onClick={handleDelete}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? (
              <Loader
                aria-label="Eliminando…"
                className="mx-auto animate-spin"
              />
            ) : (
              'Eliminar'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-red-500 p-3 font-semibold border rounded-md bg-red-50">
            {error}
          </div>
        )}
      </Modal>

      {/* Modal Actualizar */}
      <Modal show={updateShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Actualizar contenido</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={closeUpdate}
            type="button"
            aria-label="Cerrar"
            title="Cerrar"
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
          <button className="btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              'Guardar'
            )}
          </button>

          {error && (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          )}
        </form>
      </Modal>
    </>
  );
};

export default ContentsTable;
