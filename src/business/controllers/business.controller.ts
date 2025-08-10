import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantResolveGuard } from '../../auth/guards/tenant-resolve.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import {
  GetTenantContext,
  TenantContext,
} from '../../common/decorators/tenant-context.decorator';
import { BaseResponseDto } from '../../common/models/base-response.dto';
import { BusinessProfileResponseDto } from '../models/business-profile.response.dto';
import { UpdateBusinessProfileRequestDto } from '../models/update-business-profile.request.dto';
import { BusinessService } from '../services/business.service';

@ApiTags('Business')
@Controller('business/:businessGgId')
@UseGuards(TenantResolveGuard, JwtAuthGuard)
@ApiBearerAuth()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get business profile',
    description: 'Retrieve the current business profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Business profile retrieved successfully',
    type: BusinessProfileResponseDto,
  })
  async getProfile(
    @GetTenantContext() tenantContext: TenantContext,
  ): Promise<BaseResponseDto<BusinessProfileResponseDto>> {
    const result = await this.businessService.getProfile(
      tenantContext.businessId,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update business profile',
    description: 'Update the current business profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Business profile updated successfully',
    type: BusinessProfileResponseDto,
  })
  async updateProfile(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateBusinessProfileRequestDto,
  ): Promise<BaseResponseDto<BusinessProfileResponseDto>> {
    const result = await this.businessService.updateProfile(
      tenantContext.businessId,
      dto,
    );

    return {
      success: true,
      data: result,
      message: 'Business profile updated successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
