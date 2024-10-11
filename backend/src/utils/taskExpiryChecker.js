import cron from 'node-cron'
import { Task } from '../models/task.models.js'

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();

        const expiredTasks = await Task.updateMany(
            { dueDate: { $lt: now }, status: { $ne: 'expired' } },
            { status: 'expired' }
        );

        console.log(`${expiredTasks.nModified} tasks were marked as expired.`);
    } catch (error) {
        console.error("Error while checking for expired tasks:", error);
    }
});