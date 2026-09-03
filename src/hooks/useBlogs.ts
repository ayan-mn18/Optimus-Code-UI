import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Blog, BlogDetailResponse, BlogDraft, BlogListResponse } from '@/lib/types';

export interface BlogFilters {
  kind?: string;
  topic?: string;
  company?: string;
  tag?: string;
  search?: string;
  sort?: string;
  page?: number;
}

export function useBlogs(filters: BlogFilters) {
  return useQuery({
    queryKey: ['blogs', filters],
    queryFn: () => api.blogs(filters),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useBlog(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => api.blog(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useMyBlogs() {
  return useQuery({ queryKey: ['blogs', 'mine'], queryFn: api.myBlogs, staleTime: 30_000 });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: BlogDraft) => api.createBlog(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: Partial<BlogDraft> }) => api.updateBlog(id, draft),
    onSuccess: ({ blog }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', blog.slug] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

/**
 * Optimistic like. The server owns the count, so the rollback restores whatever
 * was on screen rather than recomputing it.
 */
export function useToggleBlogLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blog: Pick<Blog, 'id' | 'slug'>) => api.likeBlog(blog.id),
    onMutate: async (blog) => {
      await queryClient.cancelQueries({ queryKey: ['blog', blog.slug] });
      const previous = queryClient.getQueryData<BlogDetailResponse>(['blog', blog.slug]);
      if (previous) {
        queryClient.setQueryData<BlogDetailResponse>(['blog', blog.slug], {
          ...previous,
          blog: {
            ...previous.blog,
            liked: !previous.blog.liked,
            likes: previous.blog.likes + (previous.blog.liked ? -1 : 1),
          },
        });
      }
      return { previous };
    },
    onError: (_error, blog, context) => {
      if (context?.previous) queryClient.setQueryData(['blog', blog.slug], context.previous);
    },
    onSuccess: ({ liked, likes }, blog) => {
      queryClient.setQueryData<BlogDetailResponse>(['blog', blog.slug], (current) =>
        current ? { ...current, blog: { ...current.blog, liked, likes } } : current);
      queryClient.setQueriesData<BlogListResponse>({ queryKey: ['blogs'] }, (current) =>
        current
          ? { ...current, items: current.items.map((item) => (item.id === blog.id ? { ...item, liked, likes } : item)) }
          : current);
    },
  });
}
