CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS shared_documents (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  markdown        text        NOT NULL,
  theme           text        NOT NULL,
  custom_css      text,
  metadata_title  text,
  metadata_author text,
  rounded_corners boolean     NOT NULL DEFAULT false,
  show_toc        boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shared_documents_created_at_idx
  ON shared_documents (created_at DESC);
