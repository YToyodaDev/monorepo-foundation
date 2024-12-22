import { Field, ObjectType } from '@nestjs/graphql';
import { Item as ItemType } from '@prisma/client';
import { RestrictProperties } from 'src/common/dtos/common.input';

@ObjectType()
export class Item implements RestrictProperties<Item, ItemType> {
  name: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  @Field({ nullable: true })
  image: string;
  uid: string;
  // Todo Add below to make optional fields optional.
  // @Field({ nullable: true })
}
