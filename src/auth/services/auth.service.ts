import { EntityRepository, EntityManager } from '@mikro-orm/core';
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
import { AuthOtp } from '../entities/auth-otp.entity';
import { LoginResponseDto } from '../models/login.response.dto';
import { RegisterBusinessRequestDto } from '../models/register-business.request.dto';
import { RegisterBusinessResponseDto } from '../models/register-business.response.dto';
import { RequestOtpRequestDto } from '../models/request-otp.request.dto';
import { VerifyOtpRequestDto } from '../models/verify-otp.request.dto';
import { UserProfileDto } from '../models/user-profile.response.dto';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { NotificationService } from '@/notifications/services/notification.service';
import { NotificationChannel } from '@/notifications/enums/notification-channel.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: EntityRepository<Member>,
    @InjectRepository(Business)
    private readonly businessRepository: EntityRepository<Business>,
    @InjectRepository(AuthOtp)
    private readonly authOtpRepository: EntityRepository<AuthOtp>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
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
      business,
      isOwner: true,
      status: 'Active' as any,
      joinedAt: new Date(),
      createdBy: user, // Pass the user entity, not ID
    });

    await this.em.persistAndFlush([user, business, member]);

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

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ id: userId, isActive: true });
  }

  async getMemberByUserAndBusiness(
    userId: number,
    businessId: string,
  ): Promise<Member | null> {
    return this.memberRepository.findOne(
      { user: { id: userId }, business: { ggId: businessId } },
    );
  }

  async getProfile(
    businessGgId: string,
    currentUser: AuthenticatedUser,
  ): Promise<UserProfileDto> {
    const business = await this.businessRepository.findOne({
      ggId: businessGgId,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.status !== BusinessStatus.ACTIVE) {
      throw new UnauthorizedException('Business is not active');
    }

    const user = await this.userRepository.findOne({ id: currentUser.id });

    // Find membership
    const member = await this.memberRepository.findOne(
      { user: currentUser, business: business },
    );

    if (!member || member.status !== 'Active') {
      throw new UnauthorizedException(
        'User is not a member of this business or membership is not active',
      );
    }

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
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      permissions: allPermissions,
      roles,
      business: {
        ggId: business.ggId,
        name: business.name,
        status: business.status,
        position: member.position,
        isOwner: member.isOwner,
      },
    };
  }

  async requestOtp(
    businessGgId: string,
    dto: RequestOtpRequestDto,
  ): Promise<{ success: boolean; message: string; nextStep: string }> {
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
      { user: user, business: business },
    );

    if (!member || member.status !== 'Active') {
      throw new UnauthorizedException(
        'User is not a member of this business or membership is not active',
      );
    }

    // Generate OTP code
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update OTP record
    let authOtp = await this.authOtpRepository.findOne({
      phone: dto.phone,
      business: business,
      isUsed: false,
      isExpired: false,
    });

    if (authOtp) {
      // Update existing OTP
      authOtp.otpCode = otpCode;
      authOtp.expiresAt = expiresAt;
      authOtp.attempts = 0;
    } else {
      // Create new OTP
      authOtp = this.authOtpRepository.create({
        otpCode,
        phone: dto.phone,
        business,
        user,
        expiresAt,
      });
    }

    await this.em.persistAndFlush(authOtp);

          // Send OTP notification
      try {
        await this.notificationService.queueNotification({
          receiver: user,
          business: business,
          template: 'login-otp',
          variables: {
            otpCode,
            firstName: user.firstName,
            businessName: business.name,
          },
          channel: NotificationChannel.WHATSAPP, // Default to SMS, could be configurable
          sendAt: new Date(),
        });
      } catch (error) {
        // Log error but don't fail the request
        console.error('Failed to send OTP notification:', error);
      }

    return {
      success: true,
      message: 'OTP sent successfully',
      nextStep: 'pending_verification',
    };
  }

  async verifyOtp(
    businessGgId: string,
    dto: VerifyOtpRequestDto,
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

    // Find OTP record
    const authOtp = await this.authOtpRepository.findOne({
      otpCode: dto.otpCode,
      phone: dto.phone,
      business: business,
      isUsed: false,
      isExpired: false,
    });

    if (!authOtp) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Check if OTP is expired
    if (new Date() > authOtp.expiresAt) {
      authOtp.isExpired = true;
      await this.em.flush();
      throw new UnauthorizedException('OTP code has expired');
    }

    // Check attempts
    if (authOtp.attempts >= authOtp.maxAttempts) {
      authOtp.isExpired = true;
      await this.em.flush();
      throw new UnauthorizedException('OTP code has been blocked due to too many attempts');
    }

    // Increment attempts
    authOtp.attempts += 1;

    // Verify OTP code
    if (authOtp.otpCode !== dto.otpCode) {
      await this.em.flush();
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Mark OTP as used
    authOtp.isUsed = true;
    await this.em.flush();

    // Find membership
    const member = await this.memberRepository.findOne(
      { user: user, business: business },
      { populate: ['roles', 'roles.permissions', 'directPermissions'] },
    );

    if (!member || member.status !== 'Active') {
      throw new UnauthorizedException(
        'User is not a member of this business or membership is not active',
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.em.flush();

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

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
