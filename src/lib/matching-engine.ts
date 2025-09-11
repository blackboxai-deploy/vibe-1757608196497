// Matching Engine for P2P Financial Platform

export interface MatchCriteria {
  withdrawalAmount: number;
  depositAmount: number;
  withdrawalId: string;
  depositId: string;
  withdrawalUserId: string;
  depositUserId: string;
}

export interface MatchResult {
  isValid: boolean;
  referenceNumber?: string;
  matchedAmount: number;
  remainingWithdrawal: number;
  reason?: string;
}

export interface PendingTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  remainingAmount: number;
  status: string;
  createdAt: Date;
  description?: string;
}

export interface Match {
  id: string;
  referenceNumber: string;
  withdrawalId: string;
  depositId: string;
  withdrawalAmount: number;
  depositAmount: number;
  matchedAmount: number;
  status: 'pending' | 'admin_review' | 'approved' | 'completed' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
}

/**
 * Generate a unique reference number for matched transactions
 */
export function generateReferenceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REF${timestamp}${random}`;
}

/**
 * Check if a deposit can match with a withdrawal based on amount criteria
 * Rule: Deposit amount must be <= Withdrawal remaining amount
 */
export function canMatch(withdrawal: PendingTransaction, deposit: PendingTransaction): MatchResult {
  // Basic validations
  if (withdrawal.type !== 'withdrawal') {
    return {
      isValid: false,
      matchedAmount: 0,
      remainingWithdrawal: withdrawal.remainingAmount,
      reason: 'Invalid withdrawal transaction type'
    };
  }

  if (deposit.type !== 'deposit') {
    return {
      isValid: false,
      matchedAmount: 0,
      remainingWithdrawal: withdrawal.remainingAmount,
      reason: 'Invalid deposit transaction type'
    };
  }

  // Users cannot match with their own transactions
  if (withdrawal.userId === deposit.userId) {
    return {
      isValid: false,
      matchedAmount: 0,
      remainingWithdrawal: withdrawal.remainingAmount,
      reason: 'Cannot match with own transaction'
    };
  }

  // Both transactions must be pending or available for matching
  if (withdrawal.status !== 'pending' && withdrawal.status !== 'partially_matched') {
    return {
      isValid: false,
      matchedAmount: 0,
      remainingWithdrawal: withdrawal.remainingAmount,
      reason: 'Withdrawal not available for matching'
    };
  }

  if (deposit.status !== 'pending') {
    return {
      isValid: false,
      matchedAmount: 0,
      remainingWithdrawal: withdrawal.remainingAmount,
      reason: 'Deposit not available for matching'
    };
  }

  // CORE MATCHING CRITERIA: Deposit amount must be <= Withdrawal remaining amount
  if (deposit.remainingAmount > withdrawal.remainingAmount) {
    return {
      isValid: false,
      matchedAmount: 0,
      remainingWithdrawal: withdrawal.remainingAmount,
      reason: `Deposit amount (${formatINR(deposit.remainingAmount)}) exceeds withdrawal remaining amount (${formatINR(withdrawal.remainingAmount)})`
    };
  }

  // Valid match - deposit amount fits within withdrawal requirements
  const matchedAmount = deposit.remainingAmount;
  const remainingWithdrawal = withdrawal.remainingAmount - matchedAmount;

  return {
    isValid: true,
    referenceNumber: generateReferenceNumber(),
    matchedAmount,
    remainingWithdrawal,
    reason: `Match valid: ${formatINR(matchedAmount)} matched, ${formatINR(remainingWithdrawal)} remaining`
  };
}

/**
 * Find all possible deposits that can match with a withdrawal
 */
export function findMatchingDeposits(
  withdrawal: PendingTransaction, 
  availableDeposits: PendingTransaction[]
): Array<{ deposit: PendingTransaction; matchResult: MatchResult }> {
  const matches: Array<{ deposit: PendingTransaction; matchResult: MatchResult }> = [];

  for (const deposit of availableDeposits) {
    const matchResult = canMatch(withdrawal, deposit);
    if (matchResult.isValid) {
      matches.push({ deposit, matchResult });
    }
  }

  // Sort by best match criteria:
  // 1. Exact amount matches first
  // 2. Larger amounts that utilize more of the withdrawal
  // 3. Older deposits first (FIFO)
  return matches.sort((a, b) => {
    const aAmount = a.deposit.remainingAmount;
    const bAmount = b.deposit.remainingAmount;
    const withdrawalAmount = withdrawal.remainingAmount;

    // Exact matches get highest priority
    if (aAmount === withdrawalAmount && bAmount !== withdrawalAmount) return -1;
    if (bAmount === withdrawalAmount && aAmount !== withdrawalAmount) return 1;

    // If both exact or both not exact, prefer larger amounts
    if (aAmount !== bAmount) {
      return bAmount - aAmount;
    }

    // If amounts are equal, prefer older deposits (FIFO)
    return a.deposit.createdAt.getTime() - b.deposit.createdAt.getTime();
  });
}

/**
 * Find all possible withdrawals that a deposit can match with
 */
export function findMatchingWithdrawals(
  deposit: PendingTransaction, 
  availableWithdrawals: PendingTransaction[]
): Array<{ withdrawal: PendingTransaction; matchResult: MatchResult }> {
  const matches: Array<{ withdrawal: PendingTransaction; matchResult: MatchResult }> = [];

  for (const withdrawal of availableWithdrawals) {
    const matchResult = canMatch(withdrawal, deposit);
    if (matchResult.isValid) {
      matches.push({ withdrawal, matchResult });
    }
  }

  // Sort by best match criteria:
  // 1. Smaller withdrawals that can be completely fulfilled
  // 2. Larger withdrawals that will be partially fulfilled
  // 3. Older withdrawals first (FIFO)
  return matches.sort((a, b) => {
    const aRemaining = a.withdrawal.remainingAmount;
    const bRemaining = b.withdrawal.remainingAmount;
    const depositAmount = deposit.remainingAmount;

    // Prefer withdrawals that can be completely fulfilled by this deposit
    const aCanComplete = aRemaining <= depositAmount;
    const bCanComplete = bRemaining <= depositAmount;

    if (aCanComplete && !bCanComplete) return -1;
    if (bCanComplete && !aCanComplete) return 1;

    // If both can be completed or both partial, prefer smaller amounts first
    if (aRemaining !== bRemaining) {
      return aRemaining - bRemaining;
    }

    // If amounts are equal, prefer older withdrawals (FIFO)
    return a.withdrawal.createdAt.getTime() - b.withdrawal.createdAt.getTime();
  });
}

/**
 * Create a match between a withdrawal and deposit
 */
export function createMatch(
  withdrawal: PendingTransaction,
  deposit: PendingTransaction,
  matchResult: MatchResult
): Match {
  if (!matchResult.isValid || !matchResult.referenceNumber) {
    throw new Error('Cannot create match from invalid match result');
  }

  return {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    referenceNumber: matchResult.referenceNumber,
    withdrawalId: withdrawal.id,
    depositId: deposit.id,
    withdrawalAmount: withdrawal.amount,
    depositAmount: deposit.amount,
    matchedAmount: matchResult.matchedAmount,
    status: 'admin_review',
    createdAt: new Date()
  };
}

/**
 * Automatic matching engine - matches deposits with withdrawals
 */
export function runAutomaticMatching(
  pendingWithdrawals: PendingTransaction[],
  pendingDeposits: PendingTransaction[]
): Match[] {
  const newMatches: Match[] = [];
  const processedDeposits = new Set<string>();

  // Sort withdrawals by creation date (FIFO)
  const sortedWithdrawals = [...pendingWithdrawals].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  for (const withdrawal of sortedWithdrawals) {
    if (withdrawal.remainingAmount <= 0) continue;

    // Find available deposits that haven't been processed
    const availableDeposits = pendingDeposits.filter(
      d => !processedDeposits.has(d.id) && d.remainingAmount > 0
    );

    const matchingDeposits = findMatchingDeposits(withdrawal, availableDeposits);

    for (const { deposit, matchResult } of matchingDeposits) {
      if (processedDeposits.has(deposit.id)) continue;
      if (withdrawal.remainingAmount <= 0) break;

      // Create match
      const match = createMatch(withdrawal, deposit, matchResult);
      newMatches.push(match);

      // Mark deposit as processed
      processedDeposits.add(deposit.id);

      // Update withdrawal remaining amount
      withdrawal.remainingAmount = matchResult.remainingWithdrawal;

      console.log(`✅ Match Created: ${match.referenceNumber} - ${formatINR(matchResult.matchedAmount)} matched`);
      console.log(`   Deposit ${deposit.id} (${formatINR(deposit.remainingAmount)}) → Withdrawal ${withdrawal.id}`);
      console.log(`   Withdrawal remaining: ${formatINR(matchResult.remainingWithdrawal)}`);

      // If withdrawal is completely fulfilled, move to next withdrawal
      if (withdrawal.remainingAmount <= 0) {
        break;
      }
    }
  }

  return newMatches;
}

/**
 * Utility function to format currency
 */
function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get matching statistics
 */
export function getMatchingStats(
  withdrawals: PendingTransaction[],
  deposits: PendingTransaction[],
  matches: Match[]
): {
  totalWithdrawals: number;
  totalDeposits: number;
  totalMatches: number;
  totalMatchedAmount: number;
  pendingWithdrawalAmount: number;
  pendingDepositAmount: number;
  matchingEfficiency: number;
} {
  const totalWithdrawals = withdrawals.length;
  const totalDeposits = deposits.length;
  const totalMatches = matches.length;
  
  const totalMatchedAmount = matches.reduce((sum, match) => sum + match.matchedAmount, 0);
  const pendingWithdrawalAmount = withdrawals.reduce((sum, w) => sum + w.remainingAmount, 0);
  const pendingDepositAmount = deposits.reduce((sum, d) => sum + d.remainingAmount, 0);
  
  const totalWithdrawalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const matchingEfficiency = totalWithdrawalAmount > 0 ? 
    ((totalWithdrawalAmount - pendingWithdrawalAmount) / totalWithdrawalAmount) * 100 : 0;

  return {
    totalWithdrawals,
    totalDeposits,
    totalMatches,
    totalMatchedAmount,
    pendingWithdrawalAmount,
    pendingDepositAmount,
    matchingEfficiency: Math.round(matchingEfficiency * 100) / 100
  };
}