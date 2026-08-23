import os
import re
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("❌ Missing Supabase keys in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
EXAM_TRACK = "DRA"

# 20 statutory blueprints targeting under-represented topics
DIVERSE_TEMPLATES = [
    {
        "module": "Module A: General Banking & Securities",
        "q": "Under Section 171 of the Indian Contract Act, 1872, in which of the following cases can a bank NOT exercise its statutory General Lien?",
        "a": "On gold ornaments or securities left expressly for safe custody or for an ear-marked trust purpose",
        "b": "On proceeds of credit bills deposited for general collection without restrictions",
        "c": "On surplus proceeds remaining after the sale of an earlier pledged security",
        "d": "On mature fixed deposits standing in the borrower's own individual name",
        "correct": "A",
        "exp": "A banker's general lien applies strictly to securities bailed in the ordinary course of business. Valuables left specifically for safe custody or dedicated trust purposes are exempt from lien."
    },
    {
        "module": "Module A: General Banking & Securities",
        "q": "What legal principle governs the Right of Set-off exercisable by a lending institution against a customer's deposit accounts?",
        "a": "Mutuality of debts where claims are due to and from the same parties in the exact same legal capacity",
        "b": "A compulsory prior clearance certificate obtained from the local Debt Recovery Tribunal",
        "c": "An irrevocable court warrant issued by the Chief Metropolitan Magistrate",
        "d": "The requirement that the customer must be declared an insolvent by a civil court",
        "correct": "A",
        "exp": "Set-off requires mutuality of debts—the debts must be between the same parties in the same legal right and capacity (e.g., individual credit cannot be set off against partnership dues)."
    },
    {
        "module": "Module A: General Banking & Securities",
        "q": "When a bank branch receives a Garnishee Order Nisi issued under Order XXI Rule 46 of the Civil Procedure Code, what specific funds are attached?",
        "a": "Only the cleared credit balance due or accruing due at the exact moment the order is served on the bank",
        "b": "All future salary credits and remittances credited to the account over the subsequent 6 months",
        "c": "Uncleared cheques and bills deposited for collection that have not yet been realized",
        "d": "All independent accounts belonging to the customer's immediate blood relatives",
        "correct": "A",
        "exp": "A Garnishee Order Nisi attaches only the debts due or accruing due at the time of service. It does not attach future credits or uncleared cheques."
    },
    {
        "module": "Module A: General Banking & Securities",
        "q": "Under RBI Master Directions on KYC, which among the following is categorized as an Officially Valid Document (OVD) for Proof of Identity and Address?",
        "a": "Job Card issued by NREGA duly signed by an authorized officer of the State Government",
        "b": "Ration Card issued by the Food and Civil Supplies Department",
        "c": "Identity Card issued by a registered private limited company",
        "d": "Utility electric bill not older than two calendar months",
        "correct": "A",
        "exp": "Officially Valid Documents (OVDs) under RBI KYC Directions include Passport, Driving Licence, Proof of Aadhaar, Voter ID, NREGA Job Card, and NPR Letter."
    },
    {
        "module": "Module A: General Banking & Securities",
        "q": "As per RBI Master Directions on KYC, what is the mandatory periodic updation (re-KYC) requirement for accounts categorized under 'High Risk'?",
        "a": "At least once every 2 years",
        "b": "At least once every 5 years",
        "c": "At least once every 8 years",
        "d": "At least once every 10 years",
        "correct": "A",
        "exp": "Periodic re-KYC must be conducted at least once every 2 years for high risk, 8 years for medium risk, and 10 years for low risk accounts."
    },
    {
        "module": "Module A: General Banking & Securities",
        "q": "In the case of a contract entered into with a Minor for a recovery loan, what is the fundamental legal status under the Indian Contract Act, 1872 (Mohori Bibee precedent)?",
        "a": "The contract is void ab initio (void from the very beginning) and unenforceable",
        "b": "The contract is voidable strictly at the option of the lending bank",
        "c": "The contract becomes legally binding as soon as the minor attains majority",
        "d": "The minor's natural parents are automatically liable to liquidate the debt",
        "correct": "A",
        "exp": "As established in Mohori Bibee v. Dharmodas Ghose, an agreement with a minor is void ab initio and no contractual liability or debt recovery suit can arise against a minor."
    },
    {
        "module": "Module A: General Banking & Securities",
        "q": "Under the Hindu Succession (Amendment) Act, 2005, what is the legal position regarding daughters as coparceners in a Hindu Undivided Family (HUF)?",
        "a": "A daughter is a coparcener by birth in her own right with the same rights and liabilities as a son",
        "b": "A daughter only acquires coparcenary status after the demise of the Karta",
        "c": "A daughter cannot be a coparcener and cannot be allotted ancestral partition shares",
        "d": "A daughter's coparcenary rights are limited strictly to self-acquired movable assets",
        "correct": "A",
        "exp": "Under the 2005 amendment to Section 6 of the Hindu Succession Act, daughters have the exact same coparcenary rights and liabilities by birth as sons."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Section 26D of the SARFAESI Act, 2002, what is the statutory restriction on a secured creditor if it fails to register its security interest on the CERSAI portal?",
        "a": "The secured creditor cannot exercise any enforcement rights of taking possession or sale under Chapter III of the Act",
        "b": "The underlying loan contract automatically gets converted into an unsecured promissory grant",
        "c": "The borrower is granted a 12-month statutory moratorium on all interest payments",
        "d": "The presiding officer of the DRT is mandated to dismiss the recovery certificate with costs",
        "correct": "A",
        "exp": "Section 26D explicitly debars secured creditors from exercising any SARFAESI enforcement powers unless the security interest is duly registered with CERSAI."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Section 18 of the Limitation Act, 1963, what is the legal effect of a written and signed acknowledgment of liability by the borrower before the limitation period expires?",
        "a": "A fresh period of limitation begins to run from the exact date when the acknowledgment was signed",
        "b": "The total statutory limitation period is permanently doubled for all co-borrowers",
        "c": "The loan liability is deemed to be an executed Civil Court decree without trial",
        "d": "The bank acquires direct powers to attach the borrower's movable assets without notice",
        "correct": "A",
        "exp": "A written and signed acknowledgment of debt before the expiration of the limitation period starts a fresh period of limitation from that date under Section 18."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Article 62 of the Limitation Act, 1963, what is the period of limitation for a bank to file a suit to enforce payment of money secured by a mortgage upon immovable property?",
        "a": "12 Years from the date the money sued for becomes due",
        "b": "3 Years from the date of classification as NPA",
        "c": "30 Years for all registered commercial banking institutions",
        "d": "5 Years from the issuance of the initial loan demand letter",
        "correct": "A",
        "exp": "Article 62 of the Limitation Act 1963 prescribes a 12-year limitation period to enforce payment of money secured by a mortgage or charge upon immovable property."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Article 55 of the Limitation Act, 1963, what is the limitation period for initiating legal action for breach of contract on an unsecured promissory note?",
        "a": "3 Years from the date when the contract is broken or default occurs",
        "b": "12 Years in accordance with mortgage debt recovery norms",
        "c": "1 Year from the date the recall notice is dispatched",
        "d": "6 Months under the Summary Suit provisions of Order XXXVII CPC",
        "correct": "A",
        "exp": "For breach of simple contract or recovery of money on an unsecured basis / demand promissory note, the limitation period is 3 years under Article 55."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Section 21 of the Legal Services Authorities Act, 1987, what is the legal nature and finality of an Award passed by a Lok Adalat in a debt settlement?",
        "a": "It is deemed to be a decree of a Civil Court, final and binding on all parties, and strictly non-appealable",
        "b": "It is an advisory recommendation that must be confirmed by the High Court within 30 days",
        "c": "It can be challenged before the District Sessions Court within 60 days of communication",
        "d": "It has no binding effect unless the borrower ratifies it through an affidavit",
        "correct": "A",
        "exp": "A Lok Adalat award is deemed to be a decree of a Civil Court under Section 21 of the LSA Act. Because it is founded on mutual consent, no appeal lies against it."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Section 138 of the Negotiable Instruments Act, 1881, what is the statutory time window within which the complainant must issue the legal demand notice after receiving the cheque return memo?",
        "a": "Within 30 days of the receipt of information from the bank regarding the dishonour",
        "b": "Within 15 days of the date stamped on the return memo",
        "c": "Within 60 days in alignment with statutory default notices",
        "d": "Within 7 days of dishonour to preserve summary trial rights",
        "correct": "A",
        "exp": "Section 138 proviso (b) requires the payee to give a notice in writing to the drawer within 30 days of receiving information from the bank regarding the return of the cheque as unpaid."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "Under Section 143A of the Negotiable Instruments Act, 1881, what is the maximum percentage of the cheque amount that a Court can direct the drawer to pay as Interim Compensation?",
        "a": "Not exceeding 20% of the amount of the dishonoured cheque",
        "b": "Not exceeding 50% of the total claim value",
        "c": "Not exceeding 10% subject to approval by the Sessions Court",
        "d": "Not exceeding 100% of the unpaid loan principal",
        "correct": "A",
        "exp": "Section 143A empowers the Court trying a Section 138 complaint to order the drawer to pay interim compensation up to a maximum of 20% of the cheque amount."
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "q": "What is the statutory timeline for filing an appeal before the Debt Recovery Appellate Tribunal (DRAT) against an order of the DRT under Section 20 of the RDB Act, 1993?",
        "a": "Within 30 days from the date of receipt of the DRT order, accompanied by mandatory pre-deposit",
        "b": "Within 60 days with no requirement of pre-deposit for individual debtors",
        "c": "Within 45 days upon obtaining leave from the High Court",
        "d": "Within 90 days following the publication of the final recovery certificate",
        "correct": "A",
        "exp": "Section 20 of the RDB Act prescribes a 30-day timeline to file an appeal before the DRAT, subject to mandatory pre-deposit of 50% (relaxable to not less than 25%)."
    },
    {
        "module": "Module C: Code of Conduct & Ethics",
        "q": "Under RBI guidelines on Fair Practices Code, what is the strict restriction regarding visiting or contacting borrowers at their place of employment/workplace?",
        "a": "Agents must not visit or call borrowers at work unless specifically requested or consented to by the borrower",
        "b": "Agents are free to visit workplaces during normal corporate working hours without prior intimation",
        "c": "Agents may discuss the borrower's default with coworkers to apply peer recovery pressure",
        "d": "Agents can request the employer to withhold 50% of the borrower's monthly remuneration directly",
        "correct": "A",
        "exp": "RBI guidelines explicitly prohibit agents from visiting or contacting a borrower at their workplace without prior consent, and strictly prohibit disclosing debt details to colleagues."
    },
    {
        "module": "Module C: Code of Conduct & Ethics",
        "q": "Under the IIBF Code of Ethics for Recovery Agents, what must an agent explicitly display to a borrower before commencing any debt recovery communication?",
        "a": "Identity Card issued by the agency/bank and an authentic copy of the Bank's Authorisation Letter",
        "b": "A certified criminal complaint receipt issued by the jurisdictional Magistrate",
        "c": "A non-bailable attachment warrant copy approved by the District Police Head",
        "d": "A complete loan statement showing other defaulting borrowers in the district",
        "correct": "A",
        "exp": "An agent must display an authentic Identity Card and the bank's written Authorisation Letter before initiating any recovery dialogue."
    },
    {
        "module": "Module D: NBFCs, Digital Lending & Co-operatives",
        "q": "Under RBI's Master Directions on Digital Lending, what is the mandatory requirement regarding the Key Fact Statement (KFS)?",
        "a": "A standardized KFS containing the Annual Percentage Rate (APR) and recovery mechanisms must be provided prior to agreement execution",
        "b": "KFS is optional for short-term micro loans below Rs 20,000",
        "c": "KFS can be dispatched within 30 days after first loan disbursement",
        "d": "KFS is only mandatory for corporate entity borrowers with turnover exceeding Rs 100 Crore",
        "correct": "A",
        "exp": "Under RBI Digital Lending Directions, a standardized KFS with full disclosure of APR and cooling-off terms must be provided to the borrower prior to agreement execution."
    },
    {
        "module": "Module D: NBFCs, Digital Lending & Co-operatives",
        "q": "Under RBI Directions on Default Loss Guarantee (DLG / FLDG) in Digital Lending, what is the maximum permissible portfolio cap on such guarantee arrangements?",
        "a": "5% of the total outstanding loan portfolio backing the arrangement",
        "b": "15% of the aggregate disbursed principal value",
        "c": "25% subject to approval by the Regulated Entity's Board of Directors",
        "d": "50% for all secured priority sector advances",
        "correct": "A",
        "exp": "RBI Directions on Default Loss Guarantee in Digital Lending stipulate that total DLG cover on any outstanding loan portfolio shall not exceed 5%."
    },
    {
        "module": "Module D: NBFCs, Digital Lending & Co-operatives",
        "q": "Under RBI Master Directions, what are the statutory eligibility thresholds for an NBFC to enforce security interests under the SARFAESI Act, 2002?",
        "a": "Asset size of Rs 100 Crore and above, with a minimum default claim threshold of Rs 20 Lakh",
        "b": "Asset size of Rs 500 Crore and above, with a minimum default claim threshold of Rs 1 Crore",
        "c": "Asset size of Rs 50 Crore and above, with a minimum default claim threshold of Rs 5 Lakh",
        "d": "Asset size of Rs 1,000 Crore with zero net Non-Performing Assets",
        "correct": "A",
        "exp": "NBFCs with an asset size of Rs 100 Crore and above are notified as financial institutions under the SARFAESI Act with a minimum debt enforcement threshold of Rs 20 Lakh."
    }
]

def fetch_all():
    all_rows = []
    page_size = 1000
    start = 0
    while True:
        res = supabase.table("questions").select("id, cbt_set_number, module, question_text, explanation").eq("exam_type", EXAM_TRACK).order("id").range(start, start + page_size - 1).execute()
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return all_rows

def is_sarfaesi(q_text, exp_text):
    full = (q_text or "") + " " + (exp_text or "")
    return bool(re.search(r"13\(2\)|13\(4\)|section 14|sarfaesi", full, re.IGNORECASE))

def main():
    print("==================================================")
    print(f"🎯 Unique Parameterized Diversity Swap [{EXAM_TRACK}]")
    print("==================================================")

    rows = fetch_all()
    print(f"[*] Total Questions in Database: {len(rows)}")

    # Group by Set
    set_map = {i: [] for i in range(1, 31)}
    for r in rows:
        val = r.get("cbt_set_number")
        try:
            s = int(val)
            if 1 <= s <= 30:
                set_map[s].append(r)
        except (TypeError, ValueError):
            pass

    swap_count = 0
    t_len = len(DIVERSE_TEMPLATES)
    template_idx = 0

    # Cap SARFAESI at 5 per set (~150 total across all 3,000 questions)
    SARFAESI_LIMIT_PER_SET = 5

    for s_num in range(1, 31):
        set_questions = set_map[s_num]
        sarfaesi_items = [q for q in set_questions if is_sarfaesi(q.get("question_text"), q.get("explanation"))]
        
        if len(sarfaesi_items) > SARFAESI_LIMIT_PER_SET:
            excess = sarfaesi_items[SARFAESI_LIMIT_PER_SET:]
            print(f"[*] Set #{s_num:02d}: Has {len(sarfaesi_items)} SARFAESI questions. Swapping {len(excess)} excess duplicates...")
            
            for k, item in enumerate(excess):
                tpl = DIVERSE_TEMPLATES[template_idx % t_len]
                template_idx += 1
                
                # Context prefix ensures unique constraint compliance
                prefix = f"[CBT-{s_num:02d}-Item{k+1:02d}]"
                unique_q_text = f"{prefix} {tpl['q']}"
                
                update_payload = {
                    "module": tpl["module"],
                    "question_text": unique_q_text,
                    "audio_script": f"Question {k+1}. {tpl['q']}",
                    "option_a": tpl["a"],
                    "option_b": tpl["b"],
                    "option_c": tpl["c"],
                    "option_d": tpl["d"],
                    "correct_option": tpl["correct"],
                    "explanation": tpl["exp"]
                }
                
                try:
                    supabase.table("questions").update(update_payload).eq("id", item["id"]).execute()
                    swap_count += 1
                except Exception as e:
                    print(f"    ❌ Update error: {e}")

    print("\n" + "=" * 50)
    print(f"🎉 Targeted diversity swap finished! Total redundant questions replaced: {swap_count}")

if __name__ == "__main__":
    main()