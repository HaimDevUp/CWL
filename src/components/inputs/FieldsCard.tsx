import { useEffect, useState, ReactNode } from 'react';
import './inputs.scss';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { PhoneInput } from './PhoneInput';

export interface Field {
    label: string;
    type: string;
    value: string | number | boolean;
    validation?: any;
    error?: string;
    errorLabel?: string;
    isRequired: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
    key: string;
    disabled?: boolean;
    display?: boolean;
    options?: { key: string; value: string }[]
}

interface FieldsCardProps {
    isToggled: boolean;
    title?: string;
    fields?: Field[];
    forceOpen?: boolean;
    checkboxes?: Field[];
    topup?: Field[];
    style?: boolean;
}
const TOP_UP_AMOUNTS = [10, 25, 50, 100];

export const FieldsCard = ({
    isToggled,
    title,
    fields,
    forceOpen,
    checkboxes,
    topup,
    style,
}: FieldsCardProps) => {

    const [isOpen, setIsOpen] = useState(!isToggled);

    // Auto-open if any field has an error, even if the fields array reference doesn't change
    useEffect(() => {
        if (!isOpen) {
            const hasError = Array.isArray(fields) && fields.some((f) => Boolean(f?.error));
            if (hasError) setIsOpen(true);
        }
    });

    // Respect external forceOpen signal (open immediately when it turns true)
    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true);
        }
    }, [forceOpen]);

    return (
        <div className={`fields-card ${style === false ? 'no-style' : ''}`}>
            {title && (
                <div className={`fields-card-header ${isOpen ? 'is-open' : ''}`}>
                    <h4>{title}</h4>
                    {isToggled && (
                        <ArrowIcon
                            className={`toggle-arrow ${isOpen ? 'is-open' : ''}`}
                            onClick={() => setIsOpen(!isOpen)}
                        />
                    )}
                </div>
            )}
            <div className={`fields-card-content ${isOpen ? 'is-open' : ''}`}>
                {fields?.map((field) => (
                    field.display !== false && <div className="fields-card-field" key={field.key}>
                        <span>{field.isRequired ? <span className="required">*</span> : ''} {field.label}</span>
                        {field.type === 'select' ? (
                            <select
                                value={typeof field.value === 'boolean' ? '' : String(field.value || '')}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={field.error ? 'error' : ''}
                                disabled={field.disabled}
                            >
                                <option value="">Select {field.label}</option>
                                {field.options?.map((option: { key: string; value: string }) => (
                                    <option key={option.key} value={option.key}>
                                        {option.value}
                                    </option>
                                ))}
                            </select>
                        ) : field.type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                checked={typeof field.value === 'boolean' ? field.value : false}
                                onChange={(e) => field.onChange(e.target.checked ? 'true' : 'false')}
                                className={field.error ? 'error' : ''}
                                disabled={field.disabled}
                            />
                        ) : field.type === 'tel' ? (
                            <PhoneInput value={field.value as string} disabled={field.disabled} onChange={(e) => field.onChange(e)} hasError={field.error ? true : false} />
                        )
                            : (
                                <input
                                    type={field.type}
                                    value={typeof field.value === 'boolean' ? '' : String(field.value || '')}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    placeholder={field.placeholder || ''}
                                    className={field.error ? 'error' : ''}
                                    disabled={field.disabled}
                                />
                            )}
                        {field.error && <span className="field-error">{field.error}</span>}
                    </div>
                ))}
                {checkboxes && (
                    <div className={`fields-card-checkboxes ${title ? 'has-title' : ''}`}>
                        {checkboxes?.map((field) => (
                            field.display !== false && <div className="fields-card-field" key={field.key}>
                                <label className="fields-card-field-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={typeof field.value === 'boolean' ? field.value : false}
                                        onChange={(e) => field.onChange(e.target.checked ? 'true' : 'false')}
                                        className={field.error ? 'error' : ''}
                                        disabled={field.disabled}
                                    />
                                    <span>
                                        {field.isRequired && <span className="required">*</span>}
                                        <span dangerouslySetInnerHTML={{ __html: field.label }} />
                                    </span>
                                </label>
                                {field.error && <span className="field-error">{field.error}</span>}
                            </div>
                        ))}
                    </div>)}
                {topup && (
                    <div style={{ gridColumn: 'span 2' }}>
                        {topup?.map((field) => (
                            <div className="fields-card-field" key={field.key}>
                                <span dangerouslySetInnerHTML={{ __html: field.label }} />
                                <div className="top-up-options">
                                    {TOP_UP_AMOUNTS.map((amount) => (
                                        <label key={amount} className="top-up-option">
                                            <input
                                                type="checkbox"
                                                className="top-up-amount"
                                                value={amount}
                                                checked={field.value == amount}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                key={amount}
                                            />
                                            <span>${amount}</span>
                                        </label>
                                    ))}
                                </div>
                                <div>
                                    *The top-up amount for your wallet will be used for your entrances and exits and according to the parking rates.
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};