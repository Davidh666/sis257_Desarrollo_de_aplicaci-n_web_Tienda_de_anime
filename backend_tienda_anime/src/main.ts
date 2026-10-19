import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors({
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({transform: true }))
  app.setGlobalPrefix('api')
  app.enableVersioning({type: VersioningType.URI, defaultVersion: '1'});
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`App cooriendo en ${await app.getUrl()}`);
}
bootstrap();
