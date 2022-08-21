import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'temp title' })
  @IsNotEmpty()
  title: string | null;

  @ApiProperty({ example: 'Hi this is temp Conent' })
  @MinLength(20)
  @IsNotEmpty()
  content: string | null;

  @ApiProperty({ example: 'La Vender' })
  @MinLength(6)
  @IsNotEmpty()
  reporterName: string | null;

  @ApiProperty({ example: 'random-cat' })
  @MinLength(3)
  @IsNotEmpty()
  categoryName: string | null;

  @ApiProperty({ example: 'XXXXXX' })
  @MinLength(6)
  @IsNotEmpty()
  thumbnail: string | null;

  @ApiProperty({ example: 'BBC' })
  @MinLength(3)
  @IsNotEmpty()
  companyName: string | null;
}
