import Course from '../models/course/Course';
import CourseQuery from '../models/course/CourseQuery';
import CreateCourseRequest from '../models/course/CreateCourseRequest';
import UpdateCourseRequest from '../models/course/UpdateCourseRequest';
import { toErrorMessage } from '../utils/errors';
import apiService from './ApiService';

class CourseService {
  async save(createCourseRequest: CreateCourseRequest): Promise<void> {
    try {
      await apiService.post('/courses', createCourseRequest);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error adding course');
      throw Object.assign(new Error(msg), { op: 'save', entity: 'course' });
    }
  }

  async findAll(courseQuery: CourseQuery): Promise<Course[]> {
    try {
      return (
        await apiService.get<Course[]>('/courses', { params: courseQuery })
      ).data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error fetching courses');
      throw Object.assign(new Error(msg), {
        op: 'findAll',
        entity: 'course',
        query: courseQuery,
      });
    }
  }

  async findOne(id: string): Promise<Course> {
    try {
      return (await apiService.get<Course>(`/courses/${id}`)).data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error fetching course');
      throw Object.assign(new Error(msg), {
        op: 'findOne',
        entity: 'course',
        id,
      });
    }
  }

  async update(
    id: string,
    updateCourseRequest: UpdateCourseRequest,
  ): Promise<void> {
    try {
      await apiService.put(`/courses/${id}`, updateCourseRequest);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error updating course');
      throw Object.assign(new Error(msg), {
        op: 'update',
        entity: 'course',
        id,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.delete(`/courses/${id}`);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error deleting course');
      throw Object.assign(new Error(msg), {
        op: 'delete',
        entity: 'course',
        id,
      });
    }
  }
}
const courseService = new CourseService();
export { courseService };
