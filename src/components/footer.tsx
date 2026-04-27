import { Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-10">
        <div className="text-muted-foreground text-sm">
          Open source. No size caps. No watermarks.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Manan-Santoki/Binderly"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="size-5" />
          </a>
          <span className="text-muted-foreground text-sm">
            © {currentYear} Binderly
          </span>
        </div>
      </div>
    </footer>
  );
}
