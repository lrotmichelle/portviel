export interface MarketCardData {
  id: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatar?: string;
  productPriceRaw: number;
  description: string;
  handle: string;
  followers: string;
  valueRaw: number;
  views: number;
  erCurrentRatio: number;
  erPreviousRatio: number;
  likes: string;
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
