export type OrderStatus = 'pending' | 'accepted' | 'countered' | 'declined' | 'completed' | 'passed' | 'timed-out';
export type OfferType = 'accept' | 'counter';
export type OfferStatus = 'sent' | 'received' | 'accepted' | 'rejected' | 'declined' | 'completed' | 'passed' | 'timed-out';

export interface Order {
  id: string;
  type: 'buy' | 'counter';
  cardId?: string;
  buyerId?: string;
  buyerName: string;
  sellerName?: string;
  productPriceRaw: number;
  offeredPrice?: number;
  description?: string;
  handle?: string;
  hashtags?: string[];
  status: OrderStatus;
  createdAt: string;
  followers?: number;
  likes?: number;
  erCurrentRatio?: number;
  erPreviousRatio?: number;
  vlCurrentRatio?: number;
  vlPreviousRatio?: number;
  value?: number;
}

export interface Offer {
  id: string;
  orderId: string;
  type: OfferType;
  responsePrice?: number;
  createdAt: string;
  status: OfferStatus;
  fromSeller: boolean;
  sellerName: string;
  buyerName: string;
  description?: string;
  handle?: string;
  hashtags?: string[];
  followers?: number;
  likes?: number;
  erCurrentRatio?: number;
  erPreviousRatio?: number;
  vlCurrentRatio?: number;
  vlPreviousRatio?: number;
  value?: number;
}

interface BaseCardData {
  id: string;
  sellerName: string;
  sellerUsername: string;
  description: string;
  handle: string;
  followers: number;
  likes: number;
  erCurrentRatio: number;
  erPreviousRatio: number;
  vlCurrentRatio: number;
  vlPreviousRatio: number;
  sentimentRate?: number;
}

export interface BuyerCardData extends BaseCardData {
  title: string;
  value: number;
  productPrice: number;
  buyerOriginalOffer: number;
  sellerCounterOffer: number;
  isCountered: boolean;
  customStatus?: string;
}

export interface MarketCardData extends BaseCardData {
  sellerAvatar?: string;
  productPriceRaw: number;
  valueRaw: number;
  views: number;
  sellerBuys: number;
  sellerSells: number;
  sellerStars: number;
  isAdminVerified: boolean;
  createdAt: string;
  offersCount: number;
}

export type SalesCardData = MarketCardData;
