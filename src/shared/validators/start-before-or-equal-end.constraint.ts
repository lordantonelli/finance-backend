import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export type StartEndParseType = 'date' | 'month' | 'number';

export interface StartBeforeOrEqualEndArgs extends ValidationArguments {
  constraints: [
    string, // start field name
    StartEndParseType?, // parse type (default 'date')
  ];
}

@ValidatorConstraint({ name: 'StartBeforeOrEqualEnd', async: false })
export class StartBeforeOrEqualEndConstraint
  implements ValidatorConstraintInterface
{
  validate(endValue: unknown, args: StartBeforeOrEqualEndArgs): boolean {
    if (!args?.object) return false;
    const [startField, parseType = 'date'] = args.constraints || [];
    const obj: Record<string, unknown> = args.object as Record<string, unknown>;
    const startValue = obj ? obj[startField] : undefined;

    // If either value is missing, treat as invalid
    if (
      startValue === undefined ||
      startValue === null ||
      endValue === undefined ||
      endValue === null
    ) {
      return false;
    }

    try {
      const s = this.toComparable(startValue, parseType);
      const e = this.toComparable(endValue, parseType);
      if (s === null || e === null) return false;
      return s <= e;
    } catch {
      return false;
    }
  }

  defaultMessage(args?: ValidationArguments): string {
    if (!args) return 'Start must be less than or equal to end';
    const [startField, parseType = 'date'] =
      (args as StartBeforeOrEqualEndArgs).constraints || [];
    return `${startField} must be less than or equal to ${args.property} (${parseType})`;
  }

  private toComparable(
    value: unknown,
    parseType: StartEndParseType,
  ): number | null {
    switch (parseType) {
      case 'number': {
        const n = typeof value === 'number' ? value : Number(value as any);
        return Number.isFinite(n) ? n : null;
      }
      case 'month': {
        // Expect YYYY-MM
        if (typeof value !== 'string') return null;
        const m = value.match(/^(\d{4})-(\d{2})$/);
        if (!m) return null;
        const y = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10);
        if (!Number.isFinite(y) || !Number.isFinite(mon) || mon < 1 || mon > 12)
          return null;
        return y * 100 + mon; // comparable integer
      }
      case 'date':
      default: {
        // Accept Date instance or string parseable by Date
        const d = value instanceof Date ? value : new Date(String(value));
        const time = d.getTime();
        return Number.isFinite(time) ? time : null;
      }
    }
  }
}
