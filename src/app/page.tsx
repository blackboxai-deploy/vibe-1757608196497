'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

// Mock data for dashboard
const mockDashboardData = {
  totalBalance: 125000,
  pendingWithdrawals: 45000,
  completedTransactions: 12,
  activeDeposits: 3,
  recentTransactions: [
    {
      id: '1',
      type: 'deposit',
      amount: 25000,
      status: 'completed',
      date: '2024-01-15',
      description: 'Investment deposit'
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 15000,
      status: 'partially_matched',
      date: '2024-01-14',
      description: 'Emergency fund',
      completion: 60
    },
    {
      id: '3',
      type: 'deposit',
      amount: 30000,
      status: 'pending',
      date: '2024-01-13',
      description: 'Savings deposit'
    }
  ]
};

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'partially_matched': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to P2P Platform 👋
        </h1>
        <p className="text-gray-600">
          Manage your deposits and withdrawals with our peer-to-peer matching system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(mockDashboardData.totalBalance)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatINR(mockDashboardData.pendingWithdrawals)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Being matched
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockDashboardData.completedTransactions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deposits</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockDashboardData.activeDeposits}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ready to match
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/deposit">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                <span className="text-2xl">💰</span>
                <span>Create Deposit</span>
              </Button>
            </Link>
            
            <Link href="/withdrawal">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                <span className="text-2xl">💸</span>
                <span>Create Withdrawal</span>
              </Button>
            </Link>
            
            <Link href="/transactions">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📋</span>
                <span>View History</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest deposit and withdrawal activities
              </CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDashboardData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {transaction.type === 'deposit' ? '💰' : '💸'}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{formatINR(transaction.amount)}</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{transaction.date}</p>
                  
                  {transaction.completion && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{transaction.completion}%</span>
                      </div>
                      <Progress value={transaction.completion} className="h-2 w-24" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ℹ️ How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Create Deposits</h3>
              <p className="text-sm text-gray-600">
                Add money to the platform and get matched with users who want to withdraw
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold mb-2">Auto Matching</h3>
              <p className="text-sm text-gray-600">
                Our system automatically matches deposits with withdrawals for optimal pairing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold mb-2">Admin Approval</h3>
              <p className="text-sm text-gray-600">
                All transactions are reviewed and approved by our admin team for security
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}