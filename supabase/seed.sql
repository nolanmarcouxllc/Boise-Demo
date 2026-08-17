-- Sanitized development seed only.
-- Contains no Boise Cascade, customer, or production information.
-- Session rows require a real auth user, so seeding is left to the application:
-- signing in creates a presentation session through the service layer.
-- This file exists so `supabase db reset` succeeds locally without inventing
-- fake user identities.
select 'no seed rows: presentation data is created by an authenticated presenter' as note;
