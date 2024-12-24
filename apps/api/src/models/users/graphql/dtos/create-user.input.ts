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
export class RegisterWithCredentialsInput extends PickType(
  User,
  ['image', 'name'],
  InputType,
) {
  email: string;
  password: string;
}
