import { dedupExchange, fetchExchange, stringifyVariables } from 'urql';
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import {
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import Router from 'next/router';
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';
import gql from 'graphql-tag';
import { isServer } from './isServer';

const errorExchange: Exchange =
	({ forward }) =>
	(ops$) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error?.message.includes('Not Autheticated')) {
					Router.replace('/login');
				}
			})
		);
	};

/** pagination code start */
export const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;

		const allFields = cache.inspectFields(entityKey);

		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

		const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, 'posts');

		info.partial = !isItInTheCache;

		let hasMore = true;
		const results: string[] = [];

		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;

			const posts = cache.resolve(key, 'posts') as string[];
			const _hasMore = cache.resolve(key, 'hasMore');

			if (!_hasMore) {
				hasMore = _hasMore as boolean;
			}

			results.push(...posts);
		});

		return {
			__typename: 'PaginatedPosts',
			hasMore,
			posts: results,
		};
	};
};

/** pagination code end */

//Cache is type from @urql/exchange-graphcache
const invalidateAllPosts = (cache: Cache) => {
	const allFields = cache.inspectFields('Query');

	const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');

	fieldInfos.forEach((fi) => {
		cache.invalidate('Query', 'posts', fi.arguments || {});
	});
};

export const createUrQlClient = (ssrExchange: any, ctx: any) => {
	let cookie = '';
	if (isServer()) {
		//this is not available on client side
		cookie = ctx?.req?.headers?.cookie;
	}
	return {
		url: 'http://localhost:4000/graphql',
		fetchOptions: {
			credentials: 'include' as const,
			headers: cookie ? { cookie } : undefined, // this is code to load graphql data on page load
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				key: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						vote: (_result, args, cache, info) => {
							///update fragments
							const { postId, value } = args as VoteMutationVariables;

							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);

							if (data) {
								if (data.voteStatus === value) {
									return;
								}
								const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{ id: postId, points: newPoints, voteStatus: value } as any
								);
							}
						},
						deletePost: (_result, args, cache, info) => {
							cache.invalidate({ __typename: 'Post', id: (args as DeletePostMutationVariables).id });
						},
						//this is function to update cache afetr adding new record
						createPost: (_result, args, cache, info) => {
							invalidateAllPosts(cache);
						},
						logout: (_result, args, cache, info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => ({ me: null })
							);
						},
						login: (_result, args, cache, info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.login.errors) {
										return query;
									} else {
										return { me: result.login.user };
									}
								}
							);
							invalidateAllPosts(cache);
						},
						register: (_result, args, cache, info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.register.errors) {
										return query;
									} else {
										return { me: result.register.user };
									}
								}
							);
						},
					},
				},
			}),
			errorExchange,
			ssrExchange,
			fetchExchange,
		],
	};
};
