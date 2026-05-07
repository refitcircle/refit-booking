# Re:Fit — Application de réservation

> Stack : Next.js 14 · Supabase · Tailwind CSS · Resend · Vercel

---

## 1. Pré-requis

- Node.js 18+
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Resend](https://resend.com) (gratuit jusqu'à 3 000 emails/mois)
- Compte [Vercel](https://vercel.com) (gratuit)

---

## 2. Installation locale

```bash
git clone <ton-repo>
cd refit
npm install
cp .env.local.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

---

## 3. Base de données Supabase

### 3.1 Créer le projet
- Aller sur [supabase.com](https://supabase.com) → New project
- Noter l'URL du projet et les clés API (Settings → API)

### 3.2 Appliquer le schéma
Dans l'éditeur SQL de Supabase :
1. Coller et exécuter `supabase/schema.sql`
2. Coller et exécuter `supabase/seed.sql`

### 3.3 Remplir `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 4. Emails avec Resend

### 4.1 Créer un compte Resend
- Aller sur [resend.com](https://resend.com) → créer un compte
- Créer une API key → copier dans `.env.local`

### 4.2 Domaine d'envoi
- Dans Resend → Domains → ajouter `refit.be`
- Ajouter les enregistrements DNS demandés chez ton hébergeur

> ⚠️ En développement, Resend accepte d'envoyer depuis `onboarding@resend.dev` sans domaine vérifié. Pratique pour tester.

---

## 5. Variables d'environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de ton projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (server-side uniquement) |
| `RESEND_API_KEY` | Clé API Resend |
| `COACH_PASSWORD` | Mot de passe espace coach |
| `COACH_EMAIL` | Email de Nicolas pour notifications |
| `PAYMENT_BENEFICIARY` | Nom du bénéficiaire virement |
| `PAYMENT_IBAN` | IBAN |
| `PAYMENT_PAYCONIQ` | Lien Payconiq |
| `NEXT_PUBLIC_BASE_URL` | URL de production (ex: https://refit.be) |

---

## 6. Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (répéter pour chaque variable)
```

Ou directement via l'interface Vercel :
- Import du repo GitHub
- Project Settings → Environment Variables → ajouter chaque variable

---

## 7. Logo

Déposer le fichier `Logo_rond.png` dans `/public/`.

Dans `src/components/Header.tsx`, remplacer le placeholder `RF` par :
```tsx
<img src="/Logo_rond.png" alt="Re:Fit" className="w-9 h-9 rounded-full" />
```

---

## 8. Structure des fichiers

```
src/
├── app/
│   ├── page.tsx                    # Page principale (cours + SGT)
│   ├── layout.tsx
│   ├── globals.css
│   ├── coach/
│   │   └── page.tsx                # Espace coach (dashboard complet)
│   ├── cancel/
│   │   └── [token]/
│   │       ├── page.tsx            # Page annulation (server)
│   │       └── CancelClient.tsx    # Logique annulation (client)
│   └── api/
│       ├── bookings/
│       │   ├── route.ts            # POST — créer une réservation / liste d'attente
│       │   └── [id]/cancel/
│       │       └── route.ts        # PATCH — annuler une réservation
│       ├── sessions/
│       │   └── route.ts            # GET/POST/DELETE — gestion séances
│       ├── sgt/
│       │   └── interest/
│       │       └── route.ts        # POST — intérêt SGT
│       ├── courses/
│       │   └── interest/
│       │       └── route.ts        # POST — inscription avant-première
│       └── coach/
│           ├── courses/route.ts    # GET/PATCH — gestion cours (coach)
│           ├── sessions/route.ts   # GET — sessions + bookings (coach)
│           ├── sgt/route.ts        # GET/POST — créneaux SGT (coach)
│           └── interests/route.ts  # GET — inscriptions avant-première (coach)
├── components/
│   ├── Header.tsx
│   ├── CourseCard.tsx              # Carte cours avec barre de remplissage
│   ├── BookingModal.tsx            # Modal de réservation complète
│   ├── WaitlistModal.tsx           # Modal liste d'attente
│   ├── ComingSoonCard.tsx          # Carte Build & Play Padel
│   └── SgtSection.tsx             # Section SGT
└── lib/
    ├── supabase.ts                 # Clients Supabase (public + admin)
    ├── types.ts                    # Types TypeScript + helpers
    └── emails.ts                   # Templates emails Resend
supabase/
├── schema.sql                      # Schéma + RLS
└── seed.sql                        # Données initiales
```

---

## 9. Accès espace coach

URL : `/coach`
Mot de passe : valeur de `COACH_PASSWORD` dans les variables d'environnement.

Fonctionnalités :
- **Vue d'ensemble** — stats, gestion des cours (actif/coming soon), liste des inscrits par séance
- **Séances** — ajouter/annuler des dates
- **SGT** — ajouter des créneaux, voir les intéressés avec leur niveau
- **Avant-première** — liste des inscrits Build & Play Padel

---

## 10. Personnalisation

### Changer les couleurs
Dans `src/app/globals.css` → modifier les variables CSS `:root`.

### Ajouter un cours
1. Dans Supabase → Table Editor → `courses` → Insert row
2. Ajouter les prix dans `prices`
3. Ajouter des sessions dans `sessions` ou via l'espace coach

### Changer la politique d'annulation
Dans `src/app/api/bookings/[id]/cancel/route.ts` → modifier `diffHours < 24`.
