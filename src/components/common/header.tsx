'use client'

import { Home, Menu, X, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/queries/use-user";
import { userQueryKey } from "@/hooks/queries/use-user";
import { Loading } from "../ui/loading";

export default function Header() {
    const { data: user, isLoading, error } = useUser()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Memoize the initials calculation
    const userInitials = React.useMemo(() => {
        if (!user?.name) return 'U'
        return user.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [user?.name])
    const navItems = [
        { label: "Dashboard", href: "/" },
        { label: "Leads", href: "/leads" },
        { label: "Imóveis", href: "/property" },
        { label: "Lançamentos", href: "/releases" },
        { label: "Follow-up", href: "/follow-up" },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavigation = (href: string) => {
        if (isNavigating) return;
        
        setIsNavigating(true);
        setIsMenuOpen(false);
        router.push(href);
    };

    // Reset loading when route changes
    useEffect(() => {
        if (isNavigating) {
            setIsNavigating(false);
        }
    }, [pathname]);

    const onLogout = async () => {
        setIsNavigating(true);
        try {
            await fetch("/api/auth/sign-out", { method: "POST" });
        } finally {
            // Limpar cache do usuário
            queryClient.removeQueries({ queryKey: userQueryKey() });
            router.push("/authentication");
            router.refresh();
        }
    };


    return (
        <>
            {/* Global Loading Overlay */}
            {isNavigating && <Loading />}
            
            <header className="relative top-0 left-0 right-0 z-50">
                <div className="w-full px-6  lg:px-8">
                <div className="flex justify-between items-center py-4 sm:py-6">
                    <Link href="/" className="flex items-center group">
                        <img src="/logogold.svg" alt="Portal Imobiliário" className="h-12 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 lg:space-x-8">
                        {navItems.map(({ label, href }) => {
                            const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
                            return (
                                <div key={href} className="inline-flex flex-col items-center">
                                    <Button
                                        onClick={() => handleNavigation(href)}
                                        variant="ghost"
                                        className="text-primary-clean hover:text-gold bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-xl"
                                    >
                                        {label}
                                    </Button>
                                    {active && (
                                        <div className="mt-1 h-1 w-full bg-gradient-to-r from-[#F2C791] to-[#A67C58] rounded-full"></div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div className="hidden md:flex">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button aria-label="Abrir menu do usuário" className="inline-flex items-center focus:outline-none cursor-pointer">
                                    <Avatar className="h-9 w-9 ring-1 ring-gold/40 bg-[#F2C791] text-[#1a1510] ">
                                        <AvatarImage src="" alt={user?.name} />
                                        <AvatarFallback className="text-sm font-semibold">{userInitials}</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/account">Minha conta</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onLogout} className="cursor-pointer">Sair</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-primary-clean hover:text-gold transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden absolute left-0 right-0 top-full z-50 px-3 sm:px-4">
                        <div className="mt-2 rounded-2xl border border-gold/30 bg-[#1a1510]/75 backdrop-blur-sm shadow-2xl">
                            <nav className="flex flex-col py-4">
                                {navItems.map(({ label, href }) => (
                                    <button
                                        key={href}
                                        onClick={() => handleNavigation(href)}
                                        className="px-5 py-3 text-primary-clean font-semibold hover:text-gold transition-colors"
                                    >
                                        {label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleNavigation("/account")}
                                    className="px-5 py-3 text-primary-clean font-semibold hover:text-gold transition-colors"
                                >
                                    Minha conta
                                </button>
                                <div className="px-4 pt-2">
                                    <Button className="w-full" variant="outline" onClick={onLogout}>Sair</Button>
                                </div>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </header>
        </>
    );
}