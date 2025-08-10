export enum ReservationStatus {
  ACTIVE = 'Active', // Reservation is active
  FULFILLED = 'Fulfilled', // Stock allocated and reservation closed
  CANCELLED = 'Cancelled', // Reservation cancelled
  EXPIRED = 'Expired', // Reservation expired
}
