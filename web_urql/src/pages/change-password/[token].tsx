import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrQlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';

const ChangePassword: NextPage = () => {
	const [_, changePassword] = useChangePasswordMutation();
	const router = useRouter();
	const [tokenError, setTokenError] = useState('');

	return (
		<div>
			<Layout variant="small">
				<Formik
					initialValues={{
						newPassword: '',
					}}
					onSubmit={async (values, { setErrors }) => {
						const respose = await changePassword({
							token: typeof router.query.token === 'string' ? router.query.token : '',
							newPassword: values.newPassword,
						});
						if (respose.data?.changePassword.errors) {
							const errormap = toErrorMap(respose.data.changePassword.errors);
							if ('token' in errormap) {
								setTokenError(errormap.token);
							}
							setErrors(errormap);
						} else if (respose.data?.changePassword.user) {
							router.push('/');
						}
					}}>
					{({ values, isSubmitting }) => (
						<Form>
							<Box mt={4}>
								<InputField
									value={values.newPassword}
									label="New Password"
									name="newPassword"
									placeholder="New Password"
								/>
							</Box>
							{tokenError && (
								<Box>
									<Box color="red">{tokenError}</Box>
									<NextLink href="/forget-password">
										<Link>Go forget Again</Link>
									</NextLink>
								</Box>
							)}
							<Box mt={4}>
								<Button isLoading={isSubmitting} variant="teal" type="submit">
									Change Password
								</Button>
							</Box>
						</Form>
					)}
				</Formik>
			</Layout>
		</div>
	);
};

export default withUrqlClient(createUrQlClient)(ChangePassword);
