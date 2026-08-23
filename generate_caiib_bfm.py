import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("❌ Missing Supabase configuration in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
EXAM_TRACK = "CAIIB_BFM"

MODULE_A_TOPICS = [
    ("Exchange Rate Quotation & Cross Rates", "In a Direct Foreign Exchange quote, how is a currency transaction defined?", "Fixed units of Foreign Currency expressed in variable units of Home Currency (e.g., 1 USD = Rs 83.50)", "Fixed units of Home Currency expressed in variable units of Foreign Currency", "Variable units of both Home and Foreign currencies determined by gold standard", "Quotation used exclusively for non-deliverable forward derivative contracts", "A", "Under direct quotation, the price of 1 unit of foreign currency is quoted in terms of variable units of domestic currency."),
    ("Forward Margins (Premium & Discount)", "Under direct quotation mechanics, what is the universal rule for computing forward exchange rates when given spot rates and forward swap points?", "Add premium to the spot rate and deduct discount from the spot rate", "Deduct premium from the spot rate and add discount", "Multiply spot rate by the foreign central bank policy interest rate", "Divide spot rate by forward margin basis points", "A", "In direct quotes: Forward Rate = Spot + Premium (or Spot - Discount). If bid < ask margin points, the foreign currency is at premium; if bid > ask, it is at discount."),
    ("Documentary Letters of Credit (UCPDC 600)", "Under Article 14(b) of UCPDC 600, what is the maximum statutory time allowed to an issuing/confirming bank to examine presentation documents?", "A maximum of five banking days following the day of presentation to determine compliance", "Strictly 24 hours from receipt of shipping papers", "Three business days including local municipal holidays", "Seven calendar days from bill of lading onboard date", "A", "UCPDC 600 Art 14(b) gives the nominated bank, confirming bank, and issuing bank a maximum of 5 banking days following the day of presentation to determine whether documents comply."),
    ("Bank Guarantees & URDG 758", "Under Uniform Rules for Demand Guarantees (URDG 758), what constitutes an independent demand guarantee?", "An irrevocable undertaking where the guarantor's obligation is strictly independent of the underlying contract between applicant and beneficiary", "A collateral agreement conditional on full civil court arbitration verdict", "An informal letter of comfort issued without monetary cap", "A credit derivative requiring underlying physical commodity delivery", "A", "Demand guarantees under URDG 758 are independent contracts; the guarantor deals strictly with compliant documents/demands and is not concerned with underlying contract disputes."),
    ("External Commercial Borrowings (ECB Framework)", "Under RBI's Master Directions on ECB, what is the Minimum Average Maturity Period (MAMP) generally mandated for standard foreign currency ECBs up to USD 750 Million?", "3 years (with specific relaxations for manufacturing/working capital)", "1 year strictly", "10 years with sovereign indemnity guarantee", "180 days aligned with trade credit tenure", "A", "Under RBI ECB framework, the standard Minimum Average Maturity Period (MAMP) for foreign currency denominated ECBs is 3 years.")
]

MODULE_B_TOPICS = [
    ("Basel III Capital Adequacy (CRAR)", "Under RBI's Basel III Capital Regulations, what is the minimum Common Equity Tier 1 (CET1) capital ratio required for Indian Scheduled Commercial Banks?", "5.50% of Risk Weighted Assets (plus 2.50% Capital Conservation Buffer = 8.00%)", "4.00% of Risk Weighted Assets", "9.00% of Total On-Balance Sheet Assets", "11.50% of Net Demand and Time Liabilities", "A", "RBI Basel III norms mandate minimum CET1 of 5.50% of RWAs. Adding the 2.50% Capital Conservation Buffer (CCB) brings total minimum CET1 requirement to 8.00%."),
    ("Total Minimum Regulatory Capital (CRAR)", "What is the total minimum Capital to Risk-Weighted Assets Ratio (CRAR) including CCB mandated by RBI for Indian commercial banks?", "11.50% of Risk Weighted Assets (9.00% Minimum CRAR + 2.50% CCB)", "8.00% of Risk Weighted Assets", "10.00% flat without capital conservation tiering", "14.00% for foreign banks operating with single branch", "A", "Total regulatory CRAR mandated by RBI is 9% + 2.5% CCB = 11.50% of total risk-weighted assets."),
    ("Liquidity Coverage Ratio (LCR)", "Under Basel III liquidity framework, what does the Liquidity Coverage Ratio (LCR) mandate banks to maintain?", "Sufficient High-Quality Liquid Assets (HQLA) to survive a 30-day severe liquidity stress scenario such that LCR >= 100%", "Unencumbered cash reserves equal to 50% of total term deposits", "Zero net open foreign currency exchange position at day end", "Foreign currency assets equal to 100% of overseas Nostro debit lines", "A", "LCR requires banks to hold an adequate stock of unencumbered High-Quality Liquid Assets (HQLA) that can be converted into cash to meet 30-day net stressed cash outflows (LCR >= 100%)."),
    ("Value at Risk (VaR) Metrics", "What does a 1-day Value at Risk (VaR) of Rs 10 Crore at a 99% confidence level signify to a treasury risk desk?", "There is a 1% statistical probability that the portfolio will experience a trading loss exceeding Rs 10 Crore over a single trading day", "The maximum possible financial loss under catastrophic liquidation is Rs 10 Crore", "The portfolio will generate a minimum return of Rs 10 Crore in 99 out of 100 days", "Expected market default rate on sovereign securities is exactly 1%", "A", "A 1-day 99% VaR of Rs 10 Cr means the bank is 99% confident that daily trading losses will not exceed Rs 10 Cr (or there is a 1% chance of loss exceeding Rs 10 Cr)."),
    ("Modified Duration & Price Volatility", "If a government benchmark bond has a Modified Duration (MD) of 5.20 years and market yield increases by 25 basis points (+0.25%), what is the approximate percentage change in the bond's price?", "Decrease by 1.30% (-5.20 × 0.25%)", "Increase by 5.20%", "Decrease by 0.25%", "Zero change as coupon rate is statutory", "A", "Percentage price change = -Modified Duration × Change in Yield = -5.20 × (+0.25%) = -1.30% (Bond price drops by 1.30%).")
]

MODULE_C_TOPICS = [
    ("Treasury Operations & Segregation", "Why is strict organizational segregation mandated between the Front Office, Mid Office, and Back Office in a bank's Treasury?", "To eliminate operational fraud and conflicts of interest by separating trade execution (Front), risk control (Mid), and settlement/accounting (Back)", "To meet municipal registration requirements of local stock exchanges", "To ensure dealers directly handle customer cash dispatches", "To prevent statutory tax deductions at source on interbank call loans", "A", "Treasury governance requires 3-tier segregation: Front Office (dealing/execution), Mid Office (risk monitoring/VaR compliance), and Back Office (clearing/settlement/confirmation)."),
    ("Interest Rate Swaps (IRS Hedging)", "In a Plain Vanilla Overnight Indexed Swap (OIS), what floating benchmark rate is conventionally used for Indian Rupee interest rate settlements?", "MIBOR (Mumbai Interbank Outright Rate) fixing published by FBIL", "RBI Base Lending Rate", "State Bank of India 1-Year Marginal Cost of Funds (MCLR)", "Statutory 10-Year Benchmark G-Sec Yield", "A", "Rupee Overnight Indexed Swaps (OIS) trade with the floating leg pegged to FBIL Overnight MIBOR compounding daily."),
    ("G-Sec Yield Curve Dynamics", "What economic scenario does an 'Inverted Yield Curve' typically signal to treasury fund managers?", "Short-term interest rates are higher than long-term rates, typically forecasting an impending economic slowdown or recession", "Long-term economic growth is accelerating above historical potential", "Inflation expectations over 30 years are rising dramatically", "Commercial banks are holding zero statutory liquidity reserves", "A", "An inverted yield curve occurs when yields on longer-duration debt drop below short-term rates, signaling market expectations of future economic slowdown and rate cuts."),
    ("Foreign Currency Nostro / Vostro Accounts", "What is the exact definition of a 'Nostro Account' maintained by an Indian Authorized Dealer bank?", "An account maintained by an Indian bank in foreign currency with a correspondent bank abroad (Our account with you)", "An account maintained by a foreign bank in Indian Rupees with an Indian bank (Your account with us)", "An internal shadow clearing ledger maintained for ATM reconciliation", "A rupee-denominated overseas term deposit held by a non-resident individual", "A", "A Nostro account ('our account with you') is an account maintained by a domestic bank in foreign currency with an overseas bank abroad.")
]

MODULE_D_TOPICS = [
    ("Asset-Liability Management (ALM) & Structural Gaps", "What is the primary risk exposure when a bank exhibits a positive Cumulative Mismatched Gap (RSA > RSL) in an increasing interest rate environment?", "Net Interest Income (NII) will increase because more assets will re-price at higher rates than liabilities", "Net Interest Margin will decline immediately to zero", "The bank will suffer severe liquidity default in overnight clearing", "Tier 1 capital adequacy ratio will fall below statutory minimums", "A", "When Rate Sensitive Assets (RSA) exceed Rate Sensitive Liabilities (RSL), a rise in interest rates benefits the bank, resulting in an expansion of Net Interest Income (NII)."),
    ("Risk-Adjusted Return on Capital (RAROC)", "How is Risk-Adjusted Return on Capital (RAROC) calculated for business unit performance evaluation?", "RAROC = (Revenues - Operating Expenses - Expected Losses + Return on Capital) / Economic Capital", "RAROC = Total Net Profit / Net Demand and Time Liabilities (NDTL)", "RAROC = Gross Non-Performing Assets / Total Regulatory Capital", "RAROC = Operating Cash Flow / Total Fixed Assets", "A", "RAROC measures profitability adjusted for risk: it divides risk-adjusted net income (net of expected loan loss provisions) by allocated Economic Capital."),
    ("Funds Transfer Pricing (FTP) Architecture", "What is the central purpose of an internal Funds Transfer Pricing (FTP) system within a commercial bank?", "To allocate internal net interest margin fairly between deposit-raising branches and credit-deploying lending units based on term liquidity costs", "To calculate statutory municipal taxes for urban branch locations", "To enforce standardized penal interest rates on restructured MSME loans", "To automate KYC risk categorization across retail savings accounts", "A", "FTP is an internal management accounting system that prices funding across business units, separating interest margin generated by deposit mobilization from lending spreads.")
]

def fetch_existing():
    all_rows = []
    start = 0
    while True:
        res = supabase.table("questions").select("id, cbt_set_number").range(start, start + 999).eq("exam_type", EXAM_TRACK).execute()
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < 1000:
            break
        start += 1000
    return all_rows

def main():
    print("==================================================")
    print(f"🚀 CAIIB Paper 2 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for CAIIB BFM
    for s_num in range(1, 11):
        count = set_map.get(s_num, 0)
        missing = 100 - count

        if missing > 0:
            print(f"\n[*] Generating Set #{s_num:02d}: Currently {count}/100. Adding {missing} questions...")
            
            # Quota: Mod A (30), Mod B (35), Mod C (20), Mod D (15)
            records_to_insert = []
            for k in range(count, 100):
                if k < 30:
                    topic_data = MODULE_A_TOPICS[k % len(MODULE_A_TOPICS)]
                    module_name = "Module A: International Banking"
                elif k < 65:
                    topic_data = MODULE_B_TOPICS[(k - 30) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Risk Management"
                elif k < 85:
                    topic_data = MODULE_C_TOPICS[(k - 65) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Treasury Management"
                else:
                    topic_data = MODULE_D_TOPICS[(k - 85) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Balance Sheet Management"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                # Strict 75% Moderate / 25% Hard distribution
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                diff = "hard" if marks == 2.0 else "moderate"
                unique_q = f"[BFM-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
                record = {
                    "exam_type": EXAM_TRACK,
                    "module": module_name,
                    "difficulty": diff,
                    "cbt_set_number": s_num,
                    "question_text": unique_q,
                    "audio_script": f"Question {k+1}. {title}. {scenario}",
                    "option_a": a,
                    "option_b": b,
                    "option_c": c,
                    "option_d": d,
                    "correct_option": correct,
                    "explanation": exp
                }
                records_to_insert.append(record)

            for i in range(0, len(records_to_insert), 50):
                chunk = records_to_insert[i:i+50]
                try:
                    supabase.table("questions").insert(chunk).execute()
                    total_inserted += len(chunk)
                    print(f"    ✅ Inserted batch {i+1} to {i+len(chunk)} into Set #{s_num:02d}")
                except Exception as e:
                    print(f"    ❌ Insert batch error: {e}")

    print("\n" + "=" * 50)
    print(f"🎉 Ingestion finished! Successfully populated {total_inserted} questions into {EXAM_TRACK}.")

if __name__ == "__main__":
    main()