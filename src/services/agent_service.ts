import { insertTask, NewTask, updateSpecificTaskStatus, viewTaskByAdmin } from "..";
export class AgentService {
  async createTask(agent_id: string) {
    const newTask = await viewTaskByAdmin(agent_id);
    return newTask;
  }
  async updateStatusTask(agent_id:string, request_id:string, newStatus:string) {
    const updatedTask = await updateSpecificTaskStatus(agent_id,request_id,newStatus)
  }
}
