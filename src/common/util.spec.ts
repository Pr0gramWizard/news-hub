import * as assert from 'assert';
import { assertMany, generateAllDatesBetweenTwoDates, isUndefinedOrEmptyObject, minutesToMilliseconds } from './util';

jest.mock('assert');
describe('Util', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('assertMany', () => {
		let assertMock: jest.SpyInstance;

		beforeEach(() => {
			assertMock = jest.spyOn(assert, 'strict').mockImplementation(() => true);
		});

		it('should assert many variables', () => {
			assertMany(1, '1', 2, '2');
			expect(assertMock).toHaveBeenCalledTimes(4);
		});
	});

	describe('isUndefinedOrEmptyObject', () => {
		it('should return true for undefined', () => {
			expect(isUndefinedOrEmptyObject(undefined)).toBe(true);
		});

		it('should return true for null', () => {
			expect(isUndefinedOrEmptyObject(null)).toBe(true);
		});

		it('should return true for an empty object', () => {
			expect(isUndefinedOrEmptyObject({})).toBe(true);
		});

		it('should return false for a non-empty object', () => {
			expect(isUndefinedOrEmptyObject({ a: 1 })).toBe(false);
		});

		it('should return false for a non-empty array', () => {
			expect(isUndefinedOrEmptyObject([1])).toBe(false);
		});

		it('should return false for a non-empty string', () => {
			expect(isUndefinedOrEmptyObject('a')).toBe(false);
		});

		it('should return false for a non-empty number', () => {
			expect(isUndefinedOrEmptyObject(1)).toBe(false);
		});
	});

	describe('minutesToMilliseconds', () => {
		it('should convert minutes to milliseconds', () => {
			expect(minutesToMilliseconds(1)).toBe(60000);
		});
	});

	describe('generateAllDatesBetweenTwoDates', () => {
		let startDate: Date;
		let endDate: Date;
		beforeEach(() => {
			startDate = new Date("2020-05-02");
			endDate = new Date("2020-05-03");
		});
		it('should generate all dates between two dates', () => {
			const expectedResult = [
				{
					id: startDate.getTime(),
					date: '2020-05-02',
				},
				{
					id: endDate.getTime(),
					date: '2020-05-03',
				},
			];
			const dates = generateAllDatesBetweenTwoDates(startDate, endDate);
			expect(dates.length).toBe(2);
			expect(dates).toStrictEqual(expectedResult);
		});

		it('should return empty array if startDate > endDate', () => {
			expect(generateAllDatesBetweenTwoDates(endDate, startDate)).toStrictEqual([]);
		});
	});
});
