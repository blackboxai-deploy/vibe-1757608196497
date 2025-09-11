'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR, getStatusColor, formatStatus } from '@/lib/currency';

// Mock pending approvals data
const mockPendingApprovals = [
  {
    id: 'm1',
    referenceNumber: 'REF17576060123456',
    withdrawalId: 'w1',
    depositId: 'd1',
    amount: 25000,
    status: 'admin_review',
    priority: 'high',
    riskScore: 'low',
    createdAt: new Date('2024-01-15T10:30:00'),
    withdrawalUser: {
      id: 'user_123',
      name: 'Rajesh Kumar',
      kycStatus: 'verified',
      transactionCount: 15,
      successRate: 96.8,
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
      kycStatus: 'verified',
      transactionCount: 8,
      successRate: 100,
      bankDetails: {
        accountNumber: '9876543210',
        ifscCode: 'ICIC0005678',
        accountHolderName: 'Priya Sharma',
        bankName: 'ICICI Bank'
      }
    },
    receipt: {
      id: 'r1',
      utrNumber: 'UTR123456789',
      receiptUrl: 'https://placehold.co/400x300?text=Bank+Transfer+Receipt',
      uploadedAt: new Date('2024-01-15T14:20:00'),
      verified: false
    }
  },
  {
    id: 'm2',
    referenceNumber: 'REF17576060654321',
    withdrawalId: 'w2',
    depositId: 'd2',
    amount: 15000,
    status: 'receipt_uploaded',
    priority: 'medium',
    riskScore: 'medium',
    createdAt: new Date('2024-01-14T16:45:00'),
    withdrawalUser: {
      id: 'user_789',
      name: 'Amit Patel',
      kycStatus: 'verified',
      transactionCount: 3,
      successRate: 100,
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
      kycStatus: 'pending',
      transactionCount: 1,
      successRate: 0,
      bankDetails: {
        accountNumber: '3333444455',
        ifscCode: 'AXIS0003456',
        accountHolderName: 'Kavya Singh',
        bankName: 'Axis Bank'
      }
    },
    receipt: {
      id: 'r2',
      utrNumber: 'UTR987654321',
      receiptUrl: 'https://placehold.co/400x300?text=Payment+Receipt+Photo',
      uploadedAt: new Date('2024-01-14T18:30:00'),
      verified: false
    }
  },
  {
    id: 'm3',
    referenceNumber: 'REF17576060789123',
    withdrawalId: 'w3',
    depositId: 'd3',
    amount: 8000,
    status: 'payment_confirmed',
    priority: 'low',
    riskScore: 'low',
    createdAt: new Date('2024-01-13T09:15:00'),
    withdrawalUser: {
      id: 'user_202',
      name: 'Suresh Reddy',
      kycStatus: 'verified',
      transactionCount: 12,
      successRate: 98.5,
      bankDetails: {
        accountNumber: '7777888899',
        ifscCode: 'KOTAK001234',
        accountHolderName: 'Suresh Reddy',
        bankName: 'Kotak Bank'
      }
    },
    depositUser: {
      id: 'user_303',
      name: 'Meena Gupta',
      kycStatus: 'verified',
      transactionCount: 6,
      successRate: 95.0,
      bankDetails: {
        accountNumber: '1111222233',
        ifscCode: 'IDBI0004567',
        accountHolderName: 'Meena Gupta',
        bankName: 'IDBI Bank'
      }
    },
    receipt: {
      id: 'r3',
      utrNumber: 'UTR456789123',
      receiptUrl: 'https://placehold.co/400x300?text=Digital+Payment+Screenshot',
      uploadedAt: new Date('2024-01-13T15:45:00'),
      verified: true
    }
  }
];

export default function ApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'high_priority' | 'low_risk'>('all');


  const filteredApprovals = mockPendingApprovals.filter(match => {
    switch (filterStatus) {
      case 'pending': return match.status === 'admin_review';
      case 'high_priority': return match.priority === 'high';
      case 'low_risk': return match.riskScore === 'low';
      default: return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleApproval = async (matchId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      alert(`Match ${matchId} has been ${actionText} successfully!`);
      
      // In a real app, this would update the UI by removing the approved/rejected item
      
    } catch (error) {
      alert(`Failed to ${action} the match`);
    }
  };

  const viewReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✅ Transaction Approvals
        </h1>
        <p className="text-gray-600">
          Review and approve or reject matched transactions between users
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{mockPendingApprovals.filter(m => m.status === 'admin_review').length}</div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{mockPendingApprovals.filter(m => m.priority === 'high').length}</div>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockPendingApprovals.filter(m => m.riskScore === 'low').length}</div>
              <p className="text-sm text-gray-600">Low Risk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatINR(mockPendingApprovals.reduce((sum, m) => sum + m.amount, 0))}</div>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: mockPendingApprovals.length },
              { key: 'pending', label: 'Pending Review', count: mockPendingApprovals.filter(m => m.status === 'admin_review').length },
              { key: 'high_priority', label: 'High Priority', count: mockPendingApprovals.filter(m => m.priority === 'high').length },
              { key: 'low_risk', label: 'Low Risk', count: mockPendingApprovals.filter(m => m.riskScore === 'low').length }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={filterStatus === filter.key ? 'default' : 'outline'}
                onClick={() => setFilterStatus(filter.key as any)}
                className="flex items-center gap-2"
              >
                {filter.label}
                <Badge variant="secondary">{filter.count}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((match) => (
          <Card key={match.id} className={`border-2 ${getPriorityColor(match.priority)}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{formatINR(match.amount)}</span>
                    <Badge className={getStatusColor(match.status)}>
                      {formatStatus(match.status)}
                    </Badge>
                    <Badge variant="outline" className={getRiskColor(match.riskScore)}>
                      {match.riskScore.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Match ID: {match.id} • Reference: {match.referenceNumber}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={match.priority === 'high' ? 'destructive' : match.priority === 'medium' ? 'default' : 'secondary'}>
                    {match.priority.toUpperCase()} PRIORITY
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Withdrawer */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">💸 Withdrawer</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {match.withdrawalUser.name}</p>
                        <p><strong>Bank:</strong> {match.withdrawalUser.bankDetails.bankName}</p>
                        <p><strong>Account:</strong> {match.withdrawalUser.bankDetails.accountNumber}</p>
                        <p><strong>IFSC:</strong> {match.withdrawalUser.bankDetails.ifscCode}</p>
                        <p><strong>KYC:</strong> 
                          <Badge variant={match.withdrawalUser.kycStatus === 'verified' ? 'default' : 'secondary'} className="ml-1">
                            {match.withdrawalUser.kycStatus}
                          </Badge>
                        </p>
                        <p><strong>Success Rate:</strong> {match.withdrawalUser.successRate}%</p>
                      </div>
                    </div>

                    {/* Depositor */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">💰 Depositor</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {match.depositUser.name}</p>
                        <p><strong>Bank:</strong> {match.depositUser.bankDetails.bankName}</p>
                        <p><strong>Account:</strong> {match.depositUser.bankDetails.accountNumber}</p>
                        <p><strong>IFSC:</strong> {match.depositUser.bankDetails.ifscCode}</p>
                        <p><strong>KYC:</strong> 
                          <Badge variant={match.depositUser.kycStatus === 'verified' ? 'default' : 'secondary'} className="ml-1">
                            {match.depositUser.kycStatus}
                          </Badge>
                        </p>
                        <p><strong>Success Rate:</strong> {match.depositUser.successRate || 'New User'}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt and Actions */}
                <div className="space-y-4">
                  {/* Receipt Details */}
                  {match.receipt && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">🧾 Receipt Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>UTR Number:</strong> <span className="font-mono">{match.receipt.utrNumber}</span></p>
                        <p><strong>Uploaded:</strong> {match.receipt.uploadedAt.toLocaleString()}</p>
                        <p><strong>Verified:</strong> 
                          <Badge variant={match.receipt.verified ? 'default' : 'secondary'} className="ml-1">
                            {match.receipt.verified ? 'Yes' : 'Pending'}
                          </Badge>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewReceipt(match.receipt!.receiptUrl)}
                          className="w-full mt-2"
                        >
                          🔍 View Receipt
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleApproval(match.id, 'approve')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      ✅ Approve Transaction
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):');
                        handleApproval(match.id, 'reject', reason || undefined);
                      }}
                      className="w-full"
                    >
                      ❌ Reject Transaction
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        📞 Contact Users
                      </Button>
                      <Button variant="outline" className="flex-1">
                        🔍 View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredApprovals.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No transactions require approval with the current filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}