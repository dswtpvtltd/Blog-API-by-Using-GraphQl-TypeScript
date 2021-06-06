import { Box, Heading, IconButton, Link } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import NextLink from 'next/link';
import Layout from '../../components/Layout';
import { useDeletePostMutation, useMeQuery, usePostQuery } from '../../generated/graphql';
import { createUrQlClient } from '../../utils/createUrqlClient';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const Post: React.FC<{}> = () => {
	const router = useRouter();
	const intID = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
	const [{ data, fetching }] = usePostQuery({
		pause: intID === -1,
		variables: {
			id: intID,
		},
	});
	const [{ data: meData }] = useMeQuery();
	const [_, deletePost] = useDeletePostMutation();

	if (fetching) {
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
			{meData?.me.id === data.post.creator.id ? (
				<Box>
					<NextLink href="/post/edit/[id]" as={'/post/edit/' + data.post.id}>
						<IconButton as={Link} style={{ backgroundColor: 'red' }} aria-label="delete post" mr={5}>
							<EditIcon />
						</IconButton>
					</NextLink>

					<IconButton
						onClick={() => deletePost({ id: data.post.id })}
						style={{ backgroundColor: 'red' }}
						aria-label="delete post">
						<DeleteIcon />
					</IconButton>
				</Box>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrQlClient, { ssr: true })(Post);
