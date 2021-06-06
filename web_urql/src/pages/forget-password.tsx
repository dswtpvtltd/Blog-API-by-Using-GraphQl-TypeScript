import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/react';

import Layout from '../components/Layout';
import InputField from '../components/InputField';

import { withUrqlClient } from 'next-urql';
import { createUrQlClient } from '../utils/createUrqlClient';
import { useForgetPasswordMutation } from '../generated/graphql';

const forgetPassword: React.FC<{}> = () => {
	const [complete, setComplete] = useState(false);

	const [_, forgotPassword] = useForgetPasswordMutation();

	return (
		<Layout>
			<Formik
				initialValues={{
					email: '',
				}}
				onSubmit={async (values) => {
					await forgotPassword(values);
					setComplete(true);
				}}>
				{({ values, isSubmitting }) =>
					complete ? (
						<Box>if an account with that email exists, we will send an email.</Box>
					) : (
						<Form>
							<Box mt={4}>
								<InputField value={values.email} label="Email" name="email" placeholder="Email" />
							</Box>

							<Box mt={4}>
								<Button isLoading={isSubmitting} variant="teal" type="submit">
									Forget Password
								</Button>
							</Box>
						</Form>
					)
				}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrQlClient)(forgetPassword);
