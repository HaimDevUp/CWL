import { format } from 'date-fns';

export const formatDateForUrl = (date: Date): string => {
  const datePart = format(date, 'yyyy-MM-dd');
  const timePart = format(date, 'h:mm a');
  return `${datePart}+${timePart}`;
};

export const parseDateFromUrl = (date: string): Date => {
  const [datePart, timePart] = date.split('+');
  return new Date(`${datePart} ${timePart}`);
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const duration = endDateObj.getTime() - startDateObj.getTime();
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
};



/**
 * Date utility functions for formatting dates
 */

/**
 * Formats a date string or Date object to "Month Day, Year" format
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string (e.g., "May 10, 2025")
 */
export function formatDate(date: string | Date | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats a date to a shorter format "MMM DD, YYYY" (e.g., "May 10, 2025")
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string
 */
export function formatDateShort(date: string | Date | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats a date to time format "HH:MM AM/PM"
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted time string
 */
export function formatTime(date: string | Date | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats a date to both date and time "Month Day, Year at HH:MM AM/PM"
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date | number, format: 'date' | 'time' | 'dateTime' = 'dateTime'): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (format === 'date') {
    return formatDate(dateObj);
  } else if (format === 'time') {
    return formatTime(dateObj);
  } else {
    return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
  }
}

/**
 * Checks if a date is in the past
 * @param date - Date string, Date object, or timestamp
 * @returns True if the date is in the past
 */
export function isPastDate(date: string | Date | number): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj < new Date();
}

/**
 * Checks if a date is today
 * @param date - Date string, Date object, or timestamp
 * @returns True if the date is today
 */
export function isToday(date: string | Date | number): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Converts a date string in MMDD format to "Month YYYY" format
 * @param dateString - Date string in MMDD format (e.g., "0527")
 * @returns Formatted date string (e.g., "May 2027")
 */
export function formatMonthYear(dateString: string): string {
  // Validate input format (should be 4 digits)
  if (!/^\d{4}$/.test(dateString)) {
    throw new Error('Date string must be in MMDD format (4 digits)');
  }
  
  const month = parseInt(dateString.substring(0, 2), 10);
  const year = parseInt(dateString.substring(2, 4), 10);
  
  // Validate month (01-12)
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 01 and 12');
  }
  
  // Convert 2-digit year to 4-digit year
  // Assuming years 00-29 are 2000s, 30-99 are 1900s
  const fullYear = year <= 29 ? 2000 + year : 1900 + year;
  
  // Create a date object for the first day of the month
  const dateObj = new Date(fullYear, month - 1, 1);
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
}
