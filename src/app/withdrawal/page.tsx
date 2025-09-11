'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatINR, validateAmount, parseINR, calculateCompletionPercentage } from '@/lib/currency';

// Mock available deposits that can match with withdrawals
const mockAvailableDeposits = [
  {
    id: 'd1',
    userId: 'user_101',
    userName: 'Priya Sharma',
    amount: 20000,
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    bankDetails: {
      accountNumber: '****5678',
      bankName: 'ICICI Bank'
    }
  },
  {
    id: 'd2',
    userId: 'user_102',
    userName: 'Rajesh Kumar',
    amount: 15000,
    status: 'pending',
    createdAt: new Date('2024-01-14'),
    bankDetails: {
      accountNumber: '****1234', 
      bankName: 'HDFC Bank'
    }
  },
  {
    id: 'd3',
    userId: 'user_103',
    userName: 'Amit Patel',
    amount: 35000,
    status: 'pending',
    createdAt: new Date('2024-01-13'),
    bankDetails: {
      accountNumber: '****9012',
      bankName: 'SBI Bank'
    }
  }
];

// Mock existing withdrawals
const mockExistingWithdrawals = [
  {
    id: 'w1',
    amount: 50000,
    remainingAmount: 30000,
    status: 'partially_matched',
    description: 'Emergency fund',
    createdAt: new Date('2024-01-10'),
    matches: [
      {
        id: 'm1',
        amount: 20000,
        depositorName: 'Priya Sharma',
        status: 'completed',
        referenceNumber: 'REF17576001234567'
      }
    ]
  },
  {
    id: 'w2', 
    amount: 75000,
    remainingAmount: 75000,
    status: 'pending',
    description: 'Business expenses',
    createdAt: new Date('2024-01-08'),
    matches: []
  }
];

export default function WithdrawalPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [formData, setFormData] = useState({
    amount: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (value: string, isEdit = false) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    if (isEdit) {
      setEditAmount(cleanValue);
    } else {
      setFormData(prev => ({ ...prev, amount: cleanValue }));
    }
    
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = (amount: string) => {
    const newErrors: Record<string, string> = {};
    
    const amountValue = parseINR(amount);
    const amountValidation = validateAmount(amountValue);
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData.amount)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate reference number
      const referenceNumber = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      alert(`Withdrawal request created successfully!\nReference: ${referenceNumber}`);
      
      setFormData({ amount: '', description: '' });
      
    } catch (error) {
      alert('Failed to create withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (withdrawalId: string) => {
    if (!validateForm(editAmount)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Withdrawal amount updated successfully!');
      setEditingId(null);
      setEditAmount('');
      
    } catch (error) {
      alert('Failed to update withdrawal amount');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (withdrawal: any) => {
    setEditingId(withdrawal.id);
    setEditAmount(withdrawal.remainingAmount.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setErrors({});
  };

  // Get deposits that can match with entered amount
  const enteredAmount = parseINR(formData.amount);
  const matchingDeposits = mockAvailableDeposits.filter(deposit => 
    !enteredAmount || deposit.amount <= enteredAmount
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💸 Withdrawal Management
        </h1>
        <p className="text-gray-600">
          Create withdrawal requests or manage existing ones. Deposits that are ≤ your withdrawal amount can match with you.
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-800">🎯 Matching Criteria:</p>
          <p className="text-sm text-blue-700">
            Deposits with amounts <strong>less than or equal to</strong> your withdrawal amount can match with you.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'create' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('create')}
          className="rounded-md"
        >
          ➕ Create New
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('manage')}
          className="rounded-md"
        >
          ✏️ Manage Existing
        </Button>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Withdrawal Request</CardTitle>
              <CardDescription>
                Enter the amount you want to withdraw
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount (min ₹100)"
                      value={formData.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`pl-8 text-lg font-semibold ${errors.amount ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {formData.amount && (
                    <p className="text-sm text-gray-600">
                      Amount: <span className="font-semibold">{formatINR(enteredAmount)}</span>
                    </p>
                  )}
                  {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Purpose (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Reason for withdrawal..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Matching Preview */}
                {enteredAmount > 0 && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Available Matches:</span>
                          <Badge variant="default" className="bg-green-500 text-white">
                            {matchingDeposits.length} deposits found
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Your Withdrawal:</span>
                          <span className="font-semibold text-blue-600">
                            {formatINR(enteredAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Can be matched by:</span>
                          <span className="font-semibold text-green-600">
                            {formatINR(matchingDeposits.reduce((sum, d) => sum + d.amount, 0))}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.amount || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating Withdrawal...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💸</span>
                      Create Withdrawal Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Available Deposits */}
          <Card>
            <CardHeader>
              <CardTitle>Available Deposits for Matching</CardTitle>
              <CardDescription>
                These deposits can match with your withdrawal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enteredAmount > 0 ? (
                <div className="space-y-3">
                  {matchingDeposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="p-4 border border-green-200 bg-green-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{deposit.userName}</p>
                          <p className="text-sm text-gray-500">{deposit.bankDetails.bankName}</p>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          Can Match
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Deposit Amount:</span>
                        <span className="font-semibold text-green-600">
                          {formatINR(deposit.amount)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {matchingDeposits.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">😔</div>
                      <p className="text-gray-500">
                        No deposits available that can match this withdrawal amount right now.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💡</div>
                  <p className="text-gray-500">
                    Enter a withdrawal amount to see available matches
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Manage Existing Withdrawals */
        <div className="space-y-4">
          {mockExistingWithdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Withdrawal Request #{withdrawal.id}
                      <Badge
                        variant="secondary"
                        className={
                          withdrawal.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : withdrawal.status === 'partially_matched'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      >
                        {withdrawal.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Created on {withdrawal.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatINR(withdrawal.amount)}
                    </div>
                    {withdrawal.remainingAmount > 0 && (
                      <div className="text-sm text-yellow-600">
                        {formatINR(withdrawal.remainingAmount)} remaining
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount and Progress */}
                  <div className="space-y-4">
                    {editingId === withdrawal.id ? (
                      <div className="space-y-3">
                        <Label>Update Remaining Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            ₹
                          </span>
                          <Input
                            type="text"
                            value={editAmount}
                            onChange={(e) => handleAmountChange(e.target.value, true)}
                            className={`pl-8 text-lg font-semibold ${errors.amount ? 'border-red-500' : ''}`}
                            placeholder="Enter new amount"
                          />
                        </div>
                        {editAmount && (
                          <p className="text-sm text-gray-600">
                            New Amount: <span className="font-semibold">{formatINR(parseINR(editAmount))}</span>
                          </p>
                        )}
                        {errors.amount && (
                          <p className="text-sm text-red-500">{errors.amount}</p>
                        )}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditSubmit(withdrawal.id)}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSubmitting ? 'Updating...' : 'Update'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Amount:</span>
                            <span className="font-semibold">{formatINR(withdrawal.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Remaining:</span>
                            <span className="font-semibold text-blue-600">
                              {formatINR(withdrawal.remainingAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Completed:</span>
                            <span className="font-semibold text-green-600">
                              {formatINR(withdrawal.amount - withdrawal.remainingAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Completion Progress</span>
                            <span>
                              {calculateCompletionPercentage(withdrawal.amount, withdrawal.remainingAmount).toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={calculateCompletionPercentage(withdrawal.amount, withdrawal.remainingAmount)}
                            className="h-3"
                          />
                        </div>

                        {withdrawal.remainingAmount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(withdrawal)}
                          >
                            ✏️ Edit Amount
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Matches */}
                  <div>
                    <h4 className="font-semibold mb-3">Matched Depositors ({withdrawal.matches.length})</h4>
                    <div className="space-y-2">
                      {withdrawal.matches.length > 0 ? (
                        withdrawal.matches.map((match) => (
                          <div key={match.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{match.depositorName}</p>
                                <p className="text-sm text-gray-600">
                                  {formatINR(match.amount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Ref: {match.referenceNumber}
                                </p>
                              </div>
                              <Badge 
                                className={match.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}
                              >
                                {match.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No matches yet</p>
                          <p className="text-xs">Waiting for depositors</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ❓ How Withdrawal Matching Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-semibold mb-2">Create Request</h4>
              <p className="text-sm text-gray-600">
                Enter your withdrawal amount and description
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-semibold mb-2">Auto Matching</h4>
              <p className="text-sm text-gray-600">
                Deposits ≤ your amount automatically match
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-semibold mb-2">Admin Approval</h4>
              <p className="text-sm text-gray-600">
                Matches are reviewed and approved by admin
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">4️⃣</div>
              <h4 className="font-semibold mb-2">Receive Payment</h4>
              <p className="text-sm text-gray-600">
                Depositors transfer money to your account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}