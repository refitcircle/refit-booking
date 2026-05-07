export default function PaiementSucces() {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="font-title font-bold text-navy text-2xl mb-3">
            Paiement confirmé !
          </h1>
          <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">
            Ta réservation est confirmée. Tu vas recevoir un email de confirmation dans quelques instants.
          </p>
          <a href="/" className="btn-primary">
            Retour au site
          </a>
        </div>
      </main>
    );
  }