import { pgTable as table, pgEnum } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
export const rolesEnum = pgEnum("roles", [
  "citizen",
  "admin",
  "agent",
  "manager",
]);
export const usersTable = table(
  "users",
  {
    id: t.uuid().defaultRandom().primaryKey(),
    name: t.varchar({ length: 30 }).notNull(),
    password: t.varchar().notNull(),
    email: t.varchar().notNull(),
    role: rolesEnum().default("citizen"),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)],
);

export const serviceRequestTable = table("serviceRequest", {
  id: t.uuid().defaultRandom().primaryKey(),
  citizen_id: t.uuid("citizen_id").references(() => usersTable.id),
  title: t.varchar({ length: 15 }),
  description: t.varchar({ length: 100 }),
  imageUrl: t.varchar({ length: 30 }),
  latitude: t.doublePrecision(),
  longitude: t.doublePrecision(),
  status: t.varchar({ length: 11 }),
  category: t.varchar({ length: 11 }),
  createdAt: t.timestamp().defaultNow(),
});
export const task = table("task", {
  id: t.uuid().defaultRandom().primaryKey(),
  req_id: t.uuid("req_id").references(() => serviceRequestTable.id),
  agent_id: t.uuid("agent_id").references(() => usersTable.id),
  admin_id: t.uuid("admin_id").references(() => usersTable.id),
  imageUrl: t.varchar({ length: 30 }),
  completedAt: t.timestamp(),
});

export const notification = table("notification", {
  id: t.uuid().defaultRandom().primaryKey(),
  user_id: t.uuid("uid").references(() => usersTable.id),
  admin_id: t.uuid("admin_id").references(() => usersTable.id),
  message: t.varchar({ length: 30 }),
  isRead: t.boolean().default(false),
  completedAt: t.timestamp(),
});
