export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SapiKatalog. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Katalog Sapi Berkualitas dengan Dokumentasi Lengkap
          </p>
        </div>
      </div>
    </footer>
  )
}
