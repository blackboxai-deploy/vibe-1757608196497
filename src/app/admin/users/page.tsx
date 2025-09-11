'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/currency';

// Mock user data
const mockUsers = [
  {
    id: 'user_001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91-9876543210',
    kycStatus: 'verified',
    role: 'user',
    joinedAt: new Date('2024-01-01'),
    totalTransactions: 15,
    totalVolume: 450000,
    successRate: 96.8,
    lastActive: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: 'user_002', 
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91-8765432109',
    kycStatus: 'verified',
    role: 'user',
    joinedAt: new Date('2024-01-05'),
    totalTransactions: 8,
    totalVolume: 120000,
    successRate: 100,
    lastActive: new Date('2024-01-14'),
    status: 'active'
  },
  {
    id: 'user_003',
    name: 'Amit Patel',
    email: 'amit@example.com', 
    phone: '+91-7654321098',
    kycStatus: 'pending',
    role: 'user',
    joinedAt: new Date('2024-01-10'),
    totalTransactions: 3,
    totalVolume: 85000,
    successRate: 100,
    lastActive: new Date('2024-01-13'),
    status: 'active'
  },
  {
    id: 'user_004',
    name: 'Kavya Singh',
    email: 'kavya@example.com',
    phone: '+91-6543210987',
    kycStatus: 'rejected',
    role: 'user', 
    joinedAt: new Date('2024-01-12'),
    totalTransactions: 1,
    totalVolume: 5000,
    successRate: 0,
    lastActive: new Date('2024-01-12'),
    status: 'suspended'
  },
  {
    id: 'sub_admin_001',
    name: 'Sub Admin User',
    email: 'subadmin@example.com',
    phone: '+91-5432109876',
    kycStatus: 'verified',
    role: 'sub_admin',
    joinedAt: new Date('2023-12-01'),
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 100,
    lastActive: new Date('2024-01-15'),
    status: 'active'
  }
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'sub_admin'>('all');
  const [filterKyc, setFilterKyc] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesKyc = filterKyc === 'all' || user.kycStatus === filterKyc;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesKyc && matchesStatus;
  });

  const getKycColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'sub_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${action} action performed on user ${userId}`);
    } catch (error) {
      alert(`Failed to perform ${action} action`);
    }
  };

  const getTotalStats = () => {
    const totalUsers = mockUsers.filter(u => u.role === 'user').length;
    const verifiedUsers = mockUsers.filter(u => u.kycStatus === 'verified').length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const subAdmins = mockUsers.filter(u => u.role === 'sub_admin').length;
    
    return { totalUsers, verifiedUsers, activeUsers, subAdmins };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 User Management
        </h1>
        <p className="text-gray-600">
          Manage platform users, KYC verification, and user roles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</div>
              <p className="text-sm text-gray-600">KYC Verified</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.activeUsers}</div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.subAdmins}</div>
              <p className="text-sm text-gray-600">Sub Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="sub_admin">Sub Admins</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">KYC Status</label>
              <select 
                value={filterKyc} 
                onChange={(e) => setFilterKyc(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    user.role === 'admin' ? 'bg-red-500' :
                    user.role === 'sub_admin' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === 'sub_admin' ? 'Sub Admin' : user.role.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">KYC Status</p>
                    <Badge className={getKycColor(user.kycStatus)}>
                      {user.kycStatus.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="font-semibold">{user.totalTransactions}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Total Volume</p>
                    <p className="font-semibold text-green-600">
                      {user.totalVolume > 0 ? formatINR(user.totalVolume) : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="font-semibold text-purple-600">{user.successRate}%</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {user.kycStatus === 'pending' && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleUserAction(user.id, 'approve_kyc')}
                    >
                      ✅ Approve KYC
                    </Button>
                  )}
                  
                  {user.status === 'active' ? (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleUserAction(user.id, 'suspend')}
                    >
                      🚫 Suspend
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleUserAction(user.id, 'activate')}
                    >
                      ✅ Activate
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUserAction(user.id, 'view_details')}
                  >
                    👁️ Details
                  </Button>
                </div>
              </div>

              {/* Additional User Details */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p><strong>User ID:</strong> {user.id}</p>
                  </div>
                  <div>
                    <p><strong>Joined:</strong> {user.joinedAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Last Active:</strong> {user.lastActive.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Role:</strong> {user.role === 'sub_admin' ? 'Sub Admin' : user.role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              ➕ Add New User
            </Button>
            <Button variant="outline">
              📊 Export User Data
            </Button>
            <Button variant="outline">
              📧 Send Bulk Email
            </Button>
            <Button variant="outline">
              🔧 Add Sub Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}