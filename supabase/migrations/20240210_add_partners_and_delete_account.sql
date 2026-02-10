-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON public.partners
    FOR SELECT USING (true);

-- Allow admin insert/update/delete (assuming admin role or check via auth.uid())
-- For now, we'll allow authenticated users to view, and rely on app logic for admin
-- Ideally we check for admin role in metadata
CREATE POLICY "Enable insert for authenticated users only" ON public.partners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.partners
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.partners
    FOR DELETE USING (auth.role() = 'authenticated');


-- Create delete_own_account RPC
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS VOID AS $$
BEGIN
  -- Delete the user from auth.users (this will cascade to profiles if properly set up, 
  -- but usually we might need to manually clean up or rely on ON DELETE CASCADE)
  -- accurate way: DELETE FROM auth.users WHERE id = auth.uid();
  -- However, executing this from a function requires high privileges (SECURITY DEFINER)
  
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
