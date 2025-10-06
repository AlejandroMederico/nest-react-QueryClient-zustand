import { useMutation, useQuery, useQueryClient } from 'react-query';

import { contentQueryKeys } from '../../lib/queryKeys';
import type ContentQuery from '../../models/content/ContentQuery';
import type CreateContentRequest from '../../models/content/CreateContentRequest';
import type UpdateContentRequest from '../../models/content/UpdateContentRequest';
import { contentService } from '../../services/ContentService';

export function useContentsList(courseId: string, query?: ContentQuery) {
  return useQuery(contentQueryKeys.list(courseId, query), () =>
    contentService.findAll(courseId, query ?? {}),
  );
}

export function useContent(courseId: string, id: string) {
  return useQuery(
    contentQueryKeys.detail(courseId, id),
    () => contentService.findOne(courseId, id),
    { enabled: !!courseId && !!id },
  );
}

export function useCreateContent(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation(
    (data: CreateContentRequest) => contentService.save(courseId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(contentQueryKeys.list(courseId));
      },
    },
  );
}

export function useUpdateContent(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: UpdateContentRequest }) =>
      contentService.update(courseId, id, data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(
          contentQueryKeys.detail(courseId, variables.id),
        );
        queryClient.invalidateQueries(contentQueryKeys.list(courseId));
      },
    },
  );
}

export function useDeleteContent(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation((id: string) => contentService.delete(courseId, id), {
    onSuccess: () => {
      queryClient.invalidateQueries(contentQueryKeys.list(courseId));
    },
  });
}
