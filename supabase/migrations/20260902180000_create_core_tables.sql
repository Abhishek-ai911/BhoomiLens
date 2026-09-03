CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE parcels (
  parcel_id uuid PRIMARY KEY,
  ulpin text NOT NULL UNIQUE,
  geometry extensions.geometry NULL,
  area numeric NULL,
  classification text NULL
);

CREATE TABLE persons (
  person_id uuid PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE interests (
  interest_id uuid PRIMARY KEY,
  parcel_id uuid NOT NULL REFERENCES parcels (parcel_id),
  person_id uuid NOT NULL REFERENCES persons (person_id),
  interest_type text NOT NULL,
  share numeric NULL,
  status text NULL,
  valid_from timestamptz NULL,
  valid_to timestamptz NULL
);

CREATE TABLE records (
  record_id uuid PRIMARY KEY,
  parcel_id uuid NOT NULL REFERENCES parcels (parcel_id),
  person_id uuid NULL REFERENCES persons (person_id),
  record_type text NOT NULL,
  source text NOT NULL,
  payload jsonb NULL,
  status text NOT NULL,
  valid_from timestamptz NULL,
  valid_to timestamptz NULL,
  recorded_at timestamptz NOT NULL,
  CONSTRAINT records_status_check CHECK (
    status IN (
      'PRESENT',
      'NOT_FOUND',
      'CONFIRMED_ABSENT',
      'CONFLICTING',
      'UNAVAILABLE'
    )
  )
);

CREATE TABLE transactions (
  transaction_id uuid PRIMARY KEY,
  parcel_id uuid NOT NULL REFERENCES parcels (parcel_id),
  from_person_id uuid NOT NULL REFERENCES persons (person_id),
  to_person_id uuid NOT NULL REFERENCES persons (person_id),
  occurred_at timestamptz NOT NULL
);

CREATE TABLE conflicts (
  conflict_id uuid PRIMARY KEY,
  parcel_id uuid NOT NULL REFERENCES parcels (parcel_id),
  conflict_type text NOT NULL,
  evidence jsonb NOT NULL
);

CREATE TABLE authority_rules (
  authority_rule_id uuid PRIMARY KEY,
  jurisdiction text NOT NULL,
  attribute text NOT NULL,
  source text NOT NULL
);

CREATE TABLE cases (
  case_id uuid PRIMARY KEY,
  conflict_id uuid NOT NULL REFERENCES conflicts (conflict_id),
  assigned_to uuid NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE audit_logs (
  audit_log_id uuid PRIMARY KEY,
  case_id uuid NULL REFERENCES cases (case_id),
  action text NOT NULL,
  actor_id uuid NULL,
  occurred_at timestamptz NOT NULL,
  details jsonb NULL
);

CREATE INDEX idx_parcels_geometry ON parcels USING GIST (geometry);
CREATE INDEX idx_interests_parcel_id ON interests (parcel_id);
CREATE INDEX idx_interests_person_id ON interests (person_id);
CREATE INDEX idx_records_parcel_id ON records (parcel_id);
CREATE INDEX idx_records_person_id ON records (person_id);
CREATE INDEX idx_records_parcel_id_record_type ON records (parcel_id, record_type);
CREATE INDEX idx_transactions_parcel_id_occurred_at ON transactions (parcel_id, occurred_at);
CREATE INDEX idx_transactions_from_person_id ON transactions (from_person_id);
CREATE INDEX idx_transactions_to_person_id ON transactions (to_person_id);
CREATE INDEX idx_conflicts_parcel_id ON conflicts (parcel_id);
CREATE INDEX idx_cases_conflict_id ON cases (conflict_id);
CREATE INDEX idx_audit_logs_case_id ON audit_logs (case_id);
CREATE INDEX idx_authority_rules_jurisdiction_attribute ON authority_rules (jurisdiction, attribute);
