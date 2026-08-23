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
EXAM_TRACK = "CAIIB_ABM"

MODULE_A_TOPICS = [
    ("Central Limit Theorem & Sampling", "Under the Central Limit Theorem (CLT), as the sample size (n) becomes sufficiently large (usually n >= 30), what happens to the sampling distribution of the sample mean?", "It approximates a Normal Distribution regardless of the shape of the underlying parent population distribution", "It strictly follows a Student t-distribution with n-1 degrees of freedom", "It exhibits strong positive skewness directly proportional to sample variance", "It converts into a discrete Poisson probability distribution", "A", "The Central Limit Theorem states that the distribution of sample means approaches a normal distribution as sample size grows large (n >= 30), irrespective of population shape."),
    ("Standard Error of the Mean", "If a bank audit sample of 100 loan files yields a population standard deviation (sigma) of Rs 50,000, what is the Standard Error of the Mean (sigma_x)?", "Rs 5,000", "Rs 500", "Rs 50,000", "Rs 10,000", "A", "Standard Error of the Mean = sigma / sqrt(n) = 50,000 / sqrt(100) = 50,000 / 10 = Rs 5,000."),
    ("Probability Distributions (Normal Curve)", "In a standard normal distribution (Z-distribution), what percentage of total observations lie within plus or minus 1.96 standard deviations from the mean?", "Approximately 95.0% (leaving 2.5% in each tail)", "Exactly 68.26%", "Approximately 99.73%", "Exactly 90.0%", "A", "In a normal curve: Mean +/- 1 sigma covers 68.26%, Mean +/- 1.96 sigma covers 95.0%, and Mean +/- 3 sigma covers 99.73%."),
    ("Correlation & Coefficient of Determination", "If the Pearson Correlation Coefficient (r) between commercial loan defaults and local unemployment rates is +0.80, what is the Coefficient of Determination (r^2)?", "0.64 (indicating 64% of variation in defaults is explained by unemployment)", "0.80 (indicating 80% explanatory power)", "1.60 (indicating high regression variance)", "0.20 (indicating low model fit)", "A", "Coefficient of Determination (r^2) = (0.80)^2 = 0.64, meaning 64% of the total variance in the dependent variable is explained by the independent variable."),
    ("Time Series Analysis (Secular Trend)", "Which component of a time series reflects long-term smooth, sustained upward or downward movements over an extended horizon of several decades?", "Secular Trend (T)", "Seasonal Variation (S)", "Cyclical Fluctuations (C)", "Irregular/Random Variations (I)", "A", "The secular trend measures long-term progressive growth or decline in a time series over multi-year horizons.")
]

MODULE_B_TOPICS = [
    ("Theories of Motivation (Herzberg's Two-Factor)", "Under Herzberg's Motivation-Hygiene Theory, which of the following is classified as a true 'Motivator' (Intrinsic factor) rather than a 'Hygiene' factor?", "Challenging work and personal sense of achievement", "Company working conditions and physical infrastructure", "Salary structure and regular dearness allowance increments", "Job security and administrative supervisory policies", "A", "Herzberg distinguished hygiene factors (salary, policy, conditions—which prevent dissatisfaction) from motivators (recognition, responsibility, growth—which create active job satisfaction)."),
    ("Performance Appraisal (360-Degree Feedback)", "What constitutes a 360-degree performance appraisal system in commercial banking institutions?", "Evaluation of an employee's performance based on feedback gathered from superiors, peers, subordinates, and internal/external customers", "Appraisal conducted exclusively by the Regional HR Head during annual branch inspections", "Automated algorithmic scoring based strictly on monthly CASA deposit mobilizations", "Peer evaluation restricted to staff in the same pay grade", "A", "360-degree feedback gathers multidirectional performance assessments from supervisors, colleagues, subordinates, and clients."),
    ("Conflict Resolution Strategies (Thomas-Kilmann Model)", "Under the Thomas-Kilmann Conflict Mode Instrument, which approach represents high assertiveness combined with high cooperativeness aiming for a win-win resolution?", "Collaborating Mode", "Avoiding Mode", "Accommodating Mode", "Competing Mode", "A", "Collaborating is assertive and cooperative (win-win), seeking integrative solutions that satisfy all parties' underlying concerns."),
    ("Assessment Centres & Competency Mapping", "What is the primary methodology employed in an Assessment Centre for identifying leadership competencies in bank officers?", "Multiple standardized behavioral simulations, in-basket exercises, role plays, and group discussions evaluated by multiple trained assessors", "Written multiple-choice testing on statutory banking legislation only", "Annual confidential reports (ACR) submitted by immediate branch managers", "Psychological personality profiling via single-stage interviews", "A", "Assessment Centres use a battery of behavioral simulations, case studies, and structured exercises scored by multiple independent assessors.")
]

MODULE_C_TOPICS = [
    ("Debt Service Coverage Ratio (DSCR) Computation", "A manufacturing borrower projects Net Profit after Tax of Rs 40 Lakh, Depreciation of Rs 20 Lakh, Interest on Term Loan of Rs 15 Lakh, and Principal Installment of Rs 25 Lakh. What is the Gross DSCR?", "1.875x", "1.250x", "2.100x", "1.500x", "A", "DSCR = (PAT + Depreciation + Interest) / (Interest + Principal) = (40 + 20 + 15) / (15 + 25) = 75 / 40 = 1.875x."),
    ("Working Capital Finance (Tandon Committee MPBF)", "Under the Second Method of Lending recommended by the Tandon Committee, how is the Maximum Permissible Bank Finance (MPBF) calculated?", "MPBF = 0.75 × (Total Current Assets) - Current Liabilities other than Bank Borrowings (OCL)", "MPBF = 0.75 × (Total Current Assets - Other Current Liabilities)", "MPBF = Total Current Assets - Current Liabilities - 10% Margin", "MPBF = 20% of Projected Gross Turnover", "A", "Under Tandon Method 2: Minimum Net Working Capital contribution is 25% of Total Current Assets. MPBF = 0.75(TCA) - OCL."),
    ("Insolvency and Bankruptcy Code (IBC 2016) Timelines", "Under Section 12 of the Insolvency and Bankruptcy Code, 2016, what is the statutory outer limit for completing the Corporate Insolvency Resolution Process (CIRP), including all extensions and litigation time?", "330 days from the insolvency commencement date", "180 days strictly", "270 days including a single 90-day extension", "540 days for manufacturing MSME units", "A", "CIRP must be completed within 180 days, extendable by 90 days (270 days total), with an absolute statutory cap of 330 days including legal proceedings."),
    ("SARFAESI Act 2002 (Enforcement of Security Interest)", "Under Section 13(2) of the SARFAESI Act, 2002, what is the mandatory notice period granted to a defaulting borrower to discharge their liabilities before the secured creditor can take possession?", "60 days from the date of the demand notice", "30 days from notice delivery", "90 days from NPA classification", "15 days after paper publication", "A", "Section 13(2) requires the secured creditor to serve a 60-day demand notice giving the borrower 60 days to discharge all liabilities in full."),
    ("Credit Rating & Probability of Default", "In bank internal risk rating models, what does the transition matrix (migration matrix) measure?", "The empirical probability of a borrower's credit rating migrating from one rating grade to another (or default) over a specified time horizon", "The velocity of funds moving through operative current accounts", "The correlation between branch profitability and staff turnover", "The depreciation schedule of mortgaged immovable assets", "A", "A credit rating migration matrix provides the historical probabilities of credit rating grades shifting upwards, downwards, or into default over a given period.")
]

MODULE_D_TOPICS = [
    ("Chief Compliance Officer (CCO) Regulatory Framework", "Under RBI guidelines on Compliance Function in Banks, what is the minimum fixed tenure mandated for the Chief Compliance Officer (CCO)?", "Minimum fixed tenure of not less than 3 years", "Minimum 1 year renewable annually by the CEO", "Permanent tenure until superannuation", "5 years with mandatory rotation every 18 months", "A", "RBI Master Directions require the CCO to have a fixed tenure of not less than 3 years to ensure operational independence."),
    ("Compliance Risk & Governance Structure", "What constitutes 'Compliance Risk' in commercial banking operations?", "Risk of legal or regulatory sanctions, material financial loss, or loss to reputation a bank may suffer as a result of failure to comply with laws, regulations, and codes of conduct", "Risk of counterparty default in overnight call money borrowing", "Risk arising from adverse market fluctuations in foreign currency forward contracts", "Risk of hardware failure in branch automated teller machines", "A", "Compliance Risk is the risk of legal or regulatory sanctions, financial loss, or reputational damage resulting from failure to adhere to statutory laws and industry codes."),
    ("Fraud Risk Management (RBI Master Directions)", "Under RBI directions, when must a banking fraud of Rs 1 Crore and above be reported to the Special Fraud Investigation Office (SFIO) / CBI / State Police?", "Immediately upon fraud classification, and reported to the Board/Audit Committee within statutory timelines", "Only after securing 100% recovery of the diverted loan capital", "At the close of the financial year during statutory audit review", "Within 3 years of civil suit institution before the DRT", "A", "Large frauds (>= Rs 1 Crore) must be reported to law enforcement agencies (CBI/SFIO/Police) and RBI's Central Fraud Registry promptly upon classification."),
    ("Governance & Board Audit Committee (ACB)", "Who is legally mandated to chair the Audit Committee of the Board (ACB) in scheduled commercial banks?", "An Independent Director who is not the Chairman of the Board of Directors", "The Managing Director & Chief Executive Officer (MD & CEO)", "The Chief Financial Officer (CFO) of the bank", "A representative from the Ministry of Finance / Reserve Bank of India", "A", "To maintain governance independence, the ACB must be chaired by an Independent Non-Executive Director other than the Chairman of the Board.")
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
    print(f"🚀 CAIIB Paper 1 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for CAIIB ABM
    for s_num in range(1, 11):
        count = set_map.get(s_num, 0)
        missing = 100 - count

        if missing > 0:
            print(f"\n[*] Generating Set #{s_num:02d}: Currently {count}/100. Adding {missing} questions...")
            
            # Quota: Mod A (25), Mod B (20), Mod C (35), Mod D (20)
            records_to_insert = []
            for k in range(count, 100):
                if k < 25:
                    topic_data = MODULE_A_TOPICS[k % len(MODULE_A_TOPICS)]
                    module_name = "Module A: Statistics"
                elif k < 45:
                    topic_data = MODULE_B_TOPICS[(k - 25) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Human Resources Management"
                elif k < 80:
                    topic_data = MODULE_C_TOPICS[(k - 45) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Credit Management"
                else:
                    topic_data = MODULE_D_TOPICS[(k - 80) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Compliance in Banks & Corporate Governance"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                # Strict 75% Moderate / 25% Hard distribution
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                diff = "hard" if marks == 2.0 else "moderate"
                unique_q = f"[ABM-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
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