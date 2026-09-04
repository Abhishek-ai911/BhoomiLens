/**
 * BhoomiLens Bilingual Localization (English ↔ हिन्दी)
 * Provides comprehensive UI translations for Unified Land Identity, Officer Performance & Decision Support.
 */

export type SupportedLanguage = 'en' | 'hi';

export const TRANSLATIONS = {
  en: {
    // Brand & Navigation
    portalTitle: 'BhoomiLens',
    officerPortal: 'Officer Portal',
    citizenPortal: 'Citizen Portal',
    dashboard: 'Dashboard',
    priorityQueue: 'Priority Queue',
    authorityMatrix: 'Authority Matrix',
    performance: 'Performance',
    backToDashboard: 'Back to Dashboard',
    backToSearch: 'Search Another ULPIN',

    // Unified Land Identity
    unifiedLandIdentity: 'Unified Land Identity',
    associatedIdentity: 'Associated Identity',
    associatedPersons: 'Associated Persons & Legal Entities',
    maskedAadhaarDemo: 'Masked Aadhaar (Demo)',
    identityLinkage: 'Identity Linkage',
    identityLinkageAvailable: 'Identity Linkage Available',
    identityDisclaimer: 'Demo data — synthetic identifier for SIH demonstration only. No real identity data is stored.',
    partyName: 'Party Name',
    relationshipRole: 'Relationship / Role',
    legalStatus: 'Statutory Status',
    sharePercentage: 'Declared Share',

    // Officer Performance & Accountability
    officerPerformance: 'Officer Performance & Accountability',
    accountability: 'Accountability',
    performanceSummary: 'Performance Summary',
    casesAssigned: 'Cases Assigned',
    casesUnderVerification: 'Under Verification',
    casesResolved: 'Cases Resolved',
    casesRejected: 'Cases Rejected',
    moreInfoRequested: 'More Info Requested',
    openCases: 'Open Cases',
    averageResolutionTime: 'Average Resolution Time',
    auditActions: 'Audit Actions',
    completionRate: 'Completion Rate',
    recentActivity: 'Recent Activity',
    authenticatedOfficer: 'Authenticated Officer',
    revenueDepartment: 'Revenue Dept',
    operationalIntegrity: 'Operational Accountability',
    accountabilityFlowTitle: 'Officer Verification & Accountability Flow',
    accountabilityFlowDesc: 'Conflict Flag → Officer Assignment → Officer Verification → Resolution / Rejection → Append-Only Audit → Performance Scoring',

    // Case Lifecycle & Actions
    caseId: 'Case ID',
    caseStatus: 'Case Status',
    assignedOfficer: 'Assigned Officer',
    createdOn: 'Created On',
    lastUpdated: 'Last Updated',
    verificationStarted: 'Verification Started',
    resolvedOn: 'Resolved On',
    rejectedOn: 'Rejected On',
    clarityScore: 'Clarity Score',
    priorityLevel: 'Priority Level',

    // Common & Actions
    viewCase: 'View Case',
    exportReport: 'Export PDF Report',
    languageToggle: 'हिन्दी',
    english: 'English',
    hindi: 'हिन्दी',
  },
  hi: {
    // Brand & Navigation
    portalTitle: 'भूमि-लेंस (BhoomiLens)',
    officerPortal: 'अधिकारी पोर्टल',
    citizenPortal: 'नागरिक पोर्टल',
    dashboard: 'डैशबोर्ड',
    priorityQueue: 'प्राथमिकता कतार',
    authorityMatrix: 'प्राधिकरण मैट्रिक्स',
    performance: 'प्रदर्शन एवं जवाबदेही',
    backToDashboard: 'डैशबोर्ड पर लौटें',
    backToSearch: 'अन्य ULPIN खोजें',

    // Unified Land Identity
    unifiedLandIdentity: 'एकीकृत भूमि पहचान',
    associatedIdentity: 'संबद्ध पहचान',
    associatedPersons: 'संबद्ध व्यक्ति एवं विधिक संस्थाएं',
    maskedAadhaarDemo: 'मुखौटा आधार (डेमो)',
    identityLinkage: 'पहचान लिंकेज',
    identityLinkageAvailable: 'पहचान लिंकेज उपलब्ध',
    identityDisclaimer: 'डेमो डेटा — केवल एसआईएच प्रदर्शन हेतु कृत्रिम पहचानकर्ता। कोई वास्तविक पहचान डेटा संग्रहीत नहीं है।',
    partyName: 'पक्षकार का नाम',
    relationshipRole: 'संबंध / अधिकार प्रकार',
    legalStatus: 'विधिक स्थिति',
    sharePercentage: 'घोषित हिस्सा',

    // Officer Performance & Accountability
    officerPerformance: 'अधिकारी प्रदर्शन एवं जवाबदेही',
    accountability: 'जवाबदेही',
    performanceSummary: 'प्रदर्शन सारांश',
    casesAssigned: 'सौंपे गए मामले',
    casesUnderVerification: 'सत्यापन अधीन',
    casesResolved: 'सुलझाए गए मामले',
    casesRejected: 'खारिज किए गए मामले',
    moreInfoRequested: 'अतिरिक्त जानकारी प्रतीक्षित',
    openCases: 'खुले मामले',
    averageResolutionTime: 'औसत समाधान समय',
    auditActions: 'ऑडिट कार्यवाहियां',
    completionRate: 'पूर्णता दर',
    recentActivity: 'हाल की गतिविधि',
    authenticatedOfficer: 'प्रमाणित राजस्व अधिकारी',
    revenueDepartment: 'राजस्व विभाग',
    operationalIntegrity: 'प्रशासनिक जवाबदेही',
    accountabilityFlowTitle: 'अधिकारी सत्यापन एवं जवाबदेही प्रवाह',
    accountabilityFlowDesc: 'विसंगति पहचान → अधिकारी आवंटन → अधिकारी सत्यापन → समाधान / निरस्तीकरण → संलग्न ऑडिट → प्रदर्शन मूल्यांकन',

    // Case Lifecycle & Actions
    caseId: 'मामला क्रमांक (Case ID)',
    caseStatus: 'मामले की स्थिति',
    assignedOfficer: 'नामित अधिकारी',
    createdOn: 'दर्ज तिथि',
    lastUpdated: 'अंतिम अद्यतन',
    verificationStarted: 'सत्यापन प्रारंभ',
    resolvedOn: 'समाधान तिथि',
    rejectedOn: 'खारिज तिथि',
    clarityScore: 'स्पष्टता स्कोर (Clarity)',
    priorityLevel: 'प्राथमिकता स्तर (Priority)',

    // Common & Actions
    viewCase: 'मामला देखें',
    exportReport: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    languageToggle: 'English',
    english: 'English',
    hindi: 'हिन्दी',
  },
} as const;

export type TranslationDictionary = {
  [K in keyof typeof TRANSLATIONS.en]: string;
};

export function getTranslation(lang: SupportedLanguage = 'en'): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
