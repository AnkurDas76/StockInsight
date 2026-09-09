from langchain.tools import tool
import yfinance as yf


# ============================================================
# 1. STOCK SCREENER
# ============================================================

@tool
def simple_screener(screen_type: str, offset: int = 0) -> str:
    """
    Find stocks using Yahoo Finance's predefined stock screens.

    Available screen types:
    aggressive_small_caps
    day_gainers
    day_losers
    growth_technology_stocks
    most_actives
    most_shorted_stocks
    small_cap_gainers
    undervalued_growth_stocks
    undervalued_large_caps
    conservative_foreign_funds
    high_yield_bond
    portfolio_anchors
    solid_large_growth_funds
    solid_midcap_growth_funds
    top_mutual_funds

    Args:
        screen_type: Name of the predefined Yahoo Finance screen.
        offset: Starting position for pagination. Defaults to 0.

    Returns:
        A list of stocks matching the selected screen.
    """

    if screen_type not in yf.PREDEFINED_SCREENER_QUERIES:
        return (
            f"Invalid screen_type: {screen_type}. "
            "Please use one of the supported predefined screens."
        )

    query = yf.PREDEFINED_SCREENER_QUERIES[screen_type]["query"]

    result = yf.screen(
        query,
        offset=offset,
        size=5
    )

    fields = [
        "shortName",
        "symbol",
        "exchange",
        "regularMarketPrice",
        "bid",
        "ask",
        "fiftyTwoWeekHigh",
        "fiftyTwoWeekLow",
        "marketCap",
        "averageAnalystRating",
        "dividendYield"
    ]

    output_data = []

    for stock in result.get("quotes", []):
        details = {}

        for key, value in stock.items():
            if key in fields:
                details[key] = value

        output_data.append(details)

    return str(output_data)


# ============================================================
# 2. CURRENT STOCK PRICE
# ============================================================

@tool
def get_stock_price(symbol: str) -> str:
    """
    Get the latest available stock price and basic market information.

    Args:
        symbol: Stock ticker symbol, for example AAPL, MSFT, NVDA.

    Returns:
        Latest price and basic price information.
    """

    ticker = yf.Ticker(symbol.upper())

    info = ticker.fast_info

    try:
        price = info["lastPrice"]
        previous_close = info["previousClose"]

        change = price - previous_close
        change_percent = (change / previous_close) * 100

        return str({
            "symbol": symbol.upper(),
            "price": round(price, 2),
            "previous_close": round(previous_close, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2)
        })

    except Exception as e:
        return f"Unable to retrieve price for {symbol}: {str(e)}"


# ============================================================
# 3. COMPANY PROFILE
# ============================================================

@tool
def get_company_profile(symbol: str) -> str:
    """
    Get basic information about a company.

    Args:
        symbol: Stock ticker symbol, for example AAPL, MSFT, NVDA.

    Returns:
        Company name, sector, industry, market cap and description.
    """

    ticker = yf.Ticker(symbol.upper())
    info = ticker.info

    profile = {
        "symbol": symbol.upper(),
        "company_name": info.get("longName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "country": info.get("country"),
        "market_cap": info.get("marketCap"),
        "employees": info.get("fullTimeEmployees"),
        "website": info.get("website"),
        "business_summary": info.get("longBusinessSummary")
    }

    return str(profile)


# ============================================================
# 4. FINANCIAL SUMMARY
# ============================================================

@tool
def get_financial_summary(symbol: str) -> str:
    """
    Get important financial metrics for a company.

    Args:
        symbol: Stock ticker symbol, for example AAPL, MSFT, NVDA.

    Returns:
        Revenue, profit, EPS, margins and valuation-related metrics.
    """

    ticker = yf.Ticker(symbol.upper())
    info = ticker.info

    financials = {
        "symbol": symbol.upper(),
        "revenue": info.get("totalRevenue"),
        "revenue_growth": info.get("revenueGrowth"),
        "gross_profit": info.get("grossProfits"),
        "gross_margin": info.get("grossMargins"),
        "operating_margin": info.get("operatingMargins"),
        "profit_margin": info.get("profitMargins"),
        "net_income": info.get("netIncomeToCommon"),
        "eps": info.get("trailingEps"),
        "forward_eps": info.get("forwardEps"),
        "pe_ratio": info.get("trailingPE"),
        "forward_pe": info.get("forwardPE"),
        "price_to_book": info.get("priceToBook"),
        "debt_to_equity": info.get("debtToEquity"),
        "return_on_equity": info.get("returnOnEquity")
    }

    return str(financials)


# ============================================================
# 5. HISTORICAL STOCK PRICES
# ============================================================

@tool
def get_stock_history(
    symbol: str,
    period: str = "6mo"
) -> str:
    """
    Get historical stock price data.

    Args:
        symbol: Stock ticker symbol, for example AAPL, MSFT, NVDA.
        period: Historical period such as 1mo, 3mo, 6mo, 1y, 5y.

    Returns:
        Recent historical OHLCV price data.
    """

    allowed_periods = [
        "1mo",
        "3mo",
        "6mo",
        "1y",
        "2y",
        "5y"
    ]

    if period not in allowed_periods:
        return (
            f"Invalid period: {period}. "
            f"Choose from {allowed_periods}"
        )

    ticker = yf.Ticker(symbol.upper())

    history = ticker.history(period=period)

    if history.empty:
        return f"No historical data found for {symbol.upper()}."

    # Keep the response reasonably small.
    history = history.tail(20)

    history = history.reset_index()

    history["Date"] = history["Date"].astype(str)

    columns = [
        "Date",
        "Open",
        "High",
        "Low",
        "Close",
        "Volume"
    ]

    history = history[columns]

    return history.to_json(orient="records")