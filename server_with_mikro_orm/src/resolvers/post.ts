import { Post } from '../entities/Post';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from 'src/types';

// this function only to show demo of loading... during posts
const sleep = (ms: number) =>
	new Promise((res) => {
		setTimeout(res, ms);
	});

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	async posts(@Ctx() ctx: MyContext): Promise<Post[]> {
		await sleep(1000);
		return ctx.em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id', () => Int) id: number, @Ctx() ctx: MyContext): Promise<Post | null> {
		return ctx.em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async createPost(@Arg('title') title: string, @Ctx() ctx: MyContext): Promise<Post | null> {
		const post = ctx.em.create(Post, { title });
		await ctx.em.persistAndFlush(post);

		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id') id: number,
		@Arg('title', () => String, { nullable: true }) title: string,
		@Ctx() ctx: MyContext
	): Promise<Post | null> {
		const post = await ctx.em.findOne(Post, { id });

		if (!post) {
			return null;
		}

		if (typeof title !== undefined) {
			post.title = title;
			await ctx.em.persistAndFlush(post);
		}

		return post;
	}

	@Mutation(() => Boolean, { nullable: true })
	async deletePost(@Arg('id') id: number, @Ctx() ctx: MyContext): Promise<boolean> {
		try {
			await ctx.em.nativeDelete(Post, { id });
		} catch (error) {
			return false;
		}

		return true;
	}
}
