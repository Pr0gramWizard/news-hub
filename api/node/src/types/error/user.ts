export enum UserErrorCodes {
	USER_NOT_FOUND = 'User with given id not found',
	USER_PASSWORD_CHANGE_FAILED = 'User password change failed',
	USER_IS_ADMIN = 'Cant change role of admin user',
	CANNOT_DELETE_ADMIN = 'Cannot delete admin user',
	CANNOT_DELETE_SUPER_ADMIN = 'Cannot delete super admin user',
	WRONG_DELETE_ROUTE = 'Wrong delete route',
}
