import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
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

    const row = result.rows[0] as Record<string, unknown>;

    const senhaHash: unknown = row.SENHA_HASH ?? row.senha_hash;
    const userId: unknown = row.ID ?? row.id;
    const userUsuario: unknown = row.USUARIO ?? row.usuario;
    const userNome: unknown = row.NOME ?? row.nome;

    if (typeof senhaHash !== 'string') {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    // Verificar senha
    let senhaValida = false;
    try {
      senhaValida = await bcrypt.compare(senha, senhaHash);
    } catch {
      senhaValida = false;
    }
    
    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    // Gerar JWT
    const payload = { 
      sub: userId,
      usuario: userUsuario,
      nome: userNome,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: userId,
        usuario: userUsuario,
        nome: userNome,
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