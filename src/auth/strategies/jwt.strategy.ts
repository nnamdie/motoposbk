import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../models/jwt-payload';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const member = await this.authService.getMemberByUserAndBusiness(
      payload.sub,
      payload.businessId,
    );

    if (!member) {
      throw new UnauthorizedException('Member not found or inactive');
    }

    // Extract permissions from roles and direct permissions
    const rolePermissions = member.roles
      .getItems()
      .flatMap((role) => role.permissions.getItems().map((p) => p.key));

    const directPermissions = member.directPermissions
      .getItems()
      .map((p) => p.key);

    const allPermissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ];

    return {
      id: user.id,
      phone: user.phone,
      businessId: payload.businessId,
      memberId: payload.memberId,
      isOwner: payload.isOwner,
      roles: member.roles.getItems().map((role) => role.name),
      permissions: allPermissions,
      user,
      member,
    };
  }
}
