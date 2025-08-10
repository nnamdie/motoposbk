import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Business,
  BusinessStatus,
} from '../../business/entities/business.entity';

@Injectable()
export class TenantResolveGuard implements CanActivate {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: EntityRepository<Business>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const businessGgId = request.params.businessGgId;

    if (!businessGgId) {
      throw new NotFoundException('Business ID is required');
    }

    // Find and validate business
    const business = await this.businessRepository.findOne({
      ggId: businessGgId,
    });

    if (!business) {
      throw new NotFoundException(
        `Business with ID '${businessGgId}' not found`,
      );
    }

    if (business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException('Business is not active');
    }

    // Attach tenant context to request
    request.tenantContext = {
      businessId: business.ggId,
      businessGgId: business.ggId,
      businessName: business.name,
      businessStatus: business.status,
      business,
    };

    return true;
  }
}
