import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { serviceRequestTable, taskTable, usersTable } from './db/schema';
import { eq,and} from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

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

    const [insertedTask] = await tx
      .insert(taskTable)
      .values(task)
      .returning();

    return insertedTask;
  });
};

export const updateSpecificTaskStatus = async (
  agentId: string,
  requestId: string,
  newStatus: string,
  newImageUrl: string // New parameter for the task image
) => {
  return await db.transaction(async (tx) => {
    // 1. Verify that this specific agent is actually assigned to this request
    const assignment = await tx
      .select()
      .from(taskTable)
      .where(
        and(
          eq(taskTable.agent_id, agentId),
          eq(taskTable.req_id, requestId)
        )
      )
      .limit(1);

    if (assignment.length === 0) {
      throw new Error("Unauthorized: Agent is not assigned to this request.");
    }

    // 2. Update the imageUrl in the taskTable for this specific assignment
    await tx
      .update(taskTable)
      .set({ imageUrl: newImageUrl, completedAt: new Date() })
      .where(
        and(
          eq(taskTable.agent_id, agentId),
          eq(taskTable.req_id, requestId)
        )
      );

    // 3. Update the status in the serviceRequestTable
    const updatedRequest = await tx
      .update(serviceRequestTable)
      .set({ status: newStatus })
      .where(eq(serviceRequestTable.id, requestId))
      .returning();

    return {
      message: "Task and Request updated successfully",
      updatedRequest: updatedRequest[0],
    };
  });
};
