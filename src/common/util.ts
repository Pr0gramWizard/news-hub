import { strict as assert } from 'assert';

export function assertMany(...variables: unknown[]): void {
	variables.forEach((x) => assert(x));
}

export type Nullable<T> = T | null;
export type ControllerResponse<T> = Nullable<T> | Error | never;

export function isUndefinedOrEmptyObject(x: unknown): x is undefined | Record<string, unknown> {
	return x === undefined || x === {} || x === null;
}
