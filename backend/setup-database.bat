@echo off
echo ========================================
echo PromptMaster Pro - Database Setup
echo ========================================
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo Step 2: Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    echo.
    echo Please check:
    echo - PostgreSQL is running
    echo - DATABASE_URL in .env is correct
    echo - Database exists
    pause
    exit /b 1
)
echo ✓ Migrations completed
echo.

echo Step 3: Seeding database with templates...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)
echo ✓ Database seeded successfully
echo.

echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo You can now:
echo 1. Run 'npm run dev' to start the server
echo 2. Run 'npm run prisma:studio' to view the database
echo.
pause
