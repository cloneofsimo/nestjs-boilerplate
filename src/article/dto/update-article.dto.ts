import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateArticleDto {
  @ApiProperty({ example: 'temp title' })
  @IsNotEmpty()
  @IsEmail()
  title: string | null;

  @ApiProperty({ example: 'Hi this is temp Conent' })
  @MinLength(6)
  @IsNotEmpty()
  content: string | null;

  @ApiProperty({ example: 'La Vender' })
  @MinLength(6)
  @IsNotEmpty()
  reporterName: string | null;

  @ApiProperty({ example: 'random-cat' })
  @MinLength(6)
  @IsNotEmpty()
  categoryName: string | null;

  @ApiProperty({ example: 'XXX' })
  @MinLength(6)
  @IsNotEmpty()
  thumbnail: string | null;
}
