import { registerDecorator, ValidationOptions } from 'class-validator';
import { DifferentFieldConstraint } from '../validators/different-field.constraint';

/**
 * Ensures the decorated field value is different from another field on the same object.
 *
 * Usage: apply on the field that must be different, passing the other field name.
 */
export function DifferentField(
  otherField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'DifferentField',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [otherField],
      validator: DifferentFieldConstraint,
    });
  };
}
