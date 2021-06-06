import { UsernamePasswordInput } from './UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
	if (options.username.length <= 4) {
		return {
			errors: [
				{
					field: 'username',
					message: 'username must be greator than 4 digit',
				},
			],
		};
	}

	if (!options.email.includes('@')) {
		return {
			errors: [
				{
					field: 'email',
					message: 'Not a valid email',
				},
			],
		};
	}

	if (options.password.length <= 8) {
		return {
			errors: [
				{
					field: 'password',
					message: 'password must be greator than 8 digit',
				},
			],
		};
	}
	return null;
};
