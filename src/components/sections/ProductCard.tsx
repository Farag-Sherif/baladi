import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Heart, Loader2 } from 'lucide-react';
import {
  getCategoryTitle,
  getProductTitle,
  resolveProductImage,
  type ApiProduct,
} from '../../lib/api';
import { useLang } from '../../lib/lang';
import { egp } from '../../lib/utils';
import { useCart } from '../../store/cart';
import { useAuth } from '../../store/auth';
import Tilt3D from '../ui/Tilt3D';
import { ZigZagBand, BaladiCatEmblem, BaladiDogEmblem } from '../brand/Ornaments';

export default function ProductCard({ product }: { product: ApiProduct }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const favorites = useAuth((s) => s.favorites);
  const toggleFavorite = useAuth((s) => s.toggleFavorite);
  const [adding, setAdding] = useState(false);

  const isCat = product.species === 'cat';
  const isFav = favorites.some((f) => f.id === product.id);
  const title = getProductTitle(product, lang);
  const categoryName = getCategoryTitle(product.category, lang);
  const imgSrc = resolveProductImage(product.image, product.species);

  const handleAdd = async () => {
    if (!product.in_stock || adding) return;
    setAdding(true);
    await add(product, 1, true);
    setAdding(false);
  };

  const handleFavorite = async () => {
    const res = await toggleFavorite(product);
    if (res.requiresAuth) {
      navigate('/login');
    }
  };

  return (
    <Tilt3D strength={9} className="relative h-full">
      <div
        className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-white transition-shadow duration-300 hover:shadow-lift ${
          isCat ? 'theme-cat border-baladi-red/20' : 'theme-dog border-baladi-green/20'
        }`}
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* backdrop: the animal ghost + product photo */}
        <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: isCat
                ? 'linear-gradient(160deg,#FCE7E8,#FBF6EE 70%)'
                : 'linear-gradient(160deg,#E7F4EE,#FBF6EE 70%)',
            }}
          />
          <div className="pointer-events-none absolute -bottom-3 end-[-4%] h-[58%] aspect-square opacity-[0.14]">
            {isCat ? (
              <BaladiCatEmblem size={200} color="#E84249" tight={false} className="h-full w-full" />
            ) : (
              <BaladiDogEmblem size={200} color="#1E996C" tight={false} className="h-full w-full" />
            )}
          </div>

          <div className="pointer-events-none absolute start-3 top-3 z-20 flex flex-wrap gap-1.5">
            {!product.in_stock ? (
              <span className="rounded-full bg-ink/85 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                {t('نفد المخزون', 'Out of stock')}
              </span>
            ) : product.discount_percent ? (
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white ${
                  isCat ? 'bg-baladi-red' : 'bg-baladi-green'
                }`}
              >
                -{product.discount_percent}%
              </span>
            ) : product.is_featured ? (
              <span className="rounded-full bg-baladi-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-ink">
                {t('مميز', 'Featured')}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void handleFavorite()}
            className={`absolute end-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border transition-all ${
              isFav
                ? 'border-baladi-red bg-baladi-red text-white shadow-sm'
                : 'border-ink/10 bg-white/90 text-ink/60 hover:text-baladi-red'
            }`}
            aria-label={t('المفضلة', 'Favorite')}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <Link
            to={`/product/${product.slug}`}
            className="absolute inset-0 z-10 flex items-center justify-center pt-10 pb-5 px-5"
          >
            <img
              src={imgSrc}
              alt={title}
              className="h-full w-full max-h-full max-w-full object-contain object-center drop-shadow-[0_20px_30px_rgba(35,37,79,0.22)] transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </Link>

          <button
            type="button"
            disabled={!product.in_stock || adding}
            onClick={() => void handleAdd()}
            className={`absolute bottom-3 end-3 z-20 grid h-11 w-11 place-items-center rounded-full text-white transition-all shadow-md disabled:cursor-not-allowed disabled:opacity-40 ${
              isCat ? 'bg-baladi-red hover:bg-baladi-red/90' : 'bg-baladi-green hover:bg-baladi-green/90'
            } ${product.in_stock ? 'hover:scale-105' : ''}`}
            aria-label={t('أضف للسلة', 'Add to cart')}
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className={`t-eyebrow ${isCat ? 'text-baladi-red' : 'text-baladi-green'}`}>
            {categoryName}
          </p>
          <Link to={`/product/${product.slug}`} className="mt-1.5">
            <h3 className="text-[15.5px] font-black leading-snug hover:opacity-70">{title}</h3>
          </Link>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-relaxed text-ink/80">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between pt-4">
            <div>
              <p className="text-[17px] font-black leading-none text-ink">{egp(product.price, lang)}</p>
              {product.compare_at_price && (
                <p className="mt-1 text-[11.5px] font-bold text-ink/55 line-through">
                  {egp(product.compare_at_price, lang)}
                </p>
              )}
            </div>
            <span className={`text-[11px] font-black ${isCat ? 'text-baladi-green' : 'text-baladi-red'}`}>
              {t('عرض التفاصيل', 'View')} <span className="inline-block rtl:rotate-180">→</span>
            </span>
          </div>
        </div>
        <ZigZagBand height={13} color={isCat ? '#1E996C' : '#E84249'} className="opacity-45" />
      </div>
    </Tilt3D>
  );
}
