import { registerDecorator, ValidationOptions } from 'class-validator';
import { EntitySchema, ObjectType } from 'typeorm';
import { ExistsAndBelongsToUserConstraint } from '../validators/exists-and-belongs-to-user.constraint';

/**
 * Validates that a record exists in the database and belongs to the current authenticated user.
 *
 * @param entity - The entity class to validate against
 * @param userFieldName - Optional: The name of the field that references the user (default: 'user')
 * @param validationOptions - Optional: Additional validation options
 *
 * @example
 * // Basic usage (assumes entity has a 'user' field)
 * @ExistsAndBelongsToUser(Account)
 * account: Account;
 *
 * @example
 * // Custom user field name
 * @ExistsAndBelongsToUser(Account, 'owner')
 * account: Account;
 */
export function ExistsAndBelongsToUser<E>(
  entity: ObjectType<E> | EntitySchema<E> | string,
  userFieldName?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ExistsAndBelongsToUser',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, userFieldName],
      validator: ExistsAndBelongsToUserConstraint,
    });
  };
}
