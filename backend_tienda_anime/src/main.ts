import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Akiba Store API')
    .setDescription(
      'API de Akiba Store para autenticación, catálogo, usuarios y ventas.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el accessToken obtenido en /api/v1/auth/login.',
      },
      'access-token',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`App cooriendo en ${await app.getUrl()}`);
}
bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Error desconocido al iniciar';
  console.error(`No se pudo iniciar Akiba Store: ${message}`);
  process.exitCode = 1;
});
