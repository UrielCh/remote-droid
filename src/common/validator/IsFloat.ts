// import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const IS_FLOAT = 'isInt';

/**
 * Checks if value is an integer.
 */
export function isFloat(val: unknown): boolean {
  return typeof val === 'number' && Number.isFinite(val);
}

/**
 * Checks if value is an integer.
 */
export function IsFloat(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_FLOAT,
      validator: {
        validate: (value: unknown /*, args*/): boolean => isFloat(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be an finite number', validationOptions),
      },
    },
    validationOptions,
  );
}
