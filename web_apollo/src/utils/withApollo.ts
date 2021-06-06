import { withApollo as createWithApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedPosts } from '../generated/graphql';
import { NextPageContext } from 'next';

const createClient = (ctx: NextPageContext) =>
	new ApolloClient({
		uri: 'http://localhost:4000/graphql',
		credentials: 'include',
		headers: {
			cookie: (typeof window === undefined ? ctx.req?.headers.cookie : undefined) || '',
		},
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						posts: {
							keyArgs: [],
							merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts): PaginatedPosts {
								console.log(existing, incoming);
								return {
									...incoming,
									posts: [...(existing?.posts || []), ...incoming?.posts],
								};
							},
						},
					},
				},
			},
		}),
	});

export const withApollo = createWithApollo(createClient);
