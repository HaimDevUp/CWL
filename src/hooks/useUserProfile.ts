import { useAuth } from '@/contexts/AuthContext';
import { getStatements, downloadStatement, getTransactions, downloadTransactions } from '@/api/user';
import { ProfileResponse, Customer, Order } from '@/schemas/profileSchemas';

export function useUserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Helper functions to access user data
  const getCustomer = (): Customer | null => {
    return user?.customer || null;
  };

  const getOrders = (): Order[] => {
    return user?.orders || [];
  };

  const getContactInfo = () => {
    return {contact: user?.customer?.contact, billingAddress: user?.customer?.billingAddress};
  };

  const getVehicles = () => {
    return user?.customer?.vehicles || [];
  };

  const getPaymentMethods = () => {
    return user?.customer?.paymentMethods || null;
  };

  const getWallet = () => {
    return user?.customer?.wallet || null;
  };

  const getInvoices = async () => {
    const invoices = await getStatements();
    return invoices;
  };

  const downloadInvoice = async (InvoiceId: string): Promise<Blob> => {
    return await downloadStatement(InvoiceId);
  };

  const getCustomerTransactions = async () => {
    const transactions = await getTransactions();
    return transactions;
  };

  const downloadCustomerTransactions = async (from?: string, to?: string): Promise<Blob> => {
    return await downloadTransactions(from, to);
  };

  const getSettings = () => {
    return user?.customer?.settings || null;
  };

  const getActiveOrders = (): Order[] => {
    return getOrders().filter(order => 
      order.result.status === 'success' && 
      new Date(order.validity.to) > new Date()
    );
  };

  const getCompletedOrders = (): Order[] => {
    return getOrders().filter(order => 
      order.result.status === 'success' && 
      new Date(order.validity.to) <= new Date()
    );
  };

  const getCancelledOrders = (): Order[] => {
    return getOrders().filter(order => order.result.status === 'canceled');
  };

  const getFailedOrders = (): Order[] => {
    return getOrders().filter(order => 
      order.result.status === 'failed' || order.result.status === 'onerror'
    );
  };

  return {
    // Auth state
    isAuthenticated,
    isLoading,
    user,
    
    // Data getters
    getCustomer,
    getOrders,
    getContactInfo,
    getVehicles,
    getPaymentMethods,
    getWallet,
    getSettings,
    getInvoices,
    downloadInvoice,
    getCustomerTransactions,
    downloadCustomerTransactions,
    // Filtered orders
    getActiveOrders,
    getCompletedOrders,
    getCancelledOrders,
    getFailedOrders,
  };
}
