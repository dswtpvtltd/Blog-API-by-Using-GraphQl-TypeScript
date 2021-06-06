import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { useRouter } from 'next/router';
import { useGetIntId } from '../../../utils/useGetIntId';
import { withApollo } from '../../../utils/withApollo';

const Edit: React.FC<{}> = () => {
	const router = useRouter();
	const intID = useGetIntId();
	const { data, loading } = usePostQuery({
		skip: intID === -1,
		variables: {
			id: intID,
		},
	});

	const [updatePost] = useUpdatePostMutation();

	if (loading) {
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
					const { errors } = await updatePost({
						variables: {
							id: intID,
							...values,
						},
					});

					if (!errors) {
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

export default withApollo({ ssr: false })(Edit);
