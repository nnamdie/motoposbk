import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  Business,
  BusinessStatus,
} from '../../business/entities/business.entity';
import { generateBusinessId } from '../../common/utils/helpers';
import { Member } from '../entities/member.entity';
import { User } from '../entities/user.entity';
import { LoginRequestDto } from '../models/login.request.dto';
import { LoginResponseDto } from '../models/login.response.dto';
import { RegisterBusinessRequestDto } from '../models/register-business.request.dto';
import { RegisterBusinessResponseDto } from '../models/register-business.response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: EntityRepository<Member>,
    @InjectRepository(Business)
    private readonly businessRepository: EntityRepository<Business>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerBusiness(
    dto: RegisterBusinessRequestDto,
  ): Promise<RegisterBusinessResponseDto> {
    // Check if business phone already exists
    const existingBusiness = await this.businessRepository.findOne({
      phone: dto.businessPhone,
    });

    if (existingBusiness) {
      throw new ConflictException(
        'Business with this phone number already exists',
      );
    }

    // Check if owner phone already exists
    const existingUser = await this.userRepository.findOne({
      phone: dto.ownerPhone,
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Generate unique business ID
    let businessId: string;
    let isUnique = false;
    const maxAttempts = 10;
    let attempts = 0;

    do {
      businessId = generateBusinessId(6);
      const existing = await this.businessRepository.findOne({
        ggId: businessId,
      });

      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new Error('Failed to generate unique business ID');
    }

    // Create business
    const business = this.businessRepository.create({
      ggId: businessId!,
      name: dto.businessName,
      phone: dto.businessPhone,
      address: dto.businessAddress,
      industry: dto.industry,
      description: dto.businessDescription,
      status: BusinessStatus.PENDING,
    });

    // Create owner user
    const user = this.userRepository.create({
      firstName: dto.ownerFirstName,
      lastName: dto.ownerLastName,
      phone: dto.ownerPhone,
      password: dto.password,
    });

    // Create owner membership
    const member = this.memberRepository.create({
      user,
      userId: user.id,
      business,
      businessId: business.ggId,
      isOwner: true,
      status: 'Active' as any,
      joinedAt: new Date(),
      createdBy: user, // Pass the user entity, not ID
    });

    await this.userRepository.persistAndFlush([user, business, member]);

    return {
      business: {
        ggId: business.ggId,
        name: business.name,
        phone: business.phone,
        status: business.status,
        createdAt: business.createdAt.toISOString(),
      },
      owner: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
      },
      message: 'Business registration successful. Awaiting approval.',
      nextStep: 'pending_approval',
    };
  }

  async login(
    businessGgId: string,
    dto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    // Find business
    const business = await this.businessRepository.findOne({
      ggId: businessGgId,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.status !== BusinessStatus.ACTIVE) {
      throw new UnauthorizedException('Business is not active');
    }

    // Find user
    const user = await this.userRepository.findOne({ phone: dto.phone });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find membership
    const member = await this.memberRepository.findOne(
      { userId: user.id, businessId: business.ggId },
      { populate: ['roles', 'roles.permissions', 'directPermissions'] },
    );

    if (!member || member.status !== 'Active') {
      throw new UnauthorizedException(
        'User is not a member of this business or membership is not active',
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.flush();

    // Generate tokens
    const payload = {
      sub: user.id,
      phone: user.phone,
      businessId: business.ggId,
      memberId: member.id,
      isOwner: member.isOwner,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // Get permissions from roles and direct permissions
    const rolePermissions = member.roles
      .getItems()
      .flatMap((role) => role.permissions.getItems().map((p) => p.key));

    const directPermissions = member.directPermissions
      .getItems()
      .map((p) => p.key);

    const allPermissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ];
    const roles = member.roles.getItems().map((role) => role.name);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
      },
      business: {
        ggId: business.ggId,
        name: business.name,
        status: business.status,
        position: member.position,
        isOwner: member.isOwner,
      },
      permissions: allPermissions,
      roles,
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ id: userId, isActive: true });
  }

  async getMemberByUserAndBusiness(
    userId: number,
    businessId: string,
  ): Promise<Member | null> {
    return this.memberRepository.findOne(
      { userId, businessId },
      {
        populate: [
          'user',
          'business',
          'roles',
          'roles.permissions',
          'directPermissions',
        ],
      },
    );
  }
}
