import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MAX_AGE } from '@foundation/util';
import { sign, verify } from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt';
import { fetchGraphqlStatic } from '../fetch';
import {
  AuthProviderType,
  LoginDocument,
  UserDocument,
  RegisterWithProviderDocument,
} from '../queries/generated';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : 'Missing Google OAuth environment variables';
  throw new Error(message);
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google Provider Configuration
    // called when you invoke signIn('google', { ... })
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Credentials Provider Configuration
    // called when you invoke signIn('credentials', { ... })
    CredentialsProvider({
      name: 'Credentials', // optional, only relevant when built-in form is used.
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // called when you invoke signIn('credentials', { ... })
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        const { data, error } = await fetchGraphqlStatic({
          document: LoginDocument,
          variables: { loginInput: { email, password } },
        });

        if (!data?.login || error) {
          console.error(`Authentication error: ${error}`);
          // If you throw an Error, the user will be sent to the error page with the error message as a query parameter.

          throw new Error(
            'Authentication failed: Invalid credentials or user not found',
          );
        }
        const user = data.login.user;
        // Any object returned will be saved in `user` property of the JWT
        return {
          id: user.uid,
          name: user.name,
          image: user.image,
          email: user.email,
        };
      },
    }),
  ],
  debug: true,
  // Tells next-auth to use 'jwt'
  session: {
    strategy: 'jwt',
    maxAge: MAX_AGE,
  },

  jwt: {
    maxAge: MAX_AGE,
    // called after both authorize and signIn have been called
    // this secret variable comes from an environmental variable NEXTAUTH_SECRET
    async encode({ token, secret }): Promise<string> {
      if (!token) {
        throw new Error('Token is undefined');
      }
      const { sub, picture, ...tokenProps } = token;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expirationTimestamp = nowInSeconds + MAX_AGE;

      // generates the JWT that gets stored as the next-auth.session-token
      return sign(
        {
          uid: sub,
          image: picture,
          ...tokenProps,
          exp: expirationTimestamp,
        },
        secret,
        { algorithm: 'HS256' },
      );
    },
    // Indirectly called by functions that need to interpret JWTs into a human-readable format, like useSession or getServerSession,
    async decode({ token, secret }): Promise<JWT | null> {
      if (!token) {
        throw new Error('Token is undefined');
      }
      try {
        const decodedToken = verify(token, secret, {
          algorithms: ['HS256'],
        });

        return decodedToken as JWT;
      } catch (error) {
        console.error('JWT decode error: ', error);
        return null;
      }
    },
  },
  callbacks: {
    // called after the user has been successfully authenticated (i.e., after the authorize function has returned a user object)
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { id, name, image } = user;

        const existingUser = await fetchGraphqlStatic({
          document: UserDocument,
          variables: { where: { uid: id } },
        });

        if (!existingUser.data) {
          await fetchGraphqlStatic({
            document: RegisterWithProviderDocument,
            variables: {
              registerWithProviderInput: {
                type: AuthProviderType.Google,
                uid: id,
                image,
                name,
              },
            },
          });
        }
      }
      return true;
    },
    // used to retrieve the session data (from the JWT) and modify the session object that is returned to the client.
    async session({ token, session }) {
      if (token) {
        session.user = {
          name: token.name,
          email: token.email,
          image: token.picture,
          uid: (token.uid as string) || '',
        };
      }
      return session;
    },
  },
  //Tells next-auth not to use the built-in form and where to fall back to in case a user is not authenticated
  pages: {
    signIn: '/sign-in',
  },
};
// getServerSession is functionally equivalent to the useSession hook on the client side,
export const getAuth = () => getServerSession(authOptions);
