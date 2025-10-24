import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export interface DifferentFieldArgs extends ValidationArguments {
  constraints: [string]; // other field name
}

@ValidatorConstraint({ name: 'DifferentField', async: false })
export class DifferentFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: DifferentFieldArgs): boolean {
    if (!args?.object) return true; // skip when not binded
    const [otherField] = args.constraints || [];
    const obj = args.object as Record<string, unknown>;
    const otherValue = obj ? obj[otherField] : undefined;

    // If either value is missing, skip (let other validators handle requiredness)
    if (value === undefined || value === null) return true;
    if (otherValue === undefined || otherValue === null) return true;

    // Compare using normalized deep-equality across types (numbers, strings, dates, objects with id, arrays)
    return !areEqualNormalized(value, otherValue);
  }

  defaultMessage(args?: ValidationArguments): string {
    const otherField =
      (args as DifferentFieldArgs)?.constraints?.[0] ?? 'the other field';
    return `${args?.property} must be different from ${otherField}`;
  }
}

// Helpers
function areEqualNormalized(a: unknown, b: unknown): boolean {
  const na = normalizeValue(a);
  const nb = normalizeValue(b);
  if (
    typeof na !== 'object' ||
    na === null ||
    typeof nb !== 'object' ||
    nb === null
  ) {
    return na === nb;
  }
  // Deep compare via stable JSON stringification
  return stableStringify(na) === stableStringify(nb);
}

function normalizeValue(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.getTime();
  const t = typeof v;
  if (t === 'number' || t === 'boolean') return v;
  if (t === 'string') {
    const s = (v as string).trim();
    // numeric string
    if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
    // date string (ISO or parseable)
    const time = Date.parse(s);
    if (Number.isFinite(time)) return new Date(time).getTime();
    return s.toLowerCase();
  }
  if (Array.isArray(v)) return v.map((x) => normalizeValue(x));
  if (isPlainObject(v)) {
    const obj: Record<string, unknown> = v;
    // Prefer comparing by id when present
    if (Object.prototype.hasOwnProperty.call(obj, 'id')) {
      return normalizeValue(obj['id']);
    }
    // Normalize each key
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = normalizeValue(obj[key]);
    }
    return out;
  }
  return v; // fallback
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === 'object' &&
    v !== null &&
    Object.prototype.toString.call(v) === '[object Object]'
  );
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v))
    return `[${v.map((x) => stableStringify(x)).join(',')}]`;
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`,
  );
  return `{${parts.join(',')}}`;
}
