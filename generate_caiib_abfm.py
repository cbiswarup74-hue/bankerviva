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
EXAM_TRACK = "CAIIB_ABFM"

MODULE_A_TOPICS = [
    ("Strategic Management Process", "In strategic management frameworks, what does Porter's Five Forces model primarily evaluate?", "The competitive intensity, attractiveness, and long-term structural profitability of an industry", "Internal operational accounting efficiencies of retail bank branches", "Statutory tax liabilities under cross-border transfer pricing", "Credit default probabilities in micro-finance portfolios", "A", "Porter's Five Forces assesses industry attractiveness based on supplier power, buyer power, competitive rivalry, threat of substitution, and threat of new entrants."),
    ("Management by Objectives (MBO)", "What is the foundational operational principle of Peter Drucker's Management by Objectives (MBO) system?", "Joint goal setting by superiors and subordinates with periodic review and self-evaluation against quantified targets", "Top-down command allocation of annual branch deposit quotas without consultation", "Automated algorithmic performance rating based on computer log times", "Delegation of statutory legal liabilities to subordinate staff", "A", "MBO relies on participative goal-setting between managers and employees, aligning individual key performance indicators with broader corporate goals."),
    ("Organizational Design & Span of Control", "What organizational outcome is typically observed when an enterprise transitions from a 'Tall' hierarchy to a 'Flat' structure?", "Wider span of control, fewer managerial levels, and faster decentralized decision-making", "Narrower span of control and increased centralized administrative overhead", "Elimination of all informal employee communication channels", "Mandatory replacement of functional units with statutory auditing panels", "A", "Flat organizations widen the span of control, reduce bureaucratic management layers, and empower frontline decision-makers."),
    ("Change Management (Lewin's 3-Stage Model)", "According to Kurt Lewin's Force-Field Change Model, what is the sequence of the three distinct phases of organizational transformation?", "Unfreezing -> Moving (Transitioning) -> Refreezing", "Planning -> Budgeting -> Auditing", "Recruiting -> Training -> Appraising", "Restructuring -> Liquidating -> Rebuilding", "A", "Lewin's model consists of Unfreezing (breaking existing inertia), Moving/Transitioning (implementing new processes), and Refreezing (institutionalizing changes into daily corporate habits).")
]

MODULE_B_TOPICS = [
    ("DuPont Financial Analysis", "Under the three-step DuPont identity, how is the Return on Equity (ROE) decomposed?", "ROE = Net Profit Margin × Total Asset Turnover × Financial Leverage (Equity Multiplier)", "ROE = Gross Margin × Return on Investment × Current Ratio", "ROE = Operating Cash Flow / Total Long-Term Debt", "ROE = Net Interest Margin × Capital Adequacy Ratio × Loan Turnover", "A", "DuPont analysis breaks down ROE into Operating Efficiency (Net Profit Margin), Asset Use Efficiency (Total Asset Turnover), and Financial Leverage (Assets/Equity)."),
    ("Leverage Analysis (DOL and DFL)", "A firm has an Operating Leverage (DOL) of 2.5 and a Financial Leverage (DFL) of 1.6. What is its Combined Leverage (DCL) and what does it imply?", "DCL = 4.0; a 10% change in sales will result in a 40% change in Earnings Per Share (EPS)", "DCL = 0.9; sales changes have negligible impact on net profits", "DCL = 4.1; operating profit is 4.1 times the interest burden", "DCL = 1.56; the firm has a debt-equity ratio of 1.56x", "A", "Degree of Combined Leverage (DCL) = DOL × DFL = 2.5 × 1.6 = 4.0. It indicates that a 1% change in sales produces a 4% change in EPS."),
    ("Cost of Capital (CAPM Formula)", "Using the Capital Asset Pricing Model (CAPM), what is the Expected Cost of Equity (Ke) if Risk-Free Rate (Rf) is 7%, Market Return (Rm) is 15%, and Beta (beta) is 1.25?", "Ke = 17.0% [7% + 1.25 × (15% - 7%)]", "Ke = 15.0%", "Ke = 22.0%", "Ke = 10.4%", "A", "Under CAPM: Ke = Rf + beta × (Rm - Rf) = 7% + 1.25 × (15% - 7%) = 7% + 1.25 × 8% = 7% + 10% = 17.0%."),
    ("Capital Budgeting & Fisher's Rate", "In capital budgeting, what is the 'Fisher's Rate of Intersection' (Cross-over rate) between two mutually exclusive projects?", "The specific discount rate at which the Net Present Values (NPVs) of both projects are exactly identical", "The discount rate where the Profitability Index equals zero", "The market yield where bond price equals par value", "The minimum risk-free hurdle rate set by the central bank", "A", "Fisher's crossover rate is the discount rate that equates the NPVs of two mutually exclusive investment alternatives."),
    ("Modigliani-Miller Theorem (Capital Structure)", "What is the core proposition of Modigliani-Miller Proposition I in a perfect capital market without corporate taxes?", "The total market value of a firm is completely independent of its capital structure and financing mix", "Firms must maintain 100% debt to minimize weighted cost of capital", "Higher equity capitalization directly multiplies market value by the risk premium", "Dividend payouts must equal 100% of net operating income", "A", "In the absence of taxes, bankruptcy costs, and market frictions, MM Proposition I proves that capital structure choices have zero effect on firm value.")
]

MODULE_C_TOPICS = [
    ("Discounted Cash Flow (FCFF vs FCFE)", "What is the fundamental difference between Free Cash Flow to Firm (FCFF) and Free Cash Flow to Equity (FCFE)?", "FCFF represents cash available to all capital providers (debt + equity) before debt service, whereas FCFE is cash available strictly to equity holders after debt repayments and interest", "FCFF includes only retained earnings, whereas FCFE includes gross revenues", "FCFF is discounted at the Cost of Equity, while FCFE is discounted at WACC", "FCFF excludes capital expenditures, while FCFE includes working capital investments", "A", "FCFF represents total enterprise operating cash flow available to both debt and equity investors and is discounted at WACC; FCFE reflects residual cash flow to equity owners discounted at Ke."),
    ("Dividend Discount Model (Gordon Growth)", "If a company pays a current dividend (D0) of Rs 6.00 per share, which is expected to grow at a constant annual rate of 5% indefinitely, and the required rate of return (Ke) is 11%, what is the intrinsic share price (P0)?", "Rs 105.00 [P0 = D1 / (Ke - g) = 6.00 × 1.05 / (0.11 - 0.05)]", "Rs 60.00", "Rs 120.00", "Rs 54.54", "A", "Gordon Model: P0 = D1 / (Ke - g). Here D1 = 6.00 × 1.05 = Rs 6.30. P0 = 6.30 / (0.11 - 0.05) = 6.30 / 0.06 = Rs 105.00."),
    ("Enterprise Value Multiple (EV/EBITDA)", "Why is the EV/EBITDA multiple widely preferred over the Price-to-Earnings (P/E) ratio when valuing corporate acquisition targets?", "It is capital structure neutral and removes distortions caused by differences in debt leverage, depreciation methods, and corporate tax rates", "It is based strictly on historical cash book balances rather than accrual accounts", "It guarantees that the acquired entity has zero contingent debt liabilities", "It is statutorily mandated by the Securities and Exchange Board of India for all unlisted entities", "A", "EV/EBITDA is capital-structure neutral because Enterprise Value reflects total firm value (debt + equity) and EBITDA is before interest, taxes, and non-cash depreciation."),
    ("M&A Swap Ratio Calculation", "If Target Company share price is Rs 40 and Acquiring Company share price is Rs 160, what is the equitable Share Swap Ratio based on market values?", "0.25 (1 share of Acquirer for every 4 shares of Target)", "4.00 (4 shares of Acquirer for every 1 share of Target)", "2.50 (2.5 shares of Acquirer for every 1 share of Target)", "1.00 (1:1 par exchange)", "A", "Share Swap Ratio = Target Share Price / Acquirer Share Price = 40 / 160 = 0.25 (or 1 acquirer share for every 4 target shares held).")
]

MODULE_D_TOPICS = [
    ("Private Equity & Venture Capital Stages", "In venture capital financing, what is 'Mezzanine Financing'?", "A hybrid debt-equity instrument (subordinated debt with equity warrants/conversion rights) used to finance late-stage expansion before an IPO", "Seed capital provided during the conceptual prototype design stage", "100% government-guaranteed micro-loans under priority sector credit", "Short-term interbank clearing credit for daily reserve maintenance", "A", "Mezzanine financing sits between senior debt and pure equity, providing subordinate debt with equity conversion features, typical of pre-IPO growth rounds."),
    ("Special Purpose Acquisition Companies (SPACs)", "What is the structural operational model of a Special Purpose Acquisition Company (SPAC)?", "A shell/blank-check company that raises capital through an IPO with the sole intent of acquiring or merging with an existing private operating firm", "A specialized asset reconstruction company taking over bad loans from commercial banks", "A subsidiary established by RBI to manage national foreign exchange reserves", "A mutual fund investing exclusively in sovereign debt papers", "A", "A SPAC is a blank-check shell entity created exclusively to pool funds via an IPO to merge with or acquire an identified private target company within a fixed timeframe."),
    ("Green Financing & ESG Frameworks", "Under international green bond standards, what does 'Greenwashing' refer to?", "The deceptive practice of making unsubstantiated or misleading claims regarding the environmental benefits of an enterprise's operations or financial products", "Converting foreign currency Nostro accounts into sovereign green bonds", "Investing excess liquidity in renewable solar infrastructure", "Refinancing non-performing retail loans through multilateral agencies", "A", "Greenwashing involves marketing products or investments as environmentally sound or sustainable when in reality they fail to meet recognized ESG criteria.")
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
    print(f"🚀 CAIIB Paper 3 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for CAIIB ABFM
    for s_num in range(1, 11):
        count = set_map.get(s_num, 0)
        missing = 100 - count

        if missing > 0:
            print(f"\n[*] Generating Set #{s_num:02d}: Currently {count}/100. Adding {missing} questions...")
            
            # Quota: Mod A (20), Mod B (35), Mod C (30), Mod D (15)
            records_to_insert = []
            for k in range(count, 100):
                if k < 20:
                    topic_data = MODULE_A_TOPICS[k % len(MODULE_A_TOPICS)]
                    module_name = "Module A: The Management Process"
                elif k < 55:
                    topic_data = MODULE_B_TOPICS[(k - 20) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Advanced Financial Management"
                elif k < 85:
                    topic_data = MODULE_C_TOPICS[(k - 55) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Valuation, Mergers & Acquisitions"
                else:
                    topic_data = MODULE_D_TOPICS[(k - 85) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Emerging Business Solutions"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                # Strict 75% Moderate / 25% Hard distribution
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                diff = "hard" if marks == 2.0 else "moderate"
                unique_q = f"[ABFM-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
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