import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrQlClient } from '../utils/createUrqlClient';

interface LoginProps {}

const Login: React.FC<{}> = () => {
	const [, login] = useLoginMutation();
	const router = useRouter();

	return (
		<Layout>
			<Formik
				initialValues={{
					usernameOrEmail: '',
					password: '',
				}}
				onSubmit={async (values, { setErrors }) => {
					const respose = await login(values);
					if (respose.data?.login.errors) {
						setErrors(toErrorMap(respose.data.login.errors));
					} else if (respose.data?.login.user) {
						if (typeof router.query?.next === 'string') {
							router.push(router.query.next);
						} else {
							router.push('/');
						}
					}
				}}>
				{({ values, isSubmitting }) => (
					<Form>
						<Box mt={4}>
							<InputField
								value={values.usernameOrEmail}
								label="Username/Email"
								name="usernameOrEmail"
								placeholder="Username/Email"
							/>
						</Box>
						<Box mt={4}>
							<InputField
								value={values.password}
								label="Password"
								name="password"
								placeholder="Password"
							/>
						</Box>

						<Box mt={4}>
							<Box>
								<NextLink href="/forget-password">
									<Link>Go forget Again</Link>
								</NextLink>
							</Box>
							<Button isLoading={isSubmitting} variant="teal" type="submit">
								Login
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrQlClient)(Login);
