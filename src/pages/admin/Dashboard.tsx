import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { projectService, Project } from "@/services/projectService";
import { constructionService, ConstructionProject } from "@/services/constructionService";
import { rentalService, Rental, RentalLocation } from "@/services/rentalService";
import { ProjectFormModal } from "@/components/admin/ProjectFormModal";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
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
  MapPin
} from "lucide-react";
import { format } from "date-fns";

type ContentType = "portfolio" | "construction" | "rentals" | "pages";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ContentType>("portfolio");
  
  // Portfolio state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  
  // Construction state
  const [constructions, setConstructions] = useState<ConstructionProject[]>([]);
  const [isLoadingConstructions, setIsLoadingConstructions] = useState(true);
  
  // Rentals state
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalLocations, setRentalLocations] = useState<RentalLocation[]>([]);
  const [isLoadingRentals, setIsLoadingRentals] = useState(true);
  
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

  useEffect(() => {
    fetchProjects();
    fetchConstructions();
    fetchRentals();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    
    setIsDeleting(true);
    await projectService.deleteImage(deletingProject.image_url);
    const { error } = await projectService.delete(deletingProject.id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    } else {
      toast({ title: "Project deleted", description: "The project has been deleted successfully." });
      fetchProjects();
    }
    
    setIsDeleting(false);
    setDeletingProject(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProject(null);
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
                {activeTab === "rentals" && `${rentals.length} rentals, ${rentalLocations.length} locations`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {activeTab !== "pages" && (
                <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {activeTab === "portfolio" ? "Project" : activeTab === "construction" ? "Construction" : "Rental"}
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
              <EmptyState onAdd={() => setIsFormOpen(true)} type="project" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => setDeletingProject(project)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Construction Tab */}
          <TabsContent value="construction">
            {isLoadingConstructions ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : constructions.length === 0 ? (
              <EmptyState onAdd={() => setIsFormOpen(true)} type="construction" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {constructions.map((construction) => (
                  <ConstructionCard
                    key={construction.id}
                    construction={construction}
                    onEdit={() => {/* TODO: implement */}}
                    onDelete={() => {/* TODO: implement */}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            {isLoadingRentals ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rentals.length === 0 && rentalLocations.length === 0 ? (
              <EmptyState onAdd={() => setIsFormOpen(true)} type="rental" />
            ) : (
              <div className="space-y-8">
                {/* Locations */}
                <div>
                  <h3 className="font-serif text-lg mb-4">Locations ({rentalLocations.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rentalLocations.map((location) => (
                      <div key={location.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-elevated transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                        {location.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {/* TODO: add location */}}
                      className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Location
                    </button>
                  </div>
                </div>

                {/* Rentals */}
                <div>
                  <h3 className="font-serif text-lg mb-4">Rental Properties ({rentals.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rentals.map((rental) => (
                      <RentalCard
                        key={rental.id}
                        rental={rental}
                        onEdit={() => {/* TODO: implement */}}
                        onDelete={() => {/* TODO: implement */}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["home", "portfolio", "construction", "rentals", "hospitality", "about", "contact"].map((page) => (
                <div
                  key={page}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-all cursor-pointer group"
                  onClick={() => {/* TODO: open page editor */}}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg capitalize">{page}</h3>
                    <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Edit content blocks, images, and text for the {page} page.
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ProjectFormModal
        open={isFormOpen}
        onOpenChange={handleFormClose}
        project={editingProject}
        onSuccess={fetchProjects}
      />

      <DeleteConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        onConfirm={handleDeleteProject}
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
      <Button onClick={onAdd} className="bg-primary hover:bg-primary-hover">
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
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
            {project.category}
          </span>
        )}
        {project.location && (
          <span className="absolute top-3 right-3 bg-background/90 text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
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
        <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
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
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
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