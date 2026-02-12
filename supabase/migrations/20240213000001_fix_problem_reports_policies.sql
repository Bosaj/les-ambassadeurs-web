-- Fix policy conflicts by dropping them if they exist before creating
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own reports" ON "public"."problem_reports";
    DROP POLICY IF EXISTS "Guests can insert reports" ON "public"."problem_reports";
    DROP POLICY IF EXISTS "Users can view their own reports" ON "public"."problem_reports";
    DROP POLICY IF EXISTS "Admins can view and update all reports" ON "public"."problem_reports";
END $$;

-- Re-create policies
CREATE POLICY "Users can insert their own reports"
ON "public"."problem_reports"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guests can insert reports"
ON "public"."problem_reports"
FOR INSERT
WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can view their own reports"
ON "public"."problem_reports"
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and update all reports"
ON "public"."problem_reports"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
