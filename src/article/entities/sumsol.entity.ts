import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { User } from 'src/users/entities/user.entity';
import { Article } from './article.entity';
import { IsString, MaxLength } from 'class-validator';

@Entity()
export class SumSol extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User, (user) => user.sumsol, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne((type) => Article, (article) => article.sumsol, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  article_id: Article;

  @Column({ nullable: false, default: 0, type: 'float' })
  score: number;

  @IsString()
  @MaxLength(300)
  @Column({ nullable: false, default: '' })
  summary: string;
}
