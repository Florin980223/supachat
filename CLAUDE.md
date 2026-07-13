# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

This is a Next.js + Supabase realtime chat application.

The app includes:
- authentication with Supabase/GitHub
- protected routes
- chat rooms
- room creation
- room membership
- invite user flow
- realtime messages
- online presence
- Vercel deployment

The main goal is to make this project clean, stable, modern, and easy to explain in a portfolio/interview.

## Important Rules

- Explain everything in Romanian.
- Do not modify files before giving a clear plan.
- Ask questions if anything is unclear.
- Do not assume important behavior without checking the code first.
- Use the smallest possible changes.
- Do not rewrite the whole project unless explicitly asked.
- Never edit `.env`, `.env.local`, or expose Supabase keys/secrets.
- Never print secrets.
- After editing, explain:
  1. what files changed
  2. what changed in each file
  3. what command should be run to test
  4. what Git commands should be run after the user confirms it works
- Before any commit, the user will manually review `git diff`.

## Workflow

Always follow this workflow:

1. Analyze the codebase.
2. Explain the problem in Romanian.
3. Propose a step-by-step plan.
4. Wait for user approval.
5. Edit only the approved files.
6. Use small, safe changes.
7. Suggest or run build/test commands.
8. Explain the result.
9. Suggest Git commands only after the user confirms it works.

Do not jump directly from prompt to code changes.

## Commands

```bash
npm run dev       # start Next.js dev server
npm run build     # production build
npm run lint      # run lint if configured
git status        # check Git status
git diff          # review local changes