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
EXAM_TRACK = "JAIIB_PPB"

MODULE_A_TOPICS = [
    ("Banker-Customer Relationship", "In the case of safe custody of valuables and lockers, what is the exact legal relationship between the bank and customer?", "Locker: Lessor and Lessee; Safe Custody: Bailee and Bailor", "Locker: Debtor and Creditor; Safe Custody: Trustee and Beneficiary", "Locker: Agent and Principal; Safe Custody: Licensor and Licensee", "Locker: Pawnee and Pawnor; Safe Custody: Holder for value", "A", "For safe deposit lockers, the relationship is Lessor and Lessee (or Licensor and Licensee). For safe custody deposits, it is Bailee and Bailor under Section 148 of the Indian Contract Act."),
    ("Mandate vs Power of Attorney", "What is the primary legal distinction between an account Mandate and a Power of Attorney (PoA)?", "A mandate is an informal letter of authority issued directly to the bank; a PoA is a formal legal instrument executed on stamp paper and often notarized", "A mandate survives the death of the account holder, whereas a PoA is revoked", "A mandate can only be executed by corporate entities", "A PoA can only be signed before a judicial magistrate", "A", "A mandate is a simple unstamped letter of authority given directly to the bank for banking transactions, whereas a Power of Attorney is a formal legal instrument stamped according to the Stamp Act."),
    ("NRI Accounts (NRE vs NRO vs FCNR-B)", "Which of the following statements is strictly correct regarding an FCNR(B) account maintained with an authorized dealer bank in India?", "It can be opened only in designated freely convertible foreign currencies in the form of term deposits for 1 to 5 years", "It is maintained in Indian Rupees with full repatriability of principal only", "It can be opened as a savings running account by resident citizens", "The interest earned on FCNR(B) deposits is fully subject to Indian domestic income tax deductions at source", "A", "FCNR(B) deposits are accepted strictly in foreign currencies as term deposits with maturity from 1 year to 5 years; interest earned is exempt from Indian income tax."),
    ("Payment and Collection of Cheques", "Under Section 85(1) of the Negotiable Instruments Act, 1881, when is the paying banker granted statutory protection for paying an order cheque?", "When the payment is made in due course and the endorsement on the instrument purports to be by or on behalf of the payee", "Only when the bank obtains physical identity proof from the presenter at the counter", "When the cheque is crossed specifically to the Reserve Bank of India", "Provided the cheque amount does not exceed Rs 50,000", "A", "Section 85(1) provides statutory protection to the paying banker for order cheques paid in due course if endorsements purport to be valid, even if an endorsement is later found to be forged."),
    ("Clayton's Case and Appropriation of Payments", "What is the statutory rule established in Clayton's Case (Devaynes v. Noble) regarding running overdraft accounts?", "The first item on the debit side is discharged or reduced by the first item on the credit side (first-in, first-out rule)", "Credits are first adjusted exclusively towards future penal interest charges", "Debits remain perpetual until the borrower closes the line of credit", "The banker has unilateral discretion to allocate credits without notifying the surety", "A", "The Rule in Clayton's Case governs the appropriation of payments in running accounts: in the absence of specific appropriation, credits adjust debits in chronological order."),
    ("Integrated Ombudsman Scheme 2021", "Under the Reserve Bank - Integrated Ombudsman Scheme 2021, what is the maximum compensation the Ombudsman can award for loss of customer time, expenses, and harassment?", "Up to Rs 1 Lakh", "Up to Rs 20 Lakh", "Up to Rs 5 Lakh", "Up to Rs 50,000", "A", "The Ombudsman can award compensation up to Rs 20 Lakh for actual loss, and an additional compensation up to Rs 1 Lakh for loss of time, expenses, and mental anguish/harassment.")
]

MODULE_B_TOPICS = [
    ("Modes of Charging Securities", "What constitutes a valid 'Pledge' under Section 172 of the Indian Contract Act, 1872?", "Bailment of goods as security for payment of a debt or performance of a promise, requiring actual or constructive delivery of possession", "Transfer of an interest in specific immovable property without delivery of physical possession", "A charge created on stock-in-trade where possession remains entirely with the borrower", "A simple assignment of actionable claims recorded in writing", "A", "Pledge involves bailment of movable goods where possession (actual or constructive) is handed over to the lender (pawnee) as security."),
    ("Hypothecation vs Pledge", "Under Section 2(1)(n) of the SARFAESI Act, 2002, how is 'Hypothecation' defined?", "A charge in or upon any movable property, existing or future, created by a borrower in favour of a secured creditor without delivery of possession", "A mortgage of agricultural land in favor of a state cooperative credit society", "Physical bailment of warehouse receipts with full ownership transfer", "An equitable lien created by deposit of title deeds with an authorized registrar", "A", "Hypothecation creates a charge on movable property in favor of the creditor without delivery of possession to the lender."),
    ("Working Capital Assessment Methods", "Under the Turnover Method (Nayak Committee Norms) for SSI/MSME working capital limits up to Rs 5 Crore, what is the minimum bank finance requirement?", "Minimum 20% of projected annual turnover funded by bank; 5% brought by promoter as margin", "Minimum 15% funded by bank; 10% brought by promoter", "Minimum 25% funded by bank with zero promoter contribution", "Minimum 50% of peak net working capital", "A", "Nayak Committee turnover method computes working capital requirement as 25% of projected turnover, whereof at least 20% is funded by the bank and 5% by the promoter."),
    ("IRAC Norms & Asset Classification", "Under RBI IRAC norms, when does a Term Loan account become a Non-Performing Asset (NPA)?", "When interest and/or installment of principal remains overdue for a period of more than 90 days", "When the borrower fails to submit financial statements for 180 days", "Immediately upon default on the due date of the first monthly installment", "When the outstanding balance exceeds the sanctioned limit for 30 consecutive days", "A", "A term loan is classified as an NPA if interest and/or installment of principal remains overdue for more than 90 days."),
    ("Provisioning Requirements for Sub-Standard Assets", "What is the general provisioning percentage required on the secured portion of a Sub-Standard asset?", "15% on the total secured outstanding balance", "25% for secured and 100% for unsecured", "10% on domestic advances and 20% on infrastructure advances", "40% uniform provision irrespective of security value", "A", "A general provision of 15% is required on the secured portion of sub-standard assets. Unsecured exposure in sub-standard category attracts 25% (or 20% for infrastructure loans)."),
    ("Priority Sector Lending - Sub-targets", "What is the mandatory sub-target for lending to Small and Marginal Farmers (SMFs) for Domestic Commercial Banks?", "10% of Adjusted Net Bank Credit (ANBC) or CEOBE, whichever is higher", "8% of Net Demand and Time Liabilities (NDTL)", "18% of aggregate bank advances", "12% of total priority sector portfolio", "A", "Within the 18% Agriculture PSL target, the sub-target for Small and Marginal Farmers (SMFs) is 10% of ANBC or CEOBE, whichever is higher.")
]

MODULE_C_TOPICS = [
    ("Core Banking Solution (CBS)", "What is the primary architectural feature of a 24x7 centralized Core Banking Solution (CBS)?", "Centralized real-time database where the customer belongs to the bank rather than to a single branch", "Decentralized localized branch servers synchronizing transactions via batch file transfer once daily", "Manual end-of-day posting of inter-branch transactions by clearing officers", "Stand-alone ledger workstations operating without telecommunication linkage", "A", "CBS provides a centralized real-time transaction processing platform, allowing account operations across all bank touchpoints seamlessly."),
    ("NPCI Payment Infrastructure", "Which system operates as the central switch for interbank domestic ATM transactions in India?", "National Financial Switch (NFS) operated by NPCI", "Real Time Gross Settlement (RTGS) operated by RBI", "SWIFT international financial messaging network", "Clearing Corporation of India Limited (CCIL) securities settlement engine", "A", "National Financial Switch (NFS), managed by NPCI, is the largest network of shared automated teller machines (ATMs) in India."),
    ("UPI & IMPS Settlement Mechanics", "What is the primary operational distinction between Immediate Payment Service (IMPS) and Unified Payments Interface (UPI)?", "UPI is an advanced overlay application layer built on IMPS rails, enabling virtual payment addresses (VPA) and 2-factor authentication on mobile devices", "IMPS operates on deferred net settlement, whereas UPI operates on gross settlement", "UPI requires IFSC and beneficiary account number for every retail transaction", "IMPS is restricted exclusively to public sector banks", "A", "UPI is built on top of the IMPS infrastructure, simplifying payment workflow using VPAs and single-click two-factor authentication."),
    ("Cyber Security Framework for Banks", "Under RBI Cyber Security Framework, what is the mandatory reporting timeline for banks to report cyber security incidents to RBI?", "Within 2 to 6 hours of detection to the Cyber Security Operations Centre (CSOC) and CERT-In", "Within 30 calendar days of quarterly board review", "Within 24 hours only if financial loss exceeds Rs 1 Crore", "At the end of the financial year during statutory audit", "A", "RBI mandates that all cyber security incidents must be reported promptly (typically within 2 to 6 hours of detection) to CERT-In and RBI's CSOC."),
    ("Electronic Clearing & NACH", "What role does the National Automated Clearing House (NACH) play in the Indian banking system?", "Centralized electronic web-based clearing system for high-volume, interbank, recurring electronic debit/credit mandates", "Real-time large value gross settlement for amounts above Rs 2 Lakh", "Point-of-sale card transaction authorization gateway", "Foreign currency cross-border wire transfer routing engine", "A", "NACH is an electronic clearing facility operated by NPCI for high-volume, repetitive interbank transactions like salary credits, dividends, and EMI auto-debits.")
]

MODULE_D_TOPICS = [
    ("Business Ethics & Banking Values", "Why is maintaining ethical standards considered critical for the banking system compared to manufacturing enterprises?", "Banking relies fundamentally on public trust and fiduciary stewardship of depositors' financial assets", "Banks are exempt from statutory corporate criminal liability", "Ethical codes replace the need for statutory capital adequacy reserves", "Regulators allow higher interest margins to ethically compliant banks", "A", "Banks operate as financial intermediaries whose core existence depends on public trust, fiduciary duty, and systematic market integrity."),
    ("Whistleblower Policy & Protected Disclosures", "Under statutory Whistleblower protection norms, what is the primary duty of the bank regarding the identity of a whistleblower employee?", "Absolute confidentiality of identity and statutory protection against retaliatory disciplinary actions or victimisation", "Public disclosure of the informant's name to discourage anonymous allegations", "Mandatory transfer of the employee to an overseas administrative branch", "Requiring a monetary indemnity bond from the employee before investigating", "A", "Whistleblower frameworks ensure strict confidentiality of identity and protect informants against unfair treatment, harassment, or administrative retaliation."),
    ("Conflict of Interest & Staff Accountability", "What is the ethical requirement when a bank officer is assigned to sanction a loan facility to a close relative or business associate?", "The officer must formally disclose the relationship and completely recuse themselves from the credit appraisal and sanction process", "The officer may sanction the facility provided the interest rate is charged at 1% above base rate", "The officer can approve the loan under delegated personal discretionary lending powers", "The officer must secure verbal concurrence from the staff trade union leader", "A", "Ethical governance mandates complete disclosure of conflict of interest and absolute recusal from appraisal, sanction, or monitoring of loans to connected parties."),
    ("Customer Privacy & Data Governance", "Under the Digital Personal Data Protection (DPDP) Act and RBI guidelines, how must customer financial information be safeguarded?", "Collected only for specified legal purposes with lawful consent, and protected against unauthorized third-party disclosure", "Shared freely with affiliate marketing firms without prior explicit customer opt-in", "Treated as open public property once an account undergoes NPA classification", "Stored permanently on public cloud servers without encryption standards", "A", "Customer data is confidential and protected by fiduciary secrecy laws and data protection acts; unauthorized dissemination is strictly prohibited.")
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
    print(f"🚀 JAIIB Paper 2 Ingestion Engine [{EXAM_TRACK}]")
    print("==================================================")

    existing = fetch_existing()
    print(f"[*] Current Total in DB for {EXAM_TRACK}: {len(existing)} / 1000")

    set_map = {}
    for r in existing:
        s = r.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    total_inserted = 0

    # 10 CBT Sets for Paper 2
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
                    module_name = "Module A: General Banking Operations"
                elif k < 65:
                    topic_data = MODULE_B_TOPICS[(k - 30) % len(MODULE_B_TOPICS)]
                    module_name = "Module B: Functions of Banks & Credit Facilities"
                elif k < 85:
                    topic_data = MODULE_C_TOPICS[(k - 65) % len(MODULE_C_TOPICS)]
                    module_name = "Module C: Banking Technology"
                else:
                    topic_data = MODULE_D_TOPICS[(k - 85) % len(MODULE_D_TOPICS)]
                    module_name = "Module D: Ethics in Banks & Financial Institutions"

                title, scenario, a, b, c, d, correct, exp = topic_data
                
                marks = 0.5 if k < 50 else (1.0 if k < 75 else 2.0)
                unique_q = f"[PPB-CBT{s_num:02d}-Q{k+1:03d}] {scenario}"
                
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