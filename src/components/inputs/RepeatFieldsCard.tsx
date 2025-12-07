import { useEffect, useState } from 'react';
import './inputs.scss';
import ArrowIcon from '@/assets/icons/arrow.svg';

interface Field {
    label: string;
    type: string;
    value: string | number;
    validation?: any;
    error?: string;
    isRequired: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
    key: string;
    disabled?: boolean;
    options?: { key: string; value: string }[]
}

interface RepeatFieldsCardProps {
    title: string;
    items: {
        fields: Field[];
        title: string;
    }[];
    itemName: string;
    initialOpenRows?: number[];
}

export const RepeatFieldsCard = ({
    title,
    items,
    itemName,
    initialOpenRows = [],
}: RepeatFieldsCardProps) => {

    const [openRows, setOpenRows] = useState<number[]>(initialOpenRows);

    useEffect(() => {
        if (initialOpenRows.length > 0) {
            setOpenRows(prev => {
                const merged = [...new Set([...prev, ...initialOpenRows])];
                return merged;
            });
        }
    }, [initialOpenRows]);

    const handleToggleRow = (index: number) => {
        setOpenRows(openRows.includes(index) ? openRows.filter((i) => i !== index) : [...openRows, index]);
    }

    console.log('openRows', openRows);

    return (
        <div className="fields-card">
            <div className="fields-card-header is-open">
                <h4>{title}</h4>
                <div>Total: {items.length}</div>
            </div>

            {items.map((item, index) => (
                <div className="fields-card-item" key={`${itemName}-${index}`}>
                    <div onClick={() => handleToggleRow(index)} className="fields-card-item-header">
                        <span className="fields-card-item-index">{index + 1}</span>
                        <h4>{itemName}: <span>{item.title}</span></h4>
                        <ArrowIcon
                            className={`toggle-arrow ${openRows.includes(index) ? 'is-open' : ''}`}
                        />
                    </div>
                    <div className={`fields-card-content ${openRows.includes(index) ? 'is-open' : ''}`}>
                        {item.fields.map((field) => (
                            <div className="fields-card-field" key={field.key}>
                                <span>{field.label} {field.isRequired ? <span className="required">*</span> : ''}</span>
                                {field.type === 'select' ? (
                                    <select
                                        value={field.value || ''}
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
                                ) : (
                                    <input
                                        type={field.type}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder={field.placeholder || ''}
                                        className={field.error ? 'error' : ''}
                                        disabled={field.disabled}
                                    />
                                )}
                                {field.error && <span className="field-error">{field.error}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};