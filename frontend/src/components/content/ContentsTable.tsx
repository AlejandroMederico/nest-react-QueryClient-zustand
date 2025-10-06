import React, { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Edit2, Loader, Trash2, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const deleteContent = useContentStore((s) => s.deleteContent);
  const updateContent = useContentStore((s) => s.updateContent);
  const fetchContents = useContentStore((s) => s.fetchContents);

  const [deleteShow, setDeleteShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [updateShow, setUpdateShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

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
      setSelectedImage(null);
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
    setSelectedImage(null);
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
        const body = Object.fromEntries(
          Object.entries(payload).filter(
            ([k, v]) =>
              v !== undefined &&
              (k === 'image' ? v !== null : String(v).trim() !== ''),
          ),
        ) as UpdateContentRequest & { image?: File | null };
        if (selectedImage) {
          body.image = selectedImage;
        }
        await updateContent(courseId, selectedContentId, body);
        await fetchContents(courseId);
        closeUpdate();
      } catch (e: unknown) {
        setError(toErrorMessage(e, 'Error updating content'));
      }
    },
    [
      selectedContentId,
      courseId,
      updateContent,
      fetchContents,
      closeUpdate,
      selectedImage,
    ],
  );

  // Tamaño fijo responsivo para la imagen ampliada
  const modalImgStyle: React.CSSProperties = {
    width: '320px',
    height: '320px',
    maxWidth: '90vw',
    maxHeight: '90vw',
    borderRadius: 12,
    boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
    background: '#fff',
    objectFit: 'cover',
    display: 'block',
  };
  // En desktop, usar 480x480px
  if (typeof window !== 'undefined' && window.innerWidth >= 640) {
    modalImgStyle.width = '480px';
    modalImgStyle.height = '480px';
    modalImgStyle.maxWidth = '90vw';
    modalImgStyle.maxHeight = '90vh';
  }

  return (
    <>
      <div className="table-container">
        <Table
          columns={
            canEdit
              ? [
                  t('name'),
                  t('description'),
                  t('created_updated'),
                  t('image'),
                  t('actions'),
                ]
              : [t('name'), t('description'), t('created_updated'), t('image')]
          }
        >
          {isLoading ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                {t('loading')}
              </td>
            </tr>
          ) : contents.length > 0 ? (
            contents.map((_content) => (
              <tr key={_content.id}>
                <TableItem>{_content.name}</TableItem>
                <TableItem>{_content.description}</TableItem>
                <TableItem>
                  {_content.dateCreated
                    ? new Date(_content.dateCreated).toLocaleDateString()
                    : '—'}
                </TableItem>
                <TableItem>
                  {_content.image ? (
                    <img
                      src={
                        _content.image.startsWith('http')
                          ? _content.image
                          : `${_content.image.startsWith('/') ? '' : '/'}${
                              _content.image
                            }`
                      }
                      alt={_content.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 6,
                        background: '#f3f3f3',
                        display: 'block',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        setModalImage(
                          _content.image.startsWith('http')
                            ? _content.image
                            : `${_content.image.startsWith('/') ? '' : '/'}${
                                _content.image
                              }`,
                        )
                      }
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableItem>
                {/* Modal para ver imagen grande */}
                <Modal
                  show={!!modalImage}
                  className="flex flex-col items-center justify-center"
                >
                  <button
                    className="ml-auto mb-2 text-gray-700 hover:text-red-500 font-bold text-xl"
                    onClick={() => setModalImage(null)}
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 24,
                      zIndex: 10,
                    }}
                    aria-label="Cerrar imagen"
                  >
                    <X size={32} />
                  </button>
                  {modalImage && (
                    <img
                      src={modalImage}
                      alt="Imagen ampliada"
                      style={modalImgStyle}
                    />
                  )}
                </Modal>
                <TableItem>
                  {canEdit && (
                    <button
                      type="button"
                      title={t('edit')}
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      onClick={() => openUpdate(_content)}
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      title={t('delete')}
                      className="text-red-600 hover:text-red-900 ml-3 focus:outline-none"
                      onClick={() => openDelete(_content.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </TableItem>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                style={{ height: '180px', padding: 0 }}
                className="!p-0"
              >
                <div
                  className="flex flex-col items-center justify-center text-gray-500"
                  style={{ minHeight: '180px', width: '100%' }}
                >
                  <h1 className="text-center w-full flex justify-center">
                    {t('empty')}
                  </h1>
                </div>
              </td>
            </tr>
          )}
        </Table>
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
            <h3 className="mb-2 font-semibold">{t('delete_content')}</h3>
            <hr />
            <p className="mt-2">{t('delete_content_confirm')}</p>
          </div>
        </div>

        <div className="flex flex-row gap-3 justify-end mt-5">
          <button
            className="btn"
            onClick={closeDelete}
            disabled={isDeleting}
            type="button"
          >
            {t('cancel')}
          </button>
          <button
            className="btn danger"
            onClick={handleDelete}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? (
              <Loader
                aria-label={t('deleting')}
                className="mx-auto animate-spin"
              />
            ) : (
              t('delete')
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
          <h1 className="font-semibold mb-3">{t('update_content')}</h1>
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
          encType="multipart/form-data"
        >
          <input
            type="text"
            className="input"
            placeholder={t('name')}
            required
            {...register('name')}
          />
          <input
            type="text"
            className="input"
            placeholder={t('description')}
            required
            {...register('description')}
          />
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('add_image_optional')}
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                {t('select_image')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target.files && e.target.files[0]
                        ? e.target.files[0]
                        : null;
                    setSelectedImage(file);
                  }}
                />
              </label>
              {selectedImage && (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded border"
                  style={{ background: '#f3f3f3' }}
                />
              )}
            </div>
            {selectedImage && (
              <button
                type="button"
                className="text-xs text-red-500 mt-1 underline"
                onClick={() => setSelectedImage(null)}
              >
                {t('remove_image')}
              </button>
            )}
          </div>
          <button className="btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              t('save')
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
