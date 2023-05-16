import cron from 'node-cron';

export class Cronjob {
	public static New() {
		return new Cronjob();
	}

	private task: cron.ScheduledTask | null = null;

	public Schedule(schedule: string, callback: () => void) {
		this.task = cron.schedule(schedule, callback);
	}

	public Stop() {
		if (this.task) {
			this.task.stop();
			this.task = null;
		}
	}
}
