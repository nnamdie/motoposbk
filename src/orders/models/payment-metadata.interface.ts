export interface PaymentMetadata {
  invoiceId: number;
  orderId: number;
  paymentType: 'OneTime' | 'DownPayment' | 'Installment';
  installmentNumber?: number;
  expectedAmount: number;
  businessId: string;
}
