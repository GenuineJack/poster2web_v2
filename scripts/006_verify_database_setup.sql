-- Creating database verification script
-- Verify all tables exist and have proper RLS policies

-- Check if all required tables exist
DO $$
BEGIN
    -- Check profiles table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'profiles table does not exist. Run 001_create_profiles.sql first.';
    END IF;
    
    -- Check projects table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        RAISE EXCEPTION 'projects table does not exist. Run 002_create_projects.sql first.';
    END IF;
    
    -- Check project_sections table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_sections') THEN
        RAISE EXCEPTION 'project_sections table does not exist. Run 003_create_project_sections.sql first.';
    END IF;
    
    -- Check project_assets table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_assets') THEN
        RAISE EXCEPTION 'project_assets table does not exist. Run 004_create_project_assets.sql first.';
    END IF;
    
    RAISE NOTICE 'All required tables exist ✅';
END
$$;

-- Verify RLS is enabled on all tables
DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    FOR table_name IN VALUES ('profiles'), ('projects'), ('project_sections'), ('project_assets')
    LOOP
        SELECT relrowsecurity INTO rls_enabled 
        FROM pg_class 
        WHERE relname = table_name;
        
        IF NOT rls_enabled THEN
            RAISE EXCEPTION 'RLS is not enabled on table: %', table_name;
        END IF;
        
        RAISE NOTICE 'RLS enabled on %: ✅', table_name;
    END LOOP;
END
$$;

-- Verify policies exist
DO $$
DECLARE
    policy_count integer;
BEGIN
    -- Check profiles policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'profiles';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for profiles table';
    END IF;
    RAISE NOTICE 'profiles table has % policies ✅', policy_count;
    
    -- Check projects policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'projects';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for projects table';
    END IF;
    RAISE NOTICE 'projects table has % policies ✅', policy_count;
    
    -- Check project_sections policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'project_sections';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for project_sections table';
    END IF;
    RAISE NOTICE 'project_sections table has % policies ✅', policy_count;
    
    -- Check project_assets policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'project_assets';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for project_assets table';
    END IF;
    RAISE NOTICE 'project_assets table has % policies ✅', policy_count;
END
$$;

-- Test basic functionality
DO $$
BEGIN
    RAISE NOTICE 'Database setup verification completed successfully! 🎉';
    RAISE NOTICE 'All tables exist, RLS is enabled, and policies are in place.';
END
$$;
