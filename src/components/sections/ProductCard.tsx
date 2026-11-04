import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import type { Product } from '../../data/catalog';
import { useLang } from '../../lib/lang';
import { egp } from '../../lib/utils';
import { useCart } from '../../store/cart';
import Tilt3D from '../ui/Tilt3D';
import { ZigZagBand } from '../brand/Ornaments';

export default function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useLang();
  const add = useCart((s) => s.add);
  const isCat = product.species === 'cats';

  return (
    <Tilt3D strength={9} className="relative h-full">
      <div
        className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-white transition-shadow duration-300 hover:shadow-lift ${
          isCat ? 'theme-cat border-baladi-green/20' : 'theme-dog border-baladi-red/20'
        }`}
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* backdrop: the animal ghost + product photo, low opacity */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: isCat ? 'linear-gradient(160deg,#E7F4EE,#FBF6EE 70%)' : 'linear-gradient(160deg,#FCE7E8,#FBF6EE 70%)' }}
          />
          <img
            src={isCat ? '/brand/cat-silhouette.png' : '/brand/dog-silhouette.png'}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-4 end-[-6%] h-[62%] w-auto object-contain opacity-[0.10]"
          />
          {product.badge && (
            <span className="absolute start-3 top-3 z-10 rounded-full bg-ink px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cream">
              {product.badge[lang]}
            </span>
          )}
          <Link to={`/product/${product.slug}`} className="absolute inset-0 z-10 grid place-items-center p-6">
            <img
              src={product.image}
              alt={product.name[lang]}
              className="max-h-full w-auto object-contain drop-shadow-[0_26px_38px_rgba(35,37,79,0.28)] transition-transform duration-500 group-hover:scale-[1.05]"
              loading="lazy"
            />
          </Link>
          <button
            type="button"
            onClick={() => add(product, 1)}
            className="absolute bottom-3 end-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-105"
            aria-label={t('أضف للسلة', 'Add to cart')}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className={`t-eyebrow ${isCat ? 'text-baladi-green' : 'text-baladi-red'}`}>
            {product.flavor[lang]} · {product.weight}
          </p>
          <Link to={`/product/${product.slug}`} className="mt-1.5">
            <h3 className="text-[15.5px] font-black leading-snug hover:opacity-70">{product.name[lang]}</h3>
          </Link>
          <p className="mt-1 text-[12px] font-semibold leading-relaxed text-ink/80">{product.tagline[lang]}</p>

          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? 'fill-baladi-yellow text-baladi-yellow' : 'text-ink/20'}`} />
            ))}
            <span className="text-[11px] font-bold text-ink/65">({product.reviews})</span>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4">
            <div>
              <p className="text-[17px] font-black leading-none text-ink">{egp(product.price, lang)}</p>
              {product.compareAt && (
                <p className="mt-1 text-[11.5px] font-bold text-ink/55 line-through">{egp(product.compareAt, lang)}</p>
              )}
            </div>
            <span className={`text-[11px] font-black ${isCat ? 'text-baladi-green' : 'text-baladi-red'}`}>
              {t('عرض التفاصيل', 'View')} <span className="inline-block rtl:rotate-180">→</span>
            </span>
          </div>
        </div>
        <ZigZagBand height={11} weight={1.3} color={isCat ? '#1E996C' : '#E84249'} className="opacity-45" />
      </div>
    </Tilt3D>
  );
}
