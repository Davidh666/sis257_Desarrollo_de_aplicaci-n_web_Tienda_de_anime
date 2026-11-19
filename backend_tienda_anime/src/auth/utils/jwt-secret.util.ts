import { ConfigService } from '@nestjs/config';

export function getJwtSecret(configService: ConfigService): string {
  const secret =
    configService.get<string>('JWT_SECRET') ??
    configService.getOrThrow<string>('JWT_TOKEN');
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  return secret;
}
