import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { createUrQlClient } from '../../../utils/createUrqlClient';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { useRouter } from 'next/router';
import { useGetIntId } from '../../../utils/useGetIntId';

const Edit: React.FC<{}> = () => {
	const router = useRouter();
	const intID = useGetIntId();
	const [{ data, fetching }] = usePostQuery({
		pause: intID === -1,
		variables: {
			id: intID,
		},
	});

	const [_, updatePost] = useUpdatePostMutation();

	if (fetching) {
		return (
			<Layout>
				<div>loading ...</div>
			</Layout>
		);
	}
	console.log(data);
	return (
		<Layout variant="small">
			<Formik
				initialValues={{
					title: data?.post?.title,
					description: data?.post?.description,
				}}
				onSubmit={async (values) => {
					const { error } = await updatePost({
						id: intID,
						...values,
					});

					if (!error) {
						router.back();
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
								Update Post
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrQlClient)(Edit);
