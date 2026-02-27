-- DropIndex (redundant — unique constraint already creates an index)
DROP INDEX "AdminUser_email_idx";
DROP INDEX "GuestUser_email_idx";
DROP INDEX "PaymentTransaction_stripePaymentId_idx";
DROP INDEX "UnavailableDate_date_idx";

-- CreateIndex: Booking.checkOut (availability queries filter on checkOut)
CREATE INDEX "Booking_checkOut_idx" ON "Booking"("checkOut");

-- CreateIndex: Booking.createdAt (admin list sorts by createdAt)
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex: Compound index for date overlap queries (availability check)
CREATE INDEX "Booking_status_checkIn_checkOut_idx" ON "Booking"("status", "checkIn", "checkOut");

-- CreateIndex: Unique constraint to prevent duplicate day-of-week overrides per season
CREATE UNIQUE INDEX "DowOverride_seasonId_dayOfWeek_key" ON "DowOverride"("seasonId", "dayOfWeek");
