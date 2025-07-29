import ShowLogIn from "@/components/ShowLogIn";
import SignInForm from "@/components/SignInForm";
import Link from "next/link";

export default function(){
  return(
    <main>
   <h2> Welcome to bed time stories</h2>
   <ShowLogIn/>
   <SignInForm/>
    <Link href="/register">Don&apos;t have an account? Sign up</Link>
   </main>
  );
}