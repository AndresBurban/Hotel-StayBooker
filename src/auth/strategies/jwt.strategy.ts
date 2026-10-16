import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../interfaces/auth-user.interface';
import { NombreRol } from '../../roles/entities/role.entity';

interface JwtPayload {
  sub: number;
  email: string;
  roles: NombreRol[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (
      !Number.isInteger(payload.sub) ||
      !payload.email ||
      !Array.isArray(payload.roles)
    ) {
      throw new UnauthorizedException('Token inválido');
    }

    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
