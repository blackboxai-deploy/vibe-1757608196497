'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Mock user context - In a real app, this would come from authentication
interface User {
  id: string;
  name: string;
  role: 'user' | 'admin';
  email: string;
}

const mockUsers: User[] = [
  {
    id: 'user_123',
    name: 'John Doe',
    role: 'user',
    email: 'john@example.com'
  },
  {
    id: 'admin_001',
    name: 'Admin User',
    role: 'admin',
    email: 'admin@example.com'
  }
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // Default to regular user
  const pathname = usePathname();

  const userMenuItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/deposit', label: 'Create Deposit', icon: '💰' },
    { href: '/withdrawal', label: 'Create Withdrawal', icon: '💸' },
    { href: '/transactions', label: 'Transaction History', icon: '📋' }
  ];

  const adminMenuItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: '⚡' },
    { href: '/admin/approvals', label: 'Pending Approvals', icon: '✅' },
    { href: '/admin/users', label: 'User Management', icon: '👥' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' }
  ];

  const menuItems = currentUser.role === 'admin' ? adminMenuItems : userMenuItems;

  const switchRole = () => {
    const newUser = currentUser.role === 'user' ? mockUsers[1] : mockUsers[0];
    setCurrentUser(newUser);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Menu Button - Mobile */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
        onClick={toggleSidebar}
      >
        <span className="text-xl">☰</span>
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">P2P Platform</h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-xl">✕</span>
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-500 capitalize">
                {currentUser.role} Account
              </p>
            </div>
          </div>
          
          {/* Role Switch Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={switchRole}
            className="w-full mt-3 text-xs"
          >
            Switch to {currentUser.role === 'user' ? 'Admin' : 'User'}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)} // Close mobile menu on navigation
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {currentUser.role === 'admin' ? 'Admin Panel' : 'User Dashboard'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}