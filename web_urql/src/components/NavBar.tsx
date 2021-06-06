import { Box, Link, Flex, Button, Heading } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

const NavBar = () => {
	const [{ fetching: fetchingLogout }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery();
	let body = null;

	if (fetching) {
		body = null;
	} else if (!data?.me) {
		body = (
			<Box ml={'auto'}>
				<NextLink href="/create-post">
					<Link mr={4}>Create Post</Link>
				</NextLink>
				<NextLink href="/login">
					<Link mr={4}>Login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link mr={4}>Register</Link>
				</NextLink>
			</Box>
		);
	} else {
		body = (
			<Flex ml={'auto'}>
				<Box mr={4}>
					<NextLink href="/create-post">
						<Button mr={4} as={Link}>
							Create Post
						</Button>
					</NextLink>
					<NextLink href="/profile">
						<Link mr={4}>{data.me.username}</Link>
					</NextLink>
				</Box>
				<Button
					isLoading={fetchingLogout}
					onClick={() => {
						logout();
					}}
					variant="link">
					Logout
				</Button>
			</Flex>
		);
	}

	return (
		<Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4} ml={'auto'}>
			<NextLink href="/">
				<Link>
					<Heading>Logo</Heading>
				</Link>
			</NextLink>
			<Box ml={'auto'}>{body}</Box>
		</Flex>
	);
};

export default NavBar;
