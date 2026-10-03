import { SALE_INVOICE_PREFIX, PURCHASE_INVOICE_PREFIX } from './constants.js';

/**
 * Format price with PKR currency
 */
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate a unique invoice number
 * Format: SI-20260929-001 or PI-20260929-001
 */
export function generateInvoiceNumber(
  type: 'sale' | 'purchase',
  sequence: number
): string {
  const prefix =
    type === 'sale' ? SALE_INVOICE_PREFIX : PURCHASE_INVOICE_PREFIX;
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const seq = String(sequence).padStart(3, '0');
  return `${prefix}-${dateStr}-${seq}`;
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  total: number,
  discountPercent: number
): number {
  return (total * discountPercent) / 100;
}

/**
 * Calculate total with discount
 */
export function calculateTotal(
  subtotal: number,
  discountPercent: number = 0
): number {
  const discount = calculateDiscount(subtotal, discountPercent);
  return subtotal - discount;
}

/**
 * Check if stock is low
 */
export function isLowStock(currentStock: number, minLevel: number): boolean {
  return currentStock <= minLevel;
}

/**
 * Format phone number for Pakistan
 * Converts 03001234567 → +92-300-1234567
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+92-${cleaned.slice(1, 4)}-${cleaned.slice(4)}`;
  }
  return phone;
}

/**
 * Validate Pakistani CNIC format (XXXXX-XXXXXXX-X)
 */
export function isValidCNIC(cnic: string): boolean {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a random SKU
 */
export function generateSKU(categoryPrefix: string): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${categoryPrefix.toUpperCase().slice(0, 3)}-${random}`;
}
