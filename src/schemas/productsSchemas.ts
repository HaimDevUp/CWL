import { z } from 'zod';
import { AddressSchema, CardSchema, ContactSchema, OrderSchema, VehicleSchema } from './profileSchemas';
import { OfferTileSchema } from './offerTileSchema';

// Breakdown price/discount schema
const BreakdownPriceSchema = z.object({
  incVat: z.number(),
  excVat: z.number(),
});

// Breakdown item schema
const BreakdownItemSchema = z.object({
  name: z.string(),
  price: BreakdownPriceSchema,
  discount: BreakdownPriceSchema,
});

// Breakdown schema
export const BreakdownSchema = z.object({
  items: z.array(BreakdownItemSchema),
  total: BreakdownPriceSchema,
  discount: BreakdownPriceSchema,
  tax: z.number(),
  options: z.object({
    showTax: z.boolean(),
  }),
});


export const PurchaseDataSchema = z.object({
  offerId: z.string(),
  contact: ContactSchema,
  billingAddress: AddressSchema.optional(),
  shippingAddress: AddressSchema.optional(),
  vehicles: z.array(VehicleSchema),
  cards: z.array(CardSchema),
  tollTag: z.string().nullable().optional(),
  paymentMethod: z.object({
    newCard: z.object({
      sid: z.string().uuid(),
    }).optional(),
    existCard: z.object({
      token: z.string(),
    }).optional(),
  }),
  services: z.array(z.string()),
  validity: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  options: z.object({
    openAnAccount: z.boolean().nullable().optional(),
    notifications: z.boolean().optional(),
    offerTerms: z.boolean().nullable().optional(),
    generalTerms: z.boolean().nullable().optional(),
    marketingTerms: z.boolean().nullable().optional(),
    scanToPay: z.object({
      ticketToVoid: z.string(),
      ticketName: z.string(),
    }).optional(),
    wallet: z.object({
      topUpAmount: z.number(),
    }).optional(),
  }),
});

const PurchaseCredentialsSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiresIn: z.number(),
  refreshTokenExpiresIn: z.number(),
});

export const PurchaseResponseSchema = z.object({
  order: OrderSchema,
  credentials: PurchaseCredentialsSchema,
});

export const initiateFileRequestSchema = z.object({
  files: z.array(z.object({
    fileId: z.string(),
    contentType: z.string(),
  })),
});

export const initiateFilesResponseSchema = z.object({
  files: z.array(z.object({
    fileId: z.string(),
    uploadUrl: z.string(),
  })),
});

export const uploadFilesRequestSchema = z.array(z.object({
  fileId: z.string(),
  uploadUrl: z.string(),
  content: z.any(),
  contentType: z.string(),
  name: z.string(),
}));

export interface UploadResult {
  fileId: string;
  contentType: string;
  success: boolean;
  name: string;
  error?: string;
  response?: Response;
}


export type PurchaseData = z.infer<typeof PurchaseDataSchema>;
export type PurchaseResponse = z.infer<typeof PurchaseResponseSchema>;

// Type exports
export type Breakdown = z.infer<typeof BreakdownSchema>;
export type OfferTile = z.infer<typeof OfferTileSchema>;
export type initiateFileRequest = z.infer<typeof initiateFileRequestSchema>;
export type initiateFilesResponse = z.infer<typeof initiateFilesResponseSchema>;
export type uploadFilesRequest = z.infer<typeof uploadFilesRequestSchema>;

