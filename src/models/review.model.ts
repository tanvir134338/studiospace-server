import { ObjectId } from "mongodb";

export interface Review {
  _id?: ObjectId;
  studioId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
