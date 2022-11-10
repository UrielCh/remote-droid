import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const IS_STRING_OR_STRINGS = 'isStringOrStrings';

/**
 * Checks if value is an integer.
 */
export function isStringOrStrings(val: unknown): boolean {
  if (typeof val === 'string') return true;
  if (!Array.isArray(val)) return false;
  for (const v of val) {
    if (typeof v !== 'string') return false;
  }
  return true;
}

/**
 * Checks if value is an String or a Strings.
 * Do not set each: true, or except if your looking for a string[] or string[][]
 */
export function IsStringOrStrings(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_STRING_OR_STRINGS,
      validator: {
        validate: (value: unknown /*, args*/): boolean => isStringOrStrings(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be a string of string array', validationOptions),
      },
    },
    validationOptions,
  );
}
