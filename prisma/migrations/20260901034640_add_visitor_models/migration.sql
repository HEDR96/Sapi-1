-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'SOLD', 'BOOKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('SEHAT', 'DALAM_PERAWATAN', 'OBSERVASI', 'SAKIT', 'SEMBUH');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('GENERAL', 'WEIGHT', 'HEALTH', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Cattle" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "birth_date" TIMESTAMP(3) NOT NULL,
    "height" DOUBLE PRECISION,
    "price" DECIMAL(15,2) NOT NULL,
    "target_weight" DOUBLE PRECISION,
    "description" TEXT,
    "main_image" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleWeight" (
    "id" TEXT NOT NULL,
    "cattle_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "measurement_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CattleWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleWeightMedia" (
    "id" TEXT NOT NULL,
    "weight_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CattleWeightMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleHealthRecord" (
    "id" TEXT NOT NULL,
    "cattle_id" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "health_type" TEXT NOT NULL,
    "status" "HealthStatus" NOT NULL DEFAULT 'SEHAT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CattleHealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleHealthMedia" (
    "id" TEXT NOT NULL,
    "health_record_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CattleHealthMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleFeedRecord" (
    "id" TEXT NOT NULL,
    "cattle_id" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "feed_type" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CattleFeedRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleMedia" (
    "id" TEXT NOT NULL,
    "cattle_id" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL DEFAULT 'GENERAL',
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CattleMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "verificationExpiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cattle_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "cattle_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "page" TEXT NOT NULL,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "page_views" INTEGER NOT NULL DEFAULT 0,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "cattle_views" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cattle_code_key" ON "Cattle"("code");

-- CreateIndex
CREATE INDEX "Cattle_status_idx" ON "Cattle"("status");

-- CreateIndex
CREATE INDEX "Cattle_breed_idx" ON "Cattle"("breed");

-- CreateIndex
CREATE INDEX "CattleWeight_cattle_id_idx" ON "CattleWeight"("cattle_id");

-- CreateIndex
CREATE INDEX "CattleWeight_measurement_date_idx" ON "CattleWeight"("measurement_date");

-- CreateIndex
CREATE INDEX "CattleHealthRecord_cattle_id_idx" ON "CattleHealthRecord"("cattle_id");

-- CreateIndex
CREATE INDEX "CattleFeedRecord_cattle_id_idx" ON "CattleFeedRecord"("cattle_id");

-- CreateIndex
CREATE INDEX "CattleMedia_cattle_id_idx" ON "CattleMedia"("cattle_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Comment_cattle_id_idx" ON "Comment"("cattle_id");

-- CreateIndex
CREATE INDEX "Comment_user_id_idx" ON "Comment"("user_id");

-- CreateIndex
CREATE INDEX "Comment_created_at_idx" ON "Comment"("created_at");

-- CreateIndex
CREATE INDEX "Booking_cattle_id_idx" ON "Booking"("cattle_id");

-- CreateIndex
CREATE INDEX "Booking_user_id_idx" ON "Booking"("user_id");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Visitor_page_idx" ON "Visitor"("page");

-- CreateIndex
CREATE INDEX "Visitor_created_at_idx" ON "Visitor"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");

-- AddForeignKey
ALTER TABLE "CattleWeight" ADD CONSTRAINT "CattleWeight_cattle_id_fkey" FOREIGN KEY ("cattle_id") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleWeightMedia" ADD CONSTRAINT "CattleWeightMedia_weight_id_fkey" FOREIGN KEY ("weight_id") REFERENCES "CattleWeight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleHealthRecord" ADD CONSTRAINT "CattleHealthRecord_cattle_id_fkey" FOREIGN KEY ("cattle_id") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleHealthMedia" ADD CONSTRAINT "CattleHealthMedia_health_record_id_fkey" FOREIGN KEY ("health_record_id") REFERENCES "CattleHealthRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleFeedRecord" ADD CONSTRAINT "CattleFeedRecord_cattle_id_fkey" FOREIGN KEY ("cattle_id") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleMedia" ADD CONSTRAINT "CattleMedia_cattle_id_fkey" FOREIGN KEY ("cattle_id") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_cattle_id_fkey" FOREIGN KEY ("cattle_id") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cattle_id_fkey" FOREIGN KEY ("cattle_id") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
