-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "categorySlug" TEXT NOT NULL DEFAULT 'guides',
ADD COLUMN     "readingMinutes" INTEGER NOT NULL DEFAULT 4;
