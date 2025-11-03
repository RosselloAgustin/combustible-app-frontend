import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Gauge, FileText, Download, Trash2, Edit2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TravelForm {
  fecha: string;
  destino: string;
  paquetes?: string;
  kmInicio: string;
  kmFinal: string;
  dineroGanado?: string;
  notas: string;
}

interface Travel {
  id: number;
  tipo: 'trabajo' | 'personal';
  fecha: string | Date;
  kmInicio: number;
  kmFinal: number;
  kmRecorridos?: number;
  paquetes: number | null;
  destino: string | null;
  dineroGanado: number | null;
  notas: string | null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("viajes");
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkTravelModal, setShowWorkTravelModal] = useState(false);
  const [showPersonalTravelModal, setShowPersonalTravelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'trabajo' | 'personal'>('todos');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterDay, setFilterDay] = useState<string>('');
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TravelForm>({
    fecha: new Date().toISOString().split('T')[0],
    destino: "",
    paquetes: "",
    kmInicio: "",
    kmFinal: "",
    dineroGanado: "",
    notas: "",
  });
  const [personalFormData, setPersonalFormData] = useState<Omit<TravelForm, 'dineroGanado' | 'paquetes'>>({
    fecha: new Date().toISOString().split('T')[0],
    destino: "",
    kmInicio: "",
    kmFinal: "",
    notas: "",
  });

  // tRPC queries
  const { data: travels = [], isLoading: isLoadingTravels, refetch } = trpc.trips.list.useQuery();

  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Viaje guardado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al guardar el viaje");
    },
  });

  const updateTripMutation = trpc.trips.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Viaje actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el viaje");
    },
  });

  const deleteTripMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Viaje eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el viaje");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingTravel) {
      setEditingTravel((prev) => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSaveTravel = async () => {
    try {
      setIsLoading(true);
      const kmInicio = parseInt(formData.kmInicio) || 0;
      const kmFinal = parseInt(formData.kmFinal) || 0;

      if (kmFinal <= kmInicio) {
        toast.error("Km final debe ser mayor que km inicio");
        return;
      }

      await createTripMutation.mutateAsync({
        tipo: 'trabajo',
        fecha: formData.fecha,
        kmInicio,
        kmFinal,
        paquetes: parseInt(formData.paquetes || '0') || 0,
        dineroGanado: parseInt(formData.dineroGanado || '0') || 0,
        notas: formData.notas || undefined,
      });

      setShowWorkTravelModal(false);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        destino: "",
        paquetes: "",
        kmInicio: "",
        kmFinal: "",
        dineroGanado: "",
        notas: "",
      });
    } catch (error) {
      console.error("Error saving trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePersonalTravel = async () => {
    try {
      setIsLoading(true);
      const kmInicio = parseInt(personalFormData.kmInicio) || 0;
      const kmFinal = parseInt(personalFormData.kmFinal) || 0;

      if (kmFinal <= kmInicio) {
        toast.error("Km final debe ser mayor que km inicio");
        return;
      }

      await createTripMutation.mutateAsync({
        tipo: 'personal',
        fecha: personalFormData.fecha,
        kmInicio,
        kmFinal,
        destino: personalFormData.destino,
        notas: personalFormData.notas || undefined,
      });

      setShowPersonalTravelModal(false);
      setPersonalFormData({
        fecha: new Date().toISOString().split('T')[0],
        destino: "",
        kmInicio: "",
        kmFinal: "",
        notas: "",
      });
    } catch (error) {
      console.error("Error saving personal trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTravel = (travel: Travel) => {
    setEditingTravel({ ...travel });
    setShowEditModal(true);
  };

  const handleSaveEditTravel = async () => {
    if (!editingTravel) return;

    try {
      setIsLoading(true);
      const kmInicio = parseInt(editingTravel.kmInicio.toString()) || 0;
      const kmFinal = parseInt(editingTravel.kmFinal.toString()) || 0;

      if (kmFinal <= kmInicio) {
        toast.error("Km final debe ser mayor que km inicio");
        return;
      }

      await updateTripMutation.mutateAsync({
        id: editingTravel.id,
        tipo: editingTravel.tipo,
        fecha: editingTravel.fecha.toString().split('T')[0],
        kmInicio,
        kmFinal,
        paquetes: editingTravel.paquetes || undefined,
        destino: editingTravel.destino || undefined,
        dineroGanado: editingTravel.dineroGanado || undefined,
        notas: editingTravel.notas || undefined,
      });

      setShowEditModal(false);
      setEditingTravel(null);
    } catch (error) {
      console.error("Error updating trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTravel = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este viaje?")) {
      try {
        setIsLoading(true);
        await deleteTripMutation.mutateAsync({ id });
      } catch (error) {
        console.error("Error deleting trip:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExportTravels = () => {
    const dataStr = JSON.stringify(filteredTravels, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viajes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAvailableYears = () => {
    const years = new Set(travels.map(t => {
      const fecha = typeof t.fecha === 'string' ? t.fecha : new Date(t.fecha).toISOString();
      return fecha.split('-')[0];
    }));
    return Array.from(years).sort().reverse();
  };

  const getAvailableMonths = () => {
    if (!filterYear) return [];
    const months = new Set(
      travels
        .filter(t => {
          const fecha = typeof t.fecha === 'string' ? t.fecha : new Date(t.fecha).toISOString();
          return fecha.startsWith(filterYear);
        })
        .map(t => {
          const fecha = typeof t.fecha === 'string' ? t.fecha : new Date(t.fecha).toISOString();
          return fecha.split('-')[1];
        })
    );
    return Array.from(months).sort();
  };

  const getAvailableDays = () => {
    if (!filterYear || !filterMonth) return [];
    const days = new Set(
      travels
        .filter(t => {
          const fecha = typeof t.fecha === 'string' ? t.fecha : new Date(t.fecha).toISOString();
          return fecha.startsWith(`${filterYear}-${filterMonth}`);
        })
        .map(t => {
          const fecha = typeof t.fecha === 'string' ? t.fecha : new Date(t.fecha).toISOString();
          return fecha.split('-')[2];
        })
    );
    return Array.from(days).sort();
  };

  const filteredTravels = travels.filter(t => {
    const fecha = typeof t.fecha === 'string' ? t.fecha : new Date(t.fecha).toISOString();
    
    // Filter by type
    if (filterType !== 'todos' && t.tipo !== filterType) return false;
    
    // Filter by date
    if (filterYear && !fecha.startsWith(filterYear)) return false;
    if (filterMonth && !fecha.startsWith(`${filterYear}-${filterMonth}`)) return false;
    if (filterDay && fecha !== `${filterYear}-${filterMonth}-${filterDay}`) return false;
    
    return true;
  });

  const getFilteredStats = () => {
    const filtered = filteredTravels;
    return {
      totalViajes: filtered.length,
      kmRecorridos: filtered.reduce((sum, t) => sum + (t.kmFinal - t.kmInicio), 0),
      dineroGanado: filtered.reduce((sum, t) => sum + (t.dineroGanado || 0), 0),
      paquetesEntregados: filtered.filter(t => t.tipo === 'trabajo').reduce((sum, t) => sum + (t.paquetes || 0), 0),
    };
  };

  const stats = getFilteredStats();

  const monthNames = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  if (isLoadingTravels) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🚗</span>
            <h1 className="text-4xl font-bold text-gray-900">Calculadora Corsa</h1>
          </div>
          <p className="text-gray-600 text-lg">Chevrolet Corsa Classic 1.6 2007 - Análisis de Costos y Ganancias</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="viajes" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Viajes
              </TabsTrigger>
              <TabsTrigger value="kilometraje" className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Kilometraje
              </TabsTrigger>
              <TabsTrigger value="resumen" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resumen
              </TabsTrigger>
            </TabsList>
            <p className="text-gray-600 text-sm text-center">Calculá costos estimados basados en rutas y km diarios</p>
          </Tabs>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            className="h-24 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg flex items-center justify-center gap-2"
            onClick={() => setShowWorkTravelModal(true)}
            disabled={isLoading}
          >
            <MapPin className="w-5 h-5" />
            Nuevo Viaje de Trabajo
          </Button>
          <Button
            className="h-24 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg flex items-center justify-center gap-2"
            onClick={() => setShowPersonalTravelModal(true)}
            disabled={isLoading}
          >
            <MapPin className="w-5 h-5" />
            Nuevo Viaje Personal
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <Checkbox
            id="showFilters"
            checked={showFilters}
            onCheckedChange={(checked) => setShowFilters(checked as boolean)}
          />
          <label htmlFor="showFilters" className="text-sm font-medium cursor-pointer">
            Mostrar filtros de fechas
          </label>
        </div>

        {showFilters && (
          <>
            <Card className="mb-8 p-6 bg-gray-100">
              <h3 className="text-lg font-semibold mb-4">Filtrar por Tipo de Viaje</h3>
              <div className="flex gap-3">
                <Button
                  variant={filterType === 'todos' ? 'default' : 'outline'}
                  onClick={() => setFilterType('todos')}
                  className={filterType === 'todos' ? 'bg-gray-800 text-white' : ''}
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === 'trabajo' ? 'default' : 'outline'}
                  onClick={() => setFilterType('trabajo')}
                  className={filterType === 'trabajo' ? 'bg-gray-800 text-white' : ''}
                >
                  Trabajo
                </Button>
                <Button
                  variant={filterType === 'personal' ? 'default' : 'outline'}
                  onClick={() => setFilterType('personal')}
                  className={filterType === 'personal' ? 'bg-gray-800 text-white' : ''}
                >
                  Personal
                </Button>
              </div>
            </Card>

            <Card className="mb-8 p-6 bg-gray-100">
              <h3 className="text-lg font-semibold mb-4">Filtrar por Fecha</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Año</label>
                  <select
                    value={filterYear}
                    onChange={(e) => {
                      setFilterYear(e.target.value);
                      setFilterMonth('');
                      setFilterDay('');
                    }}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar año</option>
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {filterYear && (
                  <div>
                    <label className="text-sm font-medium">Mes</label>
                    <select
                      value={filterMonth}
                      onChange={(e) => {
                        setFilterMonth(e.target.value);
                        setFilterDay('');
                      }}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar mes</option>
                      {getAvailableMonths().map(month => {
                        const monthName = monthNames.find(m => m.value === month);
                        return (
                          <option key={month} value={month}>{monthName?.label}</option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {filterYear && filterMonth && (
                  <div>
                    <label className="text-sm font-medium">Día</label>
                    <select
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar día</option>
                      {getAvailableDays().map(day => (
                        <option key={day} value={day}>{parseInt(day)}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        <Card className="mb-8 p-6 border-2 border-gray-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Resumen del Mes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600 font-medium">Total Viajes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViajes}</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600 font-medium">Km Recorridos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.kmRecorridos}</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg text-center">
              <p className="text-green-700 font-medium">Dinero Ganado</p>
              <p className="text-3xl font-bold text-green-700">${stats.dineroGanado}</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600 font-medium">Paquetes Entregados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.paquetesEntregados}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Historial de Viajes
            </h2>
            {filteredTravels.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTravels}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-6">Aquí puedes ver y gestionar tus viajes registrados en el mes seleccionado.</p>

          {filteredTravels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay viajes registrados para este mes. ¡Comienza a registrar tus viajes!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold">Destino/Paquetes</th>
                    <th className="text-left py-3 px-4 font-semibold">Km Inicio</th>
                    <th className="text-left py-3 px-4 font-semibold">Km Final</th>
                    <th className="text-left py-3 px-4 font-semibold">Km Recorridos</th>
                    <th className="text-left py-3 px-4 font-semibold">Dinero</th>
                    <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTravels.map((travel) => {
                    const fecha = typeof travel.fecha === 'string' ? travel.fecha : new Date(travel.fecha).toISOString().split('T')[0];
                    const kmRecorridos = travel.kmFinal - travel.kmInicio;
                    return (
                      <tr key={travel.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{fecha}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            travel.tipo === 'trabajo' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {travel.tipo === 'trabajo' ? 'Trabajo' : 'Personal'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {travel.tipo === 'trabajo' ? `${travel.paquetes} paquetes` : travel.destino}
                        </td>
                        <td className="py-3 px-4">{travel.kmInicio}</td>
                        <td className="py-3 px-4">{travel.kmFinal}</td>
                        <td className="py-3 px-4 font-semibold">{kmRecorridos}</td>
                        <td className="py-3 px-4">${travel.dineroGanado || 0}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTravel(travel)}
                            disabled={isLoading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTravel(travel.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* Modal para nuevo viaje de trabajo */}
      <Dialog open={showWorkTravelModal} onOpenChange={setShowWorkTravelModal}>
        <DialogContent className="max-w-2xl border-2 border-blue-500">
          <DialogHeader>
            <DialogTitle className="text-2xl">Registrar Nuevo Viaje de Trabajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="paquetes">Paquetes Enviados</Label>
                <Input
                  id="paquetes"
                  name="paquetes"
                  type="number"
                  placeholder="Ej. 15"
                  value={formData.paquetes}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kmInicio">Kilometraje de Inicio</Label>
                <Input
                  id="kmInicio"
                  name="kmInicio"
                  type="number"
                  placeholder="Ej. 45000"
                  value={formData.kmInicio}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="kmFinal">Kilometraje Final</Label>
                <Input
                  id="kmFinal"
                  name="kmFinal"
                  type="number"
                  placeholder="Ej. 45025"
                  value={formData.kmFinal}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dineroGanado">Dinero Ganado ($)</Label>
              <Input
                id="dineroGanado"
                name="dineroGanado"
                type="number"
                placeholder="Ej. 1500"
                value={formData.dineroGanado}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                name="notas"
                placeholder="Ej. Viaje largo, buen pago"
                value={formData.notas}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                onClick={handleSaveTravel}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Viaje
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowWorkTravelModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para nuevo viaje personal */}
      <Dialog open={showPersonalTravelModal} onOpenChange={setShowPersonalTravelModal}>
        <DialogContent className="max-w-2xl border-2 border-green-500">
          <DialogHeader>
            <DialogTitle className="text-2xl">Registrar Nuevo Viaje Personal</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personalFecha">Fecha</Label>
                <Input
                  id="personalFecha"
                  name="fecha"
                  type="date"
                  value={personalFormData.fecha}
                  onChange={handlePersonalInputChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="destino">Destino/Lugar</Label>
                <Input
                  id="destino"
                  name="destino"
                  type="text"
                  placeholder="Ej. Centro, Zona Norte, Barrio X"
                  value={personalFormData.destino}
                  onChange={handlePersonalInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personalKmInicio">Kilometraje de Inicio</Label>
                <Input
                  id="personalKmInicio"
                  name="kmInicio"
                  type="number"
                  placeholder="Ej. 45000"
                  value={personalFormData.kmInicio}
                  onChange={handlePersonalInputChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="personalKmFinal">Kilometraje Final</Label>
                <Input
                  id="personalKmFinal"
                  name="kmFinal"
                  type="number"
                  placeholder="Ej. 45025"
                  value={personalFormData.kmFinal}
                  onChange={handlePersonalInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="personalNotas">Notas (opcional)</Label>
              <Textarea
                id="personalNotas"
                name="notas"
                placeholder="Ej. Viaje largo, buen pago"
                value={personalFormData.notas}
                onChange={handlePersonalInputChange}
                className="mt-2"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                onClick={handleSavePersonalTravel}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Viaje
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPersonalTravelModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar viaje */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl border-2 border-blue-500">
          <DialogHeader>
            <DialogTitle className="text-2xl">Editar Viaje</DialogTitle>
          </DialogHeader>
          {editingTravel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFecha">Fecha</Label>
                  <Input
                    id="editFecha"
                    name="fecha"
                    type="date"
                    value={typeof editingTravel.fecha === 'string' ? editingTravel.fecha : new Date(editingTravel.fecha).toISOString().split('T')[0]}
                    onChange={handleEditInputChange}
                    className="mt-2"
                  />
                </div>
                {editingTravel.tipo === 'trabajo' ? (
                  <div>
                    <Label htmlFor="editPaquetes">Paquetes Enviados</Label>
                    <Input
                      id="editPaquetes"
                      name="paquetes"
                      type="number"
                      value={editingTravel.paquetes || ''}
                      onChange={handleEditInputChange}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="editDestino">Destino/Lugar</Label>
                    <Input
                      id="editDestino"
                      name="destino"
                      type="text"
                      value={editingTravel.destino || ''}
                      onChange={handleEditInputChange}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editKmInicio">Kilometraje de Inicio</Label>
                  <Input
                    id="editKmInicio"
                    name="kmInicio"
                    type="number"
                    value={editingTravel.kmInicio}
                    onChange={handleEditInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="editKmFinal">Kilometraje Final</Label>
                  <Input
                    id="editKmFinal"
                    name="kmFinal"
                    type="number"
                    value={editingTravel.kmFinal}
                    onChange={handleEditInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              {editingTravel.tipo === 'trabajo' && (
                <div>
                  <Label htmlFor="editDineroGanado">Dinero Ganado ($)</Label>
                  <Input
                    id="editDineroGanado"
                    name="dineroGanado"
                    type="number"
                    value={editingTravel.dineroGanado || ''}
                    onChange={handleEditInputChange}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="editNotas">Notas (opcional)</Label>
                <Textarea
                  id="editNotas"
                  name="notas"
                  value={editingTravel.notas || ''}
                  onChange={handleEditInputChange}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                  onClick={handleSaveEditTravel}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Guardar Cambios
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
