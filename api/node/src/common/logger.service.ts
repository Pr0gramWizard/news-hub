import { ConsoleLogger } from '@nestjs/common';

export class NewsHubLogger extends ConsoleLogger {
	constructor() {
		super('NewsHub');
		this.setup();
	}

	log(message: any, context?: string) {
		if (context === 'InstanceLoader') return;
		super.log(message);
	}

	protected getTimestamp(): string {
		return new Date().toLocaleString('de');
	}

	private setup(): void {
		const env = process.env.NODE_ENV;
		switch (env) {
			case 'development':
				this.setLogLevels(['log', 'error', 'warn', 'debug', 'verbose']);
				break;
			case 'production':
				this.setLogLevels(['log', 'error']);
				break;
			case 'test':
				this.setLogLevels(['error']);
				break;
			default:
				throw new Error(`Unknown environment: ${env}`);
		}
	}
}
