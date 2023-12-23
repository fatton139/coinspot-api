export type LatestPricesResponse = {
  status: "ok" | "error";
  message: string;
  prices: Record<
    string,
    {
      bid: number;
      ask: number;
      last: number;
    }
  >;
};

export type LatestCoinPricesResponse = {
  status: "ok" | "error";
  message: string;
  prices: Record<
    string,
    {
      bid: number;
      ask: number;
      last: number;
    }
  >;
};

export type LatestBuyPriceResponse = {
  status: "ok" | "error";
  message: string;
  rate: number;
  market: string;
};

export type LatestSellPriceResponse = {
  status: "ok" | "error";
  message: string;
  rate: number;
  market: string;
};

export type OpenOrdersByCoinResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
  }[];
  sellorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
  }[];
};

export type CompletedOrdersByCoinResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    solddate: string;
    market: string;
  }[];
  sellorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    solddate: string;
    market: string;
  }[];
};

export type FullAccessStatusCheckResponse = {
  status: "ok" | "error";
};

export type MyCoinDepositAddressResponse = {
  status: "ok" | "error";
  message: string;
  networks: {
    name: string;
    network: string;
    address: string;
    memo: string;
  }[];
};

export type BuyNowQuoteResponse = {
  status: "ok" | "error";
  message: string;
  rate: number;
};

export type SellNowQuoteResponse = {
  status: "ok" | "error";
  message: string;
  rate: number;
};

export type SwapNowQuoteResponse = {
  status: "ok" | "error";
  message: string;
  rate: number;
};

export type PlaceMarketBuyOrderResponse = {
  status: "ok" | "error";
  message: string;
  coin: string;
  market: string;
  amount: number;
  rate: number;
  id: string;
};

export type PlaceBuyNowOrderResponse = {
  status: "ok" | "error";
  message: string;
  coin: string;
  amount: number;
  market: string;
  total: number;
};

export type PlaceMarketSellOrderResponse = {
  status: "ok" | "error";
  message: string;
  coin: string;
  market: string;
  amount: number;
  rate: number;
  id: string;
};

export type PlaceSellNowOrderResponse = {
  status: "ok" | "error";
  message: string;
  coin: string;
  amount: number;
  market: string;
  total: number;
};

export type PlaceSwapNowOrder = {
  status: "ok" | "error";
  message: string;
  coin: string;
  amount: number;
  market: string;
  total: number;
};

export type CancelByBuyOrderResponse = {
  status: "ok" | "error";
  message: string;
};

export type CancelBySellOrderResponse = {
  status: "ok" | "error";
  message: string;
};

export type GetCoinWithdrawalDetailsResponse = {
  status: "ok" | "error";
  message: string;
  networks: {
    network: string;
    paymentid: string;
    fee: number;
    minsend: number;
    default: boolean;
  }[];
};

export type CoinWithdrawalResponse = {
  status: "ok" | "error";
  message: string;
};

export type ReadonlyStatusCheckResponse = {
  status: "ok" | "error";
};

export type OpenMarketOrdersResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
  }[];
  sellorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
  }[];
};

export type CompletedMarketOrdersResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
    solddate: string;
  }[];
  sellorders: {
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
    solddate: string;
  }[];
};

export type MyCoinBalancesResponse = {
  status: "ok" | "error";
  message: string;
  balances: Record<
    string,
    {
      balance: number;
      audbalance: number;
      rate: number;
    }
  >[];
};

export type MyCoinBalanceResponse<TAvailable extends boolean> = {
  status: "ok" | "error";
  message: string;
  balance: Record<
    string,
    TAvailable extends true
      ? {
          balance: number;
          available: number;
          audbalance: number;
          rate: number;
        }
      : {
          balance: number;

          audbalance: number;
          rate: number;
        }
  >;
};

export type MyOpenMarketOrdersResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    id: string;
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
    created: string;
  }[];
  sellorders: {
    id: string;
    amount: number;
    rate: number;
    total: number;
    coin: string;
    market: string;
    created: string;
  }[];
};

export type MyOpenLimitOrdersResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    id: string;
    amount: number;
    rate: number;
    coin: string;
    market: string;
    created: string;
    type: "buy stop" | "buy limit";
  }[];
  sellorders: {
    id: string;
    amount: number;
    rate: number;
    coin: string;
    market: string;
    created: string;
    type: "stop loss" | "take profit";
  }[];
};

export type MyOrderHistoryResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    coin: string;
    type: string;
    market: string;
    rate: number;
    amount: number;
    total: number;
    solddate: string;
    audfeeExGst: number;
    audGst: number;
    audtotal: number;
    otc?: boolean;
  }[];
  sellorders: {
    coin: string;
    type: string;
    market: string;
    rate: number;
    amount: number;
    total: number;
    solddate: string;
    audfeeExGst: number;
    audGst: number;
    audtotal: number;
    otc?: boolean;
  }[];
};

export type MyMarketOrderHistoryResponse = {
  status: "ok" | "error";
  message: string;
  buyorders: {
    coin: string;
    market: string;
    rate: number;
    amount: number;
    total: number;
    solddate: string;
    audfeeExGst: number;
    audGst: number;
    audtotal: number;
  }[];
  sellorders: {
    coin: string;
    market: string;
    rate: number;
    amount: number;
    total: number;
    solddate: string;
    audfeeExGst: number;
    audGst: number;
    audtotal: number;
  }[];
};

export type MySendAndReceiveHistoryResponse = {
  status: "ok" | "error";
  message: string;
  sendtransactions: {
    timestamp: string;
    amount: number;
    coin: string;
    address: string;
    aud: number;
  }[];
  receivetransactions: {
    timestamp: string;
    amount: number;
    coin: string;
    address: string;
    aud: number;
    from: string;
  }[];
};

export type MyDepositHistoryResponse = {
  status: "ok" | "error";
  message: string;
  deposits: {
    amount: number;
    created: string;
    status: "ok" | "error";
    type: string;
    referrnce: string;
  }[];
};

export type MyWithdrawalHistoryResponse = {
  status: "ok" | "error";
  message: string;
  withdrawals: {
    amount: number;
    created: string;
    status: "ok" | "error";
  }[];
};

export type MyAffiliatePaymentsResponse = {
  status: "ok" | "error";
  message: string;
  payments: {
    amount: number;
    month: string;
  }[];
};

export type MyReferralPaymentsResponse = {
  status: "ok" | "error";
  message: string;
  payments: {
    amount: number;
    coin: string;
    audamount: number;
    timestamp: string;
  }[];
};
