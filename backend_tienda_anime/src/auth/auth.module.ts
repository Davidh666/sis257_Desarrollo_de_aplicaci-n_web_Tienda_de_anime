import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

const jwtExpirationMultipliers: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

function parseJwtExpiration(value: string): number {
  const match = /^([1-9]\d*)(s|m|h|d)$/.exec(value);
  if (!match) {
    throw new Error(
      'JWT_TOKEN_EXPIRATION must be a positive duration such as 60s, 15m, 1h, or 7d',
    );
  }

  const durationInSeconds =
    Number(match[1]) * jwtExpirationMultipliers[match[2]];
  if (!Number.isSafeInteger(durationInSeconds)) {
    throw new Error('JWT_TOKEN_EXPIRATION is outside the supported range');
  }

  return durationInSeconds;
}

function getJwtSecret(configService: ConfigService): string {
  const secret = configService.getOrThrow<string>('JWT_TOKEN');
  if (secret.length < 32) {
    throw new Error('JWT_TOKEN must contain at least 32 characters');
  }

  return secret;
}

@Module({
  imports: [
    ConfigModule,
    UsuariosModule,
    PassportModule.register({}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: getJwtSecret(configService),
        signOptions: {
          expiresIn: parseJwtExpiration(
            configService.getOrThrow<string>('JWT_TOKEN_EXPIRATION'),
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
