/**
 * Toast notification utilities for consistent messaging across the app
 */

import { toast, ToastOptions } from 'react-toastify';

// Default toast options
const defaultOptions: ToastOptions = {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
};

// Success toast
export const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
};

// Error toast
export const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
};

// Info toast
export const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
};

// Warning toast
export const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
};

// Loading toast (returns toast ID for manual dismiss)
export const showLoading = (message: string = 'Loading...') => {
    return toast.loading(message, defaultOptions);
};

// Update existing toast (useful for loading -> success/error)
export const updateToast = (toastId: string | number, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    toast.update(toastId, { 
        render: message, 
        type, 
        isLoading: false,
        ...defaultOptions 
    });
};

// Dismiss toast
export const dismissToast = (toastId?: string | number) => {
    if (toastId) {
        toast.dismiss(toastId);
    } else {
        toast.dismiss();
    }
};

// Common application messages
export const toastMessages = {
    // Download messages
    downloadStart: (fileType: string) => showInfo(`Starting ${fileType} download...`),
    downloadSuccess: (fileName: string) => showSuccess(`${fileName} downloaded successfully!`),
    downloadError: (fileType: string) => showError(`${fileType} download failed. Please try again.`),
    
    // Export messages
    exportStart: (dataType: string) => showInfo(`Starting ${dataType} export...`),
    exportSuccess: (dataType: string) => showSuccess(`${dataType} exported successfully!`),
    exportError: (dataType: string) => showError(`${dataType} export failed. Please try again.`),
    
    // Authentication messages
    loginSuccess: () => showSuccess('Welcome! You are now logged in.'),
    loginError: () => showError('Login failed. Please check your credentials.'),
    logoutSuccess: () => showSuccess('You have been logged out successfully.'),
    
    // Generic messages
    actionSuccess: (action: string) => showSuccess(`${action} completed successfully!`),
    actionError: (action: string) => showError(`${action}`),
    
    // Network messages
    networkError: () => showError('Network error. Please check your connection and try again.'),
    serverError: () => showError('Server error. Please try again later.'),
    
    // Validation messages
    invalidInput: (field: string) => showWarning(`Please enter a valid ${field}.`),
    requiredField: (field: string) => showWarning(`${field} is required.`),
}; 