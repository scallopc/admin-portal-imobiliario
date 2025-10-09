"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditProfileDialog } from "@/app/account/components/edit-profile-dialog"
import { ChangePasswordDialog } from "@/app/account/components/change-password-dialog"
import { useUser } from "@/hooks/queries/use-user"
import { Loader2, User } from "lucide-react"

export default function Account() {
    const { data: user, isLoading, error } = useUser()

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-6 md:p-8">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex flex-col gap-6 p-6 md:p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Erro ao carregar perfil</p>
                    </div>
                </div>
            </div>
        )
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>
                    <p className="text-sm text-muted-foreground">Gerencie as informações do seu perfil</p>
                </div>
                <div className="flex gap-2">
                    <EditProfileDialog
                        initialName={user.name}
                        initialEmail={user.email}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16 ring-1 ring-gold/40 bg-[#F2C791] text-[#1a1510]">
                            <AvatarImage src="" alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Nome</p>
                                <p className="text-base text-primary-clean">{user.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">E-mail</p>
                                <p className="text-base text-primary-clean">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Segurança</CardTitle>
                        <CardDescription>Gerencie sua senha e configurações de segurança</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordDialog />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
