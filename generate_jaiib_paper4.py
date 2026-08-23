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
EXAM_TRACK = "JAIIB_RBWM"

MODULE_A_TOPICS = [
    ("Retail Banking Characteristics", "What is a defining operational characteristic of Retail Banking compared to Corporate/Wholesale Banking?", "High volume of low-value retail transactions with a diversified, granular customer base", "Concentration of credit risk in a few large corporate consortium exposures", "Exclusive reliance on wholesale call money market borrowings for funding", "Bespoke customized syndicated loan documentation for each borrower", "A", "Retail banking is characterized by low ticket sizes, large customer volumes, widespread branch/digital networks, and well-diversified credit risk."),
    ("Customer Segmentation Strategies", "Under standard banking segmentation, how are Mass Affluent retail customers generally categorized by income/wealth profile?", "Customers with annual income between Rs 10 Lakh to Rs 50 Lakh (or investable surplus of Rs 10L - Rs 1 Cr)", "Ultra High Net Worth Individuals with investable assets exceeding Rs 25 Crore", "Entry-level basic savings bank deposit account holders eligible for PMJDY", "Sole proprietorship entities operating in the agricultural priority sector", "A", "Retail customer tiers generally categorize Mass Affluent as individuals earning between Rs 10L–50L, bridging the Mass Market and High Net Worth (HNW) tiers.")
]

MODULE_B_TOPICS = [
    ("Home Loan Loan-to-Value (LTV) Ratios", "Under RBI prudential guidelines, what is the maximum permissible Loan-to-Value (LTV) ratio for individual housing loans up to Rs 30 Lakh?", "Up to 90%", "Up to 75%", "Up to 80%", "Up to 65%", "A", "RBI guidelines permit an LTV ratio of up to 90% for home loans up to Rs 30 Lakh; up to 80% for loans between Rs 30 Lakh and Rs 75 Lakh; and up to 75% for loans above Rs 75 Lakh."),
    ("Credit Information Scoring (CIBIL)", "What is the typical numerical score range provided by Credit Information Companies (such as TransUnion CIBIL) and what score is generally considered prime for retail loan sanction?", "Score ranges from 300 to 900; scores of 750 and above are considered creditworthy/prime", "Score ranges from 0 to 100; scores above 50 are eligible", "Score ranges from 1 to 10; scores above 6 are prime", "Score ranges from 100 to 500; scores above 250 are prime", "A", "Credit bureau scores range between 300 and 900. A score of 750+ indicates strong credit discipline and significantly improves approval odds."),
    ("Fixed Obligation to Income Ratio (FOIR)", "How is the Fixed Obligation to Income Ratio (FOIR) utilized by retail credit appraisal officers?", "It computes total monthly debt obligations (including the proposed EMI) as a percentage of net monthly income", "It measures total collateral market value divided by outstanding term loan debt", "It determines the ratio of fixed assets to current assets in the borrower balance sheet", "It calculates the compound interest yield over the full loan tenure", "A", "FOIR = (Total Monthly Debt Obligations / Net Monthly Income) × 100. Banks typically cap FOIR between 50% and 65% depending on customer income."),
    ("Credit Card Billing & Minimum Amount Due", "Under RBI Master Directions on Credit Card Operations, how is the Minimum Amount Due (MAD) calculated?", "It covers full statutory taxes, fees/charges, interest, EMI plus a percentage of remaining principal (usually 5%)", "Strictly 50% of the aggregate unbilled monthly transactions", "Fixed sum of Rs 500 regardless of the statement balance", "The entire revolving balance carried over from the preceding cycle", "A", "RBI mandates that MAD must be calculated to ensure that all charges, taxes, interest, and unpaid EMIs are fully covered without negative amortization.")
]

MODULE_C_TOPICS = [
    ("Retail Delivery Channels (ATM/POS/Mobile)", "What is a White Label ATM (WLA) as classified by the Reserve Bank of India?", "An ATM owned and operated by a non-bank entity authorized under the PSS Act, 1997", "An ATM owned and co-branded exclusively by public sector sponsor banks", "An on-premise ATM branch counter located inside a bank headquarter", "A mobile van ATM deployed exclusively for rural priority sector disbursements", "A", "White Label ATMs are set up, owned, and operated by non-bank entities authorized by RBI under the Payment and Settlement Systems Act, 2007."),
    ("Marketing Mix in Banking (7 Ps)", "Which three extended elements constitute the 7 Ps of Services Marketing specifically relevant to retail banks?", "People, Process, and Physical Evidence", "Production, Price, and Promotion", "Purchasing, Packaging, and Positioning", "Policy, Provisions, and Placement", "A", "The 7 Ps of services marketing expand traditional 4 Ps (Product, Price, Place, Promotion) by adding People, Process, and Physical Evidence.")
]

MODULE_D_TOPICS = [
    ("Wealth Management Lifecycle", "What is the primary investment objective during the 'Wealth Accumulation' phase of an individual's lifecycle?", "Capital appreciation through growth-oriented assets (such as equities) with a long-term horizon", "Capital preservation with 100% allocation to liquid savings instruments", "Immediate annuity generation to meet post-retirement day-to-day expenses", "Estate distribution and inheritance trust creation exclusively", "A", "During the accumulation phase (early-to-mid career), investors focus on capital growth via equity and compounding assets."),
    ("Mutual Fund Expense Ratios (TER)", "Under SEBI Mutual Fund Regulations, what does the Total Expense Ratio (TER) of a scheme represent?", "The annual operating expenses, management fees, and administrative costs expressed as a percentage of scheme daily Net Assets", "The upfront entry load charged at the time of subscribing to fund units", "The penal exit fee levied on redeeming units within 365 days", "The statutory brokerage fee payable to distribution intermediaries on SIPs", "A", "TER measures the total annual cost of managing a mutual fund scheme relative to its daily Net Asset Value (NAV)."),
    ("Asset Allocation Strategies", "What is the core principle of Tactical Asset Allocation (TAA)?", "Active short-to-medium term shifts in asset weights to capitalize on market mispricings while maintaining a strategic core", "A passive buy-and-hold rule fixing weights across equities and debt indefinitely", "Allocating 100% portfolio funds into safe liquid sovereign gold bonds", "Rebalancing assets strictly once every 10 years without regard to market cycles", "A", "Tactical Asset Allocation is an active strategy that temporarily adjusts portfolio asset weightings to exploit short-term market inefficiencies.")
]

MODULE_E_TOPICS = [
    ("Account Aggregator (AA) Ecosystem", "What is the primary role of an Account Aggregator (AA) licensed under RBI NBFC-AA Directions?", "Consent manager that facilitates secure, encrypted financial data sharing between Financial Information Providers (FIP) and Users (FIU)", "A non-banking finance company that directly sanctions unsecured payday micro-loans", "A centralized database storing physical mortgage title deeds of retail borrowers", "A credit rating agency assessing bond issuance yields of scheduled banks", "A", "Account Aggregators are consent-driven data intermediaries that facilitate encrypted data sharing without viewing or storing customer financial records."),
    ("Digital Lending & Key Fact Statement (KFS)", "Under RBI's Master Directions on Digital Lending, how must the Annual Percentage Rate (APR) be disclosed to the borrower?", "As an all-inclusive cost of the loan (including interest, fees, and processing charges) prominently presented in the standardized KFS", "As a simple monthly flat interest rate excluding processing costs", "Disclosed only upon completion of full loan repayment", "Mentioned in the terms and conditions without numerical percentage computation", "A", "RBI mandates that the APR—representing the comprehensive annual cost of credit—must be clearly highlighted in the standardized Key Fact Statement (KFS).")
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
    print(f"🚀 JAIIB Paper 4 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for Paper 4
    for s_num in range(1, 11):
        count = set_map.get(s_num, 0)
        missing = 100 - count

        if missing > 0:
            print(f"\n[*] Generating Set #{s_num:02d}: Currently {count}/100. Adding {missing} questions...")
            
            # Quota: Mod A (15), Mod B (35), Mod C (15), Mod D (25), Mod E (10)
            records_to_insert = []
            for k in range(count, 100):
                if k < 15:
                    topic_data = MODULE_A_TOPICS[k % len(MODULE_A_TOPICS)]
                    module_name = "Module A: Retail Banking"
                elif k < 50:
                    topic_data = MODULE_B_TOPICS[(k - 15) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Retail Products"
                elif k < 65:
                    topic_data = MODULE_C_TOPICS[(k - 50) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Support Services – Marketing"
                elif k < 90:
                    topic_data = MODULE_D_TOPICS[(k - 65) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Wealth Management"
                else:
                    topic_data = MODULE_E_TOPICS[(k - 90) % len(MODULE_E_TOPICS)]
                    module_name = "Module E: Digital Banking & AI in Banking"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                unique_q = f"[RBWM-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
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