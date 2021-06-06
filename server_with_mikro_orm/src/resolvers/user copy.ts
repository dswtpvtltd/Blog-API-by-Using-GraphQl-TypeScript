import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Arg, Resolver, InputType, Field, Ctx, Mutation, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME } from '../contants';

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	email: string;
	@Field()
	password: string;
	@Field()
	firstname: string;
	@Field()
	lastname: string;
}

@InputType()
class UsernamePasswordInputLogin {
	@Field()
	username: string;
	@Field()
	password: string;
}

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

@Resolver()
export class UserResolver {
	@Mutation(() => Boolean)
	async forgotPassword() { //@Ctx() { em }: MyContext //@Arg('email') email: string,
		//const user = em.findOne(User, { email });

		return true;
	}

	// this is to get all logged in user data
	@Query(() => User, { nullable: true })
	async me(@Ctx() ctx: MyContext) {
		if (!ctx.req.session.userId) {
			return null;
		}

		const user = await ctx.em.findOne(User, { id: ctx.req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
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

		const user = await ctx.em.findOne(User, { username: options.username });

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

		const newUser = ctx.em.create(User, {
			username: options.username,
			firstname: options.firstname,
			lastname: options.lastname,
			password: hashPassword,
		});

		await ctx.em.persistAndFlush(newUser);

		// store user id session
		//this will set a cookie on the user
		//keep them logged in
		ctx.req.session.userId = newUser.id;

		return { user: newUser };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('options', () => UsernamePasswordInputLogin) options: UsernamePasswordInputLogin,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		if (options.username === '') {
			return {
				errors: [
					{
						field: 'username',
						message: 'Please enter the username.',
					},
				],
			};
		}

		if (options.password === '') {
			return {
				errors: [
					{
						field: 'password',
						message: 'Please enter the password.',
					},
				],
			};
		}

		const user = await ctx.em.findOne(User, { username: options.username.toLowerCase() });
		if (!user) {
			return {
				errors: [{ field: 'username', message: 'username is not exists' }],
			};
		}

		const valid = await argon2.verify(user.password, options.password);

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
