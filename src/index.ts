import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from './db/schema';
import { eq,and} from 'drizzle-orm';

export const db = drizzle(process.env.DATABASE_URL!);
export type NewUser = typeof usersTable.$inferInsert;



export const insertUser = async (user: NewUser) => {
  return db.insert(usersTable).values(user).returning({id:usersTable.id, name:usersTable.name,role:usersTable.role});
}

export const selectUserByEmail = async (email:string) => {
  return db.select().from(usersTable).where(eq(usersTable.email,email))
}

export const Login = async (email:string, password:string) => {
  return db.select().from(usersTable).where(
  and(
    eq(usersTable.email, email),
    eq(usersTable.password,password)
  )
);
}