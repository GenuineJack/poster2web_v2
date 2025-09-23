-- Create project_sections table for storing individual sections of a project
-- Each section represents a part of the converted document (header, content blocks, etc.)

create table if not exists public.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_type text not null check (section_type in ('header', 'content', 'image', 'list', 'footer')),
  title text not null,
  content jsonb not null default '[]', -- Array of content blocks
  icon text default '📄',
  sort_order integer not null default 0,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.project_sections enable row level security;

-- Create policies for project_sections table (access through project ownership)
create policy "project_sections_select_own"
  on public.project_sections for select
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_sections.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_sections_insert_own"
  on public.project_sections for insert
  with check (
    exists (
      select 1 from public.projects 
      where projects.id = project_sections.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_sections_update_own"
  on public.project_sections for update
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_sections.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_sections_delete_own"
  on public.project_sections for delete
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_sections.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index if not exists project_sections_project_id_idx on public.project_sections(project_id);
create index if not exists project_sections_sort_order_idx on public.project_sections(project_id, sort_order);
create index if not exists project_sections_type_idx on public.project_sections(section_type);
