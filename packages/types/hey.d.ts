import type {
  AmountInput,
  CollectOpenActionModuleType,
  RecipientDataInput
} from '@hey/lens';

export type StaffPick = {
  profileId: string;
};

export type Feature = {
  createdAt: Date;
  enabled: boolean;
  id: string;
  key: string;
  type: 'FEATURE' | 'MODE' | 'PERMISSION';
};

export type AllowedToken = {
  contractAddress: string;
  decimals: number;
  id: string;
  maxTipAmount: number;
  name: string;
  symbol: string;
};

export type MembershipNft = {
  createdAt: Date;
  dismissedOrMinted: boolean;
  id: string;
};

export type CollectModuleType = {
  amount?: AmountInput | null;
  collectLimit?: null | string;
  endsAt?: null | string;
  followerOnly?: boolean;
  recipient?: null | string;
  recipients?: RecipientDataInput[];
  referralFee?: number;
  type?:
    | CollectOpenActionModuleType.MultirecipientFeeCollectOpenActionModule
    | CollectOpenActionModuleType.SimpleCollectOpenActionModule
    | null;
};

export type PublicationViewCount = {
  id: string;
  views: number;
};

export type PollOption = {
  id: string;
  option: string;
  percentage: number;
  responses: number;
  voted: boolean;
};

export type Poll = {
  endsAt: Date;
  id: string;
  options: PollOption[];
};

export type Preferences = {
  appIcon: number;
  email: null | string;
  emailVerified: boolean;
  features: string[];
  hasDismissedOrMintedMembershipNft: boolean;
  highSignalNotificationFilter: boolean;
};

export type ProfileFlags = {
  isSuspended: boolean;
};

type UniswapToken = {
  address: string;
  chainId: number;
  decimals: string;
  symbol: string;
};

export type UniswapQuote = {
  amountOut: string;
  maxSlippage: string;
  route: {
    tokenIn: UniswapToken;
    tokenOut: UniswapToken;
  };
  routeString: string;
};

export type Draft = {
  collectModule: null | string;
  content: string;
  createdAt: Date;
  id: string;
  updatedAt: Date;
};
