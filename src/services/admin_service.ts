import { insertTask, NewTask, selectRequestsByFilters } from "..";
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
  
  async selectRequestbyFilter(filters:{
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const selectedTask = await selectRequestsByFilters(filters);
  return selectedTask;
}

}


