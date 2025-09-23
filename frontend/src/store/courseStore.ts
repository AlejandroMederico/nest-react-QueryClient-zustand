import { createWithEqualityFn } from 'zustand/traditional';

import type Course from '../models/course/Course';
import type CourseQuery from '../models/course/CourseQuery';
import type CreateCourseRequest from '../models/course/CreateCourseRequest';
import type UpdateCourseRequest from '../models/course/UpdateCourseRequest';
import courseService from '../services/CourseService';
import { toErrorMessage } from '../utils/errors';

type State = {
  all: Course[];
  filtered: Course[];
  loading: boolean;
  error: string | null;
  filters: CourseQuery;
};

type Actions = {
  setFilters: (partial: CourseQuery) => void;
  fetchCourses: () => Promise<void>;
  addCourse: (payload: CreateCourseRequest) => Promise<void>;
  updateCourse: (id: string, payload: UpdateCourseRequest) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
};

const applyLocalFilter = (
  items: Course[],
  elementFiltered: CourseQuery,
): Course[] => {
  const name = (elementFiltered.name ?? '').trim().toLowerCase();
  const description = (elementFiltered.description ?? '').trim().toLowerCase();

  return items.filter((course) => {
    const okName = name ? `${course.name}`.toLowerCase().includes(name) : true;
    const okDesc = description
      ? `${course.description}`.toLowerCase().includes(description)
      : true;
    return okName && okDesc;
  });
};

// Ordena la lista de cursos por nombre asc (mutando una copia)
const sortCourses = (items: Course[]) =>
  items.slice().sort((a, b) => a.name.localeCompare(b.name));

const useCourseStore = createWithEqualityFn<State & Actions>()((set, get) => ({
  all: [],
  filtered: [],
  loading: false,
  error: null,
  filters: {},

  setFilters(partial) {
    set((_state) => {
      const nextFilters = { ..._state.filters, ...partial };
      const nextFiltered = sortCourses(
        applyLocalFilter(_state.all, nextFilters),
      );
      return { filters: nextFilters, filtered: nextFiltered };
    });
  },

  async fetchCourses() {
    set({ loading: true, error: null });
    try {
      const data = await courseService.findAll({});
      const sorted = sortCourses(data);
      const filtered = applyLocalFilter(sorted, get().filters);
      set({ all: sorted, filtered, loading: false });
    } catch (e: unknown) {
      set((s) => ({
        ...s,
        loading: false,
        error: toErrorMessage(e, 'Error fetching courses'),
      }));
    }
  },

  async addCourse(payload) {
    set({ loading: true, error: null });
    try {
      if (Object.keys(payload).length === 0) {
        set({ loading: false, error: 'No fields to add' });
        return;
      }
      await courseService.save(payload);
      await get().fetchCourses();
    } catch (e: unknown) {
      set((s) => ({ ...s, loading: false }));
      throw e;
    }
  },

  async updateCourse(id, payload) {
    set({ loading: true, error: null });
    try {
      if (!id) {
        set({ loading: false, error: 'Course ID is required' });
        return;
      }
      if (Object.keys(payload).length === 0) {
        set({ loading: false, error: 'No fields to update' });
        return;
      }
      await courseService.update(id, payload);
      await get().fetchCourses();
    } catch (e: unknown) {
      set((s) => ({ ...s, loading: false }));
      throw e;
    }
  },

  async deleteCourse(id) {
    set({ loading: true, error: null });
    try {
      if (!id) {
        set({ loading: false, error: 'Course ID is required' });
        return;
      }
      await courseService.delete(id);
      await get().fetchCourses();
    } catch (e: unknown) {
      set((s) => ({ ...s, loading: false }));
      throw e;
    }
  },
}));

export default useCourseStore;
