export interface Studio {
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  capacity: number;
  image: string;
  amenities: string[];
  category: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
