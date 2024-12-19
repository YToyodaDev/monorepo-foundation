import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { add } from '@foundation/sample-lib';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(add, add(2, 8));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Monorepo foundation | Yasuaki Toyoda')
    .setDescription(
      `<h1>Looking for the GraphQL API?</h1>
    Go to <a href="/graphql" target="_blank">/graphql</a>.
    Or,
    You might also need to use the <a target="_blank" href="https://studio.apollographql.com">Apollo Explorer for a better experience.</a>`,
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
