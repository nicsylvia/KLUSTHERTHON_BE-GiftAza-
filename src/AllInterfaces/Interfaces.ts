export interface UserDetails {
  name: string;
  companyName: string;
  username: string;
  email: string;
  image: string;
  phoneNumber: number;
  password: string;
  confirmPassword: string;
  status: string;
  TransactionHistory: {}[];
  companyGiftCards: {}[];
  PurchasedGiftCards: {}[];
  dateTime: string;
  token: string;
}

export interface BusinessDetails {
  companyName: string;
  email: string;
  logo: string;
  Balance: number;
  phoneNumber: number;
  password: string;
  confirmPassword: string;
  BusinessCode: string;
  status: string;
  TransactionHistory: {}[];
  giftCard: {}[];
  createUserProfile: {}[];
  dateTime: string;
}

export interface GiftCardDetails {
  name: string;
  BrandLogo: string;
  uniqueID: string;
  colour: string;
  moneyWorth: number;
  dateTime: string;
}

export interface HistoryDetails {
  owner: string;
  message: string;
  transactionReference: string;
  transactionType: string;
  dateTime: string;
}
