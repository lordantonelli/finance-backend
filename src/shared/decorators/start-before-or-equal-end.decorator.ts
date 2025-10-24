import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  StartBeforeOrEqualEndConstraint,
  StartEndParseType,
} from '../validators/start-before-or-equal-end.constraint';

/**
 * Ensures that a start field value is less than or equal to the decorated end field.
 *
 * Usage: apply on the end field.
 *
 * @param startField The name of the start field in the same DTO/class
 * @param parseType How to parse/compare the values: 'date' (default), 'month', or 'number'
 */
export function StartBeforeOrEqualEnd(
  startField: string,
  parseType: StartEndParseType = 'date',
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'StartBeforeOrEqualEnd',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [startField, parseType],
      validator: StartBeforeOrEqualEndConstraint,
    });
  };
}

/**
 * Convenience decorator for 'month' inputs (YYYY-MM) ensuring startMonth <= endMonth.
 */
export function StartBeforeOrEqualEndMonth(
  startField: string,
  validationOptions?: ValidationOptions,
) {
  return StartBeforeOrEqualEnd(startField, 'month', validationOptions);
}
