import { Fragment, useState } from 'react';
import './Cards.scss';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Breakdown } from '@/schemas/productsSchemas';


interface BreakdownCardProps {
    title: string;
    breakdown: Breakdown;
    isStatic?: boolean;
    onClick: () => void;
    disabled?: boolean;
        buttonText?: string;
};

export const BreakdownCard = ({ title, breakdown, isStatic = false, onClick, disabled = false, buttonText }: BreakdownCardProps) => {
    const totalIsCredit = breakdown.total.excVat < 0 ? 'credit' : '';

    return (
        <div className="breakdown-card-container">
            <div className={`breakdown-card ${isStatic ? 'static' : ''}`}>
                <div className="breakdown-card--title">{title}</div>
                <div className="breakdown-card--breakdown">
                    {breakdown.items.map((item, index) => {
                        const isCredit = item.price.excVat < 0 ? 'credit' : '';
                        return (
                            <Fragment key={index} >
                                <span className={isCredit}>{item.name}</span>
                                <span className={`breakdown-card--breakdown-amount ${isCredit}`}>${item.price.excVat.toFixed(2)}</span>
                            </Fragment>
                        );
                    })}
                    {breakdown.options.showTax && (
                        <>
                            <span >Tax</span>
                            <span className={`breakdown-card--breakdown-amount`}>${breakdown.tax.toFixed(2)}</span>
                        </>
                    )}
                </div>
                <div className="breakdown-card--total">
                    <Fragment>
                        <span className={totalIsCredit}>Total Cost</span>
                        <span className={`breakdown-card--total-amount ${totalIsCredit}`}>${breakdown.total.incVat.toFixed(2)}</span>
                    </Fragment>
                </div>
                <button 
                    className="btn-primary fw" 
                    onClick={onClick}
                    disabled={disabled}
                >
                    {buttonText || 'Continue to My Details'}
                </button>
            </div>
        </div>
    );
}