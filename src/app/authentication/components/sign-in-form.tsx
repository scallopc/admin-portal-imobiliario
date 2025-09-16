"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignInEmailPassword } from "@/hooks/mutations/use-sign-in-email-password";

const formSchema = z.object({
    email: z.string({ message: "E-mail inválido!" }).email("E-mail inválido!"),
    password: z.string({ message: "Senha inválida!" }).min(8, "Senha inválida!"),
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = () => {
    const router = useRouter();
    const signIn = useSignInEmailPassword();
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            await signIn.mutateAsync({ email: values.email, password: values.password });
            router.push("/");
        } catch (err: any) {
            const message: string | undefined = err?.message;
            if (message === "EMAIL_NOT_FOUND") {
                toast.error("E-mail não encontrado.");
                form.setError("email", { message: "E-mail não encontrado." });
                return;
            }
            if (message === "INVALID_PASSWORD" || message === "INVALID_CREDENTIAL" || message === "auth/invalid-credential") {
                toast.error("E-mail ou senha inválidos.");
                form.setError("email", { message: "E-mail ou senha inválidos." });
                form.setError("password", { message: "E-mail ou senha inválidos." });
                return;
            }
            toast.error(message ?? "Erro ao entrar.");
        }
    }

    return (
        <>
            <Card className="w-full bg-white/10 backdrop-blur-md border-gold shadow-lg">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logoallgold.svg"
                            alt="Logo"
                            className="h-12 w-auto max-w-[180px] select-none object-contain"
                            draggable={false}
                        />
                    </div>
                    <CardTitle>Entrar</CardTitle>
                    <CardDescription>Faça login para continuar.</CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite seu email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Digite sua senha"
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button type="submit" className="w-full" variant="outline" disabled={signIn.isPending}>
                                {signIn.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>Entrar</>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </>
    );
};

export default SignInForm;