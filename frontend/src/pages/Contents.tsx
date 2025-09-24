import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { shallow } from 'zustand/shallow';

import ContentsTable from '../components/content/ContentsTable';
import Layout from '../components/layout';
import Modal from '../components/shared/Modal';
import type CreateContentRequest from '../models/content/CreateContentRequest';
import courseService from '../services/CourseService';
import useAuth from '../store/authStore';
import useContentStore from '../store/contentStore';
import { toErrorMessage } from '../utils/errors';

export default function Course() {
  const { id: courseId } = useParams<{ id: string }>();
  const { authenticatedUser } = useAuth();

  const [bucket, setFilters, fetchContents, addContent] = useContentStore(
    (s) => [
      s.byCourse[courseId ?? ''],
      s.setFilters,
      s.fetchContents,
      s.addContent,
    ],
    shallow,
  );

  const loading = bucket?.loading ?? false;
  const error = bucket?.error ?? null;
  const contents = bucket?.filtered ?? [];

  // Para el título (nombre del curso): dejamos el fetch directo
  const [courseName, setCourseName] = useState('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!courseId) return;
      const c = await courseService.findOne(courseId);
      if (mounted) setCourseName(c?.name ?? '');
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  // carga inicial
  useEffect(() => {
    if (!courseId) return;
    fetchContents(courseId);
  }, [courseId, fetchContents]);

  // filtros UI locales
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // debounce corto para aplicar filtros al store (sin API)
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!courseId) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setFilters(courseId, {
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
  }, [courseId, name, description, setFilters]);

  // modal crear
  const [addContentShow, setAddContentShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateContentRequest>();

  const saveContent = async (req: CreateContentRequest) => {
    try {
      if (!courseId) return;
      await addContent(courseId, req); // re-sync luego de crear
      setAddContentShow(false);
      setFormError(null);
      reset();
    } catch (e: unknown) {
      setFormError(toErrorMessage(e, 'Error creating content'));
    }
  };

  return (
    <Layout>
      <h1 className="font-semibold text-3xl mb-5">
        {courseName ? `${courseName} Contents` : ''}
      </h1>
      <hr />
      {authenticatedUser.role !== 'user' ? (
        <button
          className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
          onClick={() => setAddContentShow(true)}
        >
          <Plus /> Add Content
        </button>
      ) : null}

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

      <ContentsTable
        contents={contents}
        isLoading={loading}
        courseId={courseId!}
      />

      {/* Add Content Modal */}
      <Modal show={addContentShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add Content</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setAddContentShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveContent)}
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
