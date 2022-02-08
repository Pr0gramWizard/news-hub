import { strict as assert } from 'assert';

export function assertMany(...variables: unknown[]): void {
	variables.forEach((x) => assert(x));
}

export type Nullable<T> = T | null;
export type ControllerResponse<T> = Nullable<T> | Error | never;

export function isUndefinedOrEmptyObject(x: unknown): x is undefined | Record<string, unknown> {
	return x === undefined || x === {} || x === null;
}

export function minutesToMilliseconds(minutes: number): number {
	return minutes * 60 * 1000;
}

// Converts a given date to a string in the format DD month YYYY
export function dateToString(date: Date): string {
	const month = date.toLocaleString('default', { month: 'long' });
	return `${date.getDate()} ${month} ${date.getFullYear()}`;
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
			date: new Date(currentDate).toISOString().slice(0,10),
			id: currentDate.getTime(),
		});
		dates.push();
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dates;
}
