import { strict as assert } from 'assert';

export function assertMany(...variables: unknown[]): void {
	variables.forEach((x) => assert(x));
}

export function isUndefinedOrEmptyObject(x: unknown | Record<string | number | symbol, unknown>): x is undefined {
	const isObject = typeof x === 'object';
	return x === undefined || x === null || (isObject && Object.keys(x).length === 0);
}

export function minutesToMilliseconds(minutes: number): number {
	return minutes * 60 * 1000;
}

interface DateValue {
	id: number;
	date: string;
}

export function generateAllDatesBetweenTwoDates(startDate: Date, endDate: Date): DateValue[] {
	const dates: DateValue[] = [];
	const currentDate = startDate;
	while (currentDate <= endDate) {
		dates.push({
			date: new Date(currentDate).toISOString().slice(0, 10),
			id: currentDate.getTime(),
		});
		dates.push();
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dates;
}
