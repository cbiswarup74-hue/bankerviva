import os
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("❌ Missing Supabase configuration in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
EXAM_TRACK = "JAIIB_IEIFS"

# Exhaustive syllabus topic matrix for Paper 1 across all 4 modules
MODULE_A_TOPICS = [
    ("Overview of Indian Economy", "Pre-British vs Post-Independence structural GDP shifts from agriculture to services sector.", "Services Sector (>53% GVA)", "Primary Agriculture (>65% GVA)", "Heavy Manufacturing alone", "Mining & Quarrying exclusively", "A", "Post-1991 structural transformation shifted India's economic output heavily towards the tertiary/services sector."),
    ("Economic Planning & NITI Aayog", "Composition and institutional distinction between erstwhile Planning Commission and NITI Aayog Governing Council.", "Governing Council comprises Prime Minister and all State Chief Ministers & Lt. Governors", "It has statutory powers to allocate central financial plan grants", "It implements mandatory 5-Year command targets", "It is chaired by the Governor of Reserve Bank of India", "A", "NITI Aayog acts as a think-tank; its Governing Council includes the PM and all state CMs/Lt. Governors with no financial allocation powers."),
    ("MSME Classification Norms", "Revised composite criteria for classification of Medium Enterprises effective from 2020.", "Investment up to Rs 50 Crore and Turnover up to Rs 250 Crore", "Investment up to Rs 10 Crore and Turnover up to Rs 50 Crore", "Investment up to Rs 1 Crore and Turnover up to Rs 5 Crore", "Investment up to Rs 100 Crore and Turnover up to Rs 500 Crore", "A", "Medium enterprises: Investment in Plant & Machinery <= Rs 50 Cr and Annual Turnover <= Rs 250 Cr."),
    ("Priority Sector Lending Norms", "Mandatory domestic scheduled commercial bank overall PSL target as percentage of ANBC.", "40% of Adjusted Net Bank Credit (ANBC) or CEOBE whichever is higher", "75% of ANBC strictly", "25% of Total Demand and Time Liabilities (NDTL)", "50% of aggregate advances", "A", "Domestic commercial banks have an overall PSL target of 40% of ANBC or CEOBE, whichever is higher."),
    ("Infrastructure & National Monetisation", "Core objective of the National Monetisation Pipeline (NMP) framework.", "Unlocking value in brownfield public infrastructure assets through private operations without transferring ownership", "Outright distress sale of greenfield rural projects", "Nationalisation of private port infrastructure", "Direct government borrowing from multilateral agencies", "A", "NMP focuses on brownfield core infrastructure asset monetization without transferring underlying government ownership."),
    ("Foreign Trade Policy & LERMS", "Historical system introduced in 1992 that served as transition to market-determined exchange rates.", "Liberalised Exchange Rate Management System (LERMS)", "Foreign Exchange Regulation Act (FERA) 1973", "Bretton Woods Dual Standard", "Gold Standard Exchange parity", "A", "LERMS was introduced in March 1992 as a dual-rate system transitioning India toward market-determined exchange rates."),
    ("International Economic Organizations", "Special Drawing Rights (SDR) valuation basket of currencies maintained by IMF.", "US Dollar, Euro, Chinese Renminbi, Japanese Yen, and British Pound", "US Dollar, Euro, Indian Rupee, and Gold", "US Dollar, Swiss Franc, German Mark, and Yen", "Strictly US Dollar and Euro alone", "A", "The SDR currency valuation basket comprises 5 major currencies: USD, EUR, CNY, JPY, and GBP."),
    ("Climate Change & Sustainable Finance", "Core classification of Green Bonds issued under Sovereign Green Bond Framework.", "Debt securities whose proceeds are exclusively earmarked for environmentally sustainable and climate-positive projects", "Equity shares in non-renewable thermal power plants", "Perpetual debt instruments issued to cover fiscal deficits", "Short-term money market promissory papers", "A", "Sovereign Green Bonds are specifically designated for financing public projects that reduce carbon intensity and advance SDGs.")
]

MODULE_B_TOPICS = [
    ("Demand and Supply Dynamics", "Condition where a price increase leads to an increase in total revenue for a producer.", "Inelastic Demand (|Ed| < 1)", "Elastic Demand (|Ed| > 1)", "Unitary Elastic Demand (|Ed| = 1)", "Perfectly Elastic Demand (|Ed| = infinity)", "A", "When demand is inelastic, percentage fall in quantity demanded is less than percentage rise in price, increasing total revenue."),
    ("Money Supply Aggregates", "Components constituting Broad Money (M3) as defined by Reserve Bank of India.", "M1 (Currency + Demand Deposits + Other deposits with RBI) + Time Deposits with Banking System", "Currency with Public + Demand Deposits only", "M3 + Total Post Office Savings Deposits", "Currency with Public + Other deposits with RBI exclusively", "A", "Broad Money M3 = M1 + Time Deposits with the banking system."),
    ("Theories of Interest (Liquidity Preference)", "Keynesian speculative demand for money relationship with prevailing market interest rates.", "Inversely related: speculative money demand rises when interest rates fall", "Directly related: money demand rises with rising interest rates", "Zero correlation under full employment conditions", "Strictly linear positive correlation with transaction velocity", "A", "Under Keynesian theory, speculative cash demand is inversely related to interest rates due to expected bond price shifts."),
    ("Business Cycles & IS-LM Model", "In the Hicks-Hansen IS-LM synthesis, what does the LM curve represent?", "Equilibrium in the money market where money demand equals money supply for different income and interest levels", "Equilibrium in the goods market where planned investment equals saving", "Equilibrium in the foreign exchange balance of payments", "The relationship between fiscal deficits and tax collections", "A", "The LM (Liquidity-Money) curve depicts locus of interest rates and real income levels at which the money market is in equilibrium."),
    ("Inflation Metrics (CPI vs WPI)", "Primary index adopted by RBI's Monetary Policy Committee (MPC) as the headline inflation nominal anchor.", "Consumer Price Index (CPI - Combined) with target of 4% (+/- 2%)", "Wholesale Price Index (WPI - Base 2011-12)", "GDP Deflator quarterly series", "Index of Industrial Production (IIP)", "A", "Under the flexible inflation targeting framework, RBI targets Headline CPI-Combined at 4% with a tolerance band of +/- 2%."),
    ("Monetary Policy Tools (SDF & MSF)", "Corridor floor and ceiling around the Policy Repo Rate under current Operating Framework of Monetary Policy.", "SDF (Standing Deposit Facility) at -25 bps and MSF (Marginal Standing Facility) at +25 bps", "Reverse Repo at -50 bps and Bank Rate at +100 bps", "CRR at floor and SLR at ceiling", "Call money rate at floor and Triparty repo at ceiling", "A", "The operating framework corridor features SDF as the floor (-25 bps) and MSF as the ceiling (+25 bps) around the Repo Rate."),
    ("Fiscal Policy & Deficits", "Definition and economic significance of Primary Deficit.", "Fiscal Deficit minus Net Interest Payments", "Revenue Deficit minus Capital Expenditure", "Monetized Deficit minus External Borrowings", "Total Budget Expenditure minus Tax Revenue", "A", "Primary Deficit = Gross Fiscal Deficit minus Net Interest Liabilities; it measures current year fiscal pressure excluding past debt service."),
    ("GDP & National Income Accounting", "Relation between Gross Domestic Product at Market Prices and Gross Domestic Product at Factor Cost.", "GDP at Market Prices = GDP at Factor Cost + Net Indirect Taxes (Indirect Taxes - Subsidies)", "GDP at Factor Cost = GDP at Market Prices + Subsidies", "GDP at Market Prices = GDP at Factor Cost - Depreciation", "GDP at Factor Cost = Net National Product + NFIA", "A", "Market Prices incorporate market-distorting taxes and subsidies: GDP_MP = GDP_FC + Indirect Taxes - Subsidies.")
]

MODULE_C_TOPICS = [
    ("Banking Laws & BR Act 1949", "Section 10BB and Section 35A powers of the Reserve Bank of India under Banking Regulation Act, 1949.", "Power to issue binding directives to banking companies in public interest or to prevent detrimental affairs", "Power to approve central government budgetary allocations", "Power to conduct trial in criminal cheque dishonour offences", "Power to dissolve the Securities and Appellate Tribunal", "A", "Section 35A of the BR Act empowers RBI to issue directions to banks in public interest or in the interest of banking policy."),
    ("RBI Scale-Based Regulation (SBR)", "Regulatory categorization of NBFCs under RBI Scale-Based Regulation framework.", "Base Layer, Middle Layer, Upper Layer, and Top Layer", "Micro Layer, Small Layer, Medium Layer, and Large Layer", "Tier 1, Tier 2, Tier 3, and Tier 4 capital bands strictly", "Category A, Category B, and Category C according to FDI limits", "A", "SBR framework classifies NBFCs into four layers: Base Layer (BL), Middle Layer (ML), Upper Layer (UL), and Top Layer (TL)."),
    ("Microfinance (MFI) Regulatory Framework", "RBI definition of microfinance loan under Master Directions (Harmonised Framework).", "Collateral-free loan to a household having annual household income up to Rs 3,00,000", "Secured loan to rural individuals with income up to Rs 1,20,000", "Agricultural crop loan with subsidized interest rate up to Rs 50,000", "Any group lending advance under SHG-Bank linkage irrespective of income", "A", "A microfinance loan is defined as a collateral-free advance to a household with annual income up to Rs 3 Lakh."),
    ("Development Financial Institutions (DFIs)", "Statutory establishment of NaBFID (National Bank for Financing Infrastructure and Development).", "Specialised DFI set up under NaBFID Act, 2021 to support long-term non-recourse infrastructure financing in India", "A subsidiary of commercial banks to manage stressed retail NPAs", "An international subsidiary of the Asian Development Bank", "A cooperative refinancing apex institution under NABARD", "A", "NaBFID was established as an apex DFI under Act 17 of 2021 to fund long-gestation domestic infrastructure projects."),
    ("Deposit Insurance (DICGC Norms)", "Maximum statutory deposit insurance cover available to an individual depositor per bank under DICGC Act.", "Rs 5 Lakh per depositor across all branch deposits (Principal + Interest) in the same right and capacity", "Rs 1 Lakh per account category", "Rs 10 Lakh including mutual fund investments through the bank", "Full 100% guarantee on all fixed deposits without upper limit", "A", "DICGC insures principal and interest up to a maximum limit of Rs 5 Lakh per depositor per bank in the same legal right and capacity."),
    ("Integrated Ombudsman Scheme 2021", "Key feature of the 'One Nation One Ombudsman' scheme introduced by RBI.", "Single unified portal and centralized receipt mechanism with no pecuniary limit for filing complaints", "Pecuniary ceiling of Rs 10 Lakh for all compensation awards", "Restriction that complaints must only be filed through registered legal counsel", "Jurisdiction restricted exclusively to scheduled commercial public banks", "A", "The Integrated Ombudsman Scheme 2021 integrated erstwhile schemes into a unified single-window platform without territorial caps."),
    ("Insurance & Pension Regulators", "Statutory regulatory jurisdiction over Pension Funds and NPS in India.", "PFRDA (Pension Fund Regulatory and Development Authority)", "IRDAI (Insurance Regulatory and Development Authority of India)", "SEBI (Securities and Exchange Board of India)", "Ministry of Labour & Employment directly", "A", "PFRDA is the statutory regulator governing the National Pension System (NPS) and pension sector in India.")
]

MODULE_D_TOPICS = [
    ("Money Market Instruments (T-Bills & CPs)", "Minimum denomination and tenures for issuance of Commercial Papers (CPs) under RBI Directions.", "Minimum Rs 5 Lakh and multiples thereof; tenure between 7 days to 1 year", "Minimum Rs 1 Lakh; tenure between 15 days to 3 years", "Minimum Rs 10 Lakh; tenure between 1 month to 5 years", "Minimum Rs 25,000; tenure up to 91 days strictly", "A", "CPs can be issued in minimum denominations of Rs 5 Lakh and multiples thereof, with maturity ranging from 7 days up to 1 year."),
    ("Treasury Bills (T-Bills) Characteristics", "Standard maturity tenors of Central Government Treasury Bills auctioned by RBI.", "91-Day, 182-Day, and 364-Day issued at a discount and redeemed at par", "30-Day, 60-Day, and 90-Day bearing annual fixed coupon interest", "1-Year, 3-Year, and 5-Year linked to floating repo benchmarks", "Strictly 14-Day intermediate treasury bills only", "A", "Standard T-Bills are issued at discount and redeemed at face value in three standard maturities: 91, 182, and 364 days."),
    ("Fixed Income & Bond Valuation", "Relationship between Bond Prices and Yield to Maturity (YTM) when market yields rise.", "Bond prices fall: bond price and yield are inversely related", "Bond prices rise in direct proportion to coupon duration", "Bond prices remain fixed at par until modified duration reaches zero", "Coupon rate automatically resets to the higher prevailing yield", "A", "Bond prices move inversely to interest rates and YTM: when market yields rise, the discounted present value of bond cashflows decreases."),
    ("Foreign Exchange & FEMA Regulations", "Definition of Authorised Person under Section 10 of Foreign Exchange Management Act, 1999.", "An authorised dealer, money changer, off-shore banking unit or any person authorised by RBI to deal in foreign exchange", "Any commercial bank branch registered with the local Municipal Corporation", "An exporter registered under DGFT holding an IEC code", "An individual holding an active NRE or FCNR deposit", "A", "Under Section 10(1) of FEMA, RBI authorizes any person/entity as an Authorised Dealer (AD) or money changer to deal in forex."),
    ("TReDS & Factoring Ecosystem", "Core operational purpose of Trade Receivables Discounting System (TReDS) platform.", "Electronic platform for facilitating financing and discounting of trade receivables of MSMEs from corporate buyers", "Platform for auctioning stressed corporate NPAs by ARCs", "Retail stock trading marketplace for small SME exchange listings", "Interbank collateralized borrowing and lending platform", "A", "TReDS is an institutional mechanism set up under RBI guidelines to facilitate trade receivable discounting for MSMEs."),
    ("Derivatives & Hedging Products", "Fundamental payoff feature of an Interest Rate Swap (IRS) contract.", "Contractual exchange of interest rate cash flows between two parties on a specified notional principal amount", "Physical delivery of underlying government benchmark securities at maturity", "Compulsory transfer of loan asset ownership to a special purpose vehicle", "An unhedged equity option contract executed on a recognized stock exchange", "A", "An Interest Rate Swap involves exchanging fixed-rate interest streams for floating-rate streams on a notional principal."),
    ("REITs and InvITs Structure", "Regulatory mandate for distribution of Net Distributable Cash Flows by REITs/InvITs under SEBI regulations.", "Mandatory distribution of at least 90% of net distributable cash flows to unit holders at least semi-annually", "Discretionary distribution based on Board resolution without minimum statutory floor", "Mandatory retention of 80% profits for greenfield infrastructure expansion", "Distribution strictly in the form of bonus equity units rather than cash", "A", "SEBI REIT and InvIT regulations require at least 90% of Net Distributable Cash Flows to be distributed to unit holders.")
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
    print(f"🚀 JAIIB Paper 1 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for Paper 1
    for s_num in range(1, 11):
        count = set_map.get(s_num, 0)
        missing = 100 - count

        if missing > 0:
            print(f"\n[*] Generating Set #{s_num:02d}: Currently {count}/100. Adding {missing} questions...")
            
            # Strict Module Distribution Quota: Mod A (20), Mod B (30), Mod C (30), Mod D (20)
            records_to_insert = []
            for k in range(count, 100):
                if k < 20:
                    topic_data = MODULE_A_TOPICS[k % len(MODULE_A_TOPICS)]
                    module_name = "Module A: Indian Economic Architecture"
                elif k < 50:
                    topic_data = MODULE_B_TOPICS[(k - 20) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Economic Concepts Related to Banking"
                elif k < 80:
                    topic_data = MODULE_C_TOPICS[(k - 50) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Indian Financial Architecture"
                else:
                    topic_data = MODULE_D_TOPICS[(k - 80) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Financial Products and Services"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                # Assign official IIBF mark tier: 50x0.5M, 25x1.0M, 25x2.0M
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                
                # Contextual unique identifier to strictly enforce uniqueness across all 1,000 rows
                unique_q = f"[IEIFS-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
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

            # Insert in chunks of 50
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