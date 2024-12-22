import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { AuthOutput, User } from './entity/user.entity';
import { FindManyUserArgs, FindUniqueUserArgs } from './dtos/find.args';
import {
  LoginInput,
  LoginOutput,
  RegisterWithCredentialsInput,
  RegisterWithProviderInput,
} from './dtos/create-user.input';
import { UpdateUserInput } from './dtos/update-user.input';
import { checkRowLevelPermission } from 'src/common/auth/util';
import { GetUserType } from 'src/common/types';
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Item } from 'src/models/items/graphql/entity/item.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}
  // This return type directly reflects in the selectable fields on Apollo sandbox. It does not throw error even if this resolver does not return the expected type.
  // the name of the mutation that will be exposed in your GraphQL schema.
  // @Args is the variable name, this does not have to match with the actual input type name
  @Mutation(() => AuthOutput)
  registerWithProvider(
    @Args('registerWithProviderInput') args: RegisterWithProviderInput,
  ): Promise<AuthOutput> {
    try {
      return this.usersService.registerWithProvider(args);
    } catch (error) {
      throw new Error(error);
    }
  }
  @Mutation(() => AuthOutput)
  async registerWithCredentials(
    @Args('registerWithCredentialsInput') args: RegisterWithCredentialsInput,
  ): Promise<AuthOutput> {
    try {
      return this.usersService.registerWithCredentials(args);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => AuthOutput)
  async login(
    @Args('loginInput')
    args: LoginInput,
  ) {
    try {
      return this.usersService.login(args);
    } catch (error) {
      throw new Error(error);
    }
  }
  @AllowAuthenticated()
  @Query(() => User)
  whoami(@GetUser() user: GetUserType) {
    return this.usersService.findOne({
      where: {
        uid: user.uid,
      },
    });
  }
  // @Mutation(() => User)
  // async logout(
  //   @Args('log') args: RegisterWithProviderInput,
  // ) {
  //   return this.usersService.logout(args);
  // }
  // @

  // @AllowAuthenticated('admin')
  @Query(() => [User], { name: 'users' })
  findAll(@Args() args: FindManyUserArgs) {
    return this.usersService.findAll(args);
  }
  @AllowAuthenticated()
  @Query(() => User, { name: 'user' })
  findOne(@Args() args: FindUniqueUserArgs, @GetUser() user: GetUserType) {
    checkRowLevelPermission(user, args.where.uid);

    return this.usersService.findOne(args);
  }
  @AllowAuthenticated()
  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') args: UpdateUserInput,
    @GetUser() user: GetUserType,
  ) {
    const userInfo = await this.prisma.user.findUnique({
      where: { uid: args.uid },
    });
    checkRowLevelPermission(user, userInfo.uid);
    return this.usersService.update(args);
  }

  @AllowAuthenticated()
  @Mutation(() => User)
  async removeUser(
    @Args() args: FindUniqueUserArgs,
    @GetUser() user: GetUserType,
  ) {
    const userInfo = await this.prisma.user.findUnique(args);
    checkRowLevelPermission(user, userInfo.uid);
    return this.usersService.remove(args);
  }
  @ResolveField(() => [Item])
  items(@Parent() parent: User) {
    return this.prisma.item.findMany({
      where: {
        uid: parent.uid,
      },
    });
  }
  @ResolveField(() => String)
  async email(@Parent() parent: User) {
    const cred = await this.prisma.credentials.findUnique({
      where: {
        uid: parent.uid,
      },
    });
    return cred.email;
  }
}
