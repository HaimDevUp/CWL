'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAuth } from '@/contexts/AuthContext';
import UserIcon from '@/assets/icons/User.svg';
import './Header.scss';
import Image from 'next/image';
import { Loader } from './Loader';

const personalAreaLins = [
  {
    label: 'Product & Information',
    href: '/product-information',
  },
  {
    label: 'Payment & Wallet',
    href: '/payment-wallet',
  },
  {
    label: 'Invoices',
    href: '/invoices',
  },
  {
    label: 'Transactions',
    href: '/transactions',
  },
  {
    label: 'Account settings',
    href: '/account-settings',
  },
]

export const Header: React.FC = () => {
  const { general, header, getTenantAsset } = useSiteSettings();
  const { site_title, logo } = general;
  const { isAuthenticated,isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Close dropdown when route changes
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (isLoading) {
    return <Loader size="large" />;
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header--content">
          {header.elements.includes('logo') && <img src={getTenantAsset(logo)} alt={site_title} onClick={header.logo_clickable ? () => router.push('/') : undefined} className={`header--logo ${header.logo_clickable ? 'clickable' : ''}`} />}
          
          {isAuthenticated ? (
            <div className="header--user-menu">
              <button 
                ref={buttonRef}
                className="header--user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <UserIcon className="header--login-icon" />
                {user?.customer?.contact?.firstName} {user?.customer?.contact?.lastName}
              </button>
              
              {showDropdown && (
                <div ref={dropdownRef} className="header--dropdown">
                  {personalAreaLins.map((link) => (
                    <button 
                      key={link.href} 
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/personal-area/'+link.href);
                      }} 
                      className="header--dropdown-item"
                    >
                      {link.label}
                    </button>
                  ))}
                  <button onClick={handleLogout} className="header--dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="header--login" onClick={handleLogin}>
              <UserIcon className="header--login-icon" />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};