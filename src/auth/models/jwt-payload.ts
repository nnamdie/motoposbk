export interface JwtPayload {
  sub: number; // User ID as integer
  phone: string;
  businessId: string;
  memberId: number; // Member ID as integer
  isOwner: boolean;
  iat?: number;
  exp?: number;
}
