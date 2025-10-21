"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { SUPER_API } from "@/lib/superApi/config";

interface BannerData {
  baner_id: number;
  banner_text: string;
  banner_limit: string;
  banner_active: number;
  created_at: string;
  updated_at?: string;
}

export function SuperadminBannerPage() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    banner_text: "",
    banner_limit: "",
    banner_active: 0
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [bannerToToggle, setBannerToToggle] = useState<{ id: number; status: number } | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);

      const apiClient = axios.create({
        baseURL: config.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await apiClient.get(SUPER_API.GET_BANNERS);
      setBanners(response.data);
    } catch (error) {
      console.error("Error obteniendo banners:", error);
      toast.error("Error al cargar los banners");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = (banner.banner_text || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && banner.banner_active === 1) ||
      (filterStatus === "inactive" && banner.banner_active === 0);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBanners = filteredBanners.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleCreateBanner = () => {
    setIsEditing(false);
    setEditingBanner(null);
    setBannerFormData({
      banner_text: "",
      banner_limit: "",
      banner_active: 0
    });
    setIsSheetOpen(true);
  };

  const handleEditBanner = (banner: BannerData) => {
    setIsEditing(true);
    setEditingBanner(banner);
    setBannerFormData({
      banner_text: banner.banner_text,
      banner_limit: banner.banner_limit,
      banner_active: banner.banner_active
    });
    setIsSheetOpen(true);
  };

  const handleSaveBanner = async () => {
    try {
      if (bannerFormData.banner_limit) {
        const limitDate = new Date(bannerFormData.banner_limit);
        const now = new Date();

        if (limitDate < now) {
          toast.error("La fecha límite no puede ser en el pasado");
          return;
        }
      }

      const apiClient = axios.create({
        baseURL: config.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (isEditing && editingBanner) {
        const url = SUPER_API.EDIT_BANNER.replace("{banner_id}", editingBanner.baner_id.toString());
        await apiClient.put(url, bannerFormData);
        toast.success("Banner actualizado correctamente");
      } else {
        await apiClient.post(SUPER_API.CREATE_BANNER, bannerFormData);
        toast.success("Banner creado correctamente");
      }

      setIsSheetOpen(false);
      setEditingBanner(null);
      fetchBanners();

      if (typeof window !== 'undefined' && window.refreshBannerStatus) {
        window.refreshBannerStatus();
      }
    } catch (error) {
      console.error("Error guardando banner:", error);

      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || "Error al guardar el banner";
        toast.error(errorMessage);
      } else {
        toast.error("Error al guardar el banner");
      }
    }
  };

  const handleDeleteBanner = (bannerId: number) => {
    setBannerToDelete(bannerId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;

    try {
      const apiClient = axios.create({
        baseURL: config.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const url = SUPER_API.DELETE_BANNER.replace("{banner_id}", bannerToDelete.toString());
      await apiClient.delete(url);

      await fetchBanners();
      toast.success("Banner eliminado correctamente");
      setShowDeleteDialog(false);
      setBannerToDelete(null);

      if (typeof window !== 'undefined' && window.refreshBannerStatus) {
        window.refreshBannerStatus();
      }
    } catch (error) {
      console.error("Error eliminando banner:", error);
      toast.error("Error al eliminar el banner");
    }
  };

  const handleToggleStatus = (bannerId: number, currentStatus: number) => {
    if (currentStatus === 0) {
      const activeBanner = banners.find(banner => banner.banner_active === 1);
      if (activeBanner) {
        toast.error(`Debes desactivar primero el banner #${activeBanner.baner_id} que está activo`);
        return;
      }
    }

    setBannerToToggle({ id: bannerId, status: currentStatus });
    setShowToggleDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!bannerToToggle) return;

    try {
      const apiClient = axios.create({
        baseURL: config.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const endpoint = bannerToToggle.status === 1 ? SUPER_API.DISABLE_BANNER : SUPER_API.ENABLE_BANNER;
      const url = endpoint.replace("{banner_id}", bannerToToggle.id.toString());
      await apiClient.post(url);

      await fetchBanners();
      toast.success(bannerToToggle.status === 1 ? "Banner deshabilitado" : "Banner habilitado");
      setShowToggleDialog(false);
      setBannerToToggle(null);
    } catch (error) {
      console.error("Error cambiando estado:", error);

      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || "Error al cambiar el estado del banner";

        if (errorMessage.includes("Solo puede haber un banner activo")) {
          toast.error("Ya hay un banner activo. Debes desactivarlo primero.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Error al cambiar el estado del banner");
      }
    }
  };

  const getStatusBadge = (status: number) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${status === 1
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
      >
        {status === 1 ? 'Activo' : 'Inactivo'}
      </span>
    );
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const isBannerExpired = (limitDate: string) => {
    if (!limitDate) return false;
    return new Date(limitDate) < new Date();
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl">Gestión de Banners</CardTitle>
            <Button onClick={handleCreateBanner}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Banner
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                  onClick={() => setSearchTerm("")}
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">Todos</SelectItem>
                <SelectItem value="active" className="cursor-pointer">Activos</SelectItem>
                <SelectItem value="inactive" className="cursor-pointer">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead className="min-w-[300px]">Banner</TableHead>
                    <TableHead className="w-[140px] text-center">Fecha Límite</TableHead>
                    <TableHead className="w-[110px] text-center">Estado</TableHead>
                    <TableHead className="w-[180px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBanners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No se encontraron banners
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBanners.map((banner) => (
                      <TableRow key={banner.baner_id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {banner.baner_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Banner #{banner.baner_id}</span>
                              {banner.banner_active === 1 && (
                                <Badge variant="default" className="text-xs">
                                  ACTIVO
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {banner.banner_text && banner.banner_text.length > 30
                                ? `${banner.banner_text.substring(0, 30)}...`
                                : banner.banner_text || "Sin contenido"
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">
                              {formatDate(banner.banner_limit || "")}
                            </span>
                            {banner.banner_limit && isBannerExpired(banner.banner_limit) && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expirado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(banner.banner_active)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={banner.banner_active === 1}
                                onCheckedChange={() => handleToggleStatus(banner.baner_id, banner.banner_active)}
                                title={banner.banner_active === 1 ? 'Deshabilitar Banner' : 'Habilitar Banner'}
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleEditBanner(banner)}
                              title="Editar banner"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBanner(banner.baner_id)}
                              title="Eliminar banner"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredBanners.length)} de {filteredBanners.length} banners
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center gap-1 md:gap-2 justify-center md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-xs md:text-sm px-2 md:px-3"
                >
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>

                <div className="flex flex-wrap items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-6 h-6 md:w-8 md:h-8 p-0 text-xs md:text-sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-xs md:text-sm px-2 md:px-3"
                >
                  <span className="hidden sm:inline mr-1">Siguiente</span>
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sheet para crear/editar banner */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Editar Banner" : "Crear Banner"}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? "Modifica los datos del banner" : "Completa los datos para crear un nuevo banner"}
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="banner_text">Texto del Banner</Label>
              <Textarea
                id="banner_text"
                value={bannerFormData.banner_text}
                onChange={(e) => setBannerFormData(prev => ({ ...prev, banner_text: e.target.value }))}
                placeholder="Ingresa el texto del banner"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="banner_limit" className="cursor-pointer">Fecha Límite</Label>
              <Input
                id="banner_limit"
                type="datetime-local"
                value={bannerFormData.banner_limit}
                onChange={(e) => setBannerFormData(prev => ({ ...prev, banner_limit: e.target.value }))}
                className="mt-1 cursor-pointer"
              />
            </div>


            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveBanner} className="flex-1">
                {isEditing ? "Actualizar" : "Crear Banner"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El banner será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBanner} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para cambiar estado */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
            <AlertDialogDescription>
              {bannerToToggle?.status === 1
                ? "¿Estás seguro de que deseas deshabilitar este banner? No se mostrará a los usuarios."
                : "¿Estás seguro de que deseas habilitar este banner? Se mostrará a todos los usuarios."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {bannerToToggle?.status === 1 ? "Deshabilitar" : "Habilitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
