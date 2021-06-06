import { Post } from '../entities/Post';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from 'src/entities/User';

// this function only to show demo of loading... during posts
// const sleep = (ms: number) =>
// 	new Promise((res) => {
// 		setTimeout(res, ms);
//  });

@InputType()
class PostInput {
	@Field()
	title!: string;

	@Field()
	description!: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	descriptionSnippet(@Root() root: Post) {
		return root.description.slice(0, 200);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post) {
		return User.findOne(post.creatorId);
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int) postId: number,
		@Arg('value', () => Int) value: number,
		@Ctx() ctx: MyContext
	) {
		const userId = ctx.req.session.userId;
		const isUpdoot = value !== -1;
		const realvalue = isUpdoot ? 1 : -1;

		const updoot = await Updoot.findOne({ where: { postId, userId } });
		const post = await Post.findOne(postId);

		let points: number = 0;

		if (post) {
			points = post.points;
		}

		if (updoot) {
			await getConnection().transaction(async (tm) => {
				await tm.query(`update updoot set value=${realvalue} where postId=${postId} and userId=${userId}`);
				await tm.query(`update post SET points = ${points + realvalue} where id=${postId}`);
			});
		} else if (!updoot) {
			await getConnection().transaction(async (tm) => {
				await tm.query(`insert into updoot(userId,postId,value) values(${userId},${postId},${value});`);
				await tm.query(`update post SET points = ${points + realvalue} where id=${postId}`);
			});
		}

		return true;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => Int, { nullable: true }) cursor: number,
		@Ctx() ctx: MyContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const posts = await getConnection().query(
			`select p.id as id, p.title as title, p.description,p.createdAt as createdAt,p.updatedAt as updatedAt, p.points,p.creatorId, JSON_OBJECT('id', u.id,'username', u.username,'firstname',u.firstname,'lastname',u.lastname,'email',u.email,'createdAt', u.createdAt,'updatedAt',u.updatedAt) as creator ${
				ctx.req.session.userId
					? ', (select value from updoot where userId=p.creatorId and postId=p.id) as voteStatus'
					: ', null as voteStatus'
			}
		from post p inner join user u on u.id=p.creatorId ${
			cursor > 0 ? `where p.id <= ${cursor}` : ''
		} order by p.createdAt DESC limit ${realLimitPlusOne}`
		);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	// @Query(() => PaginatedPosts)
	// async posts(
	// 	@Arg('limit', () => Int) limit: number,
	// 	@Arg('cursor', () => Int, { nullable: true }) cursor: number,
	// 	@Ctx() ctx: MyContext
	// ): Promise<PaginatedPosts> {
	// 	const realLimit = Math.min(50, limit);
	// 	const realLimitPlusOne = realLimit + 1;

	// 	const posts = await getConnection().query(
	// 		`select p.id as id, p.title as title, p.description,p.createdAt as createdAt,p.updatedAt as updatedAt, p.points,p.creatorId, JSON_OBJECT('id', u.id,'username', u.username,'firstname',u.firstname,'lastname',u.lastname,'email',u.email,'createdAt', u.createdAt,'updatedAt',u.updatedAt) as creator ${
	// 			ctx.req.session.userId
	// 				? ', (select value from updoot where userId=p.creatorId and postId=p.id) as voteStatus'
	// 				: ', null as voteStatus'
	// 		}
	// 	from post p inner join user u on u.id=p.creatorId ${
	// 		cursor > 0 ? `where p.id <= ${cursor}` : ''
	// 	} order by p.createdAt DESC limit ${realLimitPlusOne}`
	// 	);

	// 	const finalPosts: Post[] = [];

	// 	posts.map((post: any) => {
	// 		const creator = JSON.parse(post.creator);
	// 		post.creator = creator;
	// 		finalPosts.push(post);
	// 	});

	// 	return {
	// 		posts: finalPosts.slice(0, realLimit),
	// 		hasMore: posts.length === realLimitPlusOne,
	// 	};
	// }

	@Query(() => Post, { nullable: true })
	post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id, { relations: ['creator'] });
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post | undefined> {
		return Post.create({ ...input, creatorId: req.session.userId }).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg('id', () => Int) id: number,
		@Arg('title', () => String, { nullable: true }) title: string,
		@Arg('description', () => String, { nullable: true }) description: string,
		@Ctx() ctx: MyContext
	): Promise<Post | undefined> {
		const post = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, description })
			.where('id= :id and creatorId= :creatorId ', { id, creatorId: ctx.req.session.userId })
			.execute();

		if (post.raw.changedRows === 1) {
			return Post.findOne({ id, creatorId: ctx.req.session.userId }, { relations: ['creator'] });
		}

		throw new Error('something wrong in query');
	}

	@Mutation(() => Boolean, { nullable: true })
	@UseMiddleware(isAuth)
	async deletePost(@Arg('id', () => Int) id: number, @Ctx() ctx: MyContext): Promise<boolean> {
		try {
			// this is not cascade way to remove post
			// const post = await Post.findOne(id);
			// if (!post) {
			// 	return false;
			// }
			// if (post.creatorId !== ctx.req.session.userId) {
			// 	throw new Error('Not Authorized');
			// }
			// await Updoot.delete({ postId: id });
			// await Post.delete({ id, creatorId: ctx.req.session.userId });

			await Post.delete({ id, creatorId: ctx.req.session.userId });
		} catch (error) {
			return false;
		}

		return true;
	}
}
