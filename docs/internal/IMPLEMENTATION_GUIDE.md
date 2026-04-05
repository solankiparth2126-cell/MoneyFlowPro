# 🔧 Security Fixes Implementation Guide

This guide walks you through applying all security fixes to MoneyFlow.

---

## ✅ FIXES PROVIDED

I've created the following fix files in your repository:

### Backend Fixes (Convex)
1. **`convex/auth.ts`** - ✅ New secure auth helper functions
2. **`convex/users-FIXED.ts`** - ✅ Fixed user mutations with bcrypt
3. **`convex/transactions-FIXED.ts`** - ✅ Pattern for fixing ALL handlers

### Frontend Fixes
4. **`src/context/auth-context-FIXED.tsx`** - ✅ Clerk integration

### Tests
5. **`__tests__/security.test.ts`** - ✅ Security test suite

### Documentation
6. **`CONVEX_AUTH_MIGRATION.md`** - ✅ Migration plan
7. **`SECURITY_AUDIT.md`** - ✅ Detailed audit report
8. **This file** - ✅ Implementation guide

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Install Dependencies (5 mins)

```bash
# Install password hashing library
npm install bcryptjs

# Install Clerk for authentication
npm install @clerk/nextjs @clerk/react

# Install testing framework (if not already)
npm install --save-dev jest @jest/globals ts-jest @types/jest
```

### STEP 2: Setup Clerk (15 mins)

#### 2.1 Create Clerk Account
1. Go to https://clerk.com/
2. Sign up with GitHub
3. Create new application
4. Select "Next.js" as framework
5. Copy "Publishable Key" and "Secret Key"

#### 2.2 Add Environment Variables

**File:** `.env.local`

```env
# Convex Setup
CONVEX_DEPLOYMENT=your-deployment-id
NEXT_PUBLIC_CONVEX_URL=http://localhost:3210

# Clerk Setup (from Step 2.1)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx (optional, for advanced auth)
```

#### 2.3 Update Convex Configuration

**File:** `convex.json` or create it if it doesn't exist:

```json
{
  "authServices": [
    {
      "type": "clerk",
      "domain": "https://YOUR_CLERK_DOMAIN.clerk.accounts.com"
    }
  ]
}
```

run:
```bash
npx convex auth add
```

### STEP 3: Apply Backend Fixes (1-2 hours)

#### 3.1 Add New Auth Helper

**File:** `convex/auth.ts`

I've already created this. No changes needed - it's ready to use!

#### 3.2 Update Schema to Add Clerk Fields

**File:** `convex/schema.ts` - Modify users table:

```typescript
users: defineTable({
  email: v.string(),          // ✅ Now primary identifier
  username: v.string(),
  name: v.optional(v.string()),
  firebaseUid: v.optional(v.string()),  // ✅ Add Firebase UID
  role: v.optional(v.string()),
  status: v.optional(v.string()),
  rights: v.optional(v.array(v.string())),
  createdAt: v.number(),
})
  .index("by_email", ["email"])
  .index("by_firebaseUid", ["firebaseUid"]),  // ✅ Add index
```

Then run:
```bash
npx convex dev
# This will prompt you to create a migration
```

#### 3.3 Replace users.ts

**File:** `convex/users.ts`

Copy content from `convex/users-FIXED.ts`:

```bash
# Backup original
cp convex/users.ts convex/users-BACKUP.ts

# Replace with fixed version
cp convex/users-FIXED.ts convex/users.ts
```

OR manually update following the pattern in `users-FIXED.ts`.

#### 3.4 Fix ALL Handlers (transactions, ledgers, categories, etc.)

For EACH file in convex/:
- `convex/transactions.ts`
- `convex/ledgers.ts`
- `convex/categories.ts`
- `convex/budgets.ts`
- `convex/goals.ts`
- `convex/companies.ts`
- `convex/audit.ts`
- `convex/stats.ts`

**Pattern to follow:**

```typescript
// ❌ OLD (VULNERABLE)
export const getTransactions = query({
  args: {
    companyId: v.string(),
    userId: v.optional(v.string()),  // ❌ REMOVE
  },
  handler: async (ctx, args) => {
    if (!args.companyId || !args.userId) return [];
    await verifyOwnership(ctx, args.companyId, args.userId);  // ❌ NOT SAFE
  },
});

// ✅ NEW (SECURE)
export const getTransactions = query({
  args: {
    companyId: v.string(),  // ✅ ONLY companyId, not userId
  },
  handler: async (ctx, args) => {
    const user = await getUserOrThrow(ctx);  // ✅ GET USER FROM AUTH
    await verifyCompanyOwnership(ctx, args.companyId, user._id);  // ✅ USE VERIFIED USER
    // ... rest of logic
  },
});
```

**Template for each handler:**

```typescript
import {
  getUserOrThrow,
  verifyCompanyOwnership,
  assertValidAmount,
  assertValidDate,
  createAuditLog,
} from "./auth";

// 1. Remove userId from args
// 2. Add: const user = await getUserOrThrow(ctx);
// 3. Add: await verifyCompanyOwnership(ctx, args.companyId, user._id);
// 4. Add input validation
// 5. Add audit logging
```

See `convex/transactions-FIXED.ts` for complete pattern.

### STEP 4: Apply Frontend Fixes (1 hour)

#### 4.1 Update App Layout

**File:** `src/app/layout.tsx`

Add Clerk provider:

```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <ConvexProvider client={convex}>
            {children}
          </ConvexProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

#### 4.2 Replace Auth Context

**File:** `src/context/auth-context.tsx`

Copy from `auth-context-FIXED.tsx` OR manually update to use Clerk's `useUser()`.

Key changes:
- Remove localStorage reading
- Use `useUser()` from `@clerk/nextjs`
- Use `useQuery(api.users.getCurrentUser)` to get verified profile
- Store only companyId in state (not user data)

#### 4.3 Update All Hooks

For EACH hook in `src/hooks/`:

```typescript
// ❌ OLD
const useTransactions = (startDate?, endDate?, page = 1, pageSize = 50) => {
  const { companyId, user } = useAuth();  // user._id passed to backend

  const data = useQuery(api.transactions.getTransactions, {
    companyId: companyId ?? undefined,
    userId: user?._id,  // ❌ REMOVE!
  });
};

// ✅ NEW
const useTransactions = (startDate?, endDate?, page = 1, pageSize = 50) => {
  const { companyId } = useAuth();  // ✅ Only use companyId

  const data = useQuery(api.transactions.getTransactions, {
    companyId: companyId ?? undefined,
    // ✅ userId REMOVED - backend gets it from ctx.auth!
  });
};
```

#### 4.4 Replace Login/Register Pages

**Files:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

Replace with Clerk-powered pages:

```typescript
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return <SignIn />;
}
```

Or customize further with Clerk's components.

### STEP 5: Test the Fixes (1 hour)

#### 5.1 Run Security Tests

```bash
# Install test dependencies
npm install --save-dev jest ts-jest @types/jest

# Create jest config
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
EOF

# Run tests
npm test -- __tests__/security.test.ts
```

#### 5.2 Manual Security Testing

```bash
# 1. Try to access another user's data via browser console
# Should FAIL: Cannot pass userId to backend anymore

# 2. Try to modify localStorage
# Should have NO EFFECT: Auth comes from Clerk, not localStorage

# 3. Try to login with wrong password
# Should FAIL: Passwords are now hashed

# 4. Try to reset another user's password
# Should FAIL: Requires admin auth
```

#### 5.3 Integration Testing

```bash
# Clear any old data (optional)
npx convex dashboard

# Start dev server
npm run dev

# Test flow:
# 1. Sign up with Clerk
# 2. Create ledger
# 3. Create transaction
# 4. Verify data loads correctly
# 5. Try to hack via browser console - should be impossible
```

### STEP 6: Deploy (1 hour)

#### 6.1 Update Production Environment Variables

Add to your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CONVEX_DEPLOYMENT=your_prod_deployment
```

#### 6.2 Migrate Database (If Needed)

```bash
# Backup production database
npx convex export --path backup.json

# Deploy new schema
npm run build

# Deploy to Convex
npx convex deploy
```

#### 6.3 Deploy Frontend

```bash
# Vercel
vercel deploy --prod

# Or your chosen hosting
```

#### 6.4 Verify Production

1. Go to your production URL
2. Sign up with Clerk
3. Create test data
4. Verify no console errors
5. Verify database shows hashed passwords (NOT plain text)

---

## 🧪 VERIFICATION CHECKLIST

After implementing all fixes, verify:

- [ ] Can start `npm run dev` without errors
- [ ] Can sign up with Clerk (not localStorage)
- [ ] Can sign in and see dashboard
- [ ] Can create ledgers and transactions
- [ ] Cannot modify localStorage to spoof userId
- [ ] Cannot access other users' data
- [ ] Passwords are hashed in database (run `npx convex logs` to verify)
- [ ] Audit logs show correct username (verified user, not spoofed)
- [ ] `npm test` passes all security tests
- [ ] No TypeScript errors: `npm run typecheck`

---

## 🚨 TROUBLESHOOTING

### "Cannot find module '@clerk/nextjs'"
```bash
npm install @clerk/nextjs @clerk/react
```

### "Convex auth not working"
Make sure `.env.local` has correct keys and `convex.json` is configured.

### "getUserOrThrow is not defined"
Make sure `convex/auth.ts` is created and imported in all handlers.

### "Tests fail"
Install jest: `npm install --save-dev jest ts-jest @types/jest`

### "Old features broken"
Carefully compare your original handlers with the FIXED versions. The pattern is:
1. Remove userId from args
2. Call `getUserOrThrow(ctx)` first
3. Update all references from args.userId to user._id

---

## 📚 Resources

- Clerk Docs: https://clerk.com/docs
- Convex Auth: https://docs.convex.dev/auth
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- Security Best Practices: https://owasp.org/

---

## ❓ Questions?

If something doesn't work:
1. Check the error message carefully
2. Compare your code with the FIXED files
3. Look at the test file to see expected behavior
4. Check Clerk & Convex documentation

---

**Status:** Ready to Implement
**Estimated Time:** 4-6 hours for full implementation
**Difficulty:** Medium
