'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatINR, validateAmount, parseINR } from '@/lib/currency';
import { toast } from 'sonner';

// Mock potential withdrawal matches - showing withdrawals that deposits can match with
const mockPotentialMatches = [
  {
    id: '1',
    userId: 'user_123',
    userName: 'Rajesh Kumar',
    type: 'withdrawal',
    totalAmount: 50000,
    remainingAmount: 50000,
    bankDetails: {
      accountNumber: '****1234',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234'
    },
    createdAt: new Date('2024-01-15'),
    description: 'Emergency fund withdrawal',
    canMatch: true,
    referenceNumber: 'REF17575901234567'
  },
  {
    id: '2', 
    userId: 'user_456',
    userName: 'Priya Sharma',
    type: 'withdrawal',
    totalAmount: 25000,
    remainingAmount: 15000, // Partially matched already
    bankDetails: {
      accountNumber: '****5678',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0005678'
    },
    createdAt: new Date('2024-01-14'),
    description: 'Business expenses',
    canMatch: true,
    referenceNumber: 'REF17575901234568'
  },
  {
    id: '3',
    userId: 'user_789',
    userName: 'Amit Patel',
    type: 'withdrawal',
    totalAmount: 75000,
    remainingAmount: 75000,
    bankDetails: {
      accountNumber: '****9012',
      bankName: 'SBI Bank',
      ifscCode: 'SBIN0009012'
    },
    createdAt: new Date('2024-01-13'),
    description: 'Investment withdrawal',
    canMatch: true,
    referenceNumber: 'REF17575901234569'
  }
];

// Function to check if deposit amount can match with withdrawal
const canMatchWithWithdrawal = (depositAmount: number, withdrawalRemainingAmount: number): boolean => {
  return depositAmount <= withdrawalRemainingAmount;
};

// Function to get match status
const getMatchStatus = (depositAmount: number, withdrawalRemainingAmount: number): string => {
  if (depositAmount === withdrawalRemainingAmount) {
    return 'Perfect Match';
  } else if (depositAmount < withdrawalRemainingAmount) {
    return 'Partial Match';
  } else {
    return 'Cannot Match';
  }
};

// Function to generate reference number
const generateReferenceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REF${timestamp}${random}`;
};

export default function DepositPage() {
  const [formData, setFormData] = useState({
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, amount: cleanValue }));
    
    // Clear amount error when user types
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate amount
    const amount = parseINR(formData.amount);
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const referenceNumber = generateReferenceNumber();
      toast.success(`Deposit request created successfully! Reference: ${referenceNumber}`);
      
      // Reset form
      setFormData({ amount: '', description: '' });
      setSelectedMatch(null);
      
    } catch (error) {
      toast.error('Failed to create deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMatchSelect = (matchId: string) => {
    const newSelection = selectedMatch === matchId ? null : matchId;
    setSelectedMatch(newSelection);
    
    if (newSelection) {
      const match = mockPotentialMatches.find(m => m.id === matchId);
      if (match) {
        toast.success(`Selected withdrawal by ${match.userName} - Reference: ${match.referenceNumber}`);
      }
    }
  };

  const selectedMatchData = selectedMatch ? mockPotentialMatches.find(m => m.id === selectedMatch) : null;
  const enteredAmount = parseINR(formData.amount);

  // Filter matches based on matching criteria: deposit amount <= withdrawal remaining amount
  const validMatches = mockPotentialMatches.filter(match => 
    !enteredAmount || canMatchWithWithdrawal(enteredAmount, match.remainingAmount)
  );

  const invalidMatches = mockPotentialMatches.filter(match => 
    enteredAmount && !canMatchWithWithdrawal(enteredAmount, match.remainingAmount)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💰 Create Deposit Request
        </h1>
        <p className="text-gray-600">
          Create a deposit request and get matched with users who want to withdraw money. 
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-800">🎯 Matching Criteria:</p>
          <p className="text-sm text-blue-700">
            Your deposit amount must be <strong>less than or equal to</strong> the withdrawal remaining amount to match.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit Details</CardTitle>
            <CardDescription>
              Enter the amount you want to deposit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount *</Label>
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a note about your deposit..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Selected Match Info */}
              {selectedMatchData && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-green-800">✅ Selected Match:</p>
                      <div className="bg-white p-3 rounded-lg border">
                        <p><strong>Withdrawer:</strong> {selectedMatchData.userName}</p>
                        <p><strong>Reference:</strong> {selectedMatchData.referenceNumber}</p>
                        <p><strong>Bank:</strong> {selectedMatchData.bankDetails.bankName}</p>
                        <p><strong>Account:</strong> {selectedMatchData.bankDetails.accountNumber}</p>
                        <p><strong>IFSC:</strong> {selectedMatchData.bankDetails.ifscCode}</p>
                        <p><strong>Amount Available:</strong> {formatINR(selectedMatchData.remainingAmount)}</p>
                        {enteredAmount && (
                          <p><strong>Match Status:</strong> 
                            <Badge className="ml-2 bg-green-500 text-white">
                              {getMatchStatus(enteredAmount, selectedMatchData.remainingAmount)}
                            </Badge>
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Matching Summary */}
              {enteredAmount > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-blue-800">🎯 Matching Summary:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>Your Deposit: <strong>{formatINR(enteredAmount)}</strong></p>
                          <p className="text-green-600">✅ Can Match: <strong>{validMatches.length}</strong></p>
                        </div>
                        <div>
                          <p className="text-red-600">❌ Cannot Match: <strong>{invalidMatches.length}</strong></p>
                          <p className="text-xs text-gray-600">(Amount too high)</p>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating Deposit Request...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💰</span>
                    Create Deposit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Available Withdrawal Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Available Withdrawal Requests
            </CardTitle>
            <CardDescription>
              Select a withdrawal request to match with your deposit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Valid Matches */}
              {validMatches.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700">✅ Can Match ({validMatches.length})</h4>
                  {validMatches.map((match) => {
                    const isSelected = selectedMatch === match.id;
                    const matchStatus = enteredAmount ? getMatchStatus(enteredAmount, match.remainingAmount) : 'Enter amount';
                    
                    return (
                      <div
                        key={match.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                        onClick={() => handleMatchSelect(match.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{match.userName}</p>
                            <p className="text-sm text-gray-500">{match.bankDetails.bankName}</p>
                            <p className="text-xs text-gray-400">Ref: {match.referenceNumber}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="bg-green-500 text-white">
                              {matchStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Withdrawal:</span>
                            <span className="font-semibold">{formatINR(match.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Available Now:</span>
                            <span className="font-semibold text-green-600">
                              {formatINR(match.remainingAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account:</span>
                            <span className="text-sm">{match.bankDetails.accountNumber}</span>
                          </div>
                          {match.description && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Purpose:</span>
                              <span className="text-sm">{match.description}</span>
                            </div>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                            ✅ Selected for matching - Reference: {match.referenceNumber}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Invalid Matches */}
              {invalidMatches.length > 0 && enteredAmount > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700">❌ Cannot Match ({invalidMatches.length})</h4>
                  {invalidMatches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 border-2 border-red-200 bg-red-50 rounded-lg opacity-75"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-700">{match.userName}</p>
                          <p className="text-sm text-gray-500">{match.bankDetails.bankName}</p>
                        </div>
                        <Badge variant="destructive">
                          Amount Too High
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-semibold text-red-600">
                            {formatINR(match.remainingAmount)}
                          </span>
                        </div>
                        <div className="text-xs text-red-600">
                          Your deposit ({formatINR(enteredAmount)}) exceeds available amount
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {mockPotentialMatches.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">🔍</p>
                  <p>No withdrawal requests available</p>
                  <p className="text-sm">Check back later for new matches</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ❓ How Deposit Matching Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">1️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">Enter Amount</h4>
              <p className="text-sm text-gray-600">Enter deposit amount (must be ≤ withdrawal amount)</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">2️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">Auto Match</h4>
              <p className="text-sm text-gray-600">System finds valid withdrawals you can match with</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">3️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">Get Details</h4>
              <p className="text-sm text-gray-600">Receive withdrawer's bank details & reference number</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">4️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">Transfer & Confirm</h4>
              <p className="text-sm text-gray-600">Transfer money and submit receipt with UTR</p>
            </div>
          </div>
          
          {/* Matching Rules */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">🎯 Matching Rules:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Your deposit amount must be <strong>≤ withdrawal remaining amount</strong></li>
              <li>• Perfect Match: Deposit amount = Withdrawal remaining amount</li>
              <li>• Partial Match: Deposit amount &lt; Withdrawal remaining amount</li>
              <li>• Each match gets a unique reference number for tracking</li>
              <li>• Admin approval required before money transfer</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}