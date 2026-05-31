export const portfolioMock = {
  summary: {
    total_value: 428350,
    today_pnl: 3210,
    overall_gain: 28350,
    xirr: 18.4,
    active_signals: 3
  },
  holdings: [
    {
      tradingsymbol: "RELIANCE",
      quantity: 50,
      average_price: 2410,
      last_price: 2538,
      pnl: 6400,
      sparkline: [2510, 2522, 2515, 2531, 2528, 2542, 2538],
      signal: { type: "BUY", confidence: "HIGH", rsi: 32, reason: "RSI oversold, MACD bullish crossover" }
    },
    {
      tradingsymbol: "INFY",
      quantity: 30,
      average_price: 1580,
      last_price: 1742,
      pnl: 4860,
      sparkline: [1690, 1710, 1728, 1736, 1742, 1730, 1718],
      signal: { type: "SELL", confidence: "LOW", rsi: 68, reason: "RSI overbought" }
    },
    {
      tradingsymbol: "TCS",
      quantity: 20,
      average_price: 3820,
      last_price: 3910,
      pnl: 1800,
      sparkline: [3905, 3912, 3906, 3915, 3910, 3914, 3910],
      signal: { type: "HOLD", confidence: "LOW", rsi: 51, reason: "mixed or neutral indicator readings" }
    },
    {
      tradingsymbol: "HDFCBANK",
      quantity: 25,
      average_price: 1620,
      last_price: 1548,
      pnl: -1800,
      sparkline: [1578, 1560, 1545, 1532, 1540, 1536, 1548],
      signal: { type: "BUY", confidence: "HIGH", rsi: 28, reason: "RSI oversold, price at lower Bollinger Band" }
    }
  ]
};

export const topPicksMock = [
  {
    tradingsymbol: "RELIANCE",
    exchange: "NSE",
    category: "Energy",
    sector: "Energy",
    last_price: 2538,
    performance_1m: 5.4,
    performance_3m: 12.1,
    target_low: 2620,
    target_high: 2710,
    downside_level: 2460,
    rsi: 58,
    confidence: "HIGH",
    signal_type: "BUY",
    reason: "positive momentum with bullish trend confirmation",
    sparkline: [2460, 2495, 2510, 2522, 2515, 2531, 2538]
  },
  {
    tradingsymbol: "HDFCBANK",
    exchange: "NSE",
    category: "Banks",
    sector: "Banks",
    last_price: 1548,
    performance_1m: 3.1,
    performance_3m: 8.2,
    target_low: 1595,
    target_high: 1642,
    downside_level: 1505,
    rsi: 54,
    confidence: "MEDIUM",
    signal_type: "HOLD",
    reason: "steady category momentum",
    sparkline: [1508, 1522, 1518, 1536, 1540, 1536, 1548]
  },
  {
    tradingsymbol: "LT",
    exchange: "NSE",
    category: "Infra",
    sector: "Infra",
    last_price: 3410,
    performance_1m: 6.2,
    performance_3m: 15.5,
    target_low: 3560,
    target_high: 3675,
    downside_level: 3280,
    rsi: 61,
    confidence: "HIGH",
    signal_type: "BUY",
    reason: "EMA trend and recent momentum are supportive",
    sparkline: [3220, 3290, 3335, 3372, 3390, 3402, 3410]
  }
];
