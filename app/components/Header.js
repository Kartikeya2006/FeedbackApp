'use Client';
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "./Button";
import Logout from "./icons/Logout";
import Login from "./icons/Login";

export default function Header() {
    const {data:session} = useSession();
    const isLoggedIn = !!session?.user?.email;
    function logout() {
        signOut();
    }
    function login() {
        signIn('google');
    }
    return (
        <div className="max-w-2xl mx-auto p-2 flex gap-4 justify-end items-center">
            {isLoggedIn && (
                <>
                 <span>
                   Hello, {session.user.name}!
                 </span>
                 <Button className="border bg-white shadow-sm px-2 py-0" 
                 onClick={logout}>
                    <div className="flex">
                     Logout <Logout/>
                    </div>
                 </Button>
                </>
            )}
            {!isLoggedIn && (
                <>
                 <span>
                   Not Logged In
                 </span>
                 <Button primary={true.toString()} className="shadow-sm border-gray-400 px-2 py-0" 
                 onClick={login}>
                    <div className="flex">
                     Login <Login/>
                    </div>
                 </Button>
                </>
            )}
        </div>
    );
}