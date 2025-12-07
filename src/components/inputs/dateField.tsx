'use client';

import { useState, useEffect } from 'react';
import EntryIcon from '@/assets/icons/EntryIcon.svg';
import ExitIcon from '@/assets/icons/ExitIcon.svg';
import { FaClock } from 'react-icons/fa';
import { DatePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';



export const DateField = ({ 
  icon, 
  label, 
  shouldDisableDate, 
  defaultValue,
  onChange,
  disabled = false
}: { 
  icon: string, 
  label: string, 
  shouldDisableDate?: (date: Date) => boolean, 
  defaultValue?: Date,
  onChange?: (date: Date | null) => void,
  disabled?: boolean
}) => {
    const [dateValue, setDateValue] = useState<Date | null>(defaultValue || null);
    const [timeValue, setTimeValue] = useState<Date | null>(defaultValue || null);

    useEffect(() => {
        if (defaultValue) {
            setDateValue(defaultValue);
            setTimeValue(defaultValue);
        }
    }, [defaultValue]);

    const combineDateAndTime = (date: Date | null, time: Date | null): Date | null => {
        if (!date || !time) return date || null;
        const combined = new Date(date);
        combined.setHours(time.getHours());
        combined.setMinutes(time.getMinutes());
        combined.setSeconds(time.getSeconds());
        return combined;
    };

    const handleDateChange = (value: Date | null) => {
        setDateValue(value);
        const combined = combineDateAndTime(value, timeValue);
        onChange?.(combined);
    };

    const handleTimeChange = (value: Date | null) => {
        setTimeValue(value);
        const combined = combineDateAndTime(dateValue, value);
        onChange?.(combined);
    };

    return (
        <div className="date-picker-wrapper">
          <label>{icon === 'entry' ? <EntryIcon /> : <ExitIcon />} {label}</label>
          <div className="date-picker-container">
            <DatePicker 
              size="lg" 
              format="MM/dd/yyyy" 
              placement="topStart" 
              value={dateValue}
              onChange={handleDateChange}
              shouldDisableDate={shouldDisableDate} 
              disabled={disabled}
            />
            <DatePicker 
              size="lg" 
              format="HH:mm aa" 
              placement="topStart" 
              caretAs={FaClock} 
              value={timeValue}
              onChange={handleTimeChange}
              disabled={disabled}
            />
          </div>
        </div>
    )
}
