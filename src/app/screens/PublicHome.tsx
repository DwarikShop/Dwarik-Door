"use client";

import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Download, Share2, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

// Public URL of the catalogue PDF (served from /public)
const CATALOGUE_URL = "/dwarik-catalogue-2024.pdf";
const CATALOGUE_FILENAME = "Dwarik-Door-Catalogue-2024.pdf";

export function PublicHome() {
  const router = useRouter();

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = CATALOGUE_URL;
    link.download = CATALOGUE_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading catalogue…");
  };

  // ── WhatsApp share handler ────────────────────────────────────────────────
  const handleWhatsApp = () => {
    // Build the full URL to the PDF so recipients can open it directly
    const pdfUrl = `${window.location.origin}${CATALOGUE_URL}`;
    const message = encodeURIComponent(
      `Check out the Dwarik Door 2024 Catalogue! 🚪✨\n\nPremium quality doors for homes and commercial spaces.\n\nView / Download: ${pdfUrl}`,
    );
    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const featuredDoors = [
    {
      title: "Premium Teak Collection",
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=800&fit=crop",
      description: "Luxury veneer doors with exceptional finish",
    },
    {
      title: "Designer Series",
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=800&fit=crop",
      description: "Contemporary designs for modern homes",
    },
    {
      title: "Carved Masterpieces",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop",
      description: "Handcrafted artistry in every detail",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">DWARIK DOOR</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/login")}
            className="flex items-center gap-2"
          >
            <LogIn size={18} />
            Login
          </Button>
        </div>
      </header>

      <main className="pb-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[400px] bg-gradient-to-br from-primary/90 to-primary overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
              alt="Premium door"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Crafting Excellence
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-md">
              Premium quality doors for homes and commercial spaces
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Download Catalogue
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWhatsApp}
                className="flex items-center gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Share2 size={20} />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </motion.section>

        <section className="px-6 py-12 max-w-lg mx-auto">
          <h3 className="text-2xl font-bold mb-6">Featured Collections</h3>
          <div className="space-y-6">
            {featuredDoors.map((door, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={door.image}
                    alt={door.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-xl font-semibold mb-2">{door.title}</h4>
                  <p className="text-muted-foreground">{door.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-6 py-12 bg-secondary/30">
          <div className="max-w-lg mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Join Our Network</h3>
            <p className="text-muted-foreground mb-6">
              Access our inventory management system and track your orders in
              real-time
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto"
            >
              Login to Dashboard
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-6 px-6 text-center">
        <p className="text-sm">
          © 2026 Dwarik Door. Premium Door Manufacturing.
        </p>
      </footer>
    </div>
  );
}
