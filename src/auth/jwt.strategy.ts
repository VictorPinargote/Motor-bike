import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_motorbike_2026';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
<<<<<<< Updated upstream
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_jwt_secret',
=======
      secretOrKey: JWT_SECRET,
>>>>>>> Stashed changes
    });
  }

  async validate(payload: any) {
    return { id: payload.id, username: payload.username, role: payload.role };
  }
}
