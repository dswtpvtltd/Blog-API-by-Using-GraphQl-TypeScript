import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import { MeDocument, MeQuery, useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
	const [changePassword] = useChangePasswordMutation();
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
							variables: {
								token: typeof router.query.token === 'string' ? router.query.token : '',
								newPassword: values.newPassword,
							},
							update: (cache, { data }) => {
								cache.writeQuery<MeQuery>({
									query: MeDocument,
									data: {
										__typename: 'Query',
										me: data?.changePassword.user,
									},
								});
							},
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

export default withApollo({ ssr: false })(ChangePassword);
