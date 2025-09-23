import { devtools, subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import type Content from '../models/content/Content';
import type ContentQuery from '../models/content/ContentQuery';
import type CreateContentRequest from '../models/content/CreateContentRequest';
import type UpdateContentRequest from '../models/content/UpdateContentRequest';
import contentService from '../services/ContentService';
import { toErrorMessage } from '../utils/errors';

type CourseBucket = {
  all: Content[];
  filtered: Content[];
  filters: ContentQuery;
  loading: boolean;
  error: string | null;
};

type State = {
  byCourse: Record<string, CourseBucket>;
};

type Actions = {
  setFilters: (courseId: string, partial: ContentQuery) => void;
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
  all: [],
  filtered: [],
  filters: {},
  loading: false,
  error: null,
});

const sortContents = (items: Content[]) =>
  items
    .slice()
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );

const applyLocalFilter = (items: Content[], query: ContentQuery) => {
  const name = (query.name ?? '').trim().toLowerCase();
  const description = (query.description ?? '').trim().toLowerCase();

  return items.filter((c) => {
    const okName = name
      ? String(c.name ?? '')
          .toLowerCase()
          .includes(name)
      : true;
    const okDesc = description
      ? String(c.description ?? '')
          .toLowerCase()
          .includes(description)
      : true;
    return okName && okDesc;
  });
};

const deriveFiltered = (all: Content[], filters: ContentQuery) =>
  sortContents(applyLocalFilter(all, filters));

const ensureCourseId = (courseId: string) => {
  if (!courseId) throw new Error('Course ID is required');
};

const ensurePayload = (payload: object, what = 'payload') => {
  if (!payload || Object.keys(payload).length === 0)
    throw new Error(`No fields to ${what}`);
};

// Helpers de mutación focalizados por curso
const updateCourse = (
  s: State,
  courseId: string,
  updater: (prev: CourseBucket) => CourseBucket,
): State => {
  const prev = s.byCourse[courseId] ?? emptyBucket;
  return {
    ...s,
    byCourse: {
      ...s.byCourse,
      [courseId]: updater(prev),
    },
  };
};

const ensureBucket = (prev: CourseBucket): CourseBucket => ({
  all: prev.all ?? [],
  filtered: prev.filtered ?? [],
  filters: prev.filters ?? {},
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
            const nextFiltered = deriveFiltered(prev.all, nextFilters);
            return {
              ...prev,
              filters: nextFilters,
              filtered: nextFiltered,
              error: null,
            };
          }),
        );
      },

      async fetchContents(courseId) {
        ensureCourseId(courseId);

        // flag de loading por curso
        set((state) =>
          updateCourse(state, courseId, (prev0) => {
            const prev = ensureBucket(prev0);
            return { ...prev, loading: true, error: null };
          }),
        );

        try {
          // Si tu ContentService soporta AbortController/signal, pásalo acá.
          const data = await contentService.findAll(courseId, {});
          const all = sortContents(data);
          const filters = get().byCourse[courseId]?.filters ?? {};
          const filtered = applyLocalFilter(all, filters);

          set((state) =>
            updateCourse(state, courseId, () => ({
              all,
              filtered,
              filters,
              loading: false,
              error: null,
            })),
          );
        } catch (e: unknown) {
          const msg = toErrorMessage(e, 'Error fetching contents');
          set((state) =>
            updateCourse(state, courseId, (prev0) => {
              const prev = ensureBucket(prev0);
              return { ...prev, loading: false, error: msg };
            }),
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

// ——— Selectores recomendados (evitan re-render de toda la store) ———
export const selectBucket = (courseId: string) => (s: State): CourseBucket =>
  s.byCourse[courseId] ?? emptyBucket;

export const selectFiltered = (courseId: string) => (s: State) =>
  (s.byCourse[courseId]?.filtered ?? []) as Content[];

export { shallow };
