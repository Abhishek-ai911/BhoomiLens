/**
 * BhoomiLens Statutory Authority Precedence Rules
 * Shared reference for detector heuristics, authority matrix modal, and officer documentation.
 */

export interface AuthorityRule {
  rule_id: string;
  department: string;
  precedence_rank: number;
  statutory_basis: string;
  scope: string;
  description: string;
}

export const STATUTORY_AUTHORITY_RULES: AuthorityRule[] = [
  {
    rule_id: 'REGISTRATION_BEATS_SURVEY_FOR_OWNERSHIP',
    department: 'Registration Department (IGRS)',
    precedence_rank: 1,
    statutory_basis: 'Section 17, Registration Act, 1908',
    scope: 'Ownership & Title Determination',
    description:
      'Duly registered conveyance deeds take legal precedence over entry in revenue survey registers for determining lawful titleholder.',
  },
  {
    rule_id: 'CADASTRE_BEATS_DEED_FOR_AREA',
    department: 'Settlement & Cadastral Survey Dept',
    precedence_rank: 1,
    statutory_basis: 'State Land Revenue Code (Cadastral Survey Act)',
    scope: 'Physical Extent & Cadastral Boundaries',
    description:
      'Cadastral GIS ground survey measurements supersede deed recitals for exact parcel area, ground coordinates, and boundary geometry.',
  },
  {
    rule_id: 'COURT_OVERRULES_REGISTRY',
    department: 'Judiciary / Civil Courts',
    precedence_rank: 0,
    statutory_basis: 'Section 52, Transfer of Property Act, 1882 (Lis Pendens)',
    scope: 'Judicial Restraint & Injunctions',
    description:
      'Orders, injunctions, and pending suits in competent civil courts override administrative registry transactions and freeze mutation entries.',
  },
  {
    rule_id: 'SUCCESSION_RULES_APPLY',
    department: 'Revenue & Civil Authorities',
    precedence_rank: 2,
    statutory_basis: 'Hindu Succession Act / Indian Succession Act',
    scope: 'Inheritance & Demise Devolution',
    description:
      'Upon death of titleholder, lawful legal heir succession overrides stale living records and bars unauthorized transactions.',
  },
  {
    rule_id: 'FOREST_WILDLIFE_PROTECTION',
    department: 'Ministry of Environment, Forest & Climate Change',
    precedence_rank: 0,
    statutory_basis: 'Forest (Conservation) Act, 1980 & Wildlife Protection Act',
    scope: 'Protected & Ecological Land Reserves',
    description:
      'Gazetted Forest and Wildlife sanctuary boundaries strictly invalidate private revenue alienation or commercial development claims.',
  },
  {
    rule_id: 'MUNICIPAL_ZONING_RESTRICTIONS',
    department: 'Urban Development & Master Planning Authorities',
    precedence_rank: 2,
    statutory_basis: 'State Town & Country Planning Act (Section 143/90-A)',
    scope: 'Land Use & Zoning Conversion',
    description:
      'Master plan zoning designations prevail over unapproved private conversions; formal Section 90-A/143 conversion order required.',
  },
  {
    rule_id: 'REVENUE_DEPARTMENT_FOR_TAXATION',
    department: 'Department of Revenue & Land Records',
    precedence_rank: 3,
    statutory_basis: 'State Land Revenue Act',
    scope: 'Fiscal Assessment, Jamabandi & Cesses',
    description:
      'Revenue department records govern land revenue liability, fiscal demand, mutation fee compliance, and local cess records.',
  },
  {
    rule_id: 'PANCHAYAT_MUTATION_RULES',
    department: 'Panchayati Raj & Rural Administration',
    precedence_rank: 4,
    statutory_basis: 'Panchayati Raj Act & Tahsil Rules',
    scope: 'Rural Abadi & Village Mutations',
    description:
      'Village Panchayat records provide local factual occupancy but require formal Tahsildar sanction for conclusive revenue title recognition.',
  },
];
