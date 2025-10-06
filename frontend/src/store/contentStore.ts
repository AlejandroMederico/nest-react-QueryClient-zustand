import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import type Content from '../models/content/Content';
import type ContentQuery from '../models/content/ContentQuery';
import type CreateContentRequest from '../models/content/CreateContentRequest';
import type UpdateContentRequest from '../models/content/UpdateContentRequest';
import { contentService } from '../services/ContentService';
import { toErrorMessage } from '../utils/errors';

type CourseBucket = {
  contents: Content[];
  filters: ContentQuery;
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: string | null;
};

type State = {
  byCourse: Record<string, CourseBucket>;
};

type Actions = {
  setFilters: (courseId: string, partial: ContentQuery) => void;
  setPage: (courseId: string, page: number) => void;
  setLimit: (courseId: string, limit: number) => void;
  fetchContents: (courseId: string) => Promise<void>;
  addContent: (
    courseId: string,
    payload: CreateContentRequest,
  ) => Promise<void>;
  updateContent: (
    courseId: string,
    id: string,
    payload: UpdateContentRequest,
  ) => Promise<void>;
  deleteContent: (courseId: string, id: string) => Promise<void>;
};

const emptyBucket: CourseBucket = Object.freeze({
  contents: [],
  filters: {},
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
});
const ensureCourseId = (courseId: string) => {
  if (!courseId) throw new Error('Course ID is required');
};

const ensurePayload = (payload: object, what = 'payload') => {
  if (!payload || Object.keys(payload).length === 0)
    throw new Error(`No fields to ${what}`);
};

const updateCourse = (
  _state: State,
  courseId: string,
  updater: (prev: CourseBucket) => CourseBucket,
): State => {
  const prev = _state.byCourse[courseId] ?? emptyBucket;
  return {
    ..._state,
    byCourse: {
      ..._state.byCourse,
      [courseId]: updater(prev),
    },
  };
};

const ensureBucket = (prev: CourseBucket): CourseBucket => ({
  contents: prev.contents ?? [],
  filters: prev.filters ?? {},
  page: prev.page ?? 1,
  limit: prev.limit ?? 10,
  total: prev.total ?? 0,
  loading: prev.loading ?? false,
  error: prev.error ?? null,
});

const useContentStore = createWithEqualityFn<State & Actions>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      byCourse: {},

      setFilters(courseId, partial) {
        ensureCourseId(courseId);
        set((state) =>
          updateCourse(state, courseId, (prev0) => {
            const prev = ensureBucket(prev0);
            const nextFilters = { ...prev.filters, ...partial };
            return {
              ...prev,
              filters: nextFilters,
              page: 1, // reset page on filter change
              error: null,
            };
          }),
        );
        get().fetchContents(courseId);
      },

      setPage(courseId, page) {
        ensureCourseId(courseId);
        set((state) =>
          updateCourse(state, courseId, (prev0) => ({
            ...ensureBucket(prev0),
            page,
          })),
        );
        get().fetchContents(courseId);
      },

      setLimit(courseId, limit) {
        ensureCourseId(courseId);
        set((state) =>
          updateCourse(state, courseId, (prev0) => ({
            ...ensureBucket(prev0),
            limit,
            page: 1,
          })),
        );
        get().fetchContents(courseId);
      },

      async fetchContents(courseId) {
        ensureCourseId(courseId);

        set((state) =>
          updateCourse(state, courseId, (prev0) => ({
            ...ensureBucket(prev0),
            loading: true,
            error: null,
          })),
        );

        try {
          const bucket = get().byCourse[courseId] ?? emptyBucket;
          const { filters, page, limit } = bucket;
          const { data, meta } = await contentService.findAll(courseId, {
            ...filters,
            page,
            limit,
          });
          set((state) =>
            updateCourse(state, courseId, (prev0) => ({
              ...ensureBucket(prev0),
              contents: data,
              filters,
              page: meta?.page ?? 1,
              limit: meta?.limit ?? 10,
              total: meta?.total ?? data.length,
              loading: false,
              error: null,
            })),
          );
        } catch (e: unknown) {
          const msg = toErrorMessage(e, 'Error fetching contents');
          set((state) =>
            updateCourse(state, courseId, (prev0) => ({
              ...ensureBucket(prev0),
              loading: false,
              error: msg,
            })),
          );
        }
      },

      async addContent(courseId, payload) {
        ensureCourseId(courseId);
        ensurePayload(payload, 'add');

        set((state) =>
          updateCourse(state, courseId, (prev0) => ({
            ...ensureBucket(prev0),
            loading: true,
            error: null,
          })),
        );

        try {
          await contentService.save(courseId, payload);
          await get().fetchContents(courseId);
        } catch (e: unknown) {
          // No setear error global (evita doble mensaje: banner + modal)
          throw e;
        } finally {
          set((state) =>
            updateCourse(state, courseId, (prev0) => ({
              ...ensureBucket(prev0),
              loading: false,
            })),
          );
        }
      },

      async updateContent(courseId, id, payload) {
        ensureCourseId(courseId);
        if (!id) throw new Error('Content ID is required');
        ensurePayload(payload, 'update');

        set((state) =>
          updateCourse(state, courseId, (prev0) => ({
            ...ensureBucket(prev0),
            loading: true,
            error: null,
          })),
        );

        try {
          await contentService.update(courseId, id, payload);
          await get().fetchContents(courseId);
        } catch (e: unknown) {
          // No setear error global (evita doble mensaje)
          throw e;
        } finally {
          set((state) =>
            updateCourse(state, courseId, (prev0) => ({
              ...ensureBucket(prev0),
              loading: false,
            })),
          );
        }
      },

      async deleteContent(courseId, id) {
        ensureCourseId(courseId);
        if (!id) throw new Error('Content ID is required');

        set((state) =>
          updateCourse(state, courseId, (prev0) => ({
            ...ensureBucket(prev0),
            loading: true,
            error: null,
          })),
        );

        try {
          await contentService.delete(courseId, id);
          await get().fetchContents(courseId);
        } catch (e: unknown) {
          // No setear error global (evita doble mensaje)
          throw e;
        } finally {
          set((state) =>
            updateCourse(state, courseId, (prev0) => ({
              ...ensureBucket(prev0),
              loading: false,
            })),
          );
        }
      },
    })),
  ),
  shallow,
);

export default useContentStore;

export const selectBucket =
  (courseId: string) =>
  (s: State): CourseBucket =>
    s.byCourse[courseId] ?? emptyBucket;

export const selectContents = (courseId: string) => (s: State) =>
  (s.byCourse[courseId]?.contents ?? []) as Content[];

export { shallow };
