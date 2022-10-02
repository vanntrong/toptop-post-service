import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Music } from '../Music/music.entity.ts';
import { Hashtag } from '../Hashtag/hashtag.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  media: string;

  @ManyToOne(() => Music)
  music: Music;

  @Column({
    default: false,
  })
  isPrivate: boolean;

  @Column()
  content: string;

  @Column({
    type: 'uuid',
  })
  authorId: string;

  @Column({
    type: 'uuid',
    array: true,
    default: [],
  })
  likes: string[];

  @Column({
    type: 'numeric',
    default: 0,
  })
  likesCount: number;

  @ManyToMany(() => Hashtag)
  @JoinTable()
  hashtags: Hashtag[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date;
}
