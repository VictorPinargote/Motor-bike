import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
// ✅ Importamos las herramientas de Swagger
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ CORS (ajusta origins cuando tengan el dominio del front desplegado)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite
      'http://localhost:3000', // si tu front usa este
      'https://motor-biker.uaeftt-ute.site', // frontend real (dominio del profe)
      'https://motorbiker-frontend.northcentralus.cloudapp.azure.com', // frontend, dominio default de Azure
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // si usas cookies/sesión
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' });

  // ✅ CONFIGURACIÓN DE SWAGGER
  const config = new DocumentBuilder()
    .setTitle('API Motor-bike')
    .setDescription('Documentación de los endpoints para la gestión de motocicletas, ventas y reservas.')
    .setVersion('1.0')
    .addBearerAuth() // Activa la autenticación con JWT en la interfaz
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
