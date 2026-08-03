export interface OrderCardData {
  id: string;
  buyerName: string;
  buyerUsername?: string;
  description?: string;
  handle?: string;
  hashtags?: string[];
  followers?: number;
  value?: number;
  productPrice?: number; // original price
  buyerOffer?: number; // buyer's offer amount
  sellerCounterOffer?: number;
  isCountered?: boolean;
  customStatus?: string;
  erCurrentRatio?: number;
  erPreviousRatio?: number;
  vlCurrentRatio?: number;
  vlPreviousRatio?: number;
  likes?: number;
  sentimentRate?: number;

  // order specific
  type?: 'buy' | 'counter';
  offeredPrice?: number;
  originalPrice?: number;
  orderDescription?: string;
  status?: 'pending' | 'accepted' | 'countered' | 'declined' | 'completed' | 'passed' | 'timed-out';
  createdAt?: string;
  isInactive?: boolean;
}

export type OrderCardProps = {
  data: OrderCardData;
  onAccept: (price: number) => void;
  onCounter: (price: number) => void;
  onDecline: () => void;
  onCounterToggle: () => void;
  activeAction?: 'decline' | 'counter' | 'accept' | null;
};
