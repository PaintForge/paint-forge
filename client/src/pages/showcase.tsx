import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Palette, Loader2, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { SiX, SiReddit } from "react-icons/si";
import { useToast } from "../hooks/use-toast";

interface ShowcasePaint {
  id: number;
  partName: string;
  technique?: string;
  usageNotes?: string;
  paint: {
    id: number;
    name: string;
    brand: string;
    color: string;
    type: string;
  };
}

interface ShowcaseProject {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  paints?: ShowcasePaint[];
}

function setMetaTag(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Showcase() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: project, isLoading, error } = useQuery<ShowcaseProject>({
    queryKey: ["/api/showcase", id],
    queryFn: async () => {
      const res = await fetch(`/api/showcase/${id}`);
      if (!res.ok) throw new Error("Showcase not found");
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (!project) return;
    const url = window.location.href;
    const paintCount = project.paints?.length || 0;
    const desc = project.description
      ? `${project.description} — ${paintCount} paint${paintCount !== 1 ? "s" : ""} used.`
      : `${paintCount} paint${paintCount !== 1 ? "s" : ""} used. Painted miniature showcase on PaintForge.`;

    document.title = `${project.name} — PaintForge`;
    setMetaTag("og:title", `${project.name} — PaintForge`);
    setMetaTag("og:description", desc);
    setMetaTag("og:url", url);
    setMetaTag("og:type", "article");
    setMetaTag("og:site_name", "PaintForge");
    if (project.imageUrl) {
      setMetaTag("og:image", project.imageUrl);
      setMetaTag("og:image:width", "1200");
      setMetaTag("og:image:height", "630");
    }
    setMetaTag("twitter:card", project.imageUrl ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", `${project.name} — PaintForge`);
    setMetaTag("twitter:description", desc);
    if (project.imageUrl) setMetaTag("twitter:image", project.imageUrl);

    return () => {
      document.title = "PaintForge";
    };
  }, [project]);

  const shareUrl = `${window.location.origin}/showcase/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Paste it anywhere — Discord, BGG, messages." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleShareTwitter = () => {
    if (!project) return;
    const paintCount = project.paints?.length || 0;
    const text = `Check out my painted miniature: ${project.name}${project.description ? ` — ${project.description}` : ""}. ${paintCount} paint${paintCount !== 1 ? "s" : ""} used. Tracked with PaintForge`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareReddit = () => {
    if (!project) return;
    const title = `${project.name}${project.description ? ` — ${project.description}` : ""} [Miniature Painting]`;
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-16 h-16 text-orange-500/50" />
        <h1 className="text-2xl font-bold text-white">Showcase Not Found</h1>
        <p className="text-gray-400 text-center">This showcase link may be invalid or the project has been deleted.</p>
        <Link href="/">
          <Button className="bg-orange-500 hover:bg-orange-600 text-black">Go to PaintForge</Button>
        </Link>
      </div>
    );
  }

  const groupedPaints = project.paints?.reduce<Record<string, ShowcasePaint[]>>((acc, p) => {
    const key = p.partName || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {}) ?? {};

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header branding */}
        <div className="flex items-center gap-2 mb-8">
          <Palette className="w-5 h-5 text-orange-500" />
          <Link href="/">
            <span className="text-orange-500 font-bold tracking-wide text-sm uppercase hover:text-orange-400 cursor-pointer">
              PaintForge
            </span>
          </Link>
        </div>

        {/* Project image */}
        {project.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-6 border border-orange-500/20">
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Project title & description */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-gray-300 text-base leading-relaxed">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="outline" className="capitalize border-orange-500/30 text-orange-400">
              {project.status}
            </Badge>
            <span className="text-gray-500 text-sm">
              {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            size="sm"
            variant="outline"
            className="border-orange-500/30 hover:bg-orange-500/10 gap-2"
            onClick={handleCopyLink}
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 hover:bg-white/10 gap-2"
            onClick={handleShareTwitter}
          >
            <SiX className="w-3.5 h-3.5" />
            Share on X
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-600/40 hover:bg-orange-900/20 gap-2 text-orange-400"
            onClick={handleShareReddit}
          >
            <SiReddit className="w-4 h-4" />
            Share on Reddit
          </Button>
          <p className="w-full text-xs text-gray-500 mt-1">
            Tip: Copy the link and paste it into Discord, BGG, or any forum — the image preview will appear automatically.
          </p>
        </div>

        {/* Paints used */}
        {project.paints && project.paints.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Paints Used ({project.paints.length})
            </h2>
            <div className="space-y-6">
              {Object.entries(groupedPaints).map(([partName, paints]) => (
                <div key={partName}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-white/10 pb-1">
                    {partName}
                  </h3>
                  <div className="space-y-2">
                    {paints.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/10"
                      >
                        <div
                          className="w-8 h-8 rounded-md border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: item.paint.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.paint.name}</p>
                          <p className="text-xs text-gray-400">{item.paint.brand} · {item.paint.type}</p>
                          {item.technique && (
                            <p className="text-xs text-orange-400 mt-0.5">{item.technique}</p>
                          )}
                          {item.usageNotes && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">{item.usageNotes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.paints?.length === 0 && (
          <p className="text-gray-500 text-sm mb-10">No paints recorded for this project.</p>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-orange-500/20 bg-black/40 p-6 text-center">
          <Palette className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Track your own paint collection</h3>
          <p className="text-gray-400 text-sm mb-4">
            PaintForge helps miniature painters manage their paint inventory, track projects, and share their work.
          </p>
          <Link href="/register">
            <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">
              Get started for free
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
