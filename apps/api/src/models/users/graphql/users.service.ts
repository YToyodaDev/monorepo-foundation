import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  LoginInput,
  LoginOutput,
  RegisterWithCredentialsInput,
  RegisterWithProviderInput,
} from './dtos/create-user.input';
import { FindManyUserArgs, FindUniqueUserArgs } from './dtos/find.args';
import { UpdateUserInput } from './dtos/update-user.input';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthOutput } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerWithProvider({
    name,
    image,
    uid,
    type,
  }: RegisterWithProviderInput): Promise<AuthOutput> {
    const user = await this.prisma.user.create({
      data: {
        name,
        image,
        uid,
        AuthProvider: {
          create: {
            type: type,
          },
        },
      },
    });
    const token = this.jwtService.sign({ uid: user.uid });
    return { user, token };
  }
  async registerWithCredentials({
    name,
    image,
    email,
    password,
  }: RegisterWithCredentialsInput): Promise<AuthOutput> {
    const existingUser = await this.prisma.credentials.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }
    // Hash the password
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);

    const uid = uuid();
    const user = await this.prisma.user.create({
      data: {
        uid,
        name,
        image,
        Credentials: {
          create: {
            email,
            passwordHash,
          },
        },
        AuthProvider: {
          create: {
            type: 'CREDENTIALS',
          },
        },
      },
      include: {
        Credentials: true,
      },
    });
    const token = this.jwtService.sign({ uid: user.uid });
    return { user, token };
  }

  async login({ email, password }: LoginInput): Promise<AuthOutput> {
    const credentials = await this.prisma.credentials.findUnique({
      where: { email },
      include: { user: true },
    });

    if (
      !credentials ||
      !bcrypt.compareSync(password, credentials?.passwordHash)
    ) {
      throw new BadRequestException('Invalid email or password');
    }

    const token = this.jwtService.sign({ uid: credentials.uid });
    return {
      user: credentials.user,
      token,
    };
  }

  findAll(args: FindManyUserArgs) {
    return this.prisma.user.findMany(args);
  }

  findOne(args: FindUniqueUserArgs) {
    return this.prisma.user.findUnique(args);
  }

  update(updateUserInput: UpdateUserInput) {
    const { uid, ...data } = updateUserInput;
    return this.prisma.user.update({
      where: { uid },
      data: data,
    });
  }

  remove(args: FindUniqueUserArgs) {
    return this.prisma.user.delete(args);
  }
}
