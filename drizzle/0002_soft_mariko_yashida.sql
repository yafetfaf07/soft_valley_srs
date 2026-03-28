ALTER TABLE "notification" ALTER COLUMN "isRead" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "serviceRequest" ALTER COLUMN "latitude" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "serviceRequest" ALTER COLUMN "longitude" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar(30);