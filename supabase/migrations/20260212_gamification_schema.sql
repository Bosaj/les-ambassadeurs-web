-- Add points column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create badge_definitions table
CREATE TABLE IF NOT EXISTS badge_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL DEFAULT 0,
    icon TEXT NOT NULL, -- keeping it simple, referencing react-icons name or similar
    category TEXT, -- 'community', 'donation', 'event'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create point_history table
CREATE TABLE IF NOT EXISTS point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- 'attendance', 'donation', 'bonus', 'referral'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for leaderboard and history
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_point_history_user_id ON point_history(user_id);

-- Enable RLS
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;

-- Policies for badge_definitions (Public Read, Admin Write)
CREATE POLICY "Public can view badges" ON badge_definitions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON badge_definitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policies for point_history (User Read Own, Admin Read All)
CREATE POLICY "Users can view own history" ON point_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all history" ON point_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
