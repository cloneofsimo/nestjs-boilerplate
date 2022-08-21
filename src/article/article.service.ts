import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { request } from 'http';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Equal, Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { SumSol } from './entities/sumsol.entity';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/users/entities/user.entity';
import { take } from 'rxjs';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';
import { getRepository } from 'typeorm';
import { randomInt } from 'crypto';
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(SumSol)
    private sumSolRepository: Repository<SumSol>,
    private readonly userService: UsersService,
  ) {}

  create(createArticleDto: CreateArticleDto) {
    return this.articleRepository.save(
      this.articleRepository.create(createArticleDto),
    );
  }

  findManyWithPagination(paginationOptions: IPaginationOptions) {
    return this.articleRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: {
        sumsol: true,
      },
    });
  }

  findOne(fields: EntityCondition<Article>) {
    return this.articleRepository.findOne({
      where: fields,
    });
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return this.articleRepository.save(
      this.articleRepository.create({
        id,
        ...updateArticleDto,
      }),
    );
  }

  async getRandomArticleLists() {
    const allval = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.sumsol', 'sum_sol')
      .groupBy('article.id')
      .select([
        'article.id',
        'article.title',
        'article.thumbnail',
        'article.content',
        'article.reporterName',
        'article.companyName',
        'count(article.id)',
      ])
      .orderBy('count(article.id)', 'DESC')
      .getMany();

    return allval.slice(0, 8).map((item) => {
      return {
        thumbnail: item.thumbnail,
        content: item.content.slice(0, 300),
        reporterName: item.reporterName,
        companyName: item.companyName,
        title: item.title,
        id: item.id,
      };
    });
  }

  async findArticleList(article_id: number) {
    const response_list = [];
    //const article_category = await this.articleRepository.findOneBy
    const article_category = (
      await this.articleRepository.findOneBy({
        id: article_id,
      })
    ).categoryName;

    console.log(article_category);

    const article_list = await this.articleRepository.find({
      where: {
        categoryName: Equal(article_category),
      },
    });

    console.log(article_list);

    article_list.map(async (article: Article) => {
      const data = {
        id: article.id,
        title: article.title,
        thumbnail: article.thumbnail,
        reporterName: article.reporterName,
        articleShortContent: article.content.slice(0, 300),
        companyName: article.companyName,
      };
      response_list.push(data);
    });
    return response_list;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleRepository.softDelete(id);
  }

  // Summary - Article Related:

  // findOne(fields: EntityCondition<User>) {
  //   return this.usersRepository.findOne({
  //     where: fields,
  //   });
  // }

  async createSumSol(
    createSummaryDto: CreateSummaryDto,
    user: User,
  ): Promise<SumSol> {
    console.log(user);
    const article_found = await this.articleRepository.findOne({
      where: { id: createSummaryDto.article_id.id },
    });

    if (!article_found) {
      throw new NotFoundException('Article not found');
    }

    const article_content = article_found.content;
    const summary = createSummaryDto.summary;

    let score;

    await axios
      .get('http://localhost:8080/summary_score', {
        params: {
          original: article_content,
          summary: summary,
        },
      })
      .then(function (res) {
        score = res.data.score;
        console.log('Updated', score);
      })
      .catch(function (err) {
        console.log(err);
      });

    const sumsol = await this.sumSolRepository.findOne({
      where: {
        user: Equal(user),
        article_id: Equal(createSummaryDto.article_id),
      },
    });
    console.log(sumsol);

    // if (sumsol?.article_id != null) {
    //   const id = sumsol.id;
    //   console.log(sumsol);
    //   sumsol.score = score;
    //   sumsol.summary = summary;
    //   this.sumSolRepository.save(this.sumSolRepository.create(sumsol));
    // } else {
    const newSol = this.sumSolRepository.create({
      score: score,
      summary: summary,
      user: user,
      article_id: createSummaryDto.article_id,
    });
    this.sumSolRepository.save(newSol);
    //}

    const exp_weight = score * article_content.length + randomInt(3);

    console.log(exp_weight);
    this.userService.evaluateUpdate(user.id, exp_weight);

    return newSol;
  }

  async getSumSol(user: User, article_id: number | null): Promise<SumSol[]> {
    let sumsol;
    if (article_id === null) {
      sumsol = (
        await this.sumSolRepository.find({
          where: {
            user: Equal(user),
          },
          relations: {
            article_id: true,
          },
        })
      ).slice(0, 10);
    } else {
      sumsol = await this.sumSolRepository.find({
        where: {
          user: Equal(user),
          article_id: Equal(article_id),
        },
        relations: {
          user: true,
          article_id: true,
        },
      });
    }

    if (sumsol == null) {
      throw new NotFoundException();
    }

    return sumsol;
  }

  async getRank(a_id: number) {
    // return await this.sumSolRepository
    //   .createQueryBuilder('sumSol')
    //   .select([
    //     'sumSol.score',
    //     'user.id',
    //     // 'user.firstName',
    //     // 'user.lastName',
    //     'sumSol.article_id',
    //   ])
    //   .innerJoin('sumSol.user', 'user')
    //   .where('sumSol.article_id = :id', { id: a_id })
    //   .groupBy('user.id')
    //   .select(['max(sumSol.score)', 'user.id'])
    //   .orderBy('max(sumSol.score)', 'DESC')
    //   .getMany();
    const usermap: Map<number, number> = new Map();
    const userNameMap: Map<number, string> = new Map();

    const user_all = await this.sumSolRepository.find({
      relations: {
        user: true,
        article_id: true,
      },
    });

    console.log(user_all);

    const filtred_ = user_all.filter((item) => item.article_id.id === a_id);
    console.log(filtred_);

    if (filtred_.length === 0) {
      return [];
    }

    filtred_.map((item) => {
      if (item.user?.id != null) {
        const curval = usermap.get(item.user.id);
        userNameMap.set(
          item.user.id,
          item.user.firstName + ' ' + item.user.lastName,
        );

        if (curval === undefined) {
          usermap.set(item.user.id, item.score);
        } else if (curval < item.score) {
          usermap.set(item.user.id, item.score);
        }
      }
    });

    const user_list = Array.from(usermap.keys()).map((val) => {
      return {
        id: val,
        score: Math.floor(usermap.get(val) * 100),
        name: userNameMap.get(val),
      };
    });

    // sort by score
    user_list
      .sort((a, b) => {
        return b.score - a.score;
      })
      .slice(0, 10);
    // get max score foe each users
    console.log(user_list);

    return user_list;
  }
}
