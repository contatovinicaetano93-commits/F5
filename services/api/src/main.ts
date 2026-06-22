import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

// Will import AppModule once created
// import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    // AppModule,
    new FastifyAdapter(),
  );

  // Middleware & pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Rate limiting will be added later
  const PORT = process.env.PORT || 3001;
  
  console.log(`🚀 F5 API running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  await app.listen(PORT, '0.0.0.0');
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start F5 API', err);
  process.exit(1);
});
