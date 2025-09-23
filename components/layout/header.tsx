import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Github, Twitter, HelpCircle } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Poster2Web</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Badge variant="secondary" className="hidden md:inline-flex">
              v2.0 - Next.js Edition
            </Badge>
          </div>
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Help</span>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="sm">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
