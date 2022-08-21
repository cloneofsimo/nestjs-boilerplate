import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { request } from 'http';
import { RolesGuard } from 'src/roles/roles.guard';
import { infinityPagination } from 'src/utils/infinity-pagination';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller({
  path: 'article',
  version: '1',
})
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateArticleDto) {
    return this.articleService.create(createProfileDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.articleService.findManyWithPagination({
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('sumsol')
  sumsoluser(@Request() req) {
    return this.articleService.getSumSol(req.user, null);
  }

  @Get('article-lists')
  async getRandomArticleLists() {
    return this.articleService.getRandomArticleLists();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.articleService.findOne({ id: +id });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.articleService.softDelete(id);
  }

  @Get('article-lists/:article_id')
  getArticleList(@Param('article_id') article_id: number) {
    //주제는 같고 정치적으로 성향이 다른 기사 추천
    return this.articleService.findArticleList(article_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('evaluate')
  evaluate(@Request() req, @Body() createSummaryDto: CreateSummaryDto) {
    return this.articleService.createSumSol(createSummaryDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('sumsol/:article_id')
  sumsol(@Request() req, @Param('article_id') article_id: number) {
    return this.articleService.getSumSol(req.user, article_id);
  }

  @Get('rank/:article_id')
  getArticleRank(@Param('article_id') article_id: number) {
    return this.articleService.getRank(article_id);
  }

  @Get('title/:title')
  getArticleByTitle(@Param('title') title: string) {
    return this.articleService.findOne({ title: title });
  }
}
