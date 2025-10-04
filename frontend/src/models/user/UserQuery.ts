export default interface UserQuery {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
}

export type UsersListParams = {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
  role?: string;
};
