/**
 * BhoomiLens AI & Decision Support Explanation Layer
 * Strictly isolated: Explanatory only.
 * AI never detects conflicts, calculates scores, or decides ownership.
 * Provides deterministic fallbacks when LLM API keys are unconfigured.
 */

import { ConflictEvidence, ConflictType } from '../reconciliation/types';
import { PriorityLevel } from '../scoring/types';
import { formatConflictName, formatPriority } from '../ui/formatters';

export interface ExplanationInput {
  conflictType: ConflictType;
  evidence: ConflictEvidence;
  clarity: number;
  priority: PriorityLevel;
  ulpin: string;
  classification?: string | null;
}

export interface ExplanationResult {
  summary: string;
  riskAnalysis: string;
  recommendedActions: string[];
  isAiGenerated: boolean;
  model: string;
  disclaimer: string;
}

const DETERMINISTIC_KNOWLEDGE: Record<
  string,
  {
    riskContext: string;
    actionTemplate: string[];
  }
> = {
  OWNERSHIP_CONFLICT: {
    riskContext:
      'Discrepancy in registered ownership vs revenue records poses substantial risk of title ambiguity, potential fraudulent conveyance, or un-synchronized record indexing.',
    actionTemplate: [
      'Call for certified Copy of registered sale deed from Sub-Registrar Office.',
      'Inspect latest Khatoni / Jamabandi extract from Tahsil revenue record room.',
      'Verify if any registered power of attorney (PoA) or succession was recorded.',
    ],
  },
  MUTATION_CONFLICT: {
    riskContext:
      'Pending or contested mutation implies title devolution has not been formally incorporated into the revenue register, impeding fiscal assessment and lawful transfer.',
    actionTemplate: [
      'Inspect Tahsildar mutation register for current stage of pending mutation proceedings.',
      'Verify if 30-day statutory notice period for public objection has lapsed without contest.',
      'Check if registered deed was transmitted to Revenue department via automatic e-mutation.',
    ],
  },
  LIFECYCLE_CONFLICT: {
    riskContext:
      'Record indicates title in the name of a deceased individual or post-demise transaction, creating acute vulnerability to unauthorized alienation without lawful succession.',
    actionTemplate: [
      'Demand original death certificate from Registrar of Births & Deaths.',
      'Examine legal heir / surviving member certificate issued by competent revenue authority.',
      'Verify whether registered deed executed post-demise utilized an unauthorized power of attorney.',
    ],
  },
  AREA_MISMATCH: {
    riskContext:
      'Variance between cadastral GIS boundary survey and registered deed extent indicates potential boundary encroachment, measurement error, or unapproved subdivision.',
    actionTemplate: [
      'Commission on-site DGPS / Electronic Total Station (ETS) cadastral resurvey.',
      'Compare boundary coordinates with Tippan / FMB (Field Measurement Book) sheets.',
      'Confirm whether adjacent parcel boundaries exhibit corresponding area deficits or overlaps.',
    ],
  },
  BOUNDARY_ANOMALY: {
    riskContext:
      'Cadastral boundary polygon overlaps or inconsistent survey coordinates risk immediate boundary disputes with adjoining parcel holders.',
    actionTemplate: [
      'Conduct joint inspection with adjoining landholders and revenue patwari.',
      'Review village cadastral map (Aks-Shajra / Village Map) to confirm fixed boundary markers.',
      'Update PostGIS polygon geometry with certified resurvey coordinates upon reconciliation.',
    ],
  },
  LAND_USE_CONFLICT: {
    riskContext:
      'Commercial or non-agricultural activity on agricultural classification without formal Section 143/90-A conversion breaches state land-use statutes.',
    actionTemplate: [
      'Verify master plan zoning map with Town & Country Planning Department.',
      'Check whether Section 90-A / 143 land-use conversion order and premium receipts exist.',
      'Issue notice to titleholder if unauthorized commercial structure is operating on agricultural land.',
    ],
  },
  GOVERNMENT_LAND_RISK: {
    riskContext:
      'Private transfer or claim over State/Poramboke/Gair Mumkin land represents severe legal illegality and state custody infringement.',
    actionTemplate: [
      'Immediately flag parcel to Sub-Divisional Magistrate (SDM) / Collector custody.',
      'Cross-reference original settlement records (Bandobast) for government vesting history.',
      'Halt any pending registration or mutation entries pending formal Collector enquiry.',
    ],
  },
  MISSING_RECORD_CONFLICT: {
    riskContext:
      'Inability to locate or query records from one or more vital departments limits complete verification and indicates incomplete digitization or inter-departmental indexing gaps.',
    actionTemplate: [
      'Issue departmental notice to missing custodian department for manual record verification.',
      'Inspect physical archives at Sub-Registrar / Tahsil record room.',
      'Log open-world record availability status in BhoomiLens audit ledger.',
    ],
  },
  COURT_CONFLICT: {
    riskContext:
      'Active civil litigation or injunction (Lis Pendens under Section 52 Transfer of Property Act) prohibits alienation or mutation until judicial determination.',
    actionTemplate: [
      'Fetch certified order copy of active suit from e-Courts judicial portal.',
      'Verify whether stay order or temporary injunction restricts title transfer.',
      'Mark parcel records with statutory Lis Pendens warning in both Registry and Revenue portals.',
    ],
  },
  MULTIPLE_ENCUMBRANCE: {
    riskContext:
      'Simultaneous active mortgage charges across multiple banking institutions signal high risk of duplicate pledging or unregistered prior charges.',
    actionTemplate: [
      'Search CERSAI (Central Registry of Securitisation Asset Reconstruction) portal for registered security interests.',
      'Request No-Objection Certificate (NOC) or charge discharge statement from all listed lending banks.',
      'Verify priority of charge based on deed execution dates.',
    ],
  },
  UNUSUAL_TRANSACTION_VELOCITY: {
    riskContext:
      'Rapid successive conveyances within a short duration indicate possible speculative flipping, value inflation, or attempts to wash defective titles.',
    actionTemplate: [
      'Examine complete chain of title deeds and consideration values for past 3 years.',
      'Verify identity and KYC of all intermediary buyers and sellers.',
      'Check for associated shell entity ownership or benami transactions.',
    ],
  },
  CIRCULAR_TRANSACTION: {
    riskContext:
      'Land returning to original seller or allied party through circular intermediaries strongly suggests fictitious conveyance or artificial price indexing.',
    actionTemplate: [
      'Analyze beneficial ownership links between initial transferor and final transferee.',
      'Examine banking transaction trails and stamp duty valuation across all cycle deeds.',
      'Refer case to revenue anti-fraud / vigilance cell if consideration trails are unaccounted.',
    ],
  },
  RECURRING_ENTITY: {
    riskContext:
      'A single corporate or individual intermediary appearing repeatedly across high-dispute transactions suggests systematic brokerage manipulation.',
    actionTemplate: [
      'Review Ministry of Corporate Affairs (MCA) filings for director and shareholder details.',
      'Audit all other parcel transactions associated with this recurring entity in the district.',
      'Flag entity in officer surveillance dashboard for mandatory deed pre-clearance.',
    ],
  },
  TAX_CONFLICT: {
    riskContext:
      'Prolonged unpaid property taxes or revenue cesses create statutory charge on the property in favor of local bodies.',
    actionTemplate: [
      'Issue demand notice for outstanding municipal tax and revenue dues.',
      'Require tax clearance certificate prior to approval of pending mutation.',
      'Update revenue demand register upon payment reconciliation.',
    ],
  },
};

/**
 * Generates an explainable briefing for verification officers.
 * Tries Gemini API if key is present, otherwise falls back to deterministic briefing.
 */
export async function generateCaseExplanation(
  input: ExplanationInput
): Promise<ExplanationResult> {
  const { conflictType, evidence, clarity, priority, ulpin, classification } = input;
  const knowledge = DETERMINISTIC_KNOWLEDGE[conflictType] || {
    riskContext: 'Inconsistency detected between departmental records requires human review.',
    actionTemplate: [
      'Inspect physical records at custodian department.',
      'Cross-verify party identities with national identity databases.',
      'Verify spatial measurements on site.',
    ],
  };

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.LLM_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are the BhoomiLens Explainable Decision Support assistant for Land Revenue Verification Officers in India.
Synthesize a concise, highly professional, 3-part officer briefing based STRICTLY on the deterministic evidence provided below.
DO NOT hallucinate facts, DO NOT decide ownership, DO NOT declare guilt or fraud. You are an explanatory aid.

Parcel ULPIN: ${ulpin}
Classification: ${classification || 'Not specified'}
Clarity Score: ${clarity}/100
Priority Tier: ${formatPriority(priority)}
Conflict Type: ${formatConflictName(conflictType)}
Detected Variance (What): ${evidence.what}
Legal/Operational Context (Why): ${evidence.why}
Sources Compared: ${evidence.source.join(', ')}
Records Cited: ${evidence.record_ids.join(', ')}
Statutory Rule: ${evidence.authority || 'Standard Revenue/Registration precedence'}

Format your response as a valid JSON object with EXACTLY these three keys:
{
  "summary": "2-3 clear sentences summarizing what was detected across the specific departments and records.",
  "riskAnalysis": "2 sentences explaining the legal or operational risks if this discrepancy remains unverified.",
  "recommendedActions": ["Step 1", "Step 2", "Step 3"]
}
Return ONLY valid raw JSON, without markdown code fences or conversational filler.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.summary && parsed.riskAnalysis && Array.isArray(parsed.recommendedActions)) {
            return {
              summary: parsed.summary,
              riskAnalysis: parsed.riskAnalysis,
              recommendedActions: parsed.recommendedActions,
              isAiGenerated: true,
              model: 'Gemini 1.5 Flash (Decision Support)',
              disclaimer:
                'AI Explanatory Layer: Synthesized from deterministic conflict evidence. Non-authoritative.',
            };
          }
        }
      }
    } catch (err) {
      // Gracefully fall through to deterministic briefing on any API error or timeout
      console.warn('Gemini explanation fallback to deterministic generator:', err);
    }
  }

  // Deterministic Fallback Briefing
  const deterministicSummary = `Deterministic analysis of parcel ${ulpin} identified ${evidence.what} Sources compared: ${evidence.source.join(
    ', '
  )} citing record IDs (${evidence.record_ids.join(', ')}).`;

  const deterministicRisk = `${knowledge.riskContext} Deterministic clarity score is ${clarity}/100 with a ${formatPriority(priority)} priority tier.`;

  return {
    summary: deterministicSummary,
    riskAnalysis: deterministicRisk,
    recommendedActions: knowledge.actionTemplate,
    isAiGenerated: false,
    model: 'Deterministic Decision Support Engine',
    disclaimer:
      'Explainable Decision Support: Generated deterministically from statutory rules and conflict detectors.',
  };
}
