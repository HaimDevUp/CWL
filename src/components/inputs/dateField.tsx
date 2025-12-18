'use client';

import { useState, useEffect, useMemo } from 'react';
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

    // Round time to nearest 15-minute interval
    const roundTo15Minutes = (date: Date): Date => {
        const rounded = new Date(date);
        const minutes = rounded.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        
        if (roundedMinutes === 60) {
            rounded.setHours(rounded.getHours() + 1);
            rounded.setMinutes(0);
        } else {
            rounded.setMinutes(roundedMinutes);
        }
        rounded.setSeconds(0);
        rounded.setMilliseconds(0);
        
        return rounded;
    };

    useEffect(() => {
        if (defaultValue) {
            setDateValue(defaultValue);
            const roundedTime = roundTo15Minutes(defaultValue);
            setTimeValue(roundedTime);
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

    // Generate all time options in 15-minute intervals (00:00 to 23:45)
    const timeOptions = useMemo(() => {
        const options: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const hourStr = hour.toString().padStart(2, '0');
                const minuteStr = minute.toString().padStart(2, '0');
                options.push(`${hourStr}:${minuteStr}`);
            }
        }
        return options;
    }, []);

    // Format time value to HH:mm string
    const formatTimeToString = (date: Date | null): string => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Parse HH:mm string to Date
    const parseTimeString = (timeStr: string, baseDate: Date | null): Date | null => {
        if (!timeStr || !baseDate) return baseDate;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(baseDate);
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const handleTimeChange = (timeStr: string) => {
        const newTime = parseTimeString(timeStr, dateValue || new Date());
        setTimeValue(newTime);
        const combined = combineDateAndTime(dateValue, newTime);
        onChange?.(combined);
    };

    const currentTimeString = formatTimeToString(timeValue);

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
            <div className="time-picker-wrapper">
              <FaClock className="time-picker-icon" />
              <select
                className="time-picker-select"
                value={currentTimeString}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={disabled}
              >
                <option value="">Select time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
    )
}
