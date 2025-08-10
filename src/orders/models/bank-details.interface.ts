export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  amount: number;
  currency: string;
  expiryDate?: Date;
  instructions?: string;
}
