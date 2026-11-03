export interface Studio {
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  securityDeposit: number;
  capacity: number;
  image: string;
  images?: string[];
  amenities: string[];
  category: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
