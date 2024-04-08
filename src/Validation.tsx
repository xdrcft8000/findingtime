import * as Yup from 'yup';

const nameValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(25, 'Name must be at most 25 characters')
    .matches(/^[a-zA-Z\-]+$/, 'Only use letters with no spaces')
    .required('Name is required'),
});

export const validateName = async (name: string): Promise<string> => {
  try {
    await nameValidationSchema.validate({name});
    return 'valid'; // Return 'valid' if the name is valid
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message; // Return the error message if there's a validation error
    } else {
      console.error('Error validating name:', error);
      return 'An unexpected error occurred'; // Return a generic error message for other errors
    }
  }
};

const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const validateEmail = async (email: string): Promise<string> => {
  try {
    await emailValidationSchema.validate({email});
    return 'valid'; // Return 'valid' if the email is valid
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    } else {
      console.error('Error validating email:', error);
      return 'An unexpected error occurred';
    }
  }
};

const passwordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const validatePassword = async (password: string): Promise<string> => {
  try {
    await passwordValidationSchema.validate({password});
    return 'valid'; // Return 'valid' if the password is valid
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    } else {
      console.error('Error validating password:', error);
      return 'An unexpected error occurred';
    }
  }
};

const titleValidationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Name must be at least 3 characters long')
    .max(25, 'Name must be at most 20 characters long')
    .required('Enter a name'),
});

export const validateTitle = async (title: string): Promise<string> => {
  try {
    await titleValidationSchema.validate({title});
    return 'valid'; // Return 'valid' if the title is valid
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    } else {
      console.error('Error validating password:', error);
      return 'An unexpected error occurred';
    }
  }
};

const durationValidationSchema = Yup.object().shape({
  duration: Yup.string()
    .required('Enter the amount of weeks you want to find the best time for.')
    .test('notZero', 'Enter a number larger than 0', value => value !== '0')
    .test(
      'notEmpty',
      'Enter the amount of weeks you want to find the best time for',
      value => value !== '',
    )
    .matches(/^[0-9]+$/, 'Duration must contain only numbers'),
});

// Define the validation function
export const validateDuration = async (duration: string): Promise<string> => {
  try {
    await durationValidationSchema.validate({duration});
    return 'valid'; // Return 'valid' if duration is valid
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    } else {
      console.error('Error validating duration:', error);
      return 'An unexpected error occurred';
    }
  }
};
