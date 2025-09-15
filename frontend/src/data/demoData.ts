import { DemoDocument, DemoScenario, Party } from "@/types";

export const DEMO_DOCUMENTS: DemoDocument[] = [
	{
		id: "1",
		title: "Software Development Agreement",
		type: "contract",
		content: `
SOFTWARE DEVELOPMENT AGREEMENT

This Software Development Agreement ("Agreement") is entered into on [Date] between TechCorp Inc., a Delaware corporation ("Company"), and Client Solutions LLC, a California limited liability company ("Client").

1. SCOPE OF WORK
The Company shall develop and deliver a custom web application ("Software") for the Client according to the specifications outlined in Exhibit A. The Software shall include user authentication, data management, and reporting features.

2. PAYMENT TERMS
Client shall pay Company a total fee of $150,000, payable in three installments:
- 40% ($60,000) upon execution of this Agreement
- 40% ($60,000) upon delivery of the beta version
- 20% ($30,000) upon final acceptance and delivery

3. INTELLECTUAL PROPERTY
All work product, including but not limited to source code, documentation, and designs, created by Company in the course of performing services under this Agreement shall be the exclusive property of Company. Client shall have a perpetual, non-exclusive license to use the Software for its internal business purposes.

4. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all proprietary information disclosed during the term of this Agreement. This obligation shall survive termination of this Agreement.

5. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice. Upon termination, Client shall pay Company for all work completed up to the termination date.

6. WARRANTY
Company warrants that the Software will perform substantially in accordance with the specifications for a period of one (1) year from delivery.

7. LIMITATION OF LIABILITY
In no event shall Company's liability exceed the total amount paid by Client under this Agreement.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.
    `,
		parties: [
			{ name: "TechCorp Inc.", role: "Service Provider" },
			{ name: "Client Solutions LLC", role: "Client" },
			{ name: "Legal Partners LLP", role: "Legal Counsel" },
		],
		sampleClauses: [
			"All work product, including but not limited to source code, documentation, and designs, created by Company in the course of performing services under this Agreement shall be the exclusive property of Company.",
			"Either party may terminate this Agreement with thirty (30) days written notice.",
			"In no event shall Company's liability exceed the total amount paid by Client under this Agreement.",
			"Both parties agree to maintain the confidentiality of all proprietary information disclosed during the term of this Agreement.",
		],
	},
	{
		id: "2",
		title: "Employment Agreement",
		type: "contract",
		content: `
EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into between DataFlow Solutions Inc. ("Company") and John Smith ("Employee") on [Date].

1. POSITION AND DUTIES
Employee shall serve as Senior Software Engineer and shall perform such duties as may be assigned by the Company from time to time.

2. COMPENSATION
Employee shall receive an annual salary of $120,000, payable in bi-weekly installments. Employee shall also be eligible for an annual bonus of up to 20% of base salary based on performance.

3. INTELLECTUAL PROPERTY
All inventions, discoveries, improvements, and other work product conceived, developed, or created by Employee during the course of employment, whether or not during working hours, shall be the exclusive property of the Company.

4. NON-COMPETE
Employee agrees that during employment and for a period of one (1) year thereafter, Employee shall not directly or indirectly engage in any business that competes with the Company within a 50-mile radius.

5. CONFIDENTIALITY
Employee shall not disclose any confidential information of the Company to any third party during or after employment.

6. TERMINATION
Either party may terminate this Agreement at will, with or without cause, upon two (2) weeks written notice.

7. SEVERABILITY
If any provision of this Agreement is found to be unenforceable, the remaining provisions shall remain in full force and effect.
    `,
		parties: [
			{ name: "DataFlow Solutions Inc.", role: "Employer" },
			{ name: "John Smith", role: "Employee" },
		],
		sampleClauses: [
			"All inventions, discoveries, improvements, and other work product conceived, developed, or created by Employee during the course of employment, whether or not during working hours, shall be the exclusive property of the Company.",
			"Employee agrees that during employment and for a period of one (1) year thereafter, Employee shall not directly or indirectly engage in any business that competes with the Company within a 50-mile radius.",
			"Employee shall not disclose any confidential information of the Company to any third party during or after employment.",
		],
	},
	{
		id: "3",
		title: "Service Level Agreement",
		type: "agreement",
		content: `
SERVICE LEVEL AGREEMENT

This Service Level Agreement ("SLA") is between CloudTech Services ("Provider") and Enterprise Corp ("Customer") effective [Date].

1. SERVICE DESCRIPTION
Provider shall deliver cloud hosting services including compute, storage, and networking resources as specified in the Service Catalog.

2. SERVICE LEVELS
Provider guarantees 99.9% uptime for all services. Service credits will be provided for any downtime exceeding the guaranteed level.

3. SUPPORT
Provider shall provide 24/7 technical support via phone, email, and online portal. Response times shall not exceed 4 hours for critical issues.

4. MAINTENANCE
Scheduled maintenance will be performed during off-peak hours with 48 hours advance notice. Emergency maintenance may be performed with immediate notice.

5. DATA PROTECTION
Provider shall implement industry-standard security measures to protect Customer data. Regular backups will be performed and retained for 30 days.

6. LIABILITY
Provider's liability is limited to the amount paid by Customer in the 12 months preceding the incident.

7. TERM AND TERMINATION
This SLA is effective for the duration of the Master Service Agreement. Either party may terminate with 30 days written notice.
    `,
		parties: [
			{ name: "CloudTech Services", role: "Service Provider" },
			{ name: "Enterprise Corp", role: "Customer" },
		],
		sampleClauses: [
			"Provider guarantees 99.9% uptime for all services. Service credits will be provided for any downtime exceeding the guaranteed level.",
			"Provider shall provide 24/7 technical support via phone, email, and online portal. Response times shall not exceed 4 hours for critical issues.",
			"Provider's liability is limited to the amount paid by Customer in the 12 months preceding the incident.",
		],
	},
];

export const DEMO_SCENARIOS: DemoScenario[] = [
	{
		id: "1",
		title: "IP Ownership Analysis",
		description:
			"Analyze intellectual property ownership clauses from the perspective of a service provider",
		document: DEMO_DOCUMENTS[0],
		selectedText:
			"All work product, including but not limited to source code, documentation, and designs, created by Company in the course of performing services under this Agreement shall be the exclusive property of Company.",
		expectedAnalysis: {
			risky: [
				{
					id: "1",
					text: "All work product, including but not limited to source code, documentation, and designs, created by Company in the course of performing services under this Agreement shall be the exclusive property of Company.",
					type: "Intellectual Property",
					risk_level: "high",
					description: "Broad IP ownership claim may be problematic for client",
					suggestions: [
						"Consider joint ownership for collaborative work",
						"Add carve-outs for pre-existing IP",
						"Define work product more specifically",
					],
				},
			],
		},
	},
	{
		id: "2",
		title: "Non-Compete Clause Review",
		description:
			"Review non-compete provisions for reasonableness and enforceability",
		document: DEMO_DOCUMENTS[1],
		selectedText:
			"Employee agrees that during employment and for a period of one (1) year thereafter, Employee shall not directly or indirectly engage in any business that competes with the Company within a 50-mile radius.",
		expectedAnalysis: {
			risky: [
				{
					id: "2",
					text: "Employee agrees that during employment and for a period of one (1) year thereafter, Employee shall not directly or indirectly engage in any business that competes with the Company within a 50-mile radius.",
					type: "Non-Compete",
					risk_level: "medium",
					description: "Geographic restriction may be too broad",
					suggestions: [
						"Consider reducing geographic scope",
						"Add specific industry restrictions",
						"Ensure compliance with local employment laws",
					],
				},
			],
		},
	},
	{
		id: "3",
		title: "Service Level Guarantees",
		description: "Evaluate service level commitments and liability limitations",
		document: DEMO_DOCUMENTS[2],
		selectedText:
			"Provider guarantees 99.9% uptime for all services. Service credits will be provided for any downtime exceeding the guaranteed level.",
		expectedAnalysis: {
			acceptable: [
				{
					id: "3",
					text: "Provider guarantees 99.9% uptime for all services. Service credits will be provided for any downtime exceeding the guaranteed level.",
					type: "Service Level",
					risk_level: "low",
					description: "Reasonable uptime guarantee with appropriate remedy",
				},
			],
		},
	},
];

export const SAMPLE_PARTIES: Party[] = [
	{ name: "TechCorp Inc.", role: "Service Provider" },
	{ name: "Client Solutions LLC", role: "Client" },
	{ name: "Legal Partners LLP", role: "Legal Counsel" },
	{ name: "DataFlow Solutions Inc.", role: "Employer" },
	{ name: "John Smith", role: "Employee" },
	{ name: "CloudTech Services", role: "Service Provider" },
	{ name: "Enterprise Corp", role: "Customer" },
];

export const SAMPLE_COMMENTS: string[] = [
	"This clause seems overly broad and may not be enforceable in all jurisdictions.",
	"Consider adding specific performance metrics to this section.",
	"The liability limitation appears reasonable given the service level commitments.",
	"This termination clause provides adequate protection for both parties.",
	"The confidentiality provision should include a definition of confidential information.",
	"Consider adding a force majeure clause to address unforeseen circumstances.",
	"The payment terms are standard but ensure they align with project milestones.",
	"This warranty period seems appropriate for the type of services provided.",
];
