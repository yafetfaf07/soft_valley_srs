CREATE TYPE "public"."roles" AS ENUM('citizen', 'admin', 'agent', 'manager');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"uid" uuid,
	"admin_id" uuid,
	"message" varchar(30),
	"isRead" boolean,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "serviceRequest" (
	"id" uuid PRIMARY KEY NOT NULL,
	"citizen_id" uuid,
	"title" varchar(15),
	"description" varchar(100),
	"imageUrl" varchar(30),
	"latitude" numeric,
	"longitude" numeric,
	"status" varchar(11),
	"category" varchar(11),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" uuid PRIMARY KEY NOT NULL,
	"req_id" uuid,
	"agent_id" uuid,
	"admin_id" uuid,
	"imageUrl" varchar(30),
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" "roles" DEFAULT 'citizen'
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serviceRequest" ADD CONSTRAINT "serviceRequest_citizen_id_users_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_req_id_serviceRequest_id_fk" FOREIGN KEY ("req_id") REFERENCES "public"."serviceRequest"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");