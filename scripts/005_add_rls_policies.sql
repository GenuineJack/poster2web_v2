-- Add RLS policies for profiles table
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Add RLS policies for projects table
create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Add RLS policies for project_sections table
create policy "project_sections_select_own"
  on public.project_sections for select
  using (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

create policy "project_sections_insert_own"
  on public.project_sections for insert
  with check (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

create policy "project_sections_update_own"
  on public.project_sections for update
  using (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

create policy "project_sections_delete_own"
  on public.project_sections for delete
  using (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

-- Add RLS policies for project_assets table
create policy "project_assets_select_own"
  on public.project_assets for select
  using (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

create policy "project_assets_insert_own"
  on public.project_assets for insert
  with check (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

create policy "project_assets_update_own"
  on public.project_assets for update
  using (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );

create policy "project_assets_delete_own"
  on public.project_assets for delete
  using (
    auth.uid() in (
      select user_id from public.projects where id = project_id
    )
  );
