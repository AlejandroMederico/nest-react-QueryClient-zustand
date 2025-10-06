import { useMutation, useQuery, useQueryClient } from 'react-query';

import { courseQueryKeys } from '../../lib/queryKeys';
import type CourseQuery from '../../models/course/CourseQuery';
import type CreateCourseRequest from '../../models/course/CreateCourseRequest';
import type UpdateCourseRequest from '../../models/course/UpdateCourseRequest';
import { courseService } from '../../services/CourseService';

export function useCoursesList(query?: CourseQuery) {
  return useQuery(courseQueryKeys.list(query), () =>
    courseService.findAll(query ?? {}),
  );
}

export function useCourse(id: string) {
  return useQuery(courseQueryKeys.detail(id), () => courseService.findOne(id), {
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation((data: CreateCourseRequest) => courseService.save(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(courseQueryKeys.list());
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: UpdateCourseRequest }) =>
      courseService.update(id, data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(courseQueryKeys.detail(variables.id));
        queryClient.invalidateQueries(courseQueryKeys.list());
      },
    },
  );
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation((id: string) => courseService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(courseQueryKeys.list());
    },
  });
}
