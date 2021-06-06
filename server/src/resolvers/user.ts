import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Arg, Resolver, Field, Ctx, Mutation, ObjectType, Query, FieldResolver, Root } from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../contants';
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { v4 } from 'uuid';
import { sendEmail } from '../utils/sendEmail';

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver(User)
export class UserResolver {
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() ctx: MyContext) {
		//this is the current user and
		//its ok to show their own email
		if (ctx.req.session.userId === user.id) {
			return user.email;
		}
		return ''; // not return email of not login users
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 2) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'Please enter the new password.',
					},
				],
			};
		}
		const key = FORGET_PASSWORD_PREFIX + token;
		const userid = await ctx.redis.get(key);

		if (!userid) {
			return {
				errors: [
					{
						field: 'token',
						message: 'token expired',
					},
				],
			};
		}

		const userId = parseInt(userid);
		const user = await User.findOne(userId);
		if (!user) {
			return {
				errors: [
					{
						field: 'token',
						message: 'user no longer exists',
					},
				],
			};
		}

		User.update({ id: userId }, { password: await argon2.hash(newPassword) });

		//remove the token after change password
		await ctx.redis.del(key);
		ctx.req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(@Ctx() { redis }: MyContext, @Arg('email') email: string) {
		const user = await User.findOne({ email });

		if (!user) {
			return true;
		}

		const token = v4();

		await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 5000);

		await sendEmail(
			'Forget password',
			'dev@gmail.com',
			`<a href="http://localhost:3000/change-password/${token}">reset password</a>`
		);

		return true;
	}

	// this is to get all logged in user data
	@Query(() => User, { nullable: true })
	async me(@Ctx() ctx: MyContext) {
		if (!ctx.req.session.userId) {
			return null;
		}

		const user = await User.findOne({ id: ctx.req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		const response = validateRegister(options);

		if (response) {
			return response;
		}

		const user = await User.findOne({ username: options.username });

		if (user) {
			return {
				errors: [
					{
						field: 'username',
						message: 'username already exists',
					},
				],
			};
		}

		const hashPassword = await argon2.hash(options.password);

		try {
			const result = await User.create({
				username: options.username,
				email: options.email,
				firstname: options.firstname,
				lastname: options.lastname,
				password: hashPassword,
			}).save();

			// store user id session
			//this will set a cookie on the user
			//keep them logged in
			ctx.req.session.userId = result.id;

			return { user: result };
		} catch (error) {
			return {
				errors: [
					{
						field: 'username',
						message: error.message,
					},
				],
			};
		}
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		if (usernameOrEmail === '') {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: 'Please enter the username.',
					},
				],
			};
		}

		if (password === '') {
			return {
				errors: [
					{
						field: 'password',
						message: 'Please enter the password.',
					},
				],
			};
		}

		const user = await User.findOne(
			usernameOrEmail.includes('@')
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);
		if (!user) {
			return {
				errors: [{ field: 'usernameOrEmail', message: 'usernameOrEmail is not exists' }],
			};
		}

		const valid = await argon2.verify(user.password, password);

		if (!valid) {
			return {
				errors: [{ field: 'password', message: 'password is not correct' }],
			};
		}

		//store user id session
		//this will set a cookie on the user
		//keep them logged in
		ctx.req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				if (err) {
					resolve(false);
					return;
				}
				res.clearCookie(COOKIE_NAME);
				resolve(true);
			})
		);
	}
}
