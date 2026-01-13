import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { VendedorModule } from './vendedor/vendedor.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProdutoModule } from './produto/produto.module';
import { VendaOnlineModule } from './venda-online/venda-online.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui',
      signOptions: { expiresIn: '60m' },
    }),
    DatabaseModule,
    AuthModule,
    VendedorModule,
    ClienteModule,
    ProdutoModule,
    VendaOnlineModule,
  ],
  controllers: [AppController],
})
export class AppModule {}