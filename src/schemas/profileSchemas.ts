import { z } from 'zod';
import { OfferTileSchema } from './offerTileSchema';

export const LookupOptionSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// Contact information schema
export const ContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string().nullable(),
  birthday: z.string().nullable(),
  driversLicense: z.string().nullable(),
  companyId: z.number().nullable(),
  employeeNumber: z.string().nullable().optional(),
  email: z.string().email(),
  phone: z.string(),
});

// Address schema
export const AddressSchema = z.object({
  name: z.string().nullable().optional(),
  street: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postCode: z.string(),
});

// Vehicle schema
export const VehicleSchema = z.object({
  plate: z.string().nullable(),
  isDefault: z.boolean(),
  permit: z.string().nullable().optional(),
  tollTag: z.string().nullable().optional(),
  cardNumber: z.string().nullable().optional(),
});

// Card schema
export const CardSchema = z.object({
  code: z.string(),
  isDefault: z.boolean(),
});

// RF Tag schema
export const RfTagSchema = z.object({
  serial: z.string(),
  token: z.string(),
  status: z.string(),
});

// Payment method card schema
export const PaymentMethodCardSchema = z.object({
  holder: z.string(),
  type: z.string(),
  last4D: z.string(),
  expiry: z.string(),
  token: z.string(),
  isDefault: z.boolean(),
});

// Payment methods schema
export const PaymentMethodsSchema = z.object({
  cards: z.array(PaymentMethodCardSchema),
});

// Notification settings schema
export const NotificationSettingsSchema = z.object({
  subscriptions: z.array(z.string()),
  marketing: z.array(z.string()),
  system: z.array(z.string()),
});

// Settings schema
export const SettingsSchema = z.object({
  notifications: NotificationSettingsSchema,
  timeZone: z.string(),
});

// Customer schema
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  belongsTo: z.string().nullable(),
  patron: z.string().nullable(),
  contact: ContactSchema,
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema.nullable(),
  vehicles: z.array(VehicleSchema),
  cards: z.array(CardSchema),
  files: z.array(z.any()), // You can define a more specific schema for files if needed
  wallet: z.any().nullable(),
  rfTag: RfTagSchema.nullable(),
  tollTag: z.string().nullable(),
  paymentMethods: PaymentMethodsSchema,
  settings: SettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
});

// Service schema
export const ServiceSchema = z.object({
  type: z.string(),
  price: z.number(),
  discount: z.number(),
  tax: z.number().nullable(),
});

// Offer schema
export const OfferSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  spot: z.string().nullable(),
  services: z.array(z.any()),
  includedServices: z.array(ServiceSchema),
  price: z.number(),
  discount: z.number(),
  tax: z.number().nullable(),
  // Optional minimal options shape for usages that expect offer.options.showQR
  options: z
    .object({
      showQR: z.boolean().nullable().optional(),
    })
    .optional(),
});

// Validity schema
export const ValiditySchema = z.object({
  from: z.string(),
  to: z.string(),
});

// Price schema
export const PriceSchema = z.object({
  total: z.number(),
  discount: z.number(),
});

// Subscription options schema
export const SubscriptionOptionsSchema = z.object({
  isAutoRenewable: z.boolean().optional(),
});

// Options schema
export const OptionsSchema = z.object({
  subscription: SubscriptionOptionsSchema.nullable(),
});

// Result schema
export const ResultSchema = z.object({
  status: z.string(),
  details: z.string().nullable(),
  missingInfo: z.string().nullable(),
});

// Order schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  shortId: z.string(),
  externalId: z.string().nullable(),
  name: z.string(),
  customerId: z.string().uuid(),
  tags: z.array(z.string()),
  customerEvidence: z.string(),
  bookingRef: z.string(),
  contact: ContactSchema,
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema.nullable(),
  offer: OfferSchema,
  vehicles: z.array(VehicleSchema),
  cards: z.array(CardSchema),
  tollTag: z.string().nullable(),
  paymentMethod: z.object({
    card: PaymentMethodCardSchema,
    priority: z.string().nullable(),
  }),
  validity: ValiditySchema,
  price: PriceSchema,
  options: OptionsSchema,
  result: ResultSchema,
  flags: z.array(z.string()),
  files: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

// Main profile response schema
export const ProfileResponseSchema = z.object({
  customer: CustomerSchema,
  orders: z.array(OrderSchema),
});

// Transaction schema
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  offer: z.object({
    name: z.string(),
    type: z.string(),
    typeName: z.string(),
  }),
  contact: ContactSchema,
  spot: z.object({
    code: z.string(),
    name: z.string(),
  }),
  enter: z.string(),
  exit: z.string(),
  amount: z.object({
    incVat: z.number(),
    excVat: z.number(),
  }),
  vehicleNumber: z.string(),
});

export const TransactionsResponseSchema = z.array(TransactionSchema);

export const InitCardResponseSchema = z.object({
  url: z.string(),
  sid: z.string(),
});

export const HppStatusResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export const ProfileUpdateSchema = z.object({
  contact: {
    firstName: z.string(),
    lastName: z.string(),
    gender: z.string().nullable(),
    birthday: z.string().nullable(),
    driversLicense: z.string().nullable(),
    companyId: z.number().nullable(),
  },
  billingAddress: {
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postCode: z.string(),
  },
});

// Type exports
export type Contact = z.infer<typeof ContactSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type Card = z.infer<typeof CardSchema>;
export type RfTag = z.infer<typeof RfTagSchema>;
export type PaymentMethodCard = z.infer<typeof PaymentMethodCardSchema>;
export type PaymentMethods = z.infer<typeof PaymentMethodsSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type Validity = z.infer<typeof ValiditySchema>;
export type Price = z.infer<typeof PriceSchema>;
export type SubscriptionOptions = z.infer<typeof SubscriptionOptionsSchema>;
export type Options = z.infer<typeof OptionsSchema>;
export type Result = z.infer<typeof ResultSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionsResponse = z.infer<typeof TransactionsResponseSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type InitCardResponse = z.infer<typeof InitCardResponseSchema>;
export type HppStatusResponse = z.infer<typeof HppStatusResponseSchema>;