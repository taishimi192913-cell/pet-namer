# Supabase notes

This directory is now initialized for local Supabase CLI usage.

## Included

- `config.toml`: local CLI config
- `migrations/20260405173000_init_profiles_and_favorites.sql`: Auth / favorites schema
- `seed.sql`: placeholder seed file

## Typical commands

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:stop
```

## Remote project setup

The local files are ready, but you still need your own Supabase account to:

1. create the remote project
2. copy `SUPABASE_URL`
3. copy `SUPABASE_ANON_KEY`
4. copy `SUPABASE_SERVICE_ROLE_KEY`
5. link or push migrations if you want the hosted DB to match local
