import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

@Entity()
@Unique(['user', 'course'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Course, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
