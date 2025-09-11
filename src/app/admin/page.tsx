'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Helper functions
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatINRCompact = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return formatINR(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500 text-white';
    case 'approved': return 'bg-green-500 text-white';
    case 'pending': return 'bg-yellow-500 text-white';
    case 'admin_review': return 'bg-red-500 text-white';
    case 'receipt_uploaded': return 'bg-blue-500 text-white';
    case 'payment_pending': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Mock data for admin dashboard
const mockSummary = {
  totalDeposits: 12450000,
  totalWithdrawals: 9875000,
  pendingMatches: 23,
  completedTransactions: 156,
  totalVolume: 22325000
};

const mockPendingMatches = [
  {
    id: 'm1',
    withdrawalId: 'w1',
    depositId: 'd1',
    amount: 25000,
    status: 'admin_review',
    adminApproved: false,
    createdAt: new Date('2024-01-15T10:30:00'),
    withdrawalUser: {
      id: 'user_123',
      name: 'Rajesh Kumar',
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Rajesh Kumar',
        bankName: 'HDFC Bank'
      }
    },
    depositUser: {
      id: 'user_456',
      name: 'Priya Sharma',
      bankDetails: {
        accountNumber: '9876543210',
        ifscCode: 'ICIC0005678',
        accountHolderName: 'Priya Sharma',
        bankName: 'ICICI Bank'
      }
    },
    receipt: {
      id: 'r1',
      matchId: 'm1',
      utrNumber: 'UTR123456789',
      receiptUrl: 'https://example.com/receipt.jpg',
      uploadedAt: new Date('2024-01-15T14:20:00'),
      verified: false
    }
  },
  {
    id: 'm2',
    withdrawalId: 'w2',
    depositId: 'd2',
    amount: 15000,
    status: 'receipt_uploaded',
    adminApproved: false,
    createdAt: new Date('2024-01-14T16:45:00'),
    withdrawalUser: {
      id: 'user_789',
      name: 'Amit Patel',
      bankDetails: {
        accountNumber: '5555666677',
        ifscCode: 'SBIN0009012',
        accountHolderName: 'Amit Patel',
        bankName: 'SBI Bank'
      }
    },
    depositUser: {
      id: 'user_101',
      name: 'Kavya Singh',
      bankDetails: {
        accountNumber: '3333444455',
        ifscCode: 'AXIS0003456',
        accountHolderName: 'Kavya Singh',
        bankName: 'Axis Bank'
      }
    },
    receipt: {
      id: 'r2',
      matchId: 'm2',
      utrNumber: 'UTR987654321',
      receiptUrl: 'https://example.com/receipt2.jpg',
      uploadedAt: new Date('2024-01-14T18:30:00'),
      verified: false
    }
  }
];

const mockRecentActivity = [
  { type: 'approval', message: 'Approved match between Rajesh Kumar and Priya Sharma', time: '2 hours ago' },
  { type: 'verification', message: 'Verified receipt for UTR123456789', time: '3 hours ago' },
  { type: 'user_register', message: 'New user registered: Amit Patel', time: '5 hours ago' },
  { type: 'match_created', message: 'New match created: ₹25,000', time: '6 hours ago' },
  { type: 'withdrawal', message: 'Withdrawal request completed: ₹50,000', time: '8 hours ago' }
];

export default function AdminDashboard() {
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const filteredMatches = mockPendingMatches.filter(match => {
    if (approvalFilter === 'pending') return !match.adminApproved;
    if (approvalFilter === 'approved') return match.adminApproved;
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return '✅';
      case 'verification': return '🔍';
      case 'user_register': return '👤';
      case 'match_created': return '🔗';
      case 'withdrawal': return '💸';
      default: return '📋';
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'admin_review': return 'border-red-200 bg-red-50';
      case 'receipt_uploaded': return 'border-yellow-200 bg-yellow-50';
      case 'payment_pending': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleApproval = async (matchId: string, action: 'approve' | 'reject') => {
    // Simulate API call
    console.log(`${action} match ${matchId}`);
    
    // In a real app, this would make an API call
    // await fetch('/api/admin/approve', {
    //   method: 'POST',
    //   body: JSON.stringify({ matchId, action })
    // });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚡ Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor platform activity, approve transactions, and manage users
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <span className="text-2xl">💎</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatINRCompact(mockSummary.totalVolume)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Platform total volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINRCompact(mockSummary.totalDeposits)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All time deposits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <span className="text-2xl">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatINRCompact(mockSummary.totalWithdrawals)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All time withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockSummary.pendingMatches}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Require your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockSummary.completedTransactions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Successful transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Platform Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Success Rate</span>
                <span>94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Based on completed transactions</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>User Satisfaction</span>
                <span>96.8%</span>
              </div>
              <Progress value={96.8} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Based on user feedback</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Processing Speed</span>
                <span>87.3%</span>
              </div>
              <Progress value={87.3} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Average approval time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                ⏳ Pending Approvals
                <Badge variant="destructive">
                  {mockPendingMatches.filter(m => !m.adminApproved).length}
                </Badge>
              </CardTitle>
              
              <div className="flex gap-2">
                <Button 
                  variant={approvalFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setApprovalFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={approvalFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setApprovalFilter('pending')}
                >
                  Pending
                </Button>
                <Button 
                  variant={approvalFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setApprovalFilter('approved')}
                >
                  Approved
                </Button>
              </div>
            </div>
            <CardDescription>
              Matches requiring admin review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMatches.map((match) => (
                <div key={match.id} className={`p-4 border-2 rounded-lg ${getPriorityColor(match.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{formatINR(match.amount)}</span>
                        <Badge className={getStatusColor(match.status)}>
                          {formatStatus(match.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Match ID: {match.id}
                      </p>
                    </div>
                    
                    {!match.adminApproved && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproval(match.id, 'approve')}
                        >
                          ✅ Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleApproval(match.id, 'reject')}
                        >
                          ❌ Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Withdrawer</p>
                        <p className="text-gray-600">{match.withdrawalUser.name}</p>
                        <p className="text-gray-500">{match.withdrawalUser.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Depositor</p>
                        <p className="text-gray-600">{match.depositUser.name}</p>
                        <p className="text-gray-500">{match.depositUser.bankDetails.bankName}</p>
                      </div>
                    </div>
                    
                    {match.receipt && (
                      <div className="pt-2 border-t">
                        <p className="font-medium">Receipt Details</p>
                        <p className="text-gray-600">UTR: {match.receipt.utrNumber}</p>
                        <p className="text-gray-500">
                          Uploaded: {match.receipt.uploadedAt.toLocaleString()}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          🔍 View Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredMatches.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm">No matches require approval right now</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mockRecentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Quick Actions
          </CardTitle>
          <CardDescription>
            Common admin tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl">📋</span>
              <span className="text-sm">View All Approvals</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl">👥</span>
              <span className="text-sm">Manage Users</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl">📊</span>
              <span className="text-sm">View Analytics</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl">⚙️</span>
              <span className="text-sm">Platform Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}