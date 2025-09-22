import { User } from "../../auth/data";

export interface Member extends User {
  membershipDate: string;
  borrowedBooksCount: number;
}
