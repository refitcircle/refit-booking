export default function PaiementSucces() {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="font-title font-bold text-navy text-2xl mb-3">
            Paiement confirmé !
          </h1>
          <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
            Ta réservation est bien enregistrée.
          </p>
          <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">
            Pour annuler ou modifier, envoie un message WhatsApp à Nicolas : <a href="https://wa.me/32477732371" className="text-gold underline">+32 477 73 23 71</a><br/>
            <span className="text-xs text-gray-400">Annulation gratuite jusqu'à 24h avant la séance. Pas d'appel, message uniquement.</span>
          </p>
          <a href="/" className="btn-primary">
            Retour au site
          </a>
        </div>
      </main>
    );
  }
