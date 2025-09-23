-- Create utility functions for the application

-- Function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers to automatically update updated_at columns
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_project_sections_updated_at on public.project_sections;
create trigger update_project_sections_updated_at
  before update on public.project_sections
  for each row
  execute function public.update_updated_at_column();

-- Function to get user's project count
create or replace function public.get_user_project_count(user_uuid uuid)
returns integer
language plpgsql
security definer
as $$
declare
  project_count integer;
begin
  select count(*)
  into project_count
  from public.projects
  where user_id = user_uuid;
  
  return project_count;
end;
$$;

-- Function to duplicate a project (useful for templates)
create or replace function public.duplicate_project(
  source_project_id uuid,
  new_title text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_project_id uuid;
  source_project record;
  section_record record;
begin
  -- Get the source project
  select * into source_project
  from public.projects
  where id = source_project_id
  and user_id = auth.uid();
  
  if not found then
    raise exception 'Project not found or access denied';
  end if;
  
  -- Create new project
  insert into public.projects (
    user_id,
    title,
    description,
    original_filename,
    file_type,
    theme_settings
  ) values (
    auth.uid(),
    coalesce(new_title, source_project.title || ' (Copy)'),
    source_project.description,
    source_project.original_filename,
    source_project.file_type,
    source_project.theme_settings
  ) returning id into new_project_id;
  
  -- Copy all sections
  for section_record in
    select * from public.project_sections
    where project_id = source_project_id
    order by sort_order
  loop
    insert into public.project_sections (
      project_id,
      section_type,
      title,
      content,
      icon,
      sort_order,
      is_visible
    ) values (
      new_project_id,
      section_record.section_type,
      section_record.title,
      section_record.content,
      section_record.icon,
      section_record.sort_order,
      section_record.is_visible
    );
  end loop;
  
  return new_project_id;
end;
$$;
