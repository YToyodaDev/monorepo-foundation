import { Signout } from '@/components/Signout';
import { getAuth } from '@foundation/network/src/auth/authOptions';
import { add } from '@foundation/sample-lib';
import Link from 'next/link';
export default async function Home() {
  const user = await getAuth();
  console.log('user', user);
  return (
    <main>
      Hello world {add(10, 12)}
      <div></div>
      {user?.user ? <Signout /> : <Link href="/signin">Sign In</Link>}
    </main>
  );
}
