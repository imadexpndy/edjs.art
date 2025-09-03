# Spectacle Data Sync System Documentation

## Overview
The Spectacle Data Sync System enables real-time synchronization between the admin dashboard (React app) and the public website pages. When admins make changes to spectacles in the dashboard, the changes are automatically reflected on the public website without requiring manual updates.

## System Components

### 1. Admin Dashboard (React App)
- **Location**: `/Users/Imad/Downloads/hello-planet-explore-main/src/pages/admin/SpectacleManager.tsx`
- **Features**:
  - Full CRUD operations for spectacles
  - Real-time editing interface
  - Image/video upload support
  - Session management
  - Status publishing controls

### 2. Database Schema
- **Location**: `/Users/Imad/Downloads/hello-planet-explore-main/supabase/migrations/20240101000000_create_spectacles.sql`
- **Tables**:
  - `spectacles`: Main spectacle data
  - `spectacle_sessions`: Performance sessions
  - `spectacle_categories`: Categories for filtering
  - `spectacle_category_relations`: Many-to-many relationships

### 3. Sync Scripts

#### A. Individual Spectacle Page Sync
- **File**: `/Users/Imad/Downloads/edjs-site1/assets/js/spectacle-sync.js`
- **Purpose**: Syncs data for individual spectacle pages
- **Features**:
  - Automatic slug detection from URL
  - Dynamic content updates
  - Real-time subscriptions
  - Meta tag updates
  - Media content sync

#### B. Spectacles List Sync
- **File**: `/Users/Imad/Downloads/edjs-site1/assets/js/spectacles-list-sync.js`
- **Purpose**: Syncs the main spectacles listing page
- **Features**:
  - Dynamic spectacle cards generation
  - Filtering and search
  - Real-time list updates
  - Category management

## Implementation Details

### Data Flow
1. Admin makes changes in React dashboard
2. Changes are saved to Supabase database
3. Real-time subscriptions trigger updates
4. Public website pages automatically refresh content
5. Users see updated information immediately

### Key Features

#### Real-Time Updates
- Uses Supabase real-time subscriptions
- Automatic content refresh without page reload
- Instant synchronization across all pages

#### Dynamic Content Areas
- Hero sections (title, description, images)
- Spectacle details (duration, age range, language)
- Pricing information
- Session schedules
- Media galleries

#### SEO Optimization
- Dynamic meta tag updates
- Automatic slug generation
- Search-friendly URLs

## File Structure

```
/Users/Imad/Downloads/edjs-site1/
├── assets/js/
│   ├── supabase-config.js          # Supabase configuration
│   ├── spectacle-sync.js           # Individual page sync
│   └── spectacles-list-sync.js     # List page sync
├── spectacle-*.html                # Individual spectacle pages
└── spectacles.html                 # Main spectacles listing
```

## Integration Status

### Completed Pages
- ✅ `spectacle-casse-noisette.html` - Full sync integration
- ✅ `spectacle-alice-chez-les-merveilles.html` - Sync scripts added
- ✅ `spectacle-charlotte.html` - Sync scripts added
- ✅ `spectacles.html` - List sync integration

### Remaining Pages (Need Integration)
- `spectacle-antigone.html`
- `spectacle-estevanico.html`
- `spectacle-le-petit-prince.html`
- `spectacle-leau-la.html`
- `spectacle-lenfant-de-larbre.html`
- `spectacle-simple-comme-bonjour.html`
- `spectacle-tara-sur-la-lune.html`

## Usage Instructions

### For Admins
1. Access the admin dashboard at `http://localhost:8080/admin`
2. Navigate to Spectacle Manager
3. Create, edit, or delete spectacles
4. Changes automatically sync to public website

### For Developers

#### Adding Sync to New Spectacle Pages
1. Include the sync scripts in the HTML head:
```html
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/spectacle-sync.js"></script>
```

2. Add data attributes to dynamic content areas:
```html
<h1 class="hero-title">Default Title</h1>
<p class="hero-subtitle">Default Subtitle</p>
<div class="info-pills">
  <!-- Dynamic content populated by sync script -->
</div>
```

#### Customizing Sync Behavior
- Modify `spectacle-sync.js` for individual page behavior
- Modify `spectacles-list-sync.js` for list page behavior
- Update database schema as needed

## Configuration

### Supabase Settings
- URL: `https://aioldzmwwhukzabrizkt.supabase.co`
- Configured in `assets/js/supabase-config.js`
- Real-time subscriptions enabled

### Database Policies
- Row-level security implemented
- Admin roles have full access
- Public read access for published spectacles

## Troubleshooting

### Common Issues
1. **Sync not working**: Check browser console for JavaScript errors
2. **Database connection**: Verify Supabase configuration
3. **Real-time updates**: Ensure WebSocket connections are allowed

### Debug Mode
Enable console logging in sync scripts to monitor:
- Data fetching
- Real-time subscription events
- Content updates

## Future Enhancements

### Planned Features
- Image optimization and CDN integration
- Advanced filtering and search
- Performance analytics
- A/B testing for spectacle pages
- Multi-language support

### Technical Improvements
- Caching layer for better performance
- Offline support
- Progressive web app features
- Enhanced error handling

## Security Considerations

### Data Protection
- Row-level security policies
- Admin role verification
- Input sanitization
- HTTPS enforcement

### Access Control
- Role-based permissions
- Session management
- API rate limiting
- Audit logging

## Performance Optimization

### Current Optimizations
- Efficient database queries
- Real-time subscription management
- Lazy loading for images
- Minimal DOM manipulation

### Monitoring
- Database query performance
- Real-time connection health
- Page load times
- User engagement metrics

## Maintenance

### Regular Tasks
- Monitor database performance
- Update dependencies
- Review security policies
- Backup data regularly

### Version Control
- Track schema changes
- Document API updates
- Maintain compatibility
- Test thoroughly before deployment
