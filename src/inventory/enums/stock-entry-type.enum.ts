export enum StockEntryType {
  INCOMING = 'Incoming', // New stock received
  ADJUSTMENT = 'Adjustment', // Manual adjustment (positive or negative)
  RETURN = 'Return', // Customer return
  DAMAGE = 'Damage', // Damaged stock write-off
  THEFT = 'Theft', // Stock loss due to theft
  SALE = 'Sale', // Stock reduction due to sale
  RESERVATION = 'Reservation', // Stock reserved for pre-order
  RELEASE = 'Release', // Reserved stock released back to available
}
