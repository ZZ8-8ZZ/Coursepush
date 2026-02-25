import { ValidationError } from '../services/errors.js';
import { toPositiveInteger } from './parsers.js';

export const requirePositiveId = (value, label = 'ID') => {
  const parsed = toPositiveInteger(value);
  if (!parsed) {
    throw new ValidationError(`${label} 必须为正整数`);
  }
  return parsed;
};
