import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport:Transport.NATS,
      options:{
        servers:envs.natsServers,
      }
    }
  );
  const logger = new Logger('Products Micro-Service Main');
  console.log(envs.natsServers);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted:true,
    })
  );


  await app.listen();
  logger.log(`Product Micro-Service running on port ${envs.port}`);
}
bootstrap();
