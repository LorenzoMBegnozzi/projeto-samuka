import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { usuario, senha } = loginDto;
    
    // Buscar usuário no banco
    const result = await this.db.execute(
      `SELECT id, usuario, senha_hash, nome FROM usuario WHERE usuario = :usuario`,
      { usuario }
    );

    if (!result.rows || result.rows.length === 0) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const user = result.rows[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.SENHA_HASH);
    
    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    // Gerar JWT
    const payload = { 
      sub: user.ID, 
      usuario: user.USUARIO,
      nome: user.NOME 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.ID,
        usuario: user.USUARIO,
        nome: user.NOME,
      },
    };
  }

  async validarToken(payload: any) {
    return { 
      id: payload.sub, 
      usuario: payload.usuario,
      nome: payload.nome 
    };
  }
}