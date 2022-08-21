import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { LessThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createProfileDto: CreateUserDto) {
    return this.usersRepository.save(
      this.usersRepository.create(createProfileDto),
    );
  }

  findManyWithPagination(paginationOptions: IPaginationOptions) {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<User>) {
    return this.usersRepository.findOne({
      where: fields,
    });
  }

  update(id: number, updateProfileDto: UpdateUserDto) {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...updateProfileDto,
      }),
    );
  }

  async evaluateUpdate(id: number, exp_num: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    //console.log('UserExp, User Cnt', user.exp, user.prob_num);

    user.exper += exp_num; //경험치 증가
    user.prob_num += 1; //푼 문제수 증가
    //console.log('UserExp, User Cnt', user.exp, user.prob_num);
    this.usersRepository.save(this.usersRepository.create(user));
  }

  async softDelete(id: number): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async topkUserswithExp(k: number) {
    const allUsers = await this.usersRepository.find();

    //console.log(allUsers);
    const sortedUsers = allUsers.sort((a, b) => b.exper - a.exper).slice(0, k);
    return sortedUsers.map((user) => {
      return {
        name: user.firstName + ' ' + user.lastName,
        score: user.exper,
        prob_num: user.prob_num,
      };
    });
  }

  async getInfo(id: number) {
    const user = await this.usersRepository.findOneBy({
      id: id,
    });
    const data = {
      exp: user.exper,
      prob_num: user.prob_num,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return data;
  }
}
