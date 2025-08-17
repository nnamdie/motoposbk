import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { Business } from '../../business/entities/business.entity';
import { AuthOtp } from '../entities/auth-otp.entity';
import { NotificationService } from '../../notifications/services/notification.service';
import { RequestOtpRequestDto } from '../models/request-otp.request.dto';
import { VerifyOtpRequestDto } from '../models/verify-otp.request.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let memberRepository: any;
  let businessRepository: any;
  let authOtpRepository: any;
  let entityManager: any;
  let jwtService: any;
  let configService: any;
  let notificationService: any;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockMemberRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockBusinessRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockAuthOtpRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockEntityManager = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockNotificationService = {
      queueNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(AuthOtp),
          useValue: mockAuthOtpRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = mockUserRepository;
    memberRepository = mockMemberRepository;
    businessRepository = mockBusinessRepository;
    authOtpRepository = mockAuthOtpRepository;
    entityManager = mockEntityManager;
    jwtService = mockJwtService;
    configService = mockConfigService;
    notificationService = mockNotificationService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestOtp', () => {
    it('should generate OTP and send notification successfully', async () => {
      const businessGgId = 'ABC123';
      const dto: RequestOtpRequestDto = {
        phone: '+2348012345678',
        password: 'password123',
      };

      const mockBusiness = {
        ggId: businessGgId,
        status: 'Active',
      };

      const mockUser = {
        id: 1,
        phone: dto.phone,
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      const mockMember = {
        id: 1,
        status: 'Active',
      };

      const mockAuthOtp = {
        otpCode: '123456',
        phone: dto.phone,
        business: mockBusiness,
        user: mockUser,
        expiresAt: new Date(),
      };

      businessRepository.findOne.mockResolvedValue(mockBusiness);
      userRepository.findOne.mockResolvedValue(mockUser);
      memberRepository.findOne.mockResolvedValue(mockMember);
      authOtpRepository.findOne.mockResolvedValue(null);
      authOtpRepository.create.mockReturnValue(mockAuthOtp);
      entityManager.persistAndFlush.mockResolvedValue(undefined);
      notificationService.queueNotification.mockResolvedValue(undefined);

      const result = await service.requestOtp(businessGgId, dto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent successfully');
      expect(result.nextStep).toBe('pending_verification');
      expect(authOtpRepository.create).toHaveBeenCalled();
      expect(notificationService.queueNotification).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return tokens successfully', async () => {
      const businessGgId = 'ABC123';
      const dto: VerifyOtpRequestDto = {
        phone: '+2348012345678',
        otpCode: '123456',
      };

      const mockBusiness = {
        ggId: businessGgId,
        status: 'Active',
      };

      const mockUser = {
        id: 1,
        phone: dto.phone,
        isActive: true,
        lastLoginAt: new Date(),
      };

      const mockAuthOtp = {
        otpCode: '123456',
        phone: dto.phone,
        business: mockBusiness,
        isUsed: false,
        isExpired: false,
        expiresAt: new Date(Date.now() + 60000), // 1 minute from now
        attempts: 0,
        maxAttempts: 3,
      };

      const mockMember = {
        id: 1,
        status: 'Active',
        isOwner: false,
        roles: { getItems: () => [] },
        directPermissions: { getItems: () => [] },
      };

      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      businessRepository.findOne.mockResolvedValue(mockBusiness);
      userRepository.findOne.mockResolvedValue(mockUser);
      authOtpRepository.findOne.mockResolvedValue(mockAuthOtp);
      memberRepository.findOne.mockResolvedValue(mockMember);
      jwtService.sign.mockReturnValue('token');
      configService.get.mockReturnValue('secret');
      entityManager.flush.mockResolvedValue(undefined);

      const result = await service.verifyOtp(businessGgId, dto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(authOtpRepository.findOne).toHaveBeenCalledWith({
        otpCode: dto.otpCode,
        phone: dto.phone,
        business: mockBusiness,
        isUsed: false,
        isExpired: false,
      });
    });
  });
});
