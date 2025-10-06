import type Course from '../course/Course';

export default interface Content {
  id: string;
  name: string;
  description: string;
  dateCreated: Date;
  image?: string | null;
  course?: Course;
}
