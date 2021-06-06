import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrQlClient } from '../utils/createUrqlClient';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
	const [, register] = useRegisterMutation();
	const router = useRouter();

	return (
		<Layout>
			<Formik
				initialValues={{
					username: '',
					email: '',
					firstname: '',
					lastname: '',
					password: '',
				}}
				onSubmit={async (values, { setErrors }) => {
					const respose = await register(values);
					if (respose.data?.register.errors) {
						setErrors(toErrorMap(respose.data.register.errors));
					} else if (respose.data?.register.user) {
						router.push('/');
					}
				}}>
				{({ values, isSubmitting }) => (
					<Form>
						<Box mt={4}>
							<InputField
								value={values.firstname}
								label="First Name"
								name="firstname"
								placeholder="First Name"
							/>
						</Box>
						<Box mt={4}>
							<InputField
								value={values.lastname}
								label="Last Name"
								name="lastname"
								placeholder="Last Name"
							/>
						</Box>
						<Box mt={4}>
							<InputField value={values.email} label="Email" name="email" placeholder="Email" />
						</Box>
						<Box mt={4}>
							<InputField
								value={values.username}
								label="Username"
								name="username"
								placeholder="Username"
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
							<Button isLoading={isSubmitting} variant="teal" type="submit">
								Register
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrQlClient)(Register);
