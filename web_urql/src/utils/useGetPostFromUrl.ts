import { usePostQuery } from '../generated/graphql';
import { useGetIntId } from './useGetIntId';

export const useGetPostFromUrl = () => {
	const intID = useGetIntId();
	return usePostQuery({
		pause: intID === -1,
		variables: {
			id: intID,
		},
	});
};
