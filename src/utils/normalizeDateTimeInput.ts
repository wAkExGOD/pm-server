import { BadRequestException } from '@nestjs/common';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeDateTimeInput(value: string, fieldName: string) {
  const normalizedValue = DATE_ONLY_PATTERN.test(value)
    ? `${value}T00:00:00.000Z`
    : value;

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new BadRequestException(`${fieldName} must be a valid date`);
  }

  return parsedDate;
}
