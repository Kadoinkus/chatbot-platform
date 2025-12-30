-- Add optional links for invoice PDF and supporting documents
alter table public.invoices
  add column if not exists invoice_url text,
  add column if not exists supporting_doc_url text;

comment on column public.invoices.invoice_url is 'Link to the finalized invoice/PDF for download';
comment on column public.invoices.supporting_doc_url is 'Link to supporting docs such as offer/proposal/SOW';
