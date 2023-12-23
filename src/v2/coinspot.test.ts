import { afterEach, expect, test, vi } from "vitest";
import { CoinSpot } from "./coinspot.js";
import * as nodeFetch from "node-fetch";

vi.mock("node-fetch", async () => {
  return {
    __esModule: true,
    ...(await vi.importActual("node-fetch")),
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test("fetchPublic works", async () => {
  const spy = vi.spyOn(nodeFetch, "default");
  const api = new CoinSpot();
  await api.latestPrices();
  expect(spy).toBeCalledTimes(1);
  expect(spy).toBeCalledWith("https://www.coinspot.com.au/pubapi/v2/latest", {
    method: "GET",
  });
});

test("fetchPrivate works", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(12345);
  const spy = vi.spyOn(nodeFetch, "default");
  const api = new CoinSpot("dummy", "dummy");
  await api.fullAccessStatusCheck();
  expect(spy).toBeCalledTimes(1);
  expect(spy).toBeCalledWith("https://www.coinspot.com.au/api/v2/status", {
    method: "POST",
    body: '{"nonce":12345}',
    headers: {
      "Content-Type": "application/json",
      key: "dummy",
      sign: "6d840f51865d48fe8f2f9e75af2376874e96c6a0dbed2109e0f9c8e37b2b7b4afbf8c99f0d6633ed9148f143e019e7262af5dbf02e73a7d5627e0e15ac272577",
    },
  });
});

test("fetchPrivate should fail", async () => {
  const api = new CoinSpot();
  expect(api.fullAccessStatusCheck()).rejects.toStrictEqual(new Error("apiKey and secret has not been setup."));
});
