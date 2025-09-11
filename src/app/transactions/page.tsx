'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatINR, getStatusColor, formatStatus } from '@/lib/currency';

// Mock transaction data
const mockTransactions = [
  {
    id: '1',
    userId: 'user_123',
    type: 'withdrawal',
    amount: 25000,
    remainingAmount: 15000,
    status: 'partially_matched',
    description: 'Emergency fund withdrawal',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T14:20:00'),
    completionPercentage: 40,
    referenceNumber: 'REF17576001234567',
    matches: [
      {
        id: 'm1',
        amount: 10000,
        otherParty: 'Priya Sharma',
        status: 'completed',
        referenceNumber: 'REF17576001234567'
      }
    ]
  },
  {
    id: '2',
    userId: 'user_123',
    type: 'deposit',
    amount: 15000,
    remainingAmount: 0,
    status: 'completed',
    description: 'Investment deposit',
    createdAt: new Date('2024-01-14T09:15:00'),
    updatedAt: new Date('2024-01-14T16:45:00'),
    completionPercentage: 100,
    referenceNumber: 'REF17576001234568',
    matches: [
      {
        id: 'm2',
        amount: 15000,
        otherParty: 'Rajesh Kumar',
        status: 'completed',
        referenceNumber: 'REF17576001234568'
      }
    ]
  },
  {
    id: '3',
    userId: 'user_123',
    type: 'withdrawal',
    amount: 50000,
    remainingAmount: 50000,
    status: 'pending',
    description: 'Business expenses',
    createdAt: new Date('2024-01-13T14:20:00'),
    updatedAt: new Date('2024-01-13T14:20:00'),
    completionPercentage: 0,
    referenceNumber: 'REF17576001234569',
    matches: []
  },
  {
    id: '4',
    userId: 'user_123',
    type: 'deposit',
    amount: 8000,
    remainingAmount: 0,
    status: 'admin_pending',
    description: 'Small deposit',
    createdAt: new Date('2024-01-12T11:45:00'),
    updatedAt: new Date('2024-01-12T16:30:00'),
    completionPercentage: 100,
    referenceNumber: 'REF17576001234570',
    matches: [
      {
        id: 'm3',
        amount: 8000,
        otherParty: 'Amit Patel',
        status: 'admin_review',
        referenceNumber: 'REF17576001234570'
      }
    ]
  }
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');

  // Filter and sort transactions
  const filteredTransactions = mockTransactions
    .filter(transaction => {
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.id.includes(searchTerm) ||
                          transaction.referenceNumber?.includes(searchTerm);
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? '💰' : '💸';
  };

  const getTotalStats = () => {
    const totalDeposits = mockTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = mockTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const completedTransactions = mockTransactions.filter(t => t.status === 'completed').length;
    
    return { totalDeposits, totalWithdrawals, completedTransactions };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Transaction History
        </h1>
        <p className="text-gray-600">
          View and manage all your deposit and withdrawal transactions with reference numbers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">{formatINR(stats.totalDeposits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💸</span>
              <div>
                <p className="text-sm text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-blue-600">{formatINR(stats.totalWithdrawals)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completedTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by ID, reference, or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="partially_matched">Partially Matched</option>
                <option value="admin_pending">Admin Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {transaction.type === 'deposit' ? 'Deposit Request' : 'Withdrawal Request'}
                      </CardTitle>
                      <CardDescription>
                        ID: {transaction.id} • Ref: {transaction.referenceNumber} • {transaction.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(transaction.status)}>
                    {formatStatus(transaction.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Transaction Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="font-semibold">{formatINR(transaction.amount)}</span>
                      </div>
                      
                      {transaction.type === 'withdrawal' && transaction.remainingAmount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Remaining:</span>
                            <span className="font-semibold text-blue-600">
                              {formatINR(transaction.remainingAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Received:</span>
                            <span className="font-semibold text-green-600">
                              {formatINR(transaction.amount - transaction.remainingAmount)}
                            </span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reference:</span>
                        <span className="font-mono text-sm">{transaction.referenceNumber}</span>
                      </div>
                      
                      {transaction.description && (
                        <div>
                          <span className="text-sm text-gray-600">Description:</span>
                          <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{transaction.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar for Withdrawals */}
                    {transaction.type === 'withdrawal' && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Completion Progress</span>
                          <span>{transaction.completionPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={transaction.completionPercentage} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Matches */}
                  <div>
                    <h4 className="font-semibold mb-3">
                      Matches ({transaction.matches.length})
                      {transaction.matches.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {transaction.matches.filter(m => m.status === 'completed').length} completed
                        </Badge>
                      )}
                    </h4>
                    
                    {transaction.matches.length > 0 ? (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {transaction.matches.map((match) => (
                          <div key={match.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{match.otherParty}</p>
                                <p className="text-sm text-gray-600">
                                  {formatINR(match.amount)}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                  Ref: {match.referenceNumber}
                                </p>
                              </div>
                              <Badge className={getStatusColor(match.status)}>
                                {formatStatus(match.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="text-sm">No matches yet</p>
                        <p className="text-xs">
                          {transaction.type === 'deposit' ? 'Waiting for withdrawers' : 'Waiting for depositors'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length >= 10 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Transactions
          </Button>
        </div>
      )}
    </div>
  );
}