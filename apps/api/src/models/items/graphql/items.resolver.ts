import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { Item } from './entity/item.entity';
import { FindManyItemArgs, FindUniqueItemArgs } from './dtos/find.args';
import { CreateItemInput } from './dtos/create-item.input';
import { UpdateItemInput } from './dtos/update-item.input';
import { checkRowLevelPermission } from 'src/common/auth/util';
import { GetUserType } from 'src/common/types';
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from 'src/models/users/graphql/entity/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@Resolver(() => Item)
export class ItemsResolver {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly prisma: PrismaService,
  ) {}

  @AllowAuthenticated()
  @Mutation(() => Item)
  createItem(
    @Args('createItemInput') args: CreateItemInput,
    @GetUser() user: GetUserType,
  ) {
    return this.itemsService.create(args, user.uid);
  }

  @Query(() => [Item], { name: 'items' })
  findAll(@Args() args: FindManyItemArgs) {
    return this.itemsService.findAll(args);
  }
  @AllowAuthenticated()
  @Query(() => [Item], { name: 'myItems' })
  myItems(@Args() args: FindManyItemArgs, @GetUser() user: GetUserType) {
    return this.itemsService.findAll({
      ...args,
      where: { ...args.where, uid: { equals: user.uid } },
    });
  }
  @AllowAuthenticated()
  @Query(() => Item, { name: 'item' })
  async findOne(
    @Args() args: FindUniqueItemArgs,
    @GetUser() user: GetUserType,
  ) {
    const item = await this.itemsService.findOne(args);
    checkRowLevelPermission(user, item.uid);
    return item;
  }

  @AllowAuthenticated()
  @Mutation(() => Item)
  async updateItem(
    @Args('updateItemInput') args: UpdateItemInput,
    @GetUser() user: GetUserType,
  ) {
    const item = await this.itemsService.findOne({ where: { id: args.id } });
    checkRowLevelPermission(user, item.uid);
    return this.itemsService.update(args);
  }

  @AllowAuthenticated()
  @Mutation(() => Item)
  async removeItem(
    @Args() args: FindUniqueItemArgs,
    @GetUser() user: GetUserType,
  ) {
    const item = await this.prisma.item.findUnique(args);
    checkRowLevelPermission(user, item.uid);
    return this.itemsService.remove(args);
  }

  @ResolveField(() => User)
  user(@Parent() parent: Item) {
    return this.prisma.user.findUnique({
      where: {
        uid: parent.uid,
      },
    });
  }
}
