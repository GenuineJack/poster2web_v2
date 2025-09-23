-- Create project_assets table for storing uploaded files and generated assets
-- This includes original documents, images, and exported files

create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_type text not null check (asset_type in ('original_file', 'image', 'export', 'thumbnail')),
  filename text not null,
  file_path text not null, -- Path in storage bucket
  file_size bigint,
  mime_type text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.project_assets enable row level security;

-- Create policies for project_assets table (access through project ownership)
create policy "project_assets_select_own"
  on public.project_assets for select
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_assets.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_assets_insert_own"
  on public.project_assets for insert
  with check (
    exists (
      select 1 from public.projects 
      where projects.id = project_assets.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_assets_update_own"
  on public.project_assets for update
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_assets.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_assets_delete_own"
  on public.project_assets for delete
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_assets.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index if not exists project_assets_project_id_idx on public.project_assets(project_id);
create index if not exists project_assets_type_idx on public.project_assets(asset_type);
create index if not exists project_assets_created_at_idx on public.project_assets(created_at desc);
