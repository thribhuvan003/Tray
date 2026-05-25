-- Migration: 20260525175000_collision_proof_tenant_slugs.sql
-- Path: supabase/migrations/20260525175000_collision_proof_tenant_slugs.sql

-- 1. Create collision-proof slug generator trigger function
CREATE OR REPLACE FUNCTION generate_clean_campus_slug()
RETURNS TRIGGER AS $$
DECLARE
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INT := 1;
BEGIN
  -- Determine base slug pattern from college_name and name
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    v_base_slug := lower(regexp_replace(NEW.college_name || '-' || NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  ELSE
    v_base_slug := lower(regexp_replace(NEW.slug, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;

  -- Trim excess trailing/leading hyphens
  v_base_slug := regexp_replace(v_base_slug, '-+$', '');
  v_base_slug := regexp_replace(v_base_slug, '^-+', '');
  
  v_final_slug := v_base_slug;

  -- Dynamic suffix checks to prevent unique constraint collisions
  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = v_final_slug AND id != NEW.id) LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_base_slug || '-' || v_counter;
  END LOOP;

  NEW.slug := v_final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to before insert/update events on public.tenants table
DROP TRIGGER IF EXISTS tenants_slug_collision_guard ON public.tenants;
CREATE TRIGGER tenants_slug_collision_guard
BEFORE INSERT OR UPDATE OF slug, name, college_name ON public.tenants
FOR EACH ROW EXECUTE FUNCTION generate_clean_campus_slug();

-- 3. Provide mapping trigger for public.canteens if it exists in any database schema variations
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'canteens') THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION generate_clean_canteen_slug()
      RETURNS TRIGGER AS $func$
      DECLARE
        v_base_slug TEXT;
        v_final_slug TEXT;
        v_counter INT := 1;
      BEGIN
        v_base_slug := lower(regexp_replace(NEW.college_name || ''-'' || NEW.location, ''[^a-zA-Z0-9]+'', ''-'', ''g''));
        v_base_slug := regexp_replace(v_base_slug, ''-+$'', '''');
        v_base_slug := regexp_replace(v_base_slug, ''^-+'', '''');
        v_final_slug := v_base_slug;

        WHILE EXISTS (SELECT 1 FROM public.canteens WHERE slug = v_final_slug AND id != NEW.id) LOOP
          v_counter := v_counter + 1;
          v_final_slug := v_base_slug || ''-'' || v_counter;
        END LOOP;

        NEW.slug := v_final_slug;
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;
    ';
    EXECUTE 'DROP TRIGGER IF EXISTS canteens_slug_collision_guard ON public.canteens';
    EXECUTE 'CREATE TRIGGER canteens_slug_collision_guard BEFORE INSERT OR UPDATE OF slug, college_name, location ON public.canteens FOR EACH ROW EXECUTE FUNCTION generate_clean_canteen_slug()';
  END IF;
END $$;
