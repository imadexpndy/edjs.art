# EDJS Website - Supabase Authentication Integration

## Overview
The EDJS website now includes Supabase authentication with role-based access control for different user types.

## Setup Instructions

### 1. Supabase Configuration
Replace the placeholders in `assets/js/supabase-config.js`:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 2. Database Schema
Create these tables in your Supabase database:

#### user_profiles table
```sql
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('school', 'association', 'individual')),
    organization_name TEXT,
    contact_person TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### spectacles table
```sql
CREATE TABLE spectacles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    duration INTEGER DEFAULT 60,
    age_range TEXT,
    target_audience TEXT NOT NULL CHECK (target_audience IN ('school', 'association', 'individual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### reservations table
```sql
CREATE TABLE reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spectacle_id UUID REFERENCES spectacles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    reservation_date DATE NOT NULL,
    participant_count INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)
Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spectacles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Spectacles policies
CREATE POLICY "Anyone can view spectacles" ON spectacles
    FOR SELECT USING (true);

-- Reservations policies
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create reservations" ON reservations
    FOR INSERT WITH CHECK (true);
```

## Features Implemented

### Authentication System
- **Login/Register Modal**: Responsive modal with role selection
- **User Roles**: School, Association, Individual
- **Header Integration**: Dynamic auth buttons that switch to user menu when logged in
- **Session Management**: Persistent login state across page refreshes

### Role-Based Access
- **Schools & Associations**: Must log in to see their assigned spectacles
- **Individuals**: Can choose to continue as guest or log in
- **Guest Access**: Popup offering login or guest continuation for individuals

### User Menu (When Logged In)
- Dashboard (links to external web app)
- My Reservations
- My Bills  
- Settings
- Support
- Logout

### Spectacles Page
- **Dynamic Loading**: Spectacles filtered by user role from Supabase
- **Guest Access**: Individuals can view and reserve without account
- **Reservation System**: Modal form for both authenticated and guest users

## File Structure
```
assets/
├── css/
│   └── auth-styles.css          # Authentication UI styles
└── js/
    ├── supabase-config.js       # Supabase client and auth manager
    └── spectacles-auth.js       # Spectacles page auth logic

standard-header.html             # Updated header template
update-auth-integration.py       # Script to add Supabase to all pages
README-AUTH.md                   # This documentation
```

## Usage

### For Development
1. Replace Supabase credentials in `supabase-config.js`
2. Set up the database schema as described above
3. Test the authentication flow on `http://localhost:8080`

### For Production
1. Update the `DASHBOARD_URL` placeholder in `supabase-config.js` to point to your web app dashboard
2. Configure proper email templates in Supabase Auth
3. Set up proper domain configuration for authentication redirects

## Testing Checklist
- [ ] Register new users (all 3 role types)
- [ ] Login/logout functionality
- [ ] Header buttons switch correctly
- [ ] User dropdown menu works
- [ ] Guest access popup shows for individuals
- [ ] Role-based spectacle filtering
- [ ] Reservation system for auth/guest users
- [ ] Mobile responsiveness
