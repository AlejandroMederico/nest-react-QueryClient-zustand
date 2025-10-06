export default interface CourseQuery {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'description' | 'dateCreated';
  order?: 'asc' | 'desc';
}
