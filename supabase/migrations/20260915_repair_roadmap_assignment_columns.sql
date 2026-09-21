-- Repairs the assignment fields used by adaptive Roadmap generation.
-- Existing assignments and answers are preserved. Safe to run more than once.
begin;

alter table public.assignments
  add column if not exists sequence_number integer,
  add column if not exists source text not null default 'legacy',
  add column if not exists start_date timestamptz;

-- Adaptive assignments belong directly to a student, without a Bootcamp.
alter table public.assignments alter column bootcamp_id drop not null;

notify pgrst, 'reload schema';
commit;

-- Confirm all three fields are present.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'assignments'
  and column_name in ('sequence_number', 'source', 'start_date')
order by column_name;
