import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { serviceRequestTable, taskTable, usersTable } from './db/schema';
import { eq,and} from 'drizzle-orm';

 const db = drizzle(process.env.DATABASE_URL!);
export type NewUser = typeof usersTable.$inferInsert;
export type NewRequest = typeof serviceRequestTable.$inferInsert;
export type NewTask = typeof taskTable.$inferInsert;

// Users
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

// ServiceRequest
export const insertServiceRequest = async (user: NewRequest) => {
  return db.insert(serviceRequestTable).values(user).returning();
}

export const getServiceByUserId = async (id:string) => {
  return db.select().from(serviceRequestTable).where(
  
    eq(serviceRequestTable.citizen_id,id),

);
}

// TaskRequest
export const viewTaskByAdmin = async(id:string) => {
  return db.select().from(taskTable).where(eq(taskTable.agent_id,id))
}


export const insertTask = async (task: NewTask) => {
  return await db.transaction(async (tx) => {
    await tx
      .update(serviceRequestTable)
      .set({ status: "Assigned" })
      .where(eq(serviceRequestTable.id, task.req_id));

    // 2. Insert the new task
    const [insertedTask] = await tx
      .insert(taskTable)
      .values(task)
      .returning();

    return insertedTask;
  });
};

