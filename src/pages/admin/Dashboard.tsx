import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { projectService, Project } from "@/services/projectService";
import { constructionService, ConstructionProject } from "@/services/constructionService";
import { rentalService, Rental, RentalLocation } from "@/services/rentalService";
import { hospitalityService, HospitalityProject } from "@/services/hospitalityService";
import { ProjectFormModal } from "@/components/admin/ProjectFormModal";
import { ConstructionFormModal } from "@/components/admin/ConstructionFormModal";
import { RentalFormModal } from "@/components/admin/RentalFormModal";
import { HospitalityFormModal } from "@/components/admin/HospitalityFormModal";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { DraggableList } from "@/components/admin/DraggableList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Plus, 
  LogOut, 
  Edit, 
  Trash2, 
  Home, 
  RefreshCw,
  Image as ImageIcon,
  Building2,
  HardHat,
  Key,
  FileText,
  MapPin,
  Hotel
} from "lucide-react";
import { format } from "date-fns";

type ContentType = "portfolio" | "construction" | "rentals" | "hospitality" | "pages";
type DeleteTarget = { type: "project"; item: Project } | { type: "construction"; item: ConstructionProject } | { type: "rental"; item: Rental } | { type: "hospitality"; item: HospitalityProject };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ContentType>("portfolio");
  
  // Portfolio state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Construction state
  const [constructions, setConstructions] = useState<ConstructionProject[]>([]);
  const [isLoadingConstructions, setIsLoadingConstructions] = useState(true);
  const [isConstructionFormOpen, setIsConstructionFormOpen] = useState(false);
  const [editingConstruction, setEditingConstruction] = useState<ConstructionProject | null>(null);
  
  // Rentals state
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalLocations, setRentalLocations] = useState<RentalLocation[]>([]);
  const [isLoadingRentals, setIsLoadingRentals] = useState(true);
  const [isRentalFormOpen, setIsRentalFormOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  
  // Hospitality state
  const [hospitalityProjects, setHospitalityProjects] = useState<HospitalityProject[]>([]);
  const [isLoadingHospitality, setIsLoadingHospitality] = useState(true);
  const [isHospitalityFormOpen, setIsHospitalityFormOpen] = useState(false);
  const [editingHospitality, setEditingHospitality] = useState<HospitalityProject | null>(null);
  
  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch functions
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    const { data, error } = await projectService.getAll();
    if (error) {
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
    } else {
      setProjects(data || []);
    }
    setIsLoadingProjects(false);
  };

  const fetchConstructions = async () => {
    setIsLoadingConstructions(true);
    const { data, error } = await constructionService.getAll();
    if (error) {
      toast({ title: "Error", description: "Failed to load construction projects", variant: "destructive" });
    } else {
      setConstructions(data || []);
    }
    setIsLoadingConstructions(false);
  };

  const fetchRentals = async () => {
    setIsLoadingRentals(true);
    const [rentalsResult, locationsResult] = await Promise.all([
      rentalService.getAll(),
      rentalService.getAllLocations()
    ]);
    
    if (rentalsResult.error) {
      toast({ title: "Error", description: "Failed to load rentals", variant: "destructive" });
    } else {
      setRentals(rentalsResult.data || []);
    }
    
    if (locationsResult.error) {
      toast({ title: "Error", description: "Failed to load rental locations", variant: "destructive" });
    } else {
      setRentalLocations(locationsResult.data || []);
    }
    
    setIsLoadingRentals(false);
  };

  const fetchHospitality = async () => {
    setIsLoadingHospitality(true);
    const { data, error } = await hospitalityService.getAll();
    if (error) {
      toast({ title: "Error", description: "Failed to load hospitality projects", variant: "destructive" });
    } else {
      setHospitalityProjects(data || []);
    }
    setIsLoadingHospitality(false);
  };

  useEffect(() => {
    fetchProjects();
    fetchConstructions();
    fetchRentals();
    fetchHospitality();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  // Project handlers
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleProjectFormClose = () => {
    setIsProjectFormOpen(false);
    setEditingProject(null);
  };

  // Construction handlers
  const handleEditConstruction = (construction: ConstructionProject) => {
    setEditingConstruction(construction);
    setIsConstructionFormOpen(true);
  };

  const handleConstructionFormClose = () => {
    setIsConstructionFormOpen(false);
    setEditingConstruction(null);
  };

  // Rental handlers
  const handleEditRental = (rental: Rental) => {
    setEditingRental(rental);
    setIsRentalFormOpen(true);
  };

  const handleRentalFormClose = () => {
    setIsRentalFormOpen(false);
    setEditingRental(null);
  };

  // Hospitality handlers
  const handleEditHospitality = (hospitality: HospitalityProject) => {
    setEditingHospitality(hospitality);
    setIsHospitalityFormOpen(true);
  };

  const handleHospitalityFormClose = () => {
    setIsHospitalityFormOpen(false);
    setEditingHospitality(null);
  };

  // Reorder handlers
  const handleReorderProjects = useCallback(async (reordered: Project[]) => {
    setProjects(reordered);
    const updates = reordered.map((item, index) => ({
      id: item.id,
      display_order: index
    }));
    
    try {
      for (const update of updates) {
        await projectService.update(update.id, { display_order: update.display_order });
      }
      toast({ title: "Order saved", description: "Project order has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
      fetchProjects();
    }
  }, [toast]);

  const handleReorderConstructions = useCallback(async (reordered: ConstructionProject[]) => {
    setConstructions(reordered);
    const updates = reordered.map((item, index) => ({
      id: item.id,
      display_order: index
    }));
    
    try {
      for (const update of updates) {
        await constructionService.update(update.id, { display_order: update.display_order });
      }
      toast({ title: "Order saved", description: "Construction order has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
      fetchConstructions();
    }
  }, [toast]);

  const handleReorderRentals = useCallback(async (reordered: Rental[]) => {
    setRentals(reordered);
    const updates = reordered.map((item, index) => ({
      id: item.id,
      display_order: index
    }));
    
    try {
      await rentalService.updateOrder(updates);
      toast({ title: "Order saved", description: "Rental order has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
      fetchRentals();
    }
  }, [toast]);

  const handleReorderHospitality = useCallback(async (reordered: HospitalityProject[]) => {
    setHospitalityProjects(reordered);
    const updates = reordered.map((item, index) => ({
      id: item.id,
      display_order: index
    }));
    
    try {
      await hospitalityService.updateOrder(updates);
      toast({ title: "Order saved", description: "Hospitality order has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
      fetchHospitality();
    }
  }, [toast]);

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    
    try {
      if (deleteTarget.type === "project") {
        await projectService.deleteImage(deleteTarget.item.image_url);
        const { error } = await projectService.delete(deleteTarget.item.id);
        if (error) throw error;
        toast({ title: "Project deleted", description: "The project has been deleted successfully." });
        fetchProjects();
      } else if (deleteTarget.type === "construction") {
        if (deleteTarget.item.thumbnail_url) {
          await constructionService.deleteImage(deleteTarget.item.thumbnail_url);
        }
        const { error } = await constructionService.delete(deleteTarget.item.id);
        if (error) throw error;
        toast({ title: "Construction deleted", description: "The construction project has been deleted successfully." });
        fetchConstructions();
      } else if (deleteTarget.type === "rental") {
        if (deleteTarget.item.thumbnail_url) {
          await rentalService.deleteImage(deleteTarget.item.thumbnail_url);
        }
        const { error } = await rentalService.delete(deleteTarget.item.id);
        if (error) throw error;
        toast({ title: "Rental deleted", description: "The rental property has been deleted successfully." });
        fetchRentals();
      } else if (deleteTarget.type === "hospitality") {
        if (deleteTarget.item.thumbnail_url) {
          await hospitalityService.deleteImage(deleteTarget.item.thumbnail_url);
        }
        const { error } = await hospitalityService.delete(deleteTarget.item.id);
        if (error) throw error;
        toast({ title: "Hospitality deleted", description: "The hospitality project has been deleted successfully." });
        fetchHospitality();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
    
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleAddClick = () => {
    if (activeTab === "portfolio") {
      setEditingProject(null);
      setIsProjectFormOpen(true);
    } else if (activeTab === "construction") {
      setEditingConstruction(null);
      setIsConstructionFormOpen(true);
    } else if (activeTab === "rentals") {
      setEditingRental(null);
      setIsRentalFormOpen(true);
    } else if (activeTab === "hospitality") {
      setEditingHospitality(null);
      setIsHospitalityFormOpen(true);
    }
  };

  const refreshData = () => {
    if (activeTab === "portfolio") fetchProjects();
    else if (activeTab === "construction") fetchConstructions();
    else if (activeTab === "hospitality") fetchHospitality();
    else if (activeTab === "rentals") fetchRentals();
  };

  const isLoading = activeTab === "portfolio" ? isLoadingProjects : 
                    activeTab === "construction" ? isLoadingConstructions : 
                    activeTab === "rentals" ? isLoadingRentals :
                    activeTab === "hospitality" ? isLoadingHospitality : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              Admin Dashboard
            </h1>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="construction" className="flex items-center gap-2">
              <HardHat className="w-4 h-4" />
              <span className="hidden sm:inline">Construction</span>
            </TabsTrigger>
            <TabsTrigger value="rentals" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Rentals</span>
            </TabsTrigger>
            <TabsTrigger value="hospitality" className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              <span className="hidden sm:inline">Hospitality</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
          </TabsList>

          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-xl text-foreground capitalize">{activeTab}</h2>
              <span className="text-sm text-muted-foreground">
                {activeTab === "portfolio" && `${projects.length} projects`}
                {activeTab === "construction" && `${constructions.length} projects`}
                {activeTab === "rentals" && `${rentals.length} rentals`}
                {activeTab === "hospitality" && `${hospitalityProjects.length} projects`}
              </span>
              {activeTab !== "pages" && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                  Drag to reorder
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {activeTab !== "pages" && (
                <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {activeTab === "portfolio" ? "Project" : activeTab === "construction" ? "Construction" : activeTab === "rentals" ? "Rental" : "Hospitality"}
                </Button>
              )}
            </div>
          </div>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <EmptyState onAdd={handleAddClick} type="project" />
            ) : (
              <DraggableList
                items={projects}
                onReorder={handleReorderProjects}
                keyExtractor={(p) => p.id}
                droppableId="portfolio-list"
                renderItem={(project) => (
                  <ProjectCard
                    project={project}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => setDeleteTarget({ type: "project", item: project })}
                  />
                )}
              />
            )}
          </TabsContent>

          {/* Construction Tab */}
          <TabsContent value="construction">
            {isLoadingConstructions ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : constructions.length === 0 ? (
              <EmptyState onAdd={handleAddClick} type="construction" />
            ) : (
              <DraggableList
                items={constructions}
                onReorder={handleReorderConstructions}
                keyExtractor={(c) => c.id}
                droppableId="construction-list"
                renderItem={(construction) => (
                  <ConstructionCard
                    construction={construction}
                    onEdit={() => handleEditConstruction(construction)}
                    onDelete={() => setDeleteTarget({ type: "construction", item: construction })}
                  />
                )}
              />
            )}
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            {isLoadingRentals ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rentals.length === 0 ? (
              <EmptyState onAdd={handleAddClick} type="rental" />
            ) : (
              <DraggableList
                items={rentals}
                onReorder={handleReorderRentals}
                keyExtractor={(r) => r.id}
                droppableId="rentals-list"
                renderItem={(rental) => (
                  <RentalCard
                    rental={rental}
                    onEdit={() => handleEditRental(rental)}
                    onDelete={() => setDeleteTarget({ type: "rental", item: rental })}
                  />
                )}
              />
            )}
          </TabsContent>

          {/* Hospitality Tab */}
          <TabsContent value="hospitality">
            {isLoadingHospitality ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : hospitalityProjects.length === 0 ? (
              <EmptyState onAdd={handleAddClick} type="hospitality" />
            ) : (
              <DraggableList
                items={hospitalityProjects}
                onReorder={handleReorderHospitality}
                keyExtractor={(h) => h.id}
                droppableId="hospitality-list"
                renderItem={(hospitality) => (
                  <HospitalityCard
                    hospitality={hospitality}
                    onEdit={() => handleEditHospitality(hospitality)}
                    onDelete={() => setDeleteTarget({ type: "hospitality", item: hospitality })}
                  />
                )}
              />
            )}
          </TabsContent>

          {/* Pages Tab - Only Home, About, Contact */}
          <TabsContent value="pages">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  key: "home", 
                  title: "Home Page", 
                  description: "Edit hero section, testimonials, and trusted brands text."
                },
                { 
                  key: "about", 
                  title: "About Us", 
                  description: "Edit about us text content and images."
                },
                { 
                  key: "contact", 
                  title: "Contact", 
                  description: "Edit address, phone, email, and map coordinates."
                }
              ].map((page) => (
                <div
                  key={page.key}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-all cursor-pointer group"
                  onClick={() => {
                    toast({ title: "Coming soon", description: `Page editor for ${page.title} is under development.` });
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg">{page.title}</h3>
                    <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ProjectFormModal
        open={isProjectFormOpen}
        onOpenChange={handleProjectFormClose}
        project={editingProject}
        onSuccess={fetchProjects}
      />

      <ConstructionFormModal
        open={isConstructionFormOpen}
        onOpenChange={handleConstructionFormClose}
        construction={editingConstruction}
        onSuccess={fetchConstructions}
      />

      <RentalFormModal
        open={isRentalFormOpen}
        onOpenChange={handleRentalFormClose}
        rental={editingRental}
        locations={rentalLocations}
        onSuccess={fetchRentals}
      />

      <HospitalityFormModal
        open={isHospitalityFormOpen}
        onOpenChange={handleHospitalityFormClose}
        project={editingHospitality}
        onSuccess={fetchHospitality}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

// Reusable Components
function EmptyState({ onAdd, type }: { onAdd: () => void; type: string }) {
  return (
    <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-serif text-lg text-foreground mb-2">No {type}s yet</h3>
      <p className="text-muted-foreground mb-6">Get started by creating your first {type}.</p>
      <Button onClick={onAdd} className="bg-primary hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-2" />
        Add {type}
      </Button>
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {project.category && (
          <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
            {project.category}
          </span>
        )}
        {project.location && (
          <span className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-4">
          Created {format(new Date(project.created_at), "MMM d, yyyy")}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConstructionCard({ construction, onEdit, onDelete }: { construction: ConstructionProject; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {construction.thumbnail_url ? (
          <img
            src={construction.thumbnail_url}
            alt={construction.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HardHat className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
          {construction.status}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {construction.title}
        </h3>
        {construction.address && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {construction.address}
          </p>
        )}
        {construction.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {construction.description}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RentalCard({ rental, onEdit, onDelete }: { rental: Rental; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {rental.thumbnail_url ? (
          <img
            src={rental.thumbnail_url}
            alt={rental.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Key className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {rental.is_featured && (
          <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
            Featured
          </span>
        )}
        {rental.price && (
          <span className="absolute bottom-3 right-3 bg-background/90 text-foreground text-sm font-semibold px-2 py-1 rounded">
            {rental.price}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {rental.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {rental.bedrooms && <span>{rental.bedrooms} bed</span>}
          {rental.bathrooms && <span>{rental.bathrooms} bath</span>}
          {rental.area && <span>{rental.area}</span>}
        </div>
        {rental.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {rental.short_description}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function HospitalityCard({ hospitality, onEdit, onDelete }: { hospitality: HospitalityProject; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {hospitality.thumbnail_url ? (
          <img
            src={hospitality.thumbnail_url}
            alt={hospitality.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hotel className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {hospitality.location && (
          <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {hospitality.location}
          </span>
        )}
        {hospitality.price_info && (
          <span className="absolute bottom-3 right-3 bg-background/90 text-foreground text-sm font-semibold px-2 py-1 rounded">
            {hospitality.price_info}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {hospitality.title}
        </h3>
        {hospitality.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {hospitality.short_description}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}