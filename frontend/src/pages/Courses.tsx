import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { shallow } from 'zustand/shallow';

import CoursesTable from '../components/courses/CoursesTable';
import Layout from '../components/layout';
import Modal from '../components/shared/Modal';
import type CreateCourseRequest from '../models/course/CreateCourseRequest';
import useAuth from '../store/authStore';
import useCourseStore from '../store/courseStore';
import { toErrorMessage } from '../utils/errors';

export default function Courses() {
  const { authenticatedUser } = useAuth();

  const [courses, loading, error, setFilters, fetchCourses, addCourse] =
    useCourseStore(
      (_state) => [
        _state.filtered,
        _state.loading,
        _state.error,
        _state.setFilters,
        _state.fetchCourses,
        _state.addCourse,
      ],
      shallow,
    );

  // filtros UI (solo tocan el store; no API)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [addCourseShow, setAddCourseShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Carga inicial (una vez)
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce corto para filtros locales
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setFilters({
        name: name || undefined,
        description: description || undefined,
      });
      timerRef.current = null;
    }, 150) as unknown as number;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [name, description, setFilters]);

  // form crear curso
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateCourseRequest>();

  const saveCourse = async (createCourseRequest: CreateCourseRequest) => {
    try {
      await addCourse(createCourseRequest);
      setAddCourseShow(false);
      setFormError(null);
      reset();
    } catch (e: unknown) {
      setFormError(toErrorMessage(e, 'Error creating course'));
    }
  };

  return (
    <Layout>
      <h1 className="font-semibold text-3xl mb-5">Manage Courses</h1>
      <hr />
      {authenticatedUser.role !== 'user' ? (
        <button
          className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
          onClick={() => setAddCourseShow(true)}
        >
          <Plus /> Add Course
        </button>
      ) : null}

      {/* Filtros */}
      <div className="table-filter">
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="input w-1/2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <CoursesTable courses={courses} isLoading={loading} />

      {/* Add Course Modal */}
      <Modal show={addCourseShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add Course</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setAddCourseShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveCourse)}
        >
          <input
            type="text"
            className="input"
            placeholder="Name"
            disabled={isSubmitting}
            required
            {...register('name')}
          />
          <input
            type="text"
            className="input"
            placeholder="Description"
            disabled={isSubmitting}
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
