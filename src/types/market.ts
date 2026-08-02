export interface MarketCardData {
  id: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatar?: string;
  productPriceRaw: number;
  description: string;
  handle: string;
  followers: number;
  valueRaw: number;
  views: number;
  erCurrentRatio: number;
  erPreviousRatio: number;
  likes: number;
  vlCurrentRatio: number;
  vlPreviousRatio: number;
  sentimentRate: number;
  sellerBuys: number;
  sellerSells: number;
  sellerStars: number;
  isAdminVerified: boolean;
  createdAt: string;
  offersCount: number;
}
