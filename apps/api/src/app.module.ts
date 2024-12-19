import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './models/users/users.module';
import { JwtModule } from '@nestjs/jwt';

const maxAge = (Number(process.env.MAX_AGE) || 24) * 60 * 60;

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: maxAge },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Makes the API publicly accessible, allowing dev-tools like Apollo Server and GraphQL Playground to access the schema for auto-complete, visual documentation, and query testing.
      introspection: true,
      // Generates GraphQL scheme, required for the code first approach
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Map TypeScript `number` to GraphQL `Int`
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      // Apply @UseGuards() globally to all field resolvers( @ResolveField() ) regardless of whetehr @UseGuards() is applied to the parent
      fieldResolverEnhancers: ['guards'],
    }),
    PrismaModule,
    UsersModule,

    // PrismaModule: Registering a module with @Global() in any module makes it accessible application-wide. However, for clarity and convention, it's typically done in AppModule. Can you make  it even shorter?
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
