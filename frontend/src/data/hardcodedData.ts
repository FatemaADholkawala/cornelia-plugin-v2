export const HARDCODED_ANALYSIS = {
	acceptable: [
		{
			title: "APPOINTMENT OF ESCROW BANK",
			text: "The Parties hereby appoint Bank of India to act as Escrow Bank on the terms and condition herein contained and to hold the amount in the Escrow Account until the release thereof as specified under this Agreement and the Escrow Bank in consideration of the fees to be paid, accepts such appointment. The Escrow Bank hereby agrees to act as such and to accept all payments and other amounts to be delivered to or held by the Escrow Bank pursuant to the terms of this Agreement and to operate the Escrow Account in terms of this Agreement. The duties of the Escrow Bank under this Agreement are purely ministerial, administrative and non-discretionary in nature. Neither Escrow Bank nor any of its directors, officers, agents and employees shall, by reason of anything contained in this Agreement, be deemed to be a trustee for or have any fiduciary relationship with the Company or any other person. If the Escrow Bank has acted in accordance with this Agreement, it shall be deemed to have acted as if instructed to do so by the Company.The Escrow Account shall be non-interest bearing and shall not have any cheque book facility.",
			explanation:
				"Clearly defines the role of the Escrow Bank as ministerial and non-discretionary, aligning with the MC's oversight role.  The non-interest bearing and no chequebook stipulations offer basic safeguards.",
		},
		{
			title: "Deposits in the Escrow Account",
			text: "The SRA agrees and undertakes to deposit the following funds  into the Escrow Account on or before  28th March, 2024. The fund infusion shall be made by the SPV on behalf of the SRA, for the following payments on 30th March 2024:Upfront Payment of INR 68,29,99,450/- (Rupees Sixty-eight Crores, twenty nine lakhs, ninety nine thousand, four hundred and fifty), which shall further be utilized in accordance with this Agreement for making payments towards:unpaid CIRP Costs, if any, as conveyed to the Successful Resolution Applicant by the Monitoring Committee with a copy to the Escrow Bank; Upfront Payment as per the Resolution Plan.Further, on or before   28th March, 2024, the SRA/SPV shall further infuse in the Escrow Account, the funds equivalent to the unpaid Monitoring Committee expenses, if any, as conveyed to the Successful Resolution Applicant by the Monitoring Committee with a copy to the Escrow Bank.It is agreed that the Company may remit the funds infused into it by the Successful Resolution Applicant (through the SPV) by way of any one or more of share subscription money/ OCD/ any other instrument), to the Escrow Account. The SPV also retains the right to remit the funds into the escrow directly.",
			explanation:
				"Specifies the amounts and timelines for deposits, including reimbursement of MC expenses, which is crucial for the MC.",
		},
		{
			title: "Withdrawals from the Escrow Account",
			text: "The Monitoring Committee may instruct the Escrow Bank to make the following payments [List of payments a-i]. The name, account numbers of the recipients and amounts payable to each such recipient for each of the above payments shall be provided to the Escrow Bank at least 48 hours prior to the proposed date of payment by the Monitoring Committee in such form as the Escrow Bank requires.",
			explanation:
				"Grants the MC control over disbursement instructions, which is essential for their plan implementation oversight.",
		},
		{
			title: "TERMS AND CONDITIONS",
			text: "Subject to Clause 3.4.2 above, Escrow Bank to act on joint instructions of representative of the Committee of Creditors and the representative of the Successful Resolution Applicant (such representatives to implement the instructions of the Monitoring Committee, as per Clause 5.17 of the approved Resolution Plan), to distribute payments to creditors in accordance with this Agreement.",
			explanation:
				"Reinforces the MC's authority by requiring their instructions to be implemented by representatives, even with joint signatories.",
		},
		{
			title: "FEES",
			text: "In consideration of Escrow Bank acting as Escrow Bank in terms of this Agreement, the First Party shall pay to Escrow Bank the fee net of all taxes plus all out-of-pocket expenses incurred by Escrow Bank as agreed between the Parties.",
			explanation: "Ensures clarity on fee payment responsibility.",
		},
	],
	risky: [
		{
			title: "WHEREAS",
			text: "It is understood that the required resolutions shall be passed by the Monitoring Committee upon infusion of the Upfront Payment in the Escrow Account for the successful transfer of control of the Company to the SPV, i.e. in line with the implementation of the Resolution Plan, the SPV must hold 90% of equity and identified financial creditors must hold 5%, while the public would hold balance 5% equity stake, while the existing promoters' shares must to be extinguished. Provided, however, the distribution of Upfront Payment shall be made irrespective of whether the shares are allotted to the SPV and the financial creditors.",
			explanation:
				"Distribution of Upfront Payment irrespective of share allotment to SPV and FCs creates a risk for the MC.  This decoupling could lead to complications if the share transfer doesn't occur as planned.",
		},
		{
			title: "Withdrawals from the Escrow Account",
			text: "Notwithstanding anything contained in this Agreement, the Escrow Agent shall be entitled to make the transfers on the dates provided in Schedule III, even if it does not receive the instructions for such remittance from the Monitoring Committee.",
			explanation:
				"This overrides the MC's control over disbursements and is a significant risk. The Escrow Agent should *always* require MC instruction.",
		},
		{
			title: "INDEMNITIES AND RELEASES",
			text: "The Successful Resolution Applicant shall indemnify and keep indemnified the Escrow Bank...[for various liabilities].",
			explanation:
				"While indemnification of the Escrow Bank is standard, the MC should also be indemnified by the SRA for any losses arising from SRA actions or inactions related to the escrow.",
		},
	],
	missing: [
		{
			title: "Dispute Resolution Mechanism for Escrow-Related Issues",
			text: "N/A",
			explanation:
				"The agreement lacks a clear process for resolving disputes specifically related to the escrow, such as disagreements over disbursement instructions or interpretation of the agreement's terms.  A dedicated mechanism is needed to avoid delays and potential litigation.",
		},
		{
			title: "Successor Escrow Agent Appointment Process",
			text: "N/A",
			explanation:
				"While termination mentions successor appointment, it lacks detail. A robust process, including MC approval rights, is crucial for continuity.",
		},
		{
			title: "Specific Performance Clause",
			text: "N/A",
			explanation:
				"Given the criticality of timely payments under the resolution plan, a specific performance clause would strengthen the MC's ability to enforce the SRA's obligations related to the escrow.",
		},
		{
			title: "Audit Rights for the Escrow Account",
			text: "N/A",
			explanation:
				"The MC should have explicit rights to audit the Escrow Account to ensure transparency and compliance with the agreement.",
		},
	],
};

export const HARDCODED_PARTIES = {
	parties: [
		{
			name: "Monitoring Committee of McNally Bharat Engineering Company Limited",
			role: "Oversees implementation of the resolution plan",
		},
		{
			name: "BTL EPC Limited",
			role: "Successful Resolution Applicant (SRA)",
		},
		{
			name: "Mandal Vyapaar Pvt Limited",
			role: "Special Purpose Vehicle (SPV) for implementing the resolution plan on behalf of the SRA",
		},
		{
			name: "Bank of India",
			role: "Escrow Bank/Agent",
		},
	],
};

export const DEMO_DOCUMENT_CONTENT = `
ESCROW AGREEMENT

This Escrow Agreement ("Agreement") is entered into on this 28th day of March, 2024, between:

1. Monitoring Committee of McNally Bharat Engineering Company Limited ("First Party")
2. BTL EPC Limited ("Second Party/Successful Resolution Applicant")
3. Mandal Vyapaar Pvt Limited ("SPV")
4. Bank of India ("Escrow Bank")

WHEREAS, the Successful Resolution Applicant has been selected to implement the resolution plan for McNally Bharat Engineering Company Limited;

WHEREAS, the Monitoring Committee oversees the implementation of the resolution plan;

WHEREAS, the parties wish to establish an escrow arrangement for the management of funds;

NOW THEREFORE, the parties agree as follows:

1. APPOINTMENT OF ESCROW BANK
The Parties hereby appoint Bank of India to act as Escrow Bank on the terms and condition herein contained and to hold the amount in the Escrow Account until the release thereof as specified under this Agreement.

2. DEPOSITS IN THE ESCROW ACCOUNT
The SRA agrees and undertakes to deposit the following funds into the Escrow Account on or before 28th March, 2024:
- Upfront Payment of INR 68,29,99,450/- (Rupees Sixty-eight Crores, twenty nine lakhs, ninety nine thousand, four hundred and fifty)
- Funds equivalent to the unpaid Monitoring Committee expenses

3. WITHDRAWALS FROM THE ESCROW ACCOUNT
The Monitoring Committee may instruct the Escrow Bank to make payments as per the resolution plan. The Escrow Bank shall act on joint instructions of representatives of the Committee of Creditors and the Successful Resolution Applicant.

4. TERMS AND CONDITIONS
Subject to the provisions above, Escrow Bank shall act on joint instructions to distribute payments to creditors in accordance with this Agreement.

5. FEES
The First Party shall pay to Escrow Bank the fee net of all taxes plus all out-of-pocket expenses incurred by Escrow Bank.

6. INDEMNITIES AND RELEASES
The Successful Resolution Applicant shall indemnify and keep indemnified the Escrow Bank against all losses, damages, costs, and expenses.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.
`;
