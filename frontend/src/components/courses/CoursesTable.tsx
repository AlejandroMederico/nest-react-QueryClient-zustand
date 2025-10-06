import { useEffect, useState } from 'react';
import React from 'react';
import {
  AlertTriangle,
  Edit2,
  Loader,
  Star,
  Star as StarFilled,
  Trash2,
  X,
} from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type Course from '../../models/course/Course';
import type UpdateCourseRequest from '../../models/course/UpdateCourseRequest';
import useAuth from '../../store/authStore';
import useCourseStore from '../../store/courseStore';
import { useFavoriteStore } from '../../store/favoriteStore';
import { toErrorMessage } from '../../utils/errors';
import Modal from '../shared/Modal';
import Table from '../shared/Table';
import TableItem from '../shared/TableItem';

interface CoursesTableProps {
  courses: Course[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (n: number) => void;
}

export default function CoursesTable({
  courses,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
}: CoursesTableProps) {
  const { authenticatedUser } = useAuth();
  const { t } = useTranslation();
  const userId = authenticatedUser?.id;
  const {
    toggleFavorite,
    loading: favLoading,
    fetchFavorites,
    isFavorite,
  } = useFavoriteStore();

  const coursesKey = courses.map((c) => c.id).join(',');

  useEffect(() => {
    if (!userId) return;
    void fetchFavorites(userId);
  }, [userId, fetchFavorites, coursesKey]);

  const deleteCourse = useCourseStore((s) => s.deleteCourse);
  const updateCourse = useCourseStore((s) => s.updateCourse);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);

  const [deleteShow, setDeleteShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [updateShow, setUpdateShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<UpdateCourseRequest>();

  const handleDelete = async () => {
    if (!selectedCourseId) return;
    try {
      setIsDeleting(true);
      await deleteCourse(selectedCourseId);
      await fetchCourses();
      setDeleteShow(false);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error deleting course'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (payload: UpdateCourseRequest) => {
    if (!selectedCourseId) return;
    try {
      const body = Object.fromEntries(
        Object.entries(payload).filter(
          ([, v]) => v !== undefined && String(v).trim() !== '',
        ),
      ) as UpdateCourseRequest;

      await updateCourse(selectedCourseId, body);
      await fetchCourses();
      setUpdateShow(false);
      reset();
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, 'Error updating course'));
    }
  };

  return (
    <>
      <div className="table-container">
        <Table
          columns={[
            t('name'),
            t('description'),
            t('created_updated'),
            t('actions'),
          ]}
        >
          {isLoading
            ? null
            : courses.map(({ id, name, description, dateCreated }) => {
                const courseId = String(id);
                const isFav = isFavorite(courseId);
                return (
                  <tr key={id}>
                    <TableItem>
                      <button
                        className="focus:outline-none mr-2"
                        title={isFav ? t('remove_favorite') : t('add_favorite')}
                        disabled={favLoading || !userId}
                        onClick={() =>
                          userId && toggleFavorite(courseId, isFav, userId)
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                        }}
                      >
                        {isFav ? (
                          <StarFilled
                            size={18}
                            color="#c1292e"
                            fill="#c1292e"
                          />
                        ) : (
                          <Star size={18} color="#aaa" />
                        )}
                      </button>
                      <Link
                        to={`/courses/${id}`}
                        className="no-underline"
                        style={{ textDecoration: 'none' }}
                      >
                        {name}
                      </Link>
                    </TableItem>
                    <TableItem>{description}</TableItem>
                    <TableItem>
                      {new Date(dateCreated).toLocaleDateString()}
                    </TableItem>
                    <TableItem>
                      {['admin', 'editor'].includes(authenticatedUser?.role) ? (
                        <button
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          onClick={() => {
                            setSelectedCourseId(id);
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
                            setSelectedCourseId(id);
                            setDeleteShow(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : null}
                    </TableItem>
                  </tr>
                );
              })}
        </Table>

        {!isLoading && courses.length < 1 ? (
          <div className="text-center my-5 text-gray-500">
            <h1>{t('empty')}</h1>
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

      {/* Delete Course Modal */}
      <Modal show={deleteShow}>
        <AlertTriangle size={30} className="text-red-500 mr-5 fixed" />
        <div className="ml-10">
          <h3 className="mb-2 font-semibold">{t('delete_course')}</h3>
          <hr />
          <p className="mt-2">{t('delete_course_confirm')}</p>
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
            {t('cancel')}
          </button>
          <button
            className="btn danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader className="mx-auto animate-spin" />
            ) : (
              t('delete')
            )}
          </button>
        </div>
        {error ? (
          <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
            {error}
          </div>
        ) : null}
      </Modal>

      {/* Update Course Modal */}
      <Modal show={updateShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">{t('update_course')}</h1>
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
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              t('save')
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
