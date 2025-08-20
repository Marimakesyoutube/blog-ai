
create table if not exists posts (
  id bigint generated always as identity primary key,
  title text,
  slug text,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists posts_created_at_idx on posts(created_at desc);
