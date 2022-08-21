import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { SumSol } from './sumsol.entity';

@Entity()
export class Article extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Index()
  @Column({ nullable: true })
  reporterName: string | null;

  @Index()
  @Column({ nullable: true })
  categoryName: string | null;

  @Column({ nullable: true })
  thumbnail: string | null;

  @OneToMany((type) => SumSol, (sumsol) => sumsol.article_id, { eager: false })
  sumsol?: SumSol | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  companyName: string | null;
}
