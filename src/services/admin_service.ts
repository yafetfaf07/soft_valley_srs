import { insertTask, NewTask } from "..";
export class AdminService {
  async createTask(
      req_id: string,
      agent_id: string,
      admin_id: string,

    
) {
    const newtask:NewTask ={
        req_id:req_id,
        agent_id:agent_id,
        admin_id:admin_id,
    }
  const newTask = await insertTask(newtask);
  return newTask
  }
  

}
