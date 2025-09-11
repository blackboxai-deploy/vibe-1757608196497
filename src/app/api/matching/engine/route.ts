import { NextRequest, NextResponse } from 'next/server';
import { 
  runAutomaticMatching, 
  findMatchingDeposits, 
  findMatchingWithdrawals,
  canMatch,
  getMatchingStats,
  PendingTransaction
} from '@/lib/matching-engine';

// Mock data for testing the matching engine
const mockPendingWithdrawals: PendingTransaction[] = [
  {
    id: 'w1',
    userId: 'user_001',
    type: 'withdrawal',
    amount: 50000,
    remainingAmount: 50000,
    status: 'pending',
    createdAt: new Date('2024-01-15T10:00:00'),
    description: 'Emergency fund withdrawal'
  },
  {
    id: 'w2', 
    userId: 'user_002',
    type: 'withdrawal',
    amount: 25000,
    remainingAmount: 15000, // Partially matched
    status: 'partially_matched',
    createdAt: new Date('2024-01-14T09:00:00'),
    description: 'Business expenses'
  },
  {
    id: 'w3',
    userId: 'user_003',
    type: 'withdrawal', 
    amount: 75000,
    remainingAmount: 75000,
    status: 'pending',
    createdAt: new Date('2024-01-13T14:30:00'),
    description: 'Investment withdrawal'
  }
];

const mockPendingDeposits: PendingTransaction[] = [
  {
    id: 'd1',
    userId: 'user_101',
    type: 'deposit',
    amount: 20000,
    remainingAmount: 20000,
    status: 'pending',
    createdAt: new Date('2024-01-15T11:00:00'),
    description: 'Savings deposit'
  },
  {
    id: 'd2',
    userId: 'user_102', 
    type: 'deposit',
    amount: 10000,
    remainingAmount: 10000,
    status: 'pending',
    createdAt: new Date('2024-01-15T12:00:00'),
    description: 'Small investment'
  },
  {
    id: 'd3',
    userId: 'user_103',
    type: 'deposit',
    amount: 35000,
    remainingAmount: 35000,
    status: 'pending',
    createdAt: new Date('2024-01-14T16:00:00'),
    description: 'Monthly savings'
  },
  {
    id: 'd4',
    userId: 'user_104',
    type: 'deposit',
    amount: 60000, // This should NOT match with w1 (50K) because 60K > 50K
    remainingAmount: 60000,
    status: 'pending',
    createdAt: new Date('2024-01-13T10:00:00'),
    description: 'Large deposit'
  },
  {
    id: 'd5',
    userId: 'user_105',
    type: 'deposit',
    amount: 15000, // This should match with w2 (15K remaining)
    remainingAmount: 15000,
    status: 'pending',
    createdAt: new Date('2024-01-12T08:00:00'),
    description: 'Exact match deposit'
  }
];

// POST - Run automatic matching engine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'run_matching':
        // Run the automatic matching algorithm
        const newMatches = runAutomaticMatching(
          [...mockPendingWithdrawals], // Clone to avoid mutation
          [...mockPendingDeposits]
        );

        return NextResponse.json({
          success: true,
          data: {
            newMatches,
            matchCount: newMatches.length,
            totalMatchedAmount: newMatches.reduce((sum, match) => sum + match.matchedAmount, 0)
          },
          message: `${newMatches.length} new matches created successfully`
        });

      case 'check_match':
        const { withdrawalId, depositId } = body;
        
        if (!withdrawalId || !depositId) {
          return NextResponse.json({
            success: false,
            error: 'Withdrawal ID and Deposit ID are required'
          }, { status: 400 });
        }

        // Find the specific transactions
        const withdrawal = mockPendingWithdrawals.find(w => w.id === withdrawalId);
        const deposit = mockPendingDeposits.find(d => d.id === depositId);

        if (!withdrawal || !deposit) {
          return NextResponse.json({
            success: false,
            error: 'Transaction not found'
          }, { status: 404 });
        }

        // Check if they can match
        const matchResult = canMatch(withdrawal, deposit);

        return NextResponse.json({
          success: true,
          data: {
            canMatch: matchResult.isValid,
            matchResult,
            withdrawal: {
              id: withdrawal.id,
              amount: withdrawal.amount,
              remainingAmount: withdrawal.remainingAmount
            },
            deposit: {
              id: deposit.id,
              amount: deposit.amount,
              remainingAmount: deposit.remainingAmount
            }
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in matching engine:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process matching request'
    }, { status: 500 });
  }
}

// GET - Get matching possibilities and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const type = searchParams.get('type') as 'deposit' | 'withdrawal' | undefined;
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      // Return matching statistics
      const stats = getMatchingStats(
        mockPendingWithdrawals,
        mockPendingDeposits,
        [] // In real app, fetch existing matches from database
      );

      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    if (transactionId && type) {
      // Get matching possibilities for a specific transaction
      if (type === 'withdrawal') {
        const withdrawal = mockPendingWithdrawals.find(w => w.id === transactionId);
        if (!withdrawal) {
          return NextResponse.json({
            success: false,
            error: 'Withdrawal not found'
          }, { status: 404 });
        }

        const matchingDeposits = findMatchingDeposits(withdrawal, mockPendingDeposits);

        return NextResponse.json({
          success: true,
          data: {
            transaction: withdrawal,
            matchingOptions: matchingDeposits,
            totalOptions: matchingDeposits.length,
            totalMatchableAmount: matchingDeposits.reduce((sum, { matchResult }) => sum + matchResult.matchedAmount, 0)
          }
        });

      } else if (type === 'deposit') {
        const deposit = mockPendingDeposits.find(d => d.id === transactionId);
        if (!deposit) {
          return NextResponse.json({
            success: false,
            error: 'Deposit not found'
          }, { status: 404 });
        }

        const matchingWithdrawals = findMatchingWithdrawals(deposit, mockPendingWithdrawals);

        return NextResponse.json({
          success: true,
          data: {
            transaction: deposit,
            matchingOptions: matchingWithdrawals,
            totalOptions: matchingWithdrawals.length,
            totalMatchableAmount: matchingWithdrawals.reduce((sum, { matchResult }) => sum + matchResult.matchedAmount, 0)
          }
        });
      }
    }

    // Return all pending transactions and their matching possibilities
    return NextResponse.json({
      success: true,
      data: {
        pendingWithdrawals: mockPendingWithdrawals,
        pendingDeposits: mockPendingDeposits,
        matchingCriteria: {
          rule: 'Deposit amount must be ≤ Withdrawal remaining amount',
          description: 'Deposits can only match with withdrawals if the deposit amount fits within the remaining withdrawal amount'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching matching data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch matching data'
    }, { status: 500 });
  }
}