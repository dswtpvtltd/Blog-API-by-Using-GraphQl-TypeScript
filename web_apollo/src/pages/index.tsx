import React from 'react';
import { useDeletePostMutation, useMeQuery, usePostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Heading, Stack, Text, Link, IconButton } from '@chakra-ui/react';
import UpdootSection from '../components/UpdootSection';
import { withApollo } from '../utils/withApollo';

const Index = () => {
	const [deletePost] = useDeletePostMutation();

	const { data: meData } = useMeQuery();
	const { data, error, loading, fetchMore, variables } = usePostsQuery({
		variables: { limit: 10, cursor: 0 },
		notifyOnNetworkStatusChange: true,
	});

	if (!data && !loading) {
		return <div>You got query failed for some reason.</div>;
	}

	return (
		<Layout variant="regular">
			<div>Hello App</div>
			{!data && loading ? (
				<div>Loading...</div>
			) : (
				<Stack spacing={4} mb={10}>
					{data?.posts.posts.map((p) => {
						if (!p) {
							return null;
						}
						return (
							<Flex p={5} shadow="md" borderWidth="1px" key={p.id}>
								<UpdootSection post={p} />
								<Box ml={4}>
									<Flex>
										<Box>
											<NextLink href={`/post/[id]`} as={'/post/' + p.id}>
												<Link>
													<Heading fontSize="xl">{p.title}</Heading>
												</Link>
											</NextLink>
											<Text>{p.creator.username}</Text>
											<Text mt={4}>{p.descriptionSnippet}</Text>
										</Box>
										<Box ml={'auto'}>
											{meData?.me?.id === p.creator.id ? (
												<Box>
													<NextLink href="/post/edit/[id]" as={'/post/edit/' + p.id}>
														<IconButton
															as={Link}
															style={{ backgroundColor: 'red' }}
															aria-label="edit post"
															mr={5}>
															<EditIcon />
														</IconButton>
													</NextLink>

													<IconButton
														onClick={() =>
															deletePost({
																variables: { id: p.id },
																update: (cache) => {
																	cache.evict({ id: 'Post:' + p.id });
																},
															})
														}
														style={{ backgroundColor: 'red' }}
														aria-label="delete post">
														<DeleteIcon />
													</IconButton>
												</Box>
											) : null}
										</Box>
									</Flex>
								</Box>
							</Flex>
						);
					})}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							fetchMore({
								variables: {
									limit: variables?.limit,
									cursor: data.posts.posts[data.posts.posts.length - 1].id,
								},
							});
						}}
						m="auto"
						my={4}>
						Load More
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withApollo({ ssr: false })(Index);
