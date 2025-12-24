import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { projectService, Project } from "@/services/projectService";
import { constructionService, ConstructionProject } from "@/services/constructionService";
import { rentalService, Rental, RentalLocation } from "@/services/rentalService";
import { ProjectFormModal } from "@/components/admin/ProjectFormModal";
import { ConstructionFormModal } from "@/components/admin/ConstructionFormModal";
import { RentalFormModal } from "@/components/admin/RentalFormModal";
import { LocationFormModal } from "@/components/admin/LocationFormModal";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { DraggableList } from "@/components/admin/DraggableList";
import { ViewDetailModal } from "@/components/admin/ViewDetailModal";
import { HomePageEditor } from "@/components/admin/HomePageEditor";
import { PageContentEditor } from "@/components/admin/PageContentEditor";
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
  Eye,
  BookOpen,
  Info
} from "lucide-react";
import { format } from "date-fns";

type ContentType = "portfolio" | "construction" | "rentals" | "pages";
type DeleteTarget = { type: "project"; item: Project } | { type: "construction"; item: ConstructionProject } | { type: "rental"; item: Rental } | { type: "location"; item: RentalLocation };
type ViewTarget = { type: "project"; item: Project } | { type: "construction"; item: ConstructionProject } | { type: "rental"; item: Rental };
type RentalsSubTab = "properties" | "locations";

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
  const [rentalsSubTab, setRentalsSubTab] = useState<RentalsSubTab>("properties");
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<RentalLocation | null>(null);
  
  
  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View detail state
  const [viewTarget, setViewTarget] = useState<ViewTarget | null>(null);
  
  // Home page editor state
  const [isHomeEditorOpen, setIsHomeEditorOpen] = useState(false);
  
  // Page content editors state
  const [isAboutEditorOpen, setIsAboutEditorOpen] = useState(false);
  const [isBrandStoryEditorOpen, setIsBrandStoryEditorOpen] = useState(false);
  
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


  useEffect(() => {
    fetchProjects();
    fetchConstructions();
    fetchRentals();
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

  // Location handlers
  const handleEditLocation = (location: RentalLocation) => {
    setEditingLocation(location);
    setIsLocationFormOpen(true);
  };

  const handleLocationFormClose = () => {
    setIsLocationFormOpen(false);
    setEditingLocation(null);
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
      } else if (deleteTarget.type === "location") {
        if (deleteTarget.item.image_url) {
          await rentalService.deleteImage(deleteTarget.item.image_url);
        }
        const { error } = await rentalService.deleteLocation(deleteTarget.item.id);
        if (error) throw error;
        toast({ title: "Location deleted", description: "The rental location has been deleted successfully." });
        fetchRentals();
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
      if (rentalsSubTab === "properties") {
        setEditingRental(null);
        setIsRentalFormOpen(true);
      } else {
        setEditingLocation(null);
        setIsLocationFormOpen(true);
      }
    }
  };

  const refreshData = () => {
    if (activeTab === "portfolio") fetchProjects();
    else if (activeTab === "construction") fetchConstructions();
    else if (activeTab === "rentals") fetchRentals();
  };

  const isLoading = activeTab === "portfolio" ? isLoadingProjects : 
                    activeTab === "construction" ? isLoadingConstructions : 
                    activeTab === "rentals" ? isLoadingRentals : false;

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
          <TabsList className="grid w-full grid-cols-4 mb-8">
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
                {activeTab === "rentals" && rentalsSubTab === "properties" && `${rentals.length} rentals`}
                {activeTab === "rentals" && rentalsSubTab === "locations" && `${rentalLocations.length} locations`}
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
                  Add {activeTab === "portfolio" ? "Project" : activeTab === "construction" ? "Construction" : activeTab === "rentals" ? (rentalsSubTab === "properties" ? "Rental" : "Location") : ""}
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
                    onView={() => setViewTarget({ type: "project", item: project })}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => setDeleteTarget({ type: "project", item: project })}
                    onToggleFeatured={async () => {
                      const currentFeatured = project.is_featured;
                      await projectService.update(project.id, { is_featured: !currentFeatured });
                      fetchProjects();
                      toast({ title: currentFeatured ? "Removed from featured" : "Added to featured" });
                    }}
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
                    onView={() => setViewTarget({ type: "construction", item: construction })}
                    onEdit={() => handleEditConstruction(construction)}
                    onDelete={() => setDeleteTarget({ type: "construction", item: construction })}
                  />
                )}
              />
            )}
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            {/* Rentals Sub-tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={rentalsSubTab === "properties" ? "default" : "outline"}
                size="sm"
                onClick={() => setRentalsSubTab("properties")}
              >
                <Key className="w-4 h-4 mr-2" />
                Properties
              </Button>
              <Button
                variant={rentalsSubTab === "locations" ? "default" : "outline"}
                size="sm"
                onClick={() => setRentalsSubTab("locations")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Locations
              </Button>
            </div>

            {rentalsSubTab === "properties" ? (
              // Properties list
              isLoadingRentals ? (
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
                      onView={() => setViewTarget({ type: "rental", item: rental })}
                      onEdit={() => handleEditRental(rental)}
                      onDelete={() => setDeleteTarget({ type: "rental", item: rental })}
                    />
                  )}
                />
              )
            ) : (
              // Locations list
              isLoadingRentals ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : rentalLocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <MapPin className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2">No Locations</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Add locations to group your rental properties by area.
                  </p>
                  <Button onClick={handleAddClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rentalLocations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      rentalCount={rentals.filter(r => r.location_id === location.id).length}
                      onEdit={() => handleEditLocation(location)}
                      onDelete={() => setDeleteTarget({ type: "location", item: location })}
                    />
                  ))}
                </div>
              )
            )}
          </TabsContent>


          {/* Pages Tab */}
          <TabsContent value="pages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => setIsHomeEditorOpen(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg">Home Page</h3>
                  </div>
                  <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Edit hero video, testimonials and trusted brands.
                </p>
              </div>
              
              <div
                className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => setIsAboutEditorOpen(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="font-serif text-lg">About Us</h3>
                  </div>
                  <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Edit about us content sections.
                </p>
              </div>
              
              <div
                className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => setIsBrandStoryEditorOpen(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="font-serif text-lg">Our Brand Story</h3>
                  </div>
                  <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Edit brand story content sections.
                </p>
              </div>
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

      <LocationFormModal
        open={isLocationFormOpen}
        onOpenChange={handleLocationFormClose}
        location={editingLocation}
        onSuccess={fetchRentals}
      />

      <HomePageEditor
        open={isHomeEditorOpen}
        onOpenChange={setIsHomeEditorOpen}
      />

      <PageContentEditor
        open={isAboutEditorOpen}
        onOpenChange={setIsAboutEditorOpen}
        pageKey="about-us"
        pageTitle="About Us"
      />

      <PageContentEditor
        open={isBrandStoryEditorOpen}
        onOpenChange={setIsBrandStoryEditorOpen}
        pageKey="brand-story"
        pageTitle="Our Brand Story"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      {/* View Detail Modal */}
      {viewTarget && (
        <ViewDetailModal
          open={!!viewTarget}
          onOpenChange={(open) => !open && setViewTarget(null)}
          item={viewTarget.item as unknown as Record<string, unknown>}
          type={viewTarget.type}
          onSave={async (updates) => {
            if (viewTarget.type === "project") {
              await projectService.update(viewTarget.item.id, updates);
              fetchProjects();
            } else if (viewTarget.type === "construction") {
              await constructionService.update(viewTarget.item.id, updates);
              fetchConstructions();
            } else if (viewTarget.type === "rental") {
              await rentalService.update(viewTarget.item.id, updates);
              fetchRentals();
            }
            toast({ title: "Saved", description: "Changes saved successfully." });
          }}
          onUploadImage={async (file: File) => {
            if (viewTarget.type === "project") {
              const { url } = await projectService.uploadImage(file);
              return url;
            } else if (viewTarget.type === "construction") {
              const { url } = await constructionService.uploadImage(file);
              return url;
            } else if (viewTarget.type === "rental") {
              const { url } = await rentalService.uploadImage(file);
              return url;
            }
            return null;
          }}
          fields={
            viewTarget.type === "project" ? [
              { key: "title", label: "Title", type: "text" },
              { key: "category", label: "Category", type: "text" },
              { key: "location", label: "Location", type: "text" },
              { key: "content_heading", label: "Content Heading", type: "text" },
              { key: "long_description", label: "Full Description", type: "textarea" },
              { key: "visit_url", label: "Visit Link", type: "url" },
            ] : viewTarget.type === "construction" ? [
              { key: "title", label: "Title", type: "text" },
              { key: "status", label: "Status", type: "text" },
              { key: "address", label: "Address", type: "text" },
              { key: "content_heading", label: "Content Heading", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "visit_url", label: "Visit Link", type: "url" },
            ] : [
              { key: "title", label: "Title", type: "text" },
              { key: "address", label: "Address", type: "text" },
              { key: "price", label: "Price", type: "text" },
              { key: "bedrooms", label: "Bedrooms", type: "number" },
              { key: "bathrooms", label: "Bathrooms", type: "number" },
              { key: "area", label: "Area", type: "text" },
              { key: "content_heading", label: "Content Heading", type: "text" },
              { key: "long_description", label: "Full Description", type: "textarea" },
              { key: "visit_url", label: "Visit Link", type: "url" },
            ]
          }
        />
      )}
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

function ProjectCard({ project, onView, onEdit, onDelete, onToggleFeatured }: { project: Project; onView: () => void; onEdit: () => void; onDelete: () => void; onToggleFeatured?: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div 
        className="aspect-video bg-muted relative overflow-hidden cursor-pointer"
        onClick={onView}
      >
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {project.category && (
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
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
        <p className="text-xs text-muted-foreground mb-4">
          Created {format(new Date(project.created_at), "MMM d, yyyy")}
        </p>
        <div className="flex gap-2 flex-wrap">
          {onToggleFeatured && (
            <Button 
              variant={(project as Project & { is_featured?: boolean }).is_featured ? "default" : "outline"} 
              size="sm" 
              onClick={onToggleFeatured}
              className={(project as Project & { is_featured?: boolean }).is_featured ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {(project as Project & { is_featured?: boolean }).is_featured ? "★ Featured" : "☆ Feature"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
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

function ConstructionCard({ construction, onView, onEdit, onDelete }: { construction: ConstructionProject; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div 
        className="aspect-video bg-muted relative overflow-hidden cursor-pointer"
        onClick={onView}
      >
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
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
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

function RentalCard({ rental, onView, onEdit, onDelete }: { rental: Rental; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all group">
      <div 
        className="aspect-video bg-muted relative overflow-hidden cursor-pointer"
        onClick={onView}
      >
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
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
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

function LocationCard({ location, rentalCount, onEdit, onDelete }: { location: RentalLocation; rentalCount: number; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">{location.name}</h3>
            <span className="text-sm text-muted-foreground">{rentalCount} properties</span>
          </div>
        </div>
      </div>
      {location.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{location.description}</p>
      )}
      {location.content_sections && location.content_sections.length > 0 && (
        <p className="text-xs text-primary mb-4">{location.content_sections.length} content section(s)</p>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1" />
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
  );
}