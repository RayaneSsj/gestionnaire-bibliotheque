import { User } from '../../auth/data/auth.models';

export interface Member extends User {
  membershipNumber: string;
  membershipStartDate: string;
  membershipEndDate?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  birthDate?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
  isBlocked: boolean;
  blockReason?: string;
  notes?: string;
}