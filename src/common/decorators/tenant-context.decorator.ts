import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantContext {
  businessId: string;
  businessGgId: string;
  businessName: string;
  businessStatus: string;
}

export const GetTenantContext = createParamDecorator(
  (
    data: keyof TenantContext | undefined,
    ctx: ExecutionContext,
  ): TenantContext | any => {
    const request = ctx.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    return data ? tenantContext?.[data] : tenantContext;
  },
);
