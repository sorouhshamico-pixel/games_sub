/*
  Warnings:

  - Added the required column `sellerNameSnapshot` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerVatNumberSnapshot` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "sellerNameSnapshot" TEXT NOT NULL,
ADD COLUMN     "sellerVatNumberSnapshot" TEXT NOT NULL;
