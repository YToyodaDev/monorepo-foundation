import { authOptions } from '@foundation/network/src/auth/authOptions';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);
// GET and POST are the names used in the App Directory for handling HTTP methods.
export { handler as GET, handler as POST };
