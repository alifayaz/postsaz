-- بررسی و اصلاح جدول posts
-- ابتدا جدول موجود را حذف کنید اگر مشکل دارد
DROP TABLE IF EXISTS posts;

-- ایجاد مجدد جدول posts با ساختار صحیح
CREATE TABLE posts (
                       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                       title VARCHAR(255) NOT NULL,
                       template_id VARCHAR(50) NOT NULL,
                       image_url TEXT,
                       caption TEXT NOT NULL,
                       topic VARCHAR(255),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد index برای بهبود عملکرد
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- تنظیم RLS (Row Level Security)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- حذف policy های قدیمی اگر وجود دارند
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Policy برای خواندن پست‌های خود کاربر
CREATE POLICY "Users can view their own posts" ON posts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy برای ایجاد پست
CREATE POLICY "Users can create their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy برای بروزرسانی پست‌های خود
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy برای حذف پست‌های خود
CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);
