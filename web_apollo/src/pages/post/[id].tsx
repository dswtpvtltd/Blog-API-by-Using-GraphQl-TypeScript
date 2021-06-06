import { Box, Heading, IconButton, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import NextLink from 'next/link';
import Layout from '../../components/Layout';
import { useDeletePostMutation, useMeQuery, usePostQuery } from '../../generated/graphql';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { withApollo } from '../../utils/withApollo';

const Post: React.FC<{}> = () => {
	const router = useRouter();
	const intID = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
	const { data, loading } = usePostQuery({
		skip: intID === -1,
		variables: {
			id: intID,
		},
	});
	const { data: meData } = useMeQuery();
	const [deletePost] = useDeletePostMutation();

	if (loading) {
		return (
			<Layout>
				<div>...loading</div>
			</Layout>
		);
	}

	if (!data?.post) {
		return (
			<Layout>
				<Box>Couldn't find post</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<Heading>{data?.post.title}</Heading>
			{data?.post.description}
			{meData?.me?.id === data.post.creator.id ? (
				<Box>
					<NextLink href="/post/edit/[id]" as={'/post/edit/' + data.post.id}>
						<IconButton as={Link} style={{ backgroundColor: 'red' }} aria-label="delete post" mr={5}>
							<EditIcon />
						</IconButton>
					</NextLink>

					<IconButton
						onClick={() =>
							deletePost({
								variables: { id: data.post.id },
								update: (cache) => {
									cache.evict({ id: 'Post:' + data.post.id });
								},
							})
						}
						style={{ backgroundColor: 'red' }}
						aria-label="delete post">
						<DeleteIcon />
					</IconButton>
				</Box>
			) : null}
		</Layout>
	);
};

export default withApollo({ ssr: false })(Post);
