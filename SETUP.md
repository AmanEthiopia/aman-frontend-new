# AMAN Frontend Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Google OAuth (Required)**
   
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://your-production-domain.com`
   - Add authorized redirect URIs:
     - `http://localhost:3000`
     - `https://your-production-domain.com`
   - Copy the Client ID
   
3. **Create `.env.local` file**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Google Client ID:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Backend Integration

The frontend is configured to connect to the Django backend at:
```
https://api.aman.yichalal.ai/api/v1
```

### API Endpoints Used

#### Authentication
- `POST /auth/register/` - Email/password registration
- `POST /auth/login/` - Email/password login
- `POST /auth/social/google/` - Google OAuth login/register
- `POST /auth/verify-email/` - Verify email with OTP
- `POST /auth/logout/` - Logout and blacklist tokens
- `GET /users/profile/me/` - Get current user profile

#### Hotels
- `GET /hotels/` - Search hotels with filters
- `GET /hotels/{id}/` - Get hotel details
- `GET /hotels/{id}/rooms/` - Get hotel rooms

#### Bookings
- `POST /bookings/create/` - Create new booking
- `GET /bookings/` - Get user's bookings
- `GET /bookings/{id}/` - Get booking details

#### Messages
- `GET /messages/conversations/` - Get conversations
- `GET /messages/conversations/{id}/messages/` - Get messages
- `POST /messages/send/` - Send message

## Content Management

All content (hotels, cities, restaurants, etc.) is managed through the Django admin panel:
```
https://api.aman.yichalal.ai/admin/
```

### Adding Content

1. Login to Django admin
2. Navigate to the content section (Hotels, Cities, etc.)
3. Click "Add" to create new content
4. Upload images to `/media/` directory
5. Content will automatically appear in the frontend

### Media Files

Images are served from:
```
https://api.aman.yichalal.ai/media/
```

The frontend automatically converts relative media paths:
- Backend: `/media/hotels/image.jpg`
- Frontend: `https://api.aman.yichalal.ai/media/hotels/image.jpg`

## Feature Flags

Control which features are enabled in `lib/config/features.ts`:

```typescript
export const FEATURES = {
  AI_CONCIERGE: false,      // AI travel assistant
  PAYMENTS: false,          // Payment processing
  BUSINESS_MODE: false,     // Business/diplomat features
}
```

## Debugging

The app includes console logging for debugging:
- All logs are prefixed with `[v0]`
- Check browser console for API errors
- OAuth errors are logged with detailed messages

### Common Issues

**Blank home page after login:**
- Check browser console for API errors
- Verify backend is running at `https://api.aman.yichalal.ai`
- Check auth token in localStorage

**Google OAuth popup closes:**
- Verify Google Client ID is correct
- Check authorized origins in Google Console
- Look for error messages in console

**Images not loading:**
- Check Django admin has uploaded images
- Verify `/media/` directory is accessible
- Check browser console for 404 errors

## Production Deployment

1. Update environment variables for production
2. Update Google OAuth authorized origins
3. Update `MEDIA_BASE_URL` in `lib/utils/media.ts` if needed
4. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── shared/           # Shared components
│   └── ...               # Feature components
├── lib/                   # Utility libraries
│   ├── api/              # API client modules
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
└── public/               # Static assets
```

## Support

For issues or questions:
1. Check browser console for errors
2. Review API endpoints in browser DevTools
3. Verify backend is running and accessible
4. Check this documentation for common solutions
