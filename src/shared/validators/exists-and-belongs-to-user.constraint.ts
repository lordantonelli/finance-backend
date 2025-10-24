import { Injectable, Scope } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager, EntitySchema, ObjectType } from 'typeorm';
import { AppContextService } from '../services/app-context.service';

export interface ExistsAndBelongsToUserValidationArguments<E>
  extends ValidationArguments {
  constraints: [
    ObjectType<E> | EntitySchema<E> | string,
    string?, // optional: custom user field name (default: 'user')
  ];
}

@ValidatorConstraint({ name: 'existsAndBelongsToUser', async: true })
@Injectable({ scope: Scope.REQUEST })
export class ExistsAndBelongsToUserConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly entityManager: EntityManager,
    private readonly appContext: AppContextService,
  ) {}

  async validate<E>(
    value: any,
    args: ExistsAndBelongsToUserValidationArguments<E>,
  ): Promise<boolean> {
    // Get options from decorator
    const [EntityClass, userFieldName = 'user'] = args.constraints;

    // Get current user ID from context
    const currentUserId = this.appContext.currentUserId;
    if (!currentUserId) {
      return false; // No user in context
    }

    // Extract ID from value
    const id = typeof value === 'object' ? value.id : value;
    if (!id) {
      return false;
    }

    // Database query to check if record exists and belongs to user
    const repository = this.entityManager.getRepository(EntityClass);
    const record = await repository.findOne({
      where: { id } as any,
      relations: [userFieldName],
    });

    if (!record) {
      return false; // Record does not exist
    }

    // Check if record belongs to the current user
    const recordUserId =
      typeof record[userFieldName] === 'object'
        ? record[userFieldName]?.id
        : record[userFieldName];

    return recordUserId === currentUserId;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const field = validationArguments?.property;
    const value =
      typeof validationArguments?.value === 'object'
        ? validationArguments?.value.id
        : validationArguments?.value;
    return `${field} with id [${value}] does not exist or does not belong to you`;
  }
}
