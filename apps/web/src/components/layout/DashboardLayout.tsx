'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { Menu, LogOut, Settings, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  tenant: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, tenant }) => {
  const { session, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', href: `/dashboard/${tenant}`, icon: '📊' },
    { label: 'Produtos', href: `/dashboard/${tenant}/produtos`, icon: '📦' },
    { label: 'Estoque', href: `/dashboard/${tenant}/estoque`, icon: '📈' },
    { label: 'Pedidos', href: `/dashboard/${tenant}/pedidos`, icon: '🛒' },
    { label: 'Margem Real', href: `/dashboard/${tenant}/margem-real`, icon: '💰' },
    { label: 'Marketplaces', href: `/dashboard/${tenant}/marketplaces`, icon: '🌐' },
    { label: 'Reputação', href: `/dashboard/${tenant}/reputacao`, icon: '⭐' },
    { label: 'Configurações', href: `/dashboard/${tenant}/configuracoes`, icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0D1B2A] text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link href={`/dashboard/${tenant}`} className="font-bold text-xl">
            {sidebarOpen ? 'F5' : 'F'}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {sidebarOpen && session && (
            <div className="text-sm">
              <p className="font-semibold truncate">{session.user.email}</p>
              <p className="text-gray-400 text-xs">{session.user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {session?.tenant.name}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
