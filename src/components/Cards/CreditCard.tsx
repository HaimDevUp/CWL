import './Cards.scss';
import { PaymentMethodCard } from '@/schemas/profileSchemas';
import { cardIcons } from '@/utils/styleUtils';
import { formatMonthYear } from '@/utils/dateUtils';
import React from 'react';

interface CreditCardProps {
  card: PaymentMethodCard;
  isDefault?: boolean;
}

export const CreditCard: React.FC<CreditCardProps> = ({ card, isDefault }) => {
  return (
    <div className={`credit-card ${isDefault ? 'default' : ''}`}>
      <h5>Debit / Credit card</h5>
      <div className="credit-card--type">{cardIcons(card.type)} {card.type} {card.last4D}</div>
      <p className="credit-card--holder">{card.holder}</p>
      <p className="credit-card--expires"><span>Expires</span> {formatMonthYear(card.expiry)}</p>
    </div>
  );
};