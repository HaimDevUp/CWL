'use client';

import React, { Fragment } from 'react';
import { usePopup } from '@/contexts/PopupContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/UI/Loader';
import { ErrorPopUp } from '@/components/UI/popup/ErrorPopUp';
import { initPurchaseCard } from '@/api/products';
import { checkHppStatus } from '@/api/user';
import type { PurchaseData } from '@/schemas/productsSchemas';
import { CreditCard } from '@/components/Cards/CreditCard';

export type PaymentSelection =
  | { type: 'newCard'; sid: string }
  | { type: 'existingCard'; token: string };

interface PaymentPopUpProps {
  purchaseData: PurchaseData;
  onSelect: (selection: PaymentSelection) => void;
}

export const PaymentPopUp: React.FC<PaymentPopUpProps> = ({ onSelect }) => {
  const { open, close } = usePopup();
  const { getPaymentMethods } = useUserProfile();
  const { isAuthenticated } = useAuth();

  const paymentMethods = getPaymentMethods();
  const [mode, setMode] = React.useState<'new' | 'existing'>(() => {
    const hasCards =
      !!paymentMethods && Array.isArray(paymentMethods.cards) && paymentMethods.cards.length > 0;
    return hasCards && isAuthenticated ? 'existing' : 'new';
  });
  const [selectedToken, setSelectedToken] = React.useState<string | null>(null);

  const [initUrl, setInitUrl] = React.useState<string | null>(null);
  const [loadingInit, setLoadingInit] = React.useState<boolean>(false);
  const pollTimerRef = React.useRef<number | null>(null);

  const clearPoll = React.useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (mode !== 'new') {
      clearPoll();
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        setLoadingInit(true);
        const init = await initPurchaseCard();
        if (cancelled) return;
        setInitUrl(init.url);
        setLoadingInit(false);

        pollTimerRef.current = window.setInterval(async () => {
          try {
            const status = await checkHppStatus(init.sid);
            const normalized = String(status.status).toLowerCase();
            const isPending =
              normalized === 'pending' ||
              normalized === 'in_progress' ||
              normalized === 'processing';
            if (isPending) return;

            clearPoll();
            onSelect({ type: 'newCard', sid: init.sid });
            close();
          } catch (err) {
            clearPoll();
            open(
              ErrorPopUp('Error', <>{String(err)}</>, close),
              { maxWidth: 400 }
            );
          }
        }, 2000);
      } catch (err) {
        if (cancelled) return;
        clearPoll();
        open(
          ErrorPopUp('Error', <>{String(err)}</>, close),
          { maxWidth: 400 }
        );
      }
    };

    start();

    return () => {
      cancelled = true;
      clearPoll();
    };
  }, [mode, clearPoll, onSelect, open, close]);

  const hasExistingCards =
    !!paymentMethods && Array.isArray(paymentMethods.cards) && paymentMethods.cards.length > 0;

  const handleExistingContinue = () => {
    if (!selectedToken) return;
    onSelect({ type: 'existingCard', token: selectedToken });
    close();
  };

  return (
    <div className="payment-pop-up">
      <h4>Payment</h4>
      {mode === 'new' && (
        <Fragment>
          {hasExistingCards && <button
            type="button"
            className="btn-download"
            onClick={() => setMode('existing')}
          >
            Use existing card
          </button>}
          <div className="payment-pop-up--content">
            {loadingInit && (
              <div className="iframe-container">
                <Loader fullScreen={false} />
              </div>
            )}
            {!loadingInit && initUrl && (
              <div className="iframe-container">
                <iframe src={initUrl} />
              </div>
            )}
          </div>
        </Fragment>
      )}

      {mode === 'existing' && hasExistingCards && (
        <Fragment>
          <div className="payment-pop-up--content">
            <div className="payment-pop-up--card-list">
              {paymentMethods!.cards.map(card => (
                <label
                  key={card.token}
                >
                  <input
                    type="radio"
                    name="payment-card"
                    value={card.token}
                    checked={selectedToken === card.token}
                    onChange={() => setSelectedToken(card.token)}
                  />
                  <CreditCard
                    card={card}
                    isDefault={selectedToken === card.token}
                  />
                </label>
              ))}
            </div>

          </div>
          <button
            type="button"
            className="btn-download"
            onClick={() => setMode('new')}
          >
            Use another card
          </button>
          <div className="payment-pop-up-footer">
            <button
              type="button"
              className="btn-primary fw"
              onClick={handleExistingContinue}
              disabled={!selectedToken}
            >
              Continue
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
};


