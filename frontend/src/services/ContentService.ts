import type Content from '../models/content/Content';
import type ContentQuery from '../models/content/ContentQuery';
import type CreateContentRequest from '../models/content/CreateContentRequest';
import type UpdateContentRequest from '../models/content/UpdateContentRequest';
import { toErrorMessage } from '../utils/errors';
import apiService from './ApiService';

class ContentService {
  async save(courseId: string, req: CreateContentRequest): Promise<void> {
    try {
      await apiService.post(`/courses/${courseId}/contents`, req);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error adding content');
      throw Object.assign(new Error(msg), {
        op: 'save',
        entity: 'content',
        courseId,
      });
    }
  }

  async findAll(courseId: string, query: ContentQuery): Promise<Content[]> {
    try {
      const { data } = await apiService.get<Content[]>(
        `/courses/${courseId}/contents`,
        { params: query },
      );
      return data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error fetching contents');
      throw Object.assign(new Error(msg), {
        op: 'findAll',
        entity: 'content',
        courseId,
        query,
      });
    }
  }

  async findOne(courseId: string, id: string): Promise<Content> {
    try {
      const { data } = await apiService.get<Content>(
        `/courses/${courseId}/contents/${id}`,
      );
      return data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error fetching content');
      throw Object.assign(new Error(msg), {
        op: 'findOne',
        entity: 'content',
        courseId,
        id,
      });
    }
  }

  async update(
    courseId: string,
    id: string,
    req: UpdateContentRequest,
  ): Promise<void> {
    try {
      await apiService.put(`/courses/${courseId}/contents/${id}`, req);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error updating content');
      throw Object.assign(new Error(msg), {
        op: 'update',
        entity: 'content',
        courseId,
        id,
      });
    }
  }

  async delete(courseId: string, id: string): Promise<void> {
    try {
      await apiService.delete(`/courses/${courseId}/contents/${id}`);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error deleting content');
      throw Object.assign(new Error(msg), {
        op: 'delete',
        entity: 'content',
        courseId,
        id,
      });
    }
  }
}

export default new ContentService();
