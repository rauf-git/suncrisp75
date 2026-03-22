import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";
import { Property } from "@/types";
import { projectService } from "@/services/projectService";
import { constructionService } from "@/services/constructionService";
import { rentalService } from "@/services/rentalService";
import { hospitalityService } from "@/services/hospitalityService";
import Navbar from "@/components/suncrisp/Navbar";
import PropertyDetail from "@/components/suncrisp/PropertyDetail";
import FloatingCTA from "@/components/suncrisp/FloatingCTA";
import Footer from "@/components/suncrisp/Footer";
import NotFound from "./NotFound";

const safeContentSections = (data: unknown): { heading: string; content: string; image?: string }[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (section): section is { heading: string; content: string; image?: string } =>
      typeof section === "object" && section !== null,
  );
};

interface ItemDetailPageProps {
  section: string;
}

const ItemDetailPage = ({ section }: ItemDetailPageProps) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      try {
        let items: Property[] = [];

        if (section === "portfolio") {
          const { data } = await projectService.getAll();
          items = (data || []).map((p) => ({
            id: p.id,
            title: p.title,
            type: p.category || "Project",
            location: p.location || "",
            price: p.short_description || "",
            image: p.image_url,
            description: p.short_description || p.description || "",
            detailedDescription: p.long_description || p.description || "",
            features: [],
            gallery: p.images || [],
            is_featured: p.is_featured ?? false,
            content_sections: safeContentSections(p.content_sections),
          }));
        } else if (section === "construction") {
          const { data } = await constructionService.getAll();
          items = (data || []).map((c) => ({
            id: c.id,
            title: c.title,
            type: c.status || "Construction",
            location: c.address || "",
            price: c.status || "",
            image: c.thumbnail_url || "",
            description: c.description || "",
            detailedDescription: c.description || "",
            features: [c.status || "Under Construction"],
            gallery: c.images || [],
            content_sections: safeContentSections(c.content_sections),
          }));
        } else if (section === "rentals") {
          const { data } = await rentalService.getAll();
          items = (data || []).map((r) => ({
            id: r.id,
            title: r.title,
            type: "Rental",
            location: r.address || "",
            price: r.price || "",
            image: r.thumbnail_url || "",
            description: r.short_description || "",
            detailedDescription: r.long_description || r.short_description || "",
            features: [
              r.bedrooms ? `${r.bedrooms} Beds` : "",
              r.bathrooms ? `${r.bathrooms} Baths` : "",
              r.area || "",
              ...(r.amenities || []),
            ].filter(Boolean),
            gallery: r.images || [],
            content_sections: safeContentSections(r.content_sections),
          }));
        } else if (section === "hospitality") {
          const { data } = await hospitalityService.getAll();
          items = (data || []).map((h) => ({
            id: h.id,
            title: h.title,
            type: "Hospitality",
            location: h.location || "",
            price: h.price_info || "",
            image: h.thumbnail_url || "",
            description: h.short_description || h.description || "",
            detailedDescription: h.long_description || h.description || "",
            features: [],
            gallery: h.images || [],
            content_sections: safeContentSections((h as any).content_sections),
          }));
        }

        const found = items.find((i) => slugify(i.title) === slug);
        if (found) {
          setItem(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("[ItemDetailPage] Error fetching:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug, section]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (notFound || !item) {
    return <NotFound />;
  }

  const sectionForDetail =
    section === "portfolio" || section === "hospitality" ? section : section;

  return (
    <div className="min-h-screen">
      <Navbar currentPage={section} />
      <main>
        <PropertyDetail
          item={item}
          section={sectionForDetail}
          onBack={() => navigate(`/${section}`)}
        />
      </main>
      <FloatingCTA isVisible={true} />
      <Footer />
    </div>
  );
};

export default ItemDetailPage;
