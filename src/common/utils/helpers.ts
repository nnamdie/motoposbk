import { customAlphabet } from 'nanoid';

/**
 * Generate a business ID with specified length using uppercase alphanumeric characters
 */
export function generateBusinessId(length: number = 6): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, length);

  return nanoid();
}

/**
 * Generate a SKU based on item properties and attributes
 */
export function generateSKU(
  name: string,
  modelNo?: string,
  attributes?: Array<{ name: string; value: string }>,
): string {
  // Extract name prefix (first 3 letters of each word)
  const namePrefix = name
    .split(' ')
    .map((word) => word.substring(0, 3).toUpperCase())
    .join('');

  // Extract model prefix
  const modelPrefix = modelNo ? modelNo.substring(0, 4).toUpperCase() : '';

  // Extract variant from attributes (Color, Size, Variant, etc.)
  const variantAttribute = attributes?.find((attr) =>
    ['color', 'colour', 'size', 'variant', 'model', 'type'].includes(
      attr.name.toLowerCase(),
    ),
  );
  const variantPrefix = variantAttribute
    ? variantAttribute.value.substring(0, 2).toUpperCase()
    : '';

  // Add timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6);

  return `${namePrefix}${modelPrefix}${variantPrefix}${timestamp}`;
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100); // Assuming amounts are stored in cents
}

/**
 * Parse phone number to standard format
 */
export function parsePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle Nigerian numbers
  if (digits.startsWith('234')) {
    return `+${digits}`;
  } else if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.substring(1)}`;
  } else if (digits.length === 10) {
    return `+234${digits}`;
  }

  // For international numbers, assume they're already formatted
  return `+${digits}`;
}

/**
 * Generate a random reference number
 */
export function generateReference(prefix: string = 'REF'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
