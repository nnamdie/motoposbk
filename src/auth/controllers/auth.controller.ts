import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  BaseResponseDto,
  ValidationErrorDto,
} from '../../common/models/base-response.dto';
import { TenantResolveGuard } from '../guards/tenant-resolve.guard';
import { LoginRequestDto } from '../models/login.request.dto';
import { LoginResponseDto } from '../models/login.response.dto';
import { RegisterBusinessRequestDto } from '../models/register-business.request.dto';
import { RegisterBusinessResponseDto } from '../models/register-business.response.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('business/register')
  @ApiOperation({
    summary: 'Register a new business',
    description:
      'Register a new business with owner account. Business will be in pending status awaiting approval.',
  })
  @ApiResponse({
    status: 201,
    description: 'Business registered successfully',
    type: RegisterBusinessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Business or user email already exists',
  })
  async registerBusiness(
    @Body() dto: RegisterBusinessRequestDto,
  ): Promise<BaseResponseDto<RegisterBusinessResponseDto>> {
    const result = await this.authService.registerBusiness(dto);

    return {
      success: true,
      data: result,
      message: 'Business registered successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('business/:businessGgId/login')
  @UseGuards(TenantResolveGuard)
  @ApiOperation({
    summary: 'Member login to business',
    description: 'Authenticate a member to access a specific business account',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or business not active',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async login(
    @Param('businessGgId') businessGgId: string,
    @Body() dto: LoginRequestDto,
  ): Promise<BaseResponseDto<LoginResponseDto>> {
    const result = await this.authService.login(businessGgId, dto);

    return {
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    };
  }
}
