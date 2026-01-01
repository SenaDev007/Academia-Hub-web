/**
 * Public Layout
 * 
 * Layout pour les pages publiques (landing, pricing, etc.)
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer pour le header fixe */}
      <div className="h-20" />
      {children}
    </div>
  );
}

