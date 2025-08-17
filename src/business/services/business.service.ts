import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Business } from '../entities/business.entity';
import { BusinessProfileResponseDto } from '../models/business-profile.response.dto';
import { UpdateBusinessProfileRequestDto } from '../models/update-business-profile.request.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: EntityRepository<Business>,
    private readonly em: EntityManager,
  ) {}

  async getProfile(businessId: string): Promise<BusinessProfileResponseDto> {
    const business = await this.businessRepository.findOne({
      ggId: businessId,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      id: business.id,
      ggId: business.ggId,
      name: business.name,
      phone: business.phone,
      address: business.address,
      industry: business.industry,
      status: business.status,
      logo: business.logo,
      description: business.description,
      settings: business.settings,
      createdAt: business.createdAt.toISOString(),
      updatedAt: business.updatedAt.toISOString(),
      approvedAt: business.approvedAt?.toISOString(),
    };
  }

  async updateProfile(
    businessId: string,
    dto: UpdateBusinessProfileRequestDto,
  ): Promise<BusinessProfileResponseDto> {
    const business = await this.businessRepository.findOne({
      ggId: businessId,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update business fields
    if (dto.name !== undefined) business.name = dto.name;
    if (dto.phone !== undefined) business.phone = dto.phone;
    if (dto.address !== undefined) business.address = dto.address;
    if (dto.industry !== undefined) business.industry = dto.industry;
    if (dto.description !== undefined) business.description = dto.description;
    if (dto.logo !== undefined) business.logo = dto.logo;
    if (dto.settings !== undefined) business.settings = dto.settings;

    business.updatedAt = new Date();

    await this.em.flush();

    return this.getProfile(businessId);
  }
}
