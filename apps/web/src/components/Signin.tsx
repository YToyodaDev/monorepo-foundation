'use client';
import { useFormSignIn } from '@foundation/forms/src/signin';

import { signIn } from 'next-auth/react';

export const Signin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useFormSignIn();

  const formData = watch();
  console.log('data, error', formData, errors);
  return (
    <form
      className=""
      onSubmit={handleSubmit((formData) => {
        signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl: '/',
        });
      })}
    >
      <label title="Email">
        <input type="email" {...register('email')} placeholder="Email" />
      </label>
      <div className="text-red-500"> {errors.email?.message}</div>
      <label title="Password">
        <input
          type="password"
          {...register('password')}
          placeholder="password"
        />
      </label>
      <div className="text-red-500"> {errors.password?.message}</div>

      <button type="submit">Submit</button>
    </form>
  );
};
