-- Add optional invoice identifiers to invoice_lines for easier lookups and reporting
alter table public.invoice_lines
  add column if not exists invoice_nr text,
  add column if not exists invoice_slug text;

-- Backfill from invoices
update public.invoice_lines il
set
  invoice_nr = inv.invoice_nr,
  invoice_slug = inv.invoice_slug
from public.invoices inv
where il.invoice_id = inv.id;

comment on column public.invoice_lines.invoice_nr is 'Copy of invoice_nr for easier joins/reporting';
comment on column public.invoice_lines.invoice_slug is 'Copy of invoice_slug for easier joins/reporting';
