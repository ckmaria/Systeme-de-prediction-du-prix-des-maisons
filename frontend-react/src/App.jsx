import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calculator,
  Camera,
  CheckCircle2,
  History,
  Home,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from './api';

const initialForm = {
  surface: 120,
  chambres: 3,
  localisation: 'Casablanca',
  type_bien: 'Appartement',
  etat: 'Bon',
  facades: 2,
  etage: 3,
  ascenseur: true,
};

const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fes', 'Agadir', 'Autre'];
const propertyTypes = ['Appartement', 'Maison', 'Villa', 'Studio'];
const states = [
  { value: 'Neuf', label: 'Neuf' },
  { value: 'Bon', label: 'Bon' },
  { value: 'A renover', label: 'A rénover' },
];

const photoCards = [
  {
    title: 'Appartement moderne',
    place: 'Casablanca',
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Villa familiale',
    place: 'Marrakech',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Salon lumineux',
    place: 'Rabat',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
];

const blogPosts = [
  {
    category: 'Conseil achat',
    title: 'Comment bien estimer un bien avant la visite',
    excerpt:
      'Comparez la surface, la localisation, l etat du bien et les equipements avant de negocier.',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Investissement',
    title: 'Les criteres qui augmentent la valeur',
    excerpt:
      'Ascenseur, facades, etage, quartier et qualite de finition peuvent changer fortement le prix.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Marche immobilier',
    title: 'Pourquoi la localisation reste essentielle',
    excerpt:
      'Deux biens avec la meme surface peuvent avoir des prix tres differents selon la ville et le quartier.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  },
];

const moneyFormatter = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  maximumFractionDigits: 0,
});

function App() {
  const [form, setForm] = useState(initialForm);
  const [price, setPrice] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const canSubmit = useMemo(() => Number(form.surface) > 0 && Number(form.chambres) >= 0, [form]);

  useEffect(() => {
    loadHistory();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const payload = () => ({
    ...form,
    surface: Number(form.surface),
    chambres: Number(form.chambres),
    facades: Number(form.facades),
    etage: Number(form.etage || 0),
    ascenseur: Boolean(form.ascenseur),
  });

  const loadHistory = async () => {
    try {
      const response = await api.get('/predictions');
      setHistory(response.data.data || []);
    } catch {
      setHistory([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setPrice(null);

    try {
      const response = await api.post('/predict', payload());
      setPrice(response.data.prix_estime);
      setMessage(response.data.message);
      await loadHistory();
    } catch (requestError) {
      const apiMessage = requestError.response?.data?.message;
      const firstValidationError = requestError.response?.data?.errors
        ? Object.values(requestError.response.data.errors).flat()[0]
        : null;

      setError(firstValidationError || apiMessage || 'Impossible de calculer le prix pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="intro">
        <div>
          <p className="eyebrow">
            <Sparkles size={16} />
            Système de prédiction immobilière
          </p>
          <h1>Estimer le prix d'une maison</h1>
        </div>
        <div className="intro-stat">
          <Building2 size={22} />
          <span>{history.length}</span>
          <small>prédictions récentes</small>
        </div>
      </section>

      <section className="photo-story" aria-label="Galerie immobiliere">
        <div className="section-heading">
          <p className="eyebrow">
            <Camera size={16} />
            Inspirations immobilier
          </p>
          <h2>Des biens qui donnent envie de comparer</h2>
        </div>

        <div className="photo-grid">
          {photoCards.map((card) => (
            <article className="photo-card" key={card.title}>
              <img src={card.image} alt={card.title} loading="lazy" />
              <div className="photo-caption">
                <strong>{card.title}</strong>
                <span>
                  <MapPin size={15} />
                  {card.place}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="panel-title">
            <Home size={22} />
            <h2>Informations du bien</h2>
          </div>

          <div className="grid">
            <label>
              Surface (m²)
              <input
                type="number"
                min="10"
                value={form.surface}
                onChange={(event) => updateField('surface', event.target.value)}
                required
              />
            </label>

            <label>
              Nombre de chambres
              <input
                type="number"
                min="0"
                value={form.chambres}
                onChange={(event) => updateField('chambres', event.target.value)}
                required
              />
            </label>

            <label>
              Localisation
              <select
                value={form.localisation}
                onChange={(event) => updateField('localisation', event.target.value)}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type de bien
              <select
                value={form.type_bien}
                onChange={(event) => updateField('type_bien', event.target.value)}
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              État du bien
              <select value={form.etat} onChange={(event) => updateField('etat', event.target.value)}>
                {states.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Nombre de façades
              <input
                type="number"
                min="0"
                max="4"
                value={form.facades}
                onChange={(event) => updateField('facades', event.target.value)}
                required
              />
            </label>

            <label>
              Étage
              <input
                type="number"
                min="0"
                value={form.etage}
                onChange={(event) => updateField('etage', event.target.value)}
                required
              />
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={form.ascenseur}
                onChange={(event) => updateField('ascenseur', event.target.checked)}
              />
              <span>Ascenseur disponible</span>
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={!canSubmit || loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <Calculator size={18} />}
            Calculer l'estimation
          </button>

          {error && (
            <div className="alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {price !== null && (
            <div className="result">
              <CheckCircle2 size={22} />
              <div>
                <span>{message}</span>
                <strong>{moneyFormatter.format(price)}</strong>
              </div>
            </div>
          )}
        </form>

        <aside className="history-panel">
          <div className="panel-title">
            <History size={22} />
            <h2>Dernières prédictions</h2>
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <p className="empty-state">Aucune prédiction enregistrée.</p>
            ) : (
              history.map((item) => (
                <article className="history-item" key={item.id}>
                  <div>
                    <strong>{moneyFormatter.format(item.prix_estime)}</strong>
                    <span>
                      {item.type_bien} à {item.localisation}
                    </span>
                  </div>
                  <small>
                    {item.surface} m² · {item.chambres} ch. · {item.facades} faç.
                  </small>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="blog-section" aria-label="Blog immobilier">
        <div className="section-heading">
          <p className="eyebrow">
            <BookOpen size={16} />
            Blog immobilier
          </p>
          <h2>Conseils pour mieux comprendre le prix d une maison</h2>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.title}>
              <img src={post.image} alt={post.title} loading="lazy" />
              <div className="blog-content">
                <span className="blog-category">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
