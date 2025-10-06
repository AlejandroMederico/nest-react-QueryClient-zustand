import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { shallow } from 'zustand/shallow';

import ContentsTable from '../components/content/ContentsTable';
import Layout from '../components/layout';
import Modal from '../components/shared/Modal';
import type CreateContentRequest from '../models/content/CreateContentRequest';
import { courseService } from '../services/CourseService';
import useAuth from '../store/authStore';
import useContentStore from '../store/contentStore';
import { toErrorMessage } from '../utils/errors';

export default function Course() {
  const { t } = useTranslation();
  const history = useHistory();
  const { id: courseId } = useParams<{ id: string }>();
  const { authenticatedUser } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [addContentShow, setAddContentShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [bucket, setFilters, setPage, fetchContents, addContent] =
    useContentStore(
      (s) => [
        s.byCourse[courseId ?? ''],
        s.setFilters,
        s.setPage,
        s.fetchContents,
        s.addContent,
      ],
      shallow,
    );
  const loading = bucket?.loading ?? false;
  const error = bucket?.error ?? null;
  const contents = bucket?.contents ?? [];
  const page = bucket?.page ?? 1;
  const limit = bucket?.limit ?? 10;
  const total = bucket?.total ?? 0;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!courseId) return;
      const _course = await courseService.findOne(courseId);
      if (mounted) setCourseName(_course?.name ?? '');
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    fetchContents(courseId);
  }, [courseId, fetchContents]);

  useEffect(() => {
    if (!courseId) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setFilters(courseId, {
        name: name || undefined,
        description: description || undefined,
      });
      timerRef.current = null;
    }, 300) as unknown as number;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [courseId, name, description, setFilters]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateContentRequest>();

  const saveContent = async (req: CreateContentRequest) => {
    try {
      if (!courseId) return;
      const body = {
        ...req,
        image: selectedImage || undefined,
      };
      await addContent(courseId, body);
      setAddContentShow(false);
      setFormError(null);
      setSelectedImage(null);
      reset();
    } catch (e: unknown) {
      setFormError(toErrorMessage(e, 'Error creating content'));
    }
  };

  return (
    <Layout>
      <h1 className="font-semibold text-3xl mb-5">
        {courseName ? `${courseName} ${t('contents')}` : ''}
      </h1>
      <hr />
      <div className="flex flex-row gap-3 my-5">
        {authenticatedUser.role !== 'user' ? (
          <>
            <button
              className="btn flex items-center justify-center gap-2 w-full sm:w-auto"
              style={{ minHeight: 48 }}
              onClick={() => history.push('/courses')}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                ←
              </span>
              <span className="flex-1 flex items-center justify-center">
                {t('back')}
              </span>
            </button>
            <button
              className="btn flex items-center justify-center gap-2 w-full sm:w-auto"
              style={{ minHeight: 48 }}
              onClick={() => setAddContentShow(true)}
            >
              <span className="flex items-center">
                <Plus />
              </span>
              <span className="flex-1 flex items-center justify-center">
                {t('add_content')}
              </span>
            </button>
          </>
        ) : null}
      </div>

      <div className="table-filter">
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="input w-1/2"
            placeholder={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <ContentsTable
        contents={contents}
        isLoading={loading}
        courseId={courseId!}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(courseId!, p)}
      />

      {/* Add Content Modal */}
      <Modal show={addContentShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">{t('add_content')}</h1>
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
          encType="multipart/form-data"
        >
          <input
            type="text"
            className="input"
            placeholder={t('name')}
            disabled={isSubmitting}
            required
            {...register('name')}
          />
          <input
            type="text"
            className="input"
            placeholder={t('description')}
            disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              t('save')
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
