import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'API online',
      endpoints: [
        'POST /auth/login',
        'GET /vendedores',
        'GET /clientes',
        'GET /clientes/:id/divida',
        'GET /produtos',
        'POST /venda-online',
      ],
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
