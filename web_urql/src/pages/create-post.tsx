import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React from 'react';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrQlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const createPost: React.FC<{}> = ({}) => {
	const router = useRouter();

	useIsAuth();

	const [_, createPost] = useCreatePostMutation();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{
					title: '',
					description: '',
				}}
				onSubmit={async (values) => {
					const { error } = await createPost({ input: values });

					if (!error) {
						router.push('/');
					}
				}}>
				{({ values, isSubmitting }) => (
					<Form>
						<Box mt={4}>
							<InputField value={values.title} label="Title" name="title" placeholder="Title" />
						</Box>
						<Box mt={4}>
							<InputField
								textarea
								value={values.description}
								label="Description"
								name="description"
								placeholder="Description"
							/>
						</Box>
						<Box mt={4}>
							<Button isLoading={isSubmitting} variant="teal" type="submit">
								Create Post
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrQlClient)(createPost);
