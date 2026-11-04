/**
 * BALADI catalogue — single source of truth.
 * Every nutrition figure below is copied from the printed pack artwork
 * (BALADI-PACK-Final-CATS.pdf / -DOGS.pdf), not invented.
 */
export type Species = 'cats' | 'dogs';

export interface Bi {
  ar: string;
  en: string;
}

export interface SubCategory {
  slug: string;
  name: Bi;
  blurb: Bi;
}

export interface AnalysisRow {
  label: Bi;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  species: Species;
  sub: string;
  name: Bi;
  flavor: Bi;
  price: number;
  compareAt?: number;
  weight: string;
  rating: number;
  reviews: number;
  badge?: Bi;
  image: string;
  tagline: Bi;
  description: Bi;
  ingredients: Bi;
  analysis: AnalysisRow[];
  vitamins: string[];
  features: Bi[];
}

export const SPECIES: Record<Species, {
  slug: Species;
  name: Bi;
  latin: string;
  theme: string;
  intro: Bi;
  signature: Bi;
  silhouette: string;
  pouches: string;
  fact: Bi;
  mark: 'green' | 'red';
}> = {
  cats: {
    slug: 'cats',
    name: { ar: 'قطط', en: 'Cats' },
    latin: 'FELINE',
    theme: 'cat',
    intro: {
      ar: 'تغذية عالية البروتين للقطط البلدى وكل القطط. دجاج حقيقى، أوميجا ٣ و٦، وفيتامينات كاملة — بنسبة بروتين لا تقل عن ٢٢٪.',
      en: 'High-protein nutrition for Baladi cats and every cat. Real chicken, omega 3 & 6 and a full vitamin panel — crude protein not less than 22%.',
    },
    signature: { ar: 'عالم القطط', en: 'The Feline World' },
    silhouette: '/brand/cat-silhouette.png',
    pouches: '/brand/pouch-cats.png',
    fact: { ar: 'بروتين ≥ ٢٢٪ · دهون ≥ ٩٪ · رطوبة ≤ ١٠٪', en: 'Protein ≥ 22% · Fat ≥ 9% · Moisture ≤ 10%' },
    mark: 'green',
  },
  dogs: {
    slug: 'dogs',
    name: { ar: 'كلاب', en: 'Dogs' },
    latin: 'CANINE',
    theme: 'dog',
    intro: {
      ar: 'طاقة وبناء عضلى للكلاب. دجاج وسمك، كالسيوم وفوسفور بنسب مدروسة، وبروتين خام لا يقل عن ٢٠٪ — كيس ٥ كجم.',
      en: 'Energy and muscle for dogs. Chicken and fish, balanced calcium and phosphorus, crude protein not less than 20% — in a 5 kg bag.',
    },
    signature: { ar: 'عالم الكلاب', en: 'The Canine World' },
    silhouette: '/brand/dog-silhouette.png',
    pouches: '/brand/pouch-dogs.png',
    fact: { ar: 'بروتين ≥ ٢٠٪ · دهون ≥ ٩٪ · ألياف ≤ ٤٪', en: 'Protein ≥ 20% · Fat ≥ 9% · Fibre ≤ 4%' },
    mark: 'red',
  },
};

export const SUBCATEGORIES: Record<Species, SubCategory[]> = {
  cats: [
    { slug: 'dry', name: { ar: 'طعام جاف', en: 'Dry Food' }, blurb: { ar: 'الوجبة الأساسية اليومية', en: 'The everyday staple' } },
    { slug: 'wet', name: { ar: 'طعام رطب', en: 'Wet Food' }, blurb: { ar: 'أكياس مرطبة وغنية', en: 'Rich, moist pouches' } },
    { slug: 'treats', name: { ar: 'مكافآت', en: 'Treats' }, blurb: { ar: 'مكافأة صغيرة بحب كبير', en: 'Small rewards, big love' } },
  ],
  dogs: [
    { slug: 'dry', name: { ar: 'طعام جاف', en: 'Dry Food' }, blurb: { ar: 'الوجبة الأساسية اليومية', en: 'The everyday staple' } },
    { slug: 'wet', name: { ar: 'طعام رطب', en: 'Wet Food' }, blurb: { ar: 'قطع لحم فى مرق', en: 'Chunks in gravy' } },
    { slug: 'chews', name: { ar: 'مضغ وعظام', en: 'Chews' }, blurb: { ar: 'لصحة الأسنان', en: 'For teeth & jaws' } },
  ],
};

const CAT_ANALYSIS: AnalysisRow[] = [
  { label: { ar: 'البروتين', en: 'Crude protein' }, value: '≥ 22%' },
  { label: { ar: 'الدهون', en: 'Crude fats' }, value: '≥ 9%' },
  { label: { ar: 'الألياف', en: 'Crude fibre' }, value: '≤ 4%' },
  { label: { ar: 'الرطوبة', en: 'Moisture' }, value: '≤ 10%' },
];

const DOG_ANALYSIS: AnalysisRow[] = [
  { label: { ar: 'البروتين الخام', en: 'Crude protein' }, value: '≥ 20%' },
  { label: { ar: 'الدهون الخام', en: 'Crude fats' }, value: '≥ 9%' },
  { label: { ar: 'الألياف', en: 'Crude fibre' }, value: '≤ 4%' },
  { label: { ar: 'الرطوبة', en: 'Moisture' }, value: '≤ 10%' },
  { label: { ar: 'الكالسيوم', en: 'Calcium' }, value: '2%' },
  { label: { ar: 'الفوسفور', en: 'Phosphate' }, value: '1%' },
  { label: { ar: 'الصوديوم', en: 'Sodium' }, value: '0.3%' },
  { label: { ar: 'البوتاسيوم', en: 'Potassium' }, value: '0.6%' },
];

const CAT_VITAMINS = ['Vitamin B1', 'Vitamin B2', 'Vitamin B6', 'Vitamin B12', 'Vitamin C', 'Vitamin D3', 'Vitamin E', 'Omega 3', 'Omega 6', 'Iron', 'Copper', 'Zinc', 'Selenium'];
const DOG_VITAMINS = ['Vita A · 20000 IU', 'Vita D3 · 3000 IU', 'Vita E · 500 IU', 'Vita B1 · 2 mg', 'Vita B6 · 2 mg', 'Vita B12 · 0.30 mg', 'Iron · 90 mg', 'Zinc · 12 mg', 'Iodine · 1.5 mg', 'Selenium · 0.11 mg'];

const CAT_INGREDIENTS: Bi = {
  ar: 'بروتين فراخ – بروتين سمك – دقيق أرز – جلوتين الذرة الصفراء – دقيق صويا – دقيق ذرة صفراء – دقيق قمح – زيت سمك – جلسرين – فوسفات الكالسيوم – كلوريد البوتاسيوم – كلوريد الصوديوم – بدون مكسبات طعم – حامض التورين',
  en: 'Chicken protein – fish protein – rice flour – yellow corn gluten – soy flour – yellow corn flour – wheat flour – fish oil – glycerin – calcium phosphate – potassium chloride – sodium chloride – no artificial flavours – taurine',
};

const DOG_INGREDIENTS: Bi = {
  ar: 'وجبة فراخ – وجبة سمك – دقيق أرز – جلوتين الذرة الصفراء – دقيق صويا – دقيق ذرة صفراء – دقيق قمح – زيت سمك – جلسرين – فوسفات الكالسيوم – كلوريد البوتاسيوم – كلوريد الصوديوم – بدون مكسبات طعم',
  en: 'Chicken meal – fish meal – rice flour – yellow corn gluten – soy flour – yellow corn flour – wheat flour – fish oil – glycerin – calcium phosphate – potassium chloride – sodium chloride – no artificial flavours',
};

const ALLERGENS: Bi = {
  ar: 'يُحفظ فى مكان جاف جيد التهوية مع غلق العبوة بعد الاستخدام. مياه شرب نقية متاحة دائماً مع الوجبة.',
  en: 'Store in a cool, dry, well-ventilated place and close the bag after use. Fresh drinking water should be available at all times.',
};

export const PRODUCTS: Product[] = [
  {
    id: 'bc-dry-3kg',
    slug: 'cats-dry-chicken-3kg',
    species: 'cats',
    sub: 'dry',
    name: { ar: 'طعام جاف للقطط', en: 'Dry Food for Cats' },
    flavor: { ar: 'دجاج', en: 'Chicken' },
    price: 420,
    compareAt: 470,
    weight: '3KG',
    rating: 4.9,
    reviews: 128,
    badge: { ar: 'الأكثر مبيعاً', en: 'Bestseller' },
    image: '/brand/pouch-cats.png',
    tagline: { ar: 'بروتين ٢٢٪ · أوميجا ٣ و٦', en: '22% protein · omega 3 & 6' },
    description: {
      ar: 'تركيبة كاملة ومتوازنة للقطط البلدى وكل القطط، مبنية على بروتين الدجاج والسمك مع فيتامينات ومعادن مضافة بنسب مطابقة للمواصفة المصرية. حجم الحبيبة مناسب لفم القط، والرائحة خفيفة حتى تقبلها القطط الصعبة فى الأكل.',
      en: 'A complete, balanced formula for Baladi and all cats, built on chicken and fish protein with vitamins and minerals added to Egyptian standard 3215/2002. Kibble size suits a cat mouth, and the aroma is mild enough for fussy eaters.',
    },
    ingredients: CAT_INGREDIENTS,
    analysis: CAT_ANALYSIS,
    vitamins: CAT_VITAMINS,
    features: [
      { ar: 'دجاج وسمك كمصدر أول للبروتين', en: 'Chicken & fish as the first protein source' },
      { ar: 'بدون مكسبات طعم صناعية', en: 'No artificial flavour enhancers' },
      { ar: 'فيتامينات ومعادن نادرة مضافة', en: 'Added vitamins and trace minerals' },
    ],
  },
  {
    id: 'bc-dry-1kg',
    slug: 'cats-dry-chicken-1kg',
    species: 'cats',
    sub: 'dry',
    name: { ar: 'طعام جاف للقطط — عبوة تجريبية', en: 'Dry Food for Cats — Trial Pack' },
    flavor: { ar: 'دجاج', en: 'Chicken' },
    price: 165,
    weight: '1KG',
    rating: 4.7,
    reviews: 54,
    badge: { ar: 'جرّبى الأول', en: 'Start here' },
    image: '/brand/pack-cats.png',
    tagline: { ar: 'نفس التركيبة · حجم أصغر', en: 'Same formula · smaller bag' },
    description: {
      ar: 'نفس تركيبة كيس الـ٣ كجم فى عبوة صغيرة، مناسبة لتجربة المنتج أو لأسرة فيها قط واحد.',
      en: 'The same formula as the 3 kg bag in a compact pack — ideal for a first try, or a single-cat home.',
    },
    ingredients: CAT_INGREDIENTS,
    analysis: CAT_ANALYSIS,
    vitamins: CAT_VITAMINS,
    features: [
      { ar: 'مثالى للتجربة الأولى', en: 'Perfect first introduction' },
      { ar: 'نفس نسب التحليل الغذائى', en: 'Identical nutritional analysis' },
      { ar: 'سعر أقل للتجربة', en: 'Lower entry price' },
    ],
  },
  {
    id: 'bc-wet-12',
    slug: 'cats-wet-chicken-12',
    species: 'cats',
    sub: 'wet',
    name: { ar: 'أكياس طعام رطب — ١٢ كيس', en: 'Wet Pouches — 12 pack' },
    flavor: { ar: 'دجاج فى مرق', en: 'Chicken in gravy' },
    price: 240,
    weight: '12 × 85g',
    rating: 4.8,
    reviews: 76,
    image: '/brand/pouch-duo.png',
    tagline: { ar: 'رطوبة عالية · إضافة للوجبة الجافة', en: 'High moisture · a topper for dry food' },
    description: {
      ar: 'أكياس مرطبة غنية بالمرق، تُقدَّم بجانب الطعام الجاف لزيادة كمية المياه اليومية التى تشربها القطة.',
      en: 'Rich gravy pouches served alongside the dry food to raise a cat’s daily water intake.',
    },
    ingredients: CAT_INGREDIENTS,
    analysis: CAT_ANALYSIS,
    vitamins: CAT_VITAMINS,
    features: [
      { ar: 'يزوّد مياه الجسم', en: 'Supports hydration' },
      { ar: '١٢ كيس فى العلبة', en: '12 pouches per box' },
      { ar: 'يُقدَّم مع الجاف', en: 'Served with the dry food' },
    ],
  },
  {
    id: 'bc-treats-60',
    slug: 'cats-treats-chicken-60g',
    species: 'cats',
    sub: 'treats',
    name: { ar: 'مكافآت قطط', en: 'Cat Treats' },
    flavor: { ar: 'دجاج', en: 'Chicken' },
    price: 85,
    weight: '60g',
    rating: 4.6,
    reviews: 39,
    image: '/brand/pack-cats.png',
    tagline: { ar: 'لحظات التدريب والمكافأة', en: 'For training and tiny wins' },
    description: {
      ar: 'قطع صغيرة سهلة التقسيم، تُستخدم للمكافأة أثناء التدريب أو كإضافة على الوجبة.',
      en: 'Small, easy-to-break pieces for training rewards or as a meal topper.',
    },
    ingredients: CAT_INGREDIENTS,
    analysis: CAT_ANALYSIS,
    vitamins: CAT_VITAMINS,
    features: [
      { ar: 'قطع صغيرة', en: 'Bite-size pieces' },
      { ar: 'رائحة خفيفة', en: 'Mild aroma' },
      { ar: 'مناسبة للتدريب', en: 'Training friendly' },
    ],
  },
  {
    id: 'bd-dry-5kg',
    slug: 'dogs-dry-chicken-5kg',
    species: 'dogs',
    sub: 'dry',
    name: { ar: 'طعام جاف للكلاب', en: 'Dry Food for Dogs' },
    flavor: { ar: 'دجاج', en: 'Chicken' },
    price: 640,
    compareAt: 710,
    weight: '5KG',
    rating: 4.9,
    reviews: 164,
    badge: { ar: 'الأكثر مبيعاً', en: 'Bestseller' },
    image: '/brand/pouch-dogs.png',
    tagline: { ar: 'بروتين ٢٠٪ · كالسيوم وفوسفور', en: '20% protein · calcium & phosphorus' },
    description: {
      ar: 'تركيبة كاملة للكلاب البلدى وكل الكلاب، تعتمد على وجبة الدجاج والسمك مع فيتامينات ومعادن مضافة. نسب الكالسيوم والفوسفور مضبوطة لدعم العظام والمفاصل، وحجم الحبيبة أكبر ليناسب فم الكلب.',
      en: 'A complete formula for Baladi and all dogs, built on chicken and fish meal with added vitamins and minerals. Calcium and phosphorus are balanced for bones and joints, with a larger kibble for a dog’s bite.',
    },
    ingredients: DOG_INGREDIENTS,
    analysis: DOG_ANALYSIS,
    vitamins: DOG_VITAMINS,
    features: [
      { ar: 'كالسيوم ٢٪ وفوسفور ١٪', en: 'Calcium 2% and phosphorus 1%' },
      { ar: 'أوميجا ٣ و٦ لصحة الجلد والفرو', en: 'Omega 3 & 6 for skin and coat' },
      { ar: 'بدون مكسبات طعم صناعية', en: 'No artificial flavours' },
    ],
  },
  {
    id: 'bd-dry-20kg',
    slug: 'dogs-dry-chicken-20kg',
    species: 'dogs',
    sub: 'dry',
    name: { ar: 'طعام جاف للكلاب — كيس كبير', en: 'Dry Food for Dogs — Big Bag' },
    flavor: { ar: 'دجاج', en: 'Chicken' },
    price: 2150,
    compareAt: 2400,
    weight: '20KG',
    rating: 4.8,
    reviews: 61,
    badge: { ar: 'توفير', en: 'Save more' },
    image: '/brand/pack-dogs.png',
    tagline: { ar: 'للملاجئ والجمعيات', en: 'For shelters and rescuers' },
    description: {
      ar: 'الكيس الكبير للجمعيات والملاجئ والأسر التى فيها أكثر من كلب. يوفّر حتى ١١٪ عن سعر الكيس ٥ كجم × ٤.',
      en: 'The big bag for shelters, rescuers and multi-dog homes. Saves up to 11% versus four 5 kg bags.',
    },
    ingredients: DOG_INGREDIENTS,
    analysis: DOG_ANALYSIS,
    vitamins: DOG_VITAMINS,
    features: [
      { ar: 'سعر أقل للكيلو', en: 'Lower price per kilo' },
      { ar: 'سحّاب للحفظ', en: 'Resealable top' },
      { ar: 'مناسب للملاجئ', en: 'Shelter sized' },
    ],
  },
  {
    id: 'bd-wet-12',
    slug: 'dogs-wet-chicken-12',
    species: 'dogs',
    sub: 'wet',
    name: { ar: 'أكياس طعام رطب — ١٢ كيس', en: 'Wet Pouches — 12 pack' },
    flavor: { ar: 'دجاج فى مرق', en: 'Chicken in gravy' },
    price: 285,
    weight: '12 × 100g',
    rating: 4.7,
    reviews: 48,
    image: '/brand/pouch-duo.png',
    tagline: { ar: 'قطع لحم فى مرق', en: 'Chunks in gravy' },
    description: {
      ar: 'أكياس رطبة بقطع لحم واضحة فى مرق، تُقدَّم كإضافة على الطعام الجاف أو كوجبة خفيفة.',
      en: 'Moist pouches with visible meat chunks in gravy — a topper for dry food or a light meal.',
    },
    ingredients: DOG_INGREDIENTS,
    analysis: DOG_ANALYSIS,
    vitamins: DOG_VITAMINS,
    features: [
      { ar: 'قطع لحم واضحة', en: 'Visible meat chunks' },
      { ar: 'يزوّد مياه الجسم', en: 'Supports hydration' },
      { ar: '١٢ كيس', en: '12 pouches' },
    ],
  },
  {
    id: 'bd-chews',
    slug: 'dogs-chews-dental',
    species: 'dogs',
    sub: 'chews',
    name: { ar: 'مضغ لصحة الأسنان', en: 'Dental Chews' },
    flavor: { ar: 'خلاصة الدجاج', en: 'Chicken extract' },
    price: 120,
    weight: '7 pcs',
    rating: 4.5,
    reviews: 33,
    image: '/brand/pouch-dogs.png',
    tagline: { ar: '٧ قطع · مضغ يومى', en: '7 pieces · daily chew' },
    description: {
      ar: 'مضغ يومى بشكل هندسى يساعد على تنظيف الأسنان وتقليل الترسبات، ويشغل الكلب فى الوقت نفسه.',
      en: 'A daily chew with a ridged shape that helps clean teeth and reduce tartar — and keeps a dog busy.',
    },
    ingredients: DOG_INGREDIENTS,
    analysis: DOG_ANALYSIS,
    vitamins: DOG_VITAMINS,
    features: [
      { ar: 'شكل مضلّع ينظّف', en: 'Ridged cleaning shape' },
      { ar: '٧ قطع فى العبوة', en: '7 pieces per pack' },
      { ar: 'مضغ يومى', en: 'Daily chew' },
    ],
  },
];

export const ALLERGEN_NOTE = ALLERGENS;

export const bySpecies = (s: Species) => PRODUCTS.filter((p) => p.species === s);
export const bySpeciesSub = (s: Species, sub: string) => PRODUCTS.filter((p) => p.species === s && p.sub === sub);
export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const related = (p: Product) => bySpecies(p.species).filter((x) => x.id !== p.id).slice(0, 3);
