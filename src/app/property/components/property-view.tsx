"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyDTO } from "@/actions/get-property/schema";
import {
  Calendar,
  Home,
  MapPin,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Car,
  Sofa,
  Star,
  Image as ImageIcon,
  Video,
  User,
} from "lucide-react";
import { useProperty } from "@/hooks/queries/use-property";

interface PropertyViewProps {
  propertyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabels = {
  casa: "Casa",
  apartamento: "Apartamento",
  penthouse: "Penthouse",
  cobertura: "Cobertura",
  sobrado: "Sobrado",
  kitnet: "Kitnet",
  studio: "Studio",
  terreno: "Terreno",
  comercial: "Comercial",
};

const statusLabels = {
  venda: "Venda",
  aluguel: "Aluguel",
  available: "Disponível",
  sold: "Vendido",
  rented: "Alugado",
};

const statusColors = {
  venda: "bg-green-100 text-green-800",
  aluguel: "bg-blue-100 text-blue-800",
  available: "bg-yellow-100 text-yellow-800",
  sold: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
};

const typeColors = {
  "Casa": "bg-orange-100 text-orange-800",
  "Apartamento": "bg-purple-100 text-purple-800",
  "Penthouse": "bg-pink-100 text-pink-800",
  "Cobertura": "bg-indigo-100 text-indigo-800",
  "Sobrado": "bg-amber-100 text-amber-800",
  "Kitnet": "bg-cyan-100 text-cyan-800",
  "Studio": "bg-teal-100 text-teal-800",
  "Terreno": "bg-brown-100 text-brown-800",
  "Comercial": "bg-gray-100 text-gray-800",
};

export function PropertyView({ propertyId, open, onOpenChange }: PropertyViewProps) {
  const { data: property, isLoading, error } = useProperty(propertyId || "");

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto m-1">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Carregando imóvel...
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground">Carregando detalhes do imóvel...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !property) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto m-1">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Erro ao carregar imóvel
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">Não foi possível carregar os detalhes do imóvel</p>
              <p className="text-muted-foreground text-sm">{error?.message}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatPrice = (price: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString("pt-BR")} m²`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="light-scroll max-h-[90vh] w-[95vw] max-w-7xl overflow-y-auto m-1">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            Visualizar Imóvel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Informações Básicas */}
          <Card>

            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
      
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Título</label>
                  <p className="text-sm sm:text-lg font-semibold">{property.title}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Tipo</label>
                  <p className="text-sm sm:text-base">{property.type || "—"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Status</label>
                  <p className="text-sm sm:text-base">
                    {property.status ? statusLabels[property.status.toLowerCase() as keyof typeof statusLabels] || property.status : "—"}
                  </p>
                </div>
              </div>

              {property.description && (
                <div>
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Descrição</label>
                  <p className="mt-1 text-sm sm:text-base whitespace-pre-wrap">{property.description}</p>
                </div>
              )}

              {property.keywords && property.keywords.length > 0 && (
                <div>
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Palavras-chave (SEO)</label>
                  <div className="mt-1 flex flex-wrap gap-1.5 sm:gap-2">
                    {property.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preço e Área */}
          {(property.price || property.area) && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {property.price && (
                <Card>
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                      Preço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-primary text-lg sm:text-2xl font-bold">{formatPrice(property.price, property.currency)}</p>
                  </CardContent>
                </Card>
              )}

              {property.area && (
                <Card>
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
                      Área
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg sm:text-2xl font-bold">{formatArea(property.area)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Características */}
          {(property.bedrooms !== undefined || property.bathrooms !== undefined || property.suites !== undefined || property.parkingSpaces !== undefined || property.furnished) && (
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Características</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {property.bedrooms !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Bed className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-muted-foreground text-xs sm:text-sm">Quartos</p>
                      </div>
                      <p className="font-semibold text-sm sm:text-base">{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Bath className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-muted-foreground text-xs sm:text-sm">Banheiros</p>
                      </div>
                      <p className="font-semibold text-sm sm:text-base">{property.bathrooms}</p>
                    </div>
                  )}
                  {property.suites !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Star className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-muted-foreground text-xs sm:text-sm">Suítes</p>
                      </div>
                      <p className="font-semibold text-sm sm:text-base">{property.suites}</p>
                    </div>
                  )}
                  {property.parkingSpaces !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Car className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-muted-foreground text-xs sm:text-sm">Vagas</p>
                      </div>
                      <p className="font-semibold text-sm sm:text-base">{property.parkingSpaces}</p>
                    </div>
                  )}
                </div>

                {property.furnished && (
                  <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2">
                    <Sofa className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Mobiliado</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Endereço */}
          {property.address && (property.address.street || property.address.city || property.address.zipCode) && (
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base">
                  {[
                    property.address.street,
                    property.address.number,
                    property.address.neighborhood,
                    property.address.city,
                    property.address.state,
                    property.address.zipCode
                  ].filter(Boolean).join(", ") || "Endereço não informado"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Características Especiais */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Características Especiais</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {property.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mídia */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {property.images && property.images.length > 0 && (
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Imagens ({property.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {property.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="bg-muted aspect-square overflow-hidden rounded-md">
                        <img src={image} alt={`Imagem ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {property.videos && property.videos.length > 0 && (
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                    Vídeos ({property.videos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5 sm:space-y-2">
                    {property.videos.map((video, index) => (
                      <div key={index} className="text-muted-foreground text-xs sm:text-sm">
                        Vídeo {index + 1}: {video}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Datas */}
          <Card>
            <CardContent className="space-y-2 pt-4 sm:pt-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Criado em</label>
                </div>
                <p className="text-sm sm:text-base">
                  {property.createdAt
                    ? new Date(property.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <label className="text-muted-foreground text-xs sm:text-sm font-medium">Atualizado em</label>
                </div>
                <p className="text-sm sm:text-base">
                  {property.updatedAt
                    ? new Date(property.updatedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
