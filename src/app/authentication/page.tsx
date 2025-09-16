import Image from "next/image";
import SignInForm from "./components/sign-in-form";

const Authentication = async () => {
    return (
        <div className="relative min-h-screen">
            <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
                alt="Fundo com imóveis"
                fill
                priority
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
                <div className="w-full max-w-md">
                    <SignInForm />
                </div>
            </div>
        </div>
    );
};

export default Authentication;