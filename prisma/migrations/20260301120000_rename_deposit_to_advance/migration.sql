-- Rename "deposit" terminology to "advance" (anticipo)
-- Deposit = security guarantee (returned after checkout)
-- Advance = partial payment toward total price (not returned)

-- 1. Rename Booking columns
ALTER TABLE "Booking" RENAME COLUMN "depositAmount" TO "advanceAmount";
ALTER TABLE "Booking" RENAME COLUMN "depositPaid" TO "advancePaid";
ALTER TABLE "Booking" RENAME COLUMN "depositSessionId" TO "advanceSessionId";

-- 2. Rename PaymentType enum value: DEPOSIT → ADVANCE
ALTER TYPE "PaymentType" RENAME VALUE 'DEPOSIT' TO 'ADVANCE';

-- 3. Rename EmailCategory enum value: DEPOSIT_RECEIVED → ADVANCE_RECEIVED
ALTER TYPE "EmailCategory" RENAME VALUE 'DEPOSIT_RECEIVED' TO 'ADVANCE_RECEIVED';
