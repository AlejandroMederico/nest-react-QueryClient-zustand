import { createWithEqualityFn } from 'zustand/traditional';

import type Course from '../models/course/Course';
import type CourseQuery from '../models/course/CourseQuery';
import type CreateCourseRequest from '../models/course/CreateCourseRequest';
import type UpdateCourseRequest from '../models/course/UpdateCourseRequest';
import { courseService } from '../services/CourseService';
import { toErrorMessage } from '../utils/errors';

type State = {
  courses: Course[];
  loading: boolean;
  error: string | null;
  filters: CourseQuery;
  page: number;
  limit: number;
  total: number;
};

type Actions = {
  setFilters: (partial: CourseQuery) => void;
  setPage: (page: number) => void;
  fetchCourses: () => Promise<void>;
  addCourse: (payload: CreateCourseRequest) => Promise<void>;
  updateCourse: (id: string, payload: UpdateCourseRequest) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
};

const useCourseStore = createWithEqualityFn<State & Actions>()((set, get) => ({
  courses: [],
  loading: false,
  error: null,
  filters: {},
  page: 1,
  limit: 10,
  total: 0,

  setFilters(partial) {
    set((state) => ({ filters: { ...state.filters, ...partial }, page: 1 }));
    get().fetchCourses();
  },

  setPage(page) {
    set({ page });
    get().fetchCourses();
  },

  async fetchCourses() {
    set({ loading: true, error: null });
    try {
      const { filters, page, limit } = get();
      const params = { ...filters, page, limit };
      const res = await courseService.findAll(params);
      set({
        courses: res.data,
        total: res.meta.total,
        loading: false,
      });
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
      await courseService.save(payload);
      await get().fetchCourses();
    } catch (e: unknown) {
      set((s) => ({
        ...s,
        loading: false,
        error: toErrorMessage(e, 'Error creating course'),
      }));
    }
    set({ loading: false });
  },

  async updateCourse(id, payload) {
    set({ loading: true, error: null });
    try {
      await courseService.update(id, payload);
      await get().fetchCourses();
    } catch (e: unknown) {
      set((s) => ({
        ...s,
        loading: false,
        error: toErrorMessage(e, 'Error updating course'),
      }));
    }
    set({ loading: false });
  },

  async deleteCourse(id) {
    set({ loading: true, error: null });
    try {
      await courseService.delete(id);
      await get().fetchCourses();
    } catch (e: unknown) {
      set((s) => ({
        ...s,
        loading: false,
        error: toErrorMessage(e, 'Error deleting course'),
      }));
    }
    set({ loading: false });
  },
}));

export default useCourseStore;
