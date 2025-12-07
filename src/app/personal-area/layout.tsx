'use client';

import { ReactNode, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import './personal-area.scss';
import ArrowIcon from '@/assets/icons/arrow.svg';

interface PersonalAreaLayoutProps {
    children: ReactNode;
}

export default function PersonalAreaLayout({ children }: PersonalAreaLayoutProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const isMobile = useIsMobile();

    const isActive = (href: string, exact: boolean = false) => {
        if (exact) {
            return pathname === href || pathname === `${href}/`;
        }
        return pathname?.startsWith(href);
    };

    const topNavItems = [
        { href: '/personal-area/product-information', label: 'Product & Information' },
    ];

    const PaymentItems = [
        { href: '/personal-area/payment-wallet', label: 'Payment & Wallet' },
        { href: '/personal-area/invoices', label: 'Invoices' },
        { href: '/personal-area/transactions', label: 'Transactions' },
    ];

    const isPaymentActive = useMemo(
        () => PaymentItems.some((item) => isActive(item.href)),
        [pathname]
    );

    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(isPaymentActive);

    return (
        <ProtectedRoute>
            <div className="container">
                <div className="personal-area--wrapper">
                    <aside >
                        <div className="personal-area--sidebar-header">
                            <h2>My Account</h2>
                        </div>
                        <nav className="personal-area--sidebar-nav">
                            <div className="personal-area--sidebar-username">
                                {user?.customer?.contact?.firstName} {user?.customer?.contact?.lastName}
                            </div>
                            <ul className="personal-area--sidebar-nav-list">
                                {topNavItems.map((item) => (
                                    <li className={`personal-area--sidebar-nav-item${isActive(item.href) ? ' active' : ''}`} key={item.href}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </li>
                                ))}
                                <li className={`personal-area--sidebar-nav-item ${isPaymentOpen || isMobile ? ' open' : ''}${isPaymentActive ? ' active-group' : ''}`}>
                                    <button onClick={() => setIsPaymentOpen((v) => !v)}>
                                        Payment details
                                        <ArrowIcon />
                                    </button>
                                    {(isPaymentOpen || isMobile) && (
                                        <ul className="personal-area--sidebar-nav-sublist">
                                            {PaymentItems.map((item) => (
                                                <li className={`personal-area--sidebar-nav-sublist-item${isActive(item.href) ? ' active' : ''}`} key={item.href}>
                                                    <Link href={item.href}>{item.label}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                                <li className={`personal-area--sidebar-nav-item${isActive('/personal-area/account-settings') ? ' active' : ''}`}>
                                    <Link href="/personal-area/account-settings">Account settings</Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>
                    <main className="personal-area--content">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
