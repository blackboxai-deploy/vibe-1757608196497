// Currency utilities for INR formatting and validation

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Format amount as Indian Rupee currency
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large amounts in compact form (L for Lakh, Cr for Crore)
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return formatINR(amount);
}

/**
 * Parse string to number (remove commas, currency symbols)
 */
export function parseINR(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.toString().replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleanValue);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount: number): ValidationResult {
  if (!amount || amount <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than 0'
    };
  }
  
  if (amount < 100) {
    return {
      valid: false,
      error: 'Minimum amount is ₹100'
    };
  }
  
  if (amount > 500000) {
    return {
      valid: false,
      error: 'Maximum amount is ₹5,00,000 per transaction'
    };
  }
  
  return { valid: true };
}

/**
 * Calculate completion percentage for partial withdrawals
 */
export function calculateCompletionPercentage(totalAmount: number, remainingAmount: number): number {
  if (totalAmount <= 0) return 0;
  const completed = totalAmount - remainingAmount;
  return Math.max(0, Math.min(100, (completed / totalAmount) * 100));
}

/**
 * Get status color class for badges
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'approved':
      return 'bg-green-500 text-white';
    case 'pending':
    case 'payment_pending':
      return 'bg-yellow-500 text-white';
    case 'partially_matched':
    case 'admin_review':
      return 'bg-blue-500 text-white';
    case 'receipt_uploaded':
      return 'bg-purple-500 text-white';
    case 'rejected':
    case 'failed':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * Format status text for display
 */
export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate matching compatibility score
 */
export function calculateMatchScore(depositAmount: number, withdrawalAmount: number): number {
  if (depositAmount > withdrawalAmount) return 0; // Cannot match
  
  if (depositAmount === withdrawalAmount) return 100; // Perfect match
  
  // Partial match score based on how much of withdrawal is fulfilled
  return Math.round((depositAmount / withdrawalAmount) * 100);
}

/**
 * Generate transaction reference ID
 */
export function generateTransactionId(type: 'deposit' | 'withdrawal'): string {
  const prefix = type === 'deposit' ? 'DEP' : 'WDL';
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp.slice(-8)}${random}`;
}

/**
 * Validate bank account details
 */
export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

export function validateBankDetails(bankDetails: Partial<BankDetails>): ValidationResult {
  if (!bankDetails.accountNumber) {
    return { valid: false, error: 'Account number is required' };
  }
  
  if (bankDetails.accountNumber.length < 8 || bankDetails.accountNumber.length > 18) {
    return { valid: false, error: 'Account number must be 8-18 digits' };
  }
  
  if (!bankDetails.ifscCode) {
    return { valid: false, error: 'IFSC code is required' };
  }
  
  const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscPattern.test(bankDetails.ifscCode)) {
    return { valid: false, error: 'Invalid IFSC code format' };
  }
  
  if (!bankDetails.accountHolderName) {
    return { valid: false, error: 'Account holder name is required' };
  }
  
  if (!bankDetails.bankName) {
    return { valid: false, error: 'Bank name is required' };
  }
  
  return { valid: true };
}

/**
 * Validate UTR number format
 */
export function validateUTR(utr: string): ValidationResult {
  if (!utr) {
    return { valid: false, error: 'UTR number is required' };
  }
  
  // UTR format: Usually 12-16 alphanumeric characters
  const utrPattern = /^[A-Z0-9]{10,16}$/;
  if (!utrPattern.test(utr.toUpperCase())) {
    return { 
      valid: false, 
      error: 'Invalid UTR format. Should be 10-16 alphanumeric characters' 
    };
  }
  
  return { valid: true };
}

/**
 * Calculate platform fee (if applicable)
 */
export function calculatePlatformFee(amount: number, feePercentage: number = 0.5): number {
  return Math.round(amount * (feePercentage / 100));
}

/**
 * Get net amount after platform fee
 */
export function getNetAmount(amount: number, feePercentage: number = 0.5): {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
} {
  const grossAmount = amount;
  const platformFee = calculatePlatformFee(amount, feePercentage);
  const netAmount = grossAmount - platformFee;
  
  return {
    grossAmount,
    platformFee,
    netAmount
  };
}