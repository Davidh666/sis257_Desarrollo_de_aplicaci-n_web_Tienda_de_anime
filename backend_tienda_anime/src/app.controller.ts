import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/auth-public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Estado del servicio')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Comprobar que la API está disponible' })
  @ApiResponse({ status: 200, description: 'Servicio disponible.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
