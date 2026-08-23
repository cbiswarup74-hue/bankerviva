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
EXAM_TRACK = "JAIIB_AFM"

MODULE_A_TOPICS = [
    ("Accounting Concepts & Conventions", "Under which accounting convention is the principle 'anticipate no profit and provide for all possible losses' strictly applied in bank provisioning?", "Conservatism (Prudence) Convention", "Materiality Convention", "Consistency Convention", "Going Concern Concept", "A", "The Prudence (Conservatism) convention requires that revenues/profits are recognized only when realized, whereas all foreseeable liabilities and potential loan losses must be provided for."),
    ("Bank Reconciliation Statement (BRS)", "When preparing a BRS starting with an Overdraft Balance as per the Cash Book, how should cheques issued but not yet presented for payment be treated?", "Added to the Cash Book overdraft balance", "Deducted from the Cash Book overdraft balance", "Ignored until dishonour advice is received", "Credited directly to the Profit and Loss suspense account", "B", "Cheques issued reduce the cash book balance; since they have not yet cleared the bank, the bank overdraft is lower. To reconcile starting from cash book overdraft, deduct them."),
    ("Depreciation Accounting", "Under the Written Down Value (WDV) method of depreciation, how does the annual depreciation charge behave over the useful asset life?", "It decreases year after year as the book value of the asset declines", "It remains strictly constant throughout the entire asset life", "It increases progressively in proportion to annual inflation", "It drops to zero immediately at the end of year one", "A", "Under the WDV (reducing balance) method, a fixed percentage is applied to the declining net book value, resulting in decreasing depreciation amounts each successive year."),
    ("Rectification of Errors", "Which type of accounting error will NOT cause a disagreement in the Trial Balance?", "Compensating Error where an excess debit in one account is neutralized by an equal excess credit in another", "Single-sided casting error in the sales day book", "Posting an amount only to the debit side without a corresponding credit", "Omission to post an entry from journal to ledger", "A", "Compensating errors, errors of complete omission, and errors of principle do not affect the arithmetic agreement of the Trial Balance as debit equals credit.")
]

MODULE_B_TOPICS = [
    ("Banking Company Financial Statements", "Under the Third Schedule of the Banking Regulation Act, 1949 (Form A - Balance Sheet), under which Schedule are 'Deposits' classified?", "Schedule 3", "Schedule 1", "Schedule 4", "Schedule 9", "A", "Under Form A Balance Sheet format for Banks: Schedule 1 is Capital, Schedule 2 is Reserves & Surplus, Schedule 3 is Deposits, Schedule 4 is Borrowings, Schedule 5 is Other Liabilities."),
    ("Classification of Bank Advances", "Under Form A of the Third Schedule of the BR Act, 1949, under which Schedule are 'Advances' disclosed by a commercial bank?", "Schedule 9", "Schedule 6", "Schedule 7", "Schedule 11", "A", "In a commercial bank's Balance Sheet: Schedule 6 is Cash and Balances with RBI, Schedule 7 is Balances with other banks/money at call, Schedule 8 is Investments, Schedule 9 is Advances."),
    ("Revenue Recognition in Banks", "Under RBI guidelines and AS-9, when should interest on Non-Performing Assets (NPAs) be recognized by a bank?", "Strictly on cash realization basis only", "On accrual basis as soon as the interest invoice is raised", "On compound monthly accrual regardless of default", "Under deferred revenue expenditure over a 5-year period", "A", "Under RBI prudential norms and AS-9, income on NPAs cannot be recognized on accrual basis; it can only be recognized in the P&L when actually realized in cash."),
    ("Cash Flow Statements (AS-3)", "In the Cash Flow Statement of a Commercial Bank prepared under AS-3, where are customer deposit mobilization and loan disbursements classified?", "Operating Activities", "Financing Activities", "Investing Activities", "Extraordinary Non-operating Activities", "A", "For a banking enterprise, accepting deposits and extending loan advances constitute principal revenue-producing operational activities and are classified under Cash Flow from Operating Activities.")
]

MODULE_C_TOPICS = [
    ("Time Value of Money (TVM)", "What is the present value of an Ordinary Annuity of Rs 10,000 receivable annually for 3 years discounted at 10% per annum? [PVIFA(10%, 3) = 2.4869]", "Rs 24,869", "Rs 30,000", "Rs 27,355", "Rs 33,100", "A", "Present Value of Ordinary Annuity = Annuity Cash Flow × PVIFA(r, n) = 10,000 × 2.4869 = Rs 24,869."),
    ("Bond Valuation & Yield to Maturity", "If a bond with a face value of Rs 1,000 carries an annual coupon rate of 8% and is currently trading in the secondary market at a discount of Rs 950, what can be deduced about its Yield to Maturity (YTM)?", "The YTM is strictly greater than the 8% coupon rate", "The YTM is strictly less than the 8% coupon rate", "The YTM is exactly equal to the 8% coupon rate", "The YTM equals the risk-free Treasury bill rate", "A", "When a bond trades at a discount (market price < par value), the Yield to Maturity (YTM) is always higher than the stated coupon rate."),
    ("Capital Budgeting (NPV Rule)", "When comparing mutually exclusive investment proposals, which evaluation metric is considered theoretically superior because it directly measures absolute shareholder wealth creation?", "Net Present Value (NPV)", "Payback Period", "Accounting Rate of Return (ARR)", "Internal Rate of Return (IRR) without reinvestment parity", "A", "NPV is the gold standard in capital budgeting because it assumes cash flows are reinvested at the cost of capital and directly computes net economic value added."),
    ("Working Capital - Ratio Analysis", "How is the Quick Ratio (Acid-Test Ratio) computed from Current Assets and Current Liabilities?", "(Current Assets - Inventories - Prepaid Expenses) / Current Liabilities", "Total Current Assets / Total Current Liabilities", "(Current Assets + Long Term Debt) / Current Liabilities", "Cash and Bank Balances / Total Fixed Assets", "A", "Quick Ratio = Quick Assets / Current Liabilities, where Quick Assets = Current Assets minus illiquid inventories and prepaid items."),
    ("Debt-Service Coverage Ratio (DSCR)", "What does a Debt Service Coverage Ratio (DSCR) of 1.75x indicate to a credit sanctioning officer?", "Available operational cash flows are 1.75 times the aggregate interest and principal repayment obligations", "The company has 1.75 times more equity than total debt", "The borrower's current assets cover current liabilities by 175%", "Operating profit margin has grown by 75% over the base year", "A", "DSCR = (Net Profit after Tax + Depreciation + Interest on Term Debt) / (Interest on Term Debt + Principal Installments). A value of 1.75x shows strong repayment buffer.")
]

MODULE_D_TOPICS = [
    ("Marginal Costing & Break-Even Analysis", "If fixed costs are Rs 2,00,000 and the Profit-Volume (P/V) Ratio of a firm is 40%, what is the Break-Even Sales Turnover in Rupees?", "Rs 5,00,000", "Rs 8,00,000", "Rs 2,80,000", "Rs 4,00,000", "A", "Break-Even Point (in Sales Value) = Fixed Costs / P/V Ratio = 2,00,000 / 0.40 = Rs 5,00,000."),
    ("Margin of Safety (MoS)", "How is the Margin of Safety computed in marginal costing?", "Actual Sales minus Break-Even Sales (or Profit / P/V Ratio)", "Break-Even Sales minus Variable Costs", "Total Fixed Costs divided by Total Production Units", "Total Revenue divided by Direct Labour Hours", "A", "Margin of Safety represents the buffer zone above break-even: MoS = Actual Sales - Break-Even Sales = Profit / P/V Ratio."),
    ("Goods and Services Tax (GST) & Input Tax Credit", "Under the Indian GST framework, how is an Inter-State supply of goods and services taxed?", "Integrated GST (IGST) levied by the Central Government", "Central GST (CGST) and State GST (SGST) in equal halves by the destination State", "Customs Duty plus local Municipal Octroi only", "State GST (SGST) exclusively by the originating State", "A", "Under the GST architecture, all inter-state supplies of goods and services attract Integrated GST (IGST) administered centrally."),
    ("TDS Provisions for Banking Operations", "Under Section 194A of the Income Tax Act, 1961, what is the statutory threshold of interest on bank deposits for senior citizens above which TDS must be deducted?", "Rs 50,000 in a financial year", "Rs 40,000 in a financial year", "Rs 10,000 in a financial year", "Rs 1,00,000 in a financial year", "A", "Section 194A prescribes a TDS threshold on bank interest of Rs 50,000 for senior citizens (compared to Rs 40,000 for non-senior individual depositors).")
]

def fetch_existing():
    all_rows = []
    start = 0
    while True:
        res = supabase.table("questions").select("id, cbt_set_number").eq("exam_type", EXAM_TRACK).range(start, start + 999).execute()
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < 1000:
            break
        start += 1000
    return all_rows

def main():
    print("==================================================")
    print(f"🚀 JAIIB Paper 3 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for Paper 3
    for s_num in range(1, 11):
        count = set_map.get(s_num, 0)
        missing = 100 - count

        if missing > 0:
            print(f"\n[*] Generating Set #{s_num:02d}: Currently {count}/100. Adding {missing} questions...")
            
            # Strict AFM Quota: Mod A (25), Mod B (20), Mod C (35), Mod D (20)
            records_to_insert = []
            for k in range(count, 100):
                if k < 25:
                    topic_data = MODULE_A_TOPICS[k % len(MODULE_A_TOPICS)]
                    module_name = "Module A: Accounting Principles and Processes"
                elif k < 45:
                    topic_data = MODULE_B_TOPICS[(k - 25) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Financial Statements and Core Banking Systems"
                elif k < 80:
                    topic_data = MODULE_C_TOPICS[(k - 45) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Financial Management"
                else:
                    topic_data = MODULE_D_TOPICS[(k - 80) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Taxation & Fundamentals of Costing"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                unique_q = f"[AFM-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
                record = {
                    "exam_type": EXAM_TRACK,
                    "module": module_name,
                    "difficulty": "moderate" if marks <= 1.0 else "hard",
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