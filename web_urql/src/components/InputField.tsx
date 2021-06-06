import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLTextAreaElement> &
	InputHTMLAttributes<HTMLInputElement> & {
		label: string;
		name: string;
		textarea?: boolean;
		placeholder?: string;
	};

const InputField: React.FC<InputFieldProps> = ({ label, textarea, size: _, ...props }) => {
	const [field, { error, touched }] = useField(props);
	let C = Input;

	if (textarea) {
		C = Textarea;
	}
	return (
		<FormControl isInvalid={error && touched}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<C aria-invalid={true} {...props} {...field} id={field.name} placeholder={props.placeholder} />
			{error ? (
				<FormErrorMessage>
					<FormErrorIcon />
					{error}
				</FormErrorMessage>
			) : null}
		</FormControl>
	);
};

export default InputField;
