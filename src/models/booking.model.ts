export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";

export interface Booking {
  studioId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
