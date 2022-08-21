import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, MinLength } from 'class-validator';
import { Article } from '../entities/article.entity';

export class CreateSummaryDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  article_id: Article;

  @ApiProperty({ example: 'Example Summary' })
  @IsNotEmpty()
  summary: string;
}
