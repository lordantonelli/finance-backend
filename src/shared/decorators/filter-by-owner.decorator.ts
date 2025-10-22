import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { OwnershipFilterInterceptor } from '@shared/interceptors/ownership-filter.interceptor';

export const FilterByOwner = (ownerField = 'user') =>
  applyDecorators(
    SetMetadata('ownerField', ownerField),
    SetMetadata('filterByOwner', true),
    UseInterceptors(OwnershipFilterInterceptor),
  );
