import {
  Field,
  InputType,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from '../entity/user.entity';
import { $Enums, AuthProviderType } from '@prisma/client';

// Whenever you use en
registerEnumType($Enums.AuthProviderType, {
  name: 'AuthProviderType',
});

@InputType()
export class RegisterWithProviderInput extends PickType(
  User,
  ['uid', 'name', 'image'],
  InputType,
) {
  @Field(() => AuthProviderType)
  type: AuthProviderType;
}

@InputType()
export class RegisterWithCredentialsInput {
  name: string;
  email: string;
  password: string;
  image?: string;
}

@InputType()
export class LoginInput extends PickType(RegisterWithCredentialsInput, [
  'email',
  'password',
]) {}

@ObjectType()
export class LoginOutput {
  token: string;
}
