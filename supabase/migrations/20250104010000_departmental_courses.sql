-- Create table for departmental course listings
CREATE TABLE IF NOT EXISTS departmental_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department VARCHAR(255) NOT NULL,
    level VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    session VARCHAR(20) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    units INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'compulsory', -- compulsory, elective
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(department, level, semester, session, course_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_departmental_courses_department ON departmental_courses(department);
CREATE INDEX IF NOT EXISTS idx_departmental_courses_level ON departmental_courses(level);
CREATE INDEX IF NOT EXISTS idx_departmental_courses_semester ON departmental_courses(semester);
CREATE INDEX IF NOT EXISTS idx_departmental_courses_session ON departmental_courses(session);
CREATE INDEX IF NOT EXISTS idx_departmental_courses_search ON departmental_courses(department, level, semester, session);

-- Enable RLS
ALTER TABLE departmental_courses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view departmental courses" ON departmental_courses
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert departmental courses" ON departmental_courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'head_admin')
        )
    );

CREATE POLICY "Only admins can update departmental courses" ON departmental_courses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'head_admin')
        )
    );

CREATE POLICY "Only admins can delete departmental courses" ON departmental_courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'head_admin')
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_departmental_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_departmental_courses_updated_at
    BEFORE UPDATE ON departmental_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_departmental_courses_updated_at();
