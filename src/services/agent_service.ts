import { insertTask, NewTask, viewTaskByAdmin } from "..";
export class AgentService {
  async createTask(agent_id: string) {
    const newTask = await viewTaskByAdmin(agent_id);
    return newTask;
  }
}
