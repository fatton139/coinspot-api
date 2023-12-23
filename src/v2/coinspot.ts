import { createHmac } from "crypto";
import fetch from "node-fetch";
import urljoin from "url-join";
import {
  BuyNowQuoteResponse,
  CancelByBuyOrderResponse,
  CoinWithdrawalResponse,
  CompletedOrdersByCoinResponse,
  FullAccessStatusCheckResponse,
  GetCoinWithdrawalDetailsResponse,
  LatestBuyPriceResponse,
  LatestCoinPricesResponse,
  LatestPricesResponse,
  LatestSellPriceResponse,
  MyAffiliatePaymentsResponse,
  MyCoinBalanceResponse,
  MyCoinBalancesResponse,
  MyCoinDepositAddressResponse,
  MyDepositHistoryResponse,
  MyOpenLimitOrdersResponse,
  MyOpenMarketOrdersResponse,
  MyOrderHistoryResponse,
  MyReferralPaymentsResponse,
  MySendAndReceiveHistoryResponse,
  MyWithdrawalHistoryResponse,
  OpenMarketOrdersResponse,
  OpenOrdersByCoinResponse,
  PlaceBuyNowOrderResponse,
  PlaceMarketBuyOrderResponse,
  PlaceMarketSellOrderResponse,
  PlaceSellNowOrderResponse,
  ReadonlyStatusCheckResponse,
  SellNowQuoteResponse,
  SwapNowQuoteResponse,
} from "./types.js";

/**
 * Class for interacting with the CoinSpot API.
 *
 * https://www.coinspot.com.au/v2/api
 */
export class CoinSpot {
  /**
   * Constructor for the CoinSpot class.
   *
   * apiKey and secrets are required to interact with the private API.
   *
   * @param apiKey - The API key for CoinSpot authentication.
   * @param secret - The secret key for CoinSpot authentication.
   */
  constructor();
  constructor(apiKey: string, secret: string);
  constructor(
    private apiKey?: string,
    private secret?: string,
  ) {}

  /**
   * Fetches public data from the CoinSpot API.
   * @param url - The API endpoint URL.
   * @param params - Additional parameters for the request.
   * @returns A Promise resolving to the response data.
   */
  private async fetchPublic<TAssumedResponse extends Record<string, unknown>>(
    url: string,
    params: (string | undefined)[] = [],
  ) {
    const response = await fetch(urljoin(url, ...params.filter((v): v is string => v !== undefined)), {
      method: "GET",
    });

    return response.json() as Promise<TAssumedResponse>;
  }

  /**
   * Fetches data from the CoinSpot private API.
   * @param url - The API endpoint URL.
   * @param data - The data to be sent in the request body.
   * @returns A Promise resolving to the response data.
   */
  private async fetchPrivate<TAssumedResponse extends Record<string, unknown>>(
    url: string,
    data: Record<string, unknown> = {},
    searchParams: Record<string, string> = {},
  ) {
    if (this.apiKey === undefined || this.secret === undefined) {
      throw new Error("apiKey and secret has not been setup.");
    }

    const nonce = Date.now();
    const strData = JSON.stringify({ ...data, nonce });
    const hmac = createHmac("sha512", this.secret);
    hmac.update(strData);
    const signature = hmac.digest("hex");

    const mutableUrl = new URL(url);
    Object.entries(searchParams).forEach(([key, value]) => {
      mutableUrl.searchParams.set(key, value);
    });

    const response = await fetch(mutableUrl.toString(), {
      method: "POST",
      body: strData,
      headers: {
        "Content-Type": "application/json",
        sign: signature,
        key: this.apiKey,
      },
    });

    return response.json() as Promise<TAssumedResponse>;
  }

  /**
   * https://www.coinspot.com.au/v2/api#latestprices
   */
  public async latestPrices() {
    return this.fetchPublic<LatestPricesResponse>("https://www.coinspot.com.au/pubapi/v2/latest");
  }

  /**
   * https://www.coinspot.com.au/v2/api#latestpricescoinmarket
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param market - market coin short name, example value 'USDT' (only for available markets)
   */
  public async latestCoinPrices(coinType: string, market?: string) {
    return this.fetchPublic<LatestCoinPricesResponse>("https://www.coinspot.com.au/pubapi/v2/latest", [
      coinType,
      market,
    ]);
  }

  /**
   * https://www.coinspot.com.au/v2/api#latestbuypricenonfiat
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param market - coin market you wish to use to buy it, example value: USDT' (only for available markets)
   */
  public async latestBuyPrice(coinType: string, market?: string) {
    return this.fetchPublic<LatestBuyPriceResponse>("https://www.coinspot.com.au/pubapi/v2/buyprice", [
      coinType,
      market,
    ]);
  }

  /**
   * https://www.coinspot.com.au/v2/api#latestsellpricenonfiat
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param market - coin market you wish to sell it for, example value: 'USDT' (note: only for available markets)
   */
  public async latestSellPrice(coinType: string, market?: string) {
    return this.fetchPublic<LatestSellPriceResponse>("https://www.coinspot.com.au/pubapi/v2/sellprice", [
      coinType,
      market,
    ]);
  }

  /**
   * https://www.coinspot.com.au/v2/api#openordersmarket
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param market- coin market, example values 'USDT' (note: only for available markets)
   */
  public async openOrdersByCoin(coinType: string, market?: string) {
    return this.fetchPublic<OpenOrdersByCoinResponse>("https://www.coinspot.com.au/pubapi/v2/orders/open", [
      coinType,
      market,
    ]);
  }

  /**
   * https://www.coinspot.com.au/v2/api#histordersmarket
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param market - coin market, example values 'USDT' (note: only for available markets)
   */
  public async completedOrdersByCoin(coinType: string, market?: string) {
    const response = await this.fetchPublic<CompletedOrdersByCoinResponse>(
      "https://www.coinspot.com.au/pubapi/v2/orders/completed",
      [coinType, market],
    );

    return {
      ...response,
      buyorders: response.buyorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
      sellorders: response.sellorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#apistatus
   * Checks if you have access to the private api
   */
  public async fullAccessStatusCheck() {
    return this.fetchPrivate<FullAccessStatusCheckResponse>("https://www.coinspot.com.au/api/v2/status");
  }

  /**
   * https://www.coinspot.com.au/v2/api#deposit
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   */
  public async myCoinDespositAddress(coinType: string) {
    return this.fetchPrivate<MyCoinDepositAddressResponse>("https://www.coinspot.com.au/api/v2/my/coin/deposit", {
      cointype: coinType,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#buynowquote
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param amount - amount to buy
   * @param amountType - 'coin' or 'aud' - whether the amount above is coin amount or AUD amount
   */
  public async buyNowQuote(coinType: string, amount: number, amountType: "coin" | "aud") {
    return this.fetchPrivate<BuyNowQuoteResponse>("https://www.coinspot.com.au/api/v2/quote/buy/now", {
      cointype: coinType,
      amount,
      amounttype: amountType,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#sellnowquote
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param amount - amount of coins to sell
   * @param amountType - 'coin' or 'aud' - whether the amount above is coin amount or AUD amount
   */
  public async sellNowQuote(coinType: string, amount: number, amountType: "coin" | "aud") {
    return this.fetchPrivate<SellNowQuoteResponse>("https://www.coinspot.com.au/api/v2/quote/sell/now", {
      cointype: coinType,
      amount,
      amounttype: amountType,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#swapnowquote
   * @param coinTypeSell - coin short name you would like to swap, example value 'BTC', 'LTC', 'DOGE'
   * @param coinTypeBuy - coin short name you wuld like to swap it for, example value 'BTC', 'LTC', 'DOGE'
   * @param amount - amount of coins to swap
   */
  public async swapNowQuote(coinTypeSell: string, coinTypeBuy: string, amount: number) {
    return this.fetchPrivate<SwapNowQuoteResponse>("https://www.coinspot.com.au/api/v2/quote/swap/now", {
      cointypesell: coinTypeSell,
      cointypebuy: coinTypeBuy,
      amount,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#placebuyorder
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param amount - mount of coins you want to buy, max precision 8 decimal places
   * @param rate - rate in market currency (e.g. AUD or USDT) you are willing to pay, max precision 8 decimal places
   * @param marketType - (optional, available markets only, default 'AUD') market coin short name to use to buy the coin, example value 'USDT'
   */
  public async placeMarketBuyOrder(coinType: string, amount: number, rate: number, marketType: string = "AUD") {
    return this.fetchPrivate<PlaceMarketBuyOrderResponse>("https://www.coinspot.com.au/api/v2/my/buy", {
      cointype: coinType,
      amount,
      rate,
      markettype: marketType,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#placebuynoworder
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param amountType - 'coin' or 'aud' - whether the amount below is coin amount or AUD amount
   * @param amount - amount to buy, max precision for coin is 8 decimal places and 2 decimal places for AUD
   * @param rate - (optional) rate in AUD received from using Buy Now Quote or otherwise
   * @param threshold - (optional) 0 to 1000 - buy request will terminate if not within percentage threshold for current rate to vary from submitted rate, max precision for percentage is 8 decimal places
   * @param direction - (optional) UP, DOWN, or BOTH (default is UP) - direction the price has moved for the percentage threshold to apply
   */
  public async placeBuyNowOrder(
    coinType: string,
    amount: number,
    amountType: string,
    rate?: number,
    threshold?: number,
    direction: "UP" | "DOWN" | "BOTH" = "UP",
  ) {
    return this.fetchPrivate<PlaceBuyNowOrderResponse>("https://www.coinspot.com.au/api/v2/my/buy/now", {
      cointype: coinType,
      amount,
      amounttype: amountType,
      rate,
      threshold,
      direction,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#placesellorder
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param amount - amount of coins you want to sell, max precision 8 decimal places
   * @param rate - rate in AUD you are willing to sell for, max precision 8 decimal places
   * @param marketType - (optional, available markets only, default 'AUD') market coin short name to use to sell the coin into, example value 'USDT'
   */
  public async placeMarketSellOrder(coinType: string, amount: number, rate: number, marketType: string = "AUD") {
    return this.fetchPrivate<PlaceMarketSellOrderResponse>("https://www.coinspot.com.au/api/v2/my/sell", {
      cointype: coinType,
      amount,
      rate,
      markettype: marketType,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#placesellnowrder
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param amountType - 'coin' or 'aud' - whether the amount below is coin amount or AUD amount
   * @param amount - amount of coins you want to sell, max precision 8 decimal places
   * @param rate - (optional) rate in AUD received from using Sell Now Quote or otherwise
   * @param threshold - (optional) 0 to 1000 - sell request will terminate if not within percentage threshold for current rate to vary from submitted rate, max precision for percentage is 8 decimal places
   * @param direction - (optional) UP, DOWN, or BOTH (default is DOWN) - direction the price has moved for the percentage threshold to apply
   */
  public async placeSellNowOrder(
    coinType: string,
    amount: number,
    amountType: string,
    rate?: number,
    threshold?: number,
    direction: "UP" | "DOWN" | "BOTH" = "DOWN",
  ) {
    return this.fetchPrivate<PlaceSellNowOrderResponse>("https://www.coinspot.com.au/api/v2/my/sell/now", {
      cointype: coinType,
      amount,
      amounttype: amountType,
      rate,
      threshold,
      direction,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#placeswapnoworder
   * @param coinTypeSell - coin short name you would like to swap, example value 'BTC', 'LTC', 'DOGE'
   * @param coinTypeBuy - coin short name you wuld like to swap it for, example value 'BTC', 'LTC', 'DOGE'
   * @param amount - amount of (cointypesell) to swap, max precision for coin is 8 decimal places
   * @param rate - (optional) rate received from using Swap Now Quote or otherwise
   * @param threshold - (optional) 0 to 1000 - swap request will terminate if not within percentage threshold for current rate to vary from submitted rate, max precision for percentage is 8 decimal places
   * @param direction - (optional) UP, DOWN, or BOTH (default is BOTH) - direction the price has moved for the percentage threshold to apply
   * @returns
   */
  public async placeSwapNowOrder(
    coinTypeSell: string,
    coinTypeBuy: string,
    amount: number,
    rate?: number,
    threshold?: number,
    direction: "UP" | "DOWN" | "BOTH" = "BOTH",
  ) {
    return this.fetchPrivate<PlaceSellNowOrderResponse>("https://www.coinspot.com.au/api/v2/my/swap/now", {
      cointypesell: coinTypeSell,
      cointypebuy: coinTypeBuy,
      amount,
      rate,
      threshold,
      direction,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#cancelbuyorder
   * @param id - id of the buy order to cancel
   */
  public async cancelMyBuyOrder(id: string) {
    return this.fetchPrivate<CancelByBuyOrderResponse>("https://www.coinspot.com.au/api/v2/my/buy/cancel", {
      id,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#cancelsellorder
   * @param - id of the sell order to cancel
   */
  public async cancelMySellOrder(id: string) {
    return this.fetchPrivate<CancelByBuyOrderResponse>("https://www.coinspot.com.au/api/v2/my/sell/cancel", {
      id,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#cointihdetail
   * @param coinType - coin short name you would like to withdraw, example value 'BTC', 'LTC', 'DOGE'
   */
  public async getCoinWithdrawalDetails(coinType: string) {
    return this.fetchPrivate<GetCoinWithdrawalDetailsResponse>(
      "https://www.coinspot.com.au/api/v2/my/coin/withdraw/senddetails",
      {
        cointype: coinType,
      },
    );
  }

  /**
   * https://www.coinspot.com.au/v2/api#coinsend
   * @param coinType - coin short name you would like to withdraw, example values 'BTC', 'LTC', 'DOGE'
   * @param amount - the amount (in coin currency) of coin you would like to withdraw
   * @param address - the destination address for the coin amount'
   * @param emailConfirm - (optional, default is False) if True an email confirmation will be sent and withdraw will not complete until confirmation link within email is clicked, values: 'YES', 'NO'
   * @param network - (optional) - network you would like to send using e.g. 'BNB', 'ETH' - omit for 'default' network
   * @param paymentid - (optional) - the appropriate payment id/memo for the withdrawal where permitted
   */
  public async coinWithdrawal(
    coinType: string,
    amount: number,
    address: string,
    emailConfirm: boolean = false,
    network?: string,
    paymentId?: string,
  ) {
    return this.fetchPrivate<CoinWithdrawalResponse>("https://www.coinspot.com.au/api/v2/my/coin/withdraw/send", {
      cointype: coinType,
      amount,
      address,
      emailconfirm: emailConfirm ? "YES" : "NO",
      network,
      paymentId,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#rostatus
   * Checks if you have access to the readonly api
   */
  public async readonlyStatusCheck() {
    return this.fetchPrivate<ReadonlyStatusCheckResponse>("https://www.coinspot.com.au/api/v2/ro/status");
  }

  /**
   * https://www.coinspot.com.au/v2/api#apiopenorders
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param marketType - (optional, available markets only)) market coin short name, example values 'AUD', 'USDT'
   */
  public async openMarketOrders(coinType: string, marketType: string) {
    return this.fetchPrivate<OpenMarketOrdersResponse>("https://www.coinspot.com.au/api/v2/ro/orders/market/open", {
      cointype: coinType,
      markettype: marketType,
    });
  }

  /**
   * https://www.coinspot.com.au/v2/api#apihistorders
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param marketType - (optional, available markets only) market coin short name, example values 'AUD', 'USDT'
   * @param startDate - (optional) start datetime
   * @param endDate - (optional) end datetime
   * @param limit - (optional, default is 200 records, max is 500 records)
   */
  public async completedMarketOrders(
    coinType: string,
    marketType: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ) {
    const response = await this.fetchPrivate<CompletedOrdersByCoinResponse>(
      "https://www.coinspot.com.au/api/v2/ro/orders/market/completed",
      {
        cointype: coinType,
        markettype: marketType,
        startdate: startDate?.toISOString(),
        enddate: endDate?.toISOString(),
        limit,
      },
    );

    return {
      ...response,
      buyorders: response.buyorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
      sellorders: response.sellorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#romybalances
   */
  public async myCoinBalances() {
    return this.fetchPrivate<MyCoinBalancesResponse>("https://www.coinspot.com.au/api/v2/ro/my/balances");
  }

  /**
   * @param coinType - coin short name, example value 'AUD', 'BTC', 'LTC', 'DOGE'
   * @param available - return available balance in addition to actual balance
   */
  public async myCoinBalance<TAvailable extends boolean>(coinType: string, available: TAvailable) {
    return this.fetchPrivate<MyCoinBalanceResponse<TAvailable>>(
      "https://www.coinspot.com.au/api/v2/ro/my/balances",
      {
        cointype: coinType,
      },
      {
        available: available ? "yes" : "no",
      },
    );
  }

  /**
   * https://www.coinspot.com.au/v2/api#roopenmarketorders
   * @param coinType - (optional) coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param marketType - (optional) market coin short name, example value 'USDT', 'AUD'
   */
  public async myOpenMarketOrders(coinType?: string, marketType?: string) {
    const response = await this.fetchPrivate<MyOpenMarketOrdersResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/orders/market/open",
      {
        cointype: coinType,
        markettype: marketType,
      },
    );

    return {
      ...response,
      buyorders: response.buyorders.map(({ created, ...rest }) => ({
        created: new Date(created),
        ...rest,
      })),
      sellorders: response.sellorders.map(({ created, ...rest }) => ({
        created: new Date(created),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#roopenlimitorders
   * @param coinType - (optional) coin short name, example value 'BTC', 'LTC', 'DOGE'
   */
  public async myOpenLimitOrders(coinType?: string) {
    const response = await this.fetchPrivate<MyOpenLimitOrdersResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/orders/limit/open",
      {
        cointype: coinType,
      },
    );

    return {
      ...response,
      buyorders: response.buyorders.map(({ created, ...rest }) => ({
        created: new Date(created),
        ...rest,
      })),
      sellorders: response.sellorders.map(({ created, ...rest }) => ({
        created: new Date(created),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#roorders
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param marketType - (optional, available markets only) market coin short name, example values 'AUD', 'USDT'
   * @param startDate - (optional) start datetime
   * @param endDate - (optional) end datetime
   * @param limit - (optional, default is 200 records, max is 500 records)
   */
  public async myOrderHistory(
    coinType?: string,
    marketType?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ) {
    const response = await this.fetchPrivate<MyOrderHistoryResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/orders/completed",
      {
        cointype: coinType,
        markettype: marketType,
        startdate: startDate?.toISOString(),
        enddate: endDate?.toISOString(),
        limit,
      },
    );

    return {
      ...response,
      buyorders: response.buyorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
      sellorders: response.sellorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#rotransaction
   * @param coinType - coin short name, example value 'BTC', 'LTC', 'DOGE'
   * @param marketType - (optional, available markets only) market coin short name, example values 'AUD', 'USDT'
   * @param startDate - (optional) start datetime
   * @param endDate - (optional) end datetime
   * @param limit - (optional, default is 200 records, max is 500 records)
   */
  public async myMarketOrderHistory(
    coinType?: string,
    marketType?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ) {
    const response = await this.fetchPrivate<MyOrderHistoryResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/orders/market/completed",
      {
        cointype: coinType,
        markettype: marketType,
        startdate: startDate?.toISOString(),
        enddate: endDate?.toISOString(),
        limit,
      },
    );

    return {
      ...response,
      buyorders: response.buyorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
      sellorders: response.sellorders.map(({ solddate, ...rest }) => ({
        solddate: new Date(solddate),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#rosendreceive
   * @param startDate - (optional) start datetime
   * @param endDate - (optional) end datetime
   */
  public async mySendAndReceiveHistory(startDate?: Date, endDate?: Date) {
    const response = await this.fetchPrivate<MySendAndReceiveHistoryResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/sendreceive",
      {
        startdate: startDate?.toISOString().split("T")[0],
        enddate: endDate?.toISOString().split("T")[0],
      },
    );

    return {
      ...response,
      sendTransactions: response.sendtransactions.map(({ timestamp, ...rest }) => ({
        timestamp: new Date(timestamp),
        ...rest,
      })),
      receiveTransactions: response.receivetransactions.map(({ timestamp, ...rest }) => ({
        timestamp: new Date(timestamp),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#rodeposit
   * @param startDate - (optional) start datetime
   * @param endDate - (optional) end datetime
   */
  public async myDespoitHistory(startDate?: Date, endDate?: Date) {
    const response = await this.fetchPrivate<MyDepositHistoryResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/deposits",
      {
        startdate: startDate?.toISOString().split("T")[0],
        enddate: endDate?.toISOString().split("T")[0],
      },
    );

    return {
      ...response,
      deposits: response.deposits.map(({ created, ...rest }) => ({
        created: new Date(created),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#rowithdrawal
   * @param startDate - (optional) start datetime
   * @param endDate - (optional) end datetime
   */
  public async myWithdrawalHistory(startDate?: Date, endDate?: Date) {
    const response = await this.fetchPrivate<MyWithdrawalHistoryResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/withdrawals",
      {
        startdate: startDate?.toISOString().split("T")[0],
        enddate: endDate?.toISOString().split("T")[0],
      },
    );

    return {
      ...response,
      withdrawals: response.withdrawals.map(({ created, ...rest }) => ({
        created: new Date(created),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#roaffpay
   */
  public async myAffiliatePayments() {
    const response = await this.fetchPrivate<MyAffiliatePaymentsResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/withdrawals",
    );

    return {
      ...response,
      payments: response.payments.map(({ month, ...rest }) => ({
        month: new Date(month),
        ...rest,
      })),
    };
  }

  /**
   * https://www.coinspot.com.au/v2/api#rorefpay
   */
  public async myReferralPayments() {
    const response = await this.fetchPrivate<MyReferralPaymentsResponse>(
      "https://www.coinspot.com.au/api/v2/ro/my/referralpayments",
    );

    return {
      ...response,
      payments: response.payments.map(({ timestamp, ...rest }) => ({
        timestamp: new Date(timestamp),
        ...rest,
      })),
    };
  }
}
