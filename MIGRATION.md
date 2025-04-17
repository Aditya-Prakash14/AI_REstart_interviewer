# Migration Guide: Firebase to Supabase

This guide will help you migrate your Prepwise application from Firebase to Supabase.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your Supabase URL and anon key from the project settings

## Migration Steps

### 1. Update Environment Variables

Replace your Firebase environment variables with Supabase ones in your `.env.local` file:

```env
# Vapi AI
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Set Up Supabase Database

Run the SQL script in `supabase/schema.sql` in your Supabase SQL editor to create the necessary tables and policies.

### 3. Enable Email Authentication

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider
4. Configure any additional settings as needed

### 4. Migrate Existing Data (Optional)

If you have existing data in Firebase that you want to migrate:

1. Export your Firebase data using the Firebase console or Firebase Admin SDK
2. Transform the data to match the Supabase schema
3. Import the data into Supabase using the Supabase dashboard or API

## Testing

After migration, test the following functionality:

1. User registration
2. User login
3. Creating interviews
4. Viewing interviews
5. Getting feedback

## Troubleshooting

If you encounter any issues during migration:

1. Check the browser console for errors
2. Verify your environment variables are correctly set
3. Ensure the Supabase tables and policies are properly configured
4. Check the Supabase logs in the dashboard for any errors

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
