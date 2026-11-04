import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog';
  age: string;
  weight: string;
  food: string;
}

export interface UserAddress {
  id: string;
  title: string;
  governorate: string;
  city: string;
  street: string;
  building?: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  image: string;
  price: number;
  qty: number;
  weight: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  governorate: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  governorate: string;
  address: string;
  avatar: string;
  preferredSpecies: 'cats' | 'dogs' | 'both';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pets: Pet[];
  addresses: UserAddress[];
  orders: Order[];
  
  // Actions
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Omit<User, 'id' | 'createdAt' | 'avatar'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (emailOrPhone: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  
  // Pet management
  addPet: (pet: Omit<Pet, 'id'>) => void;
  removePet: (id: string) => void;
  
  // Address management
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Order management
  addOrder: (order: Order) => void;
}

// Initial demo user with real-world sample data so the user can immediately experience the pages
const DEMO_USER: User = {
  id: 'usr_baladi_01',
  name: 'أحمد محمود',
  email: 'ahmed@baladi.pet',
  phone: '01012345678',
  governorate: 'الجيزة',
  address: 'شارع الهرم، بجوار محطة المترو، عمارة 14 الدور 3',
  avatar: '🐱',
  preferredSpecies: 'both',
  createdAt: '2024-03-15',
};

const INITIAL_PETS: Pet[] = [
  {
    id: 'pet_1',
    name: 'مشمش',
    species: 'cat',
    age: 'سنتين',
    weight: '3.8 كجم',
    food: 'طعام جاف كامل للقطط البالغة — دجاج',
  },
  {
    id: 'pet_2',
    name: 'صخر',
    species: 'dog',
    age: 'سنة ونصف',
    weight: '16 كجم',
    food: 'طعام جاف كامل للكلاب البالغة — لحم وخضار',
  },
];

const INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr_1',
    title: 'المنزل',
    governorate: 'الجيزة',
    city: 'الدقي',
    street: 'شارع مصدق، عمارة الأمل، الدور الخامس شقة 10',
    isDefault: true,
  },
  {
    id: 'addr_2',
    title: 'العمل',
    governorate: 'القاهرة',
    city: 'المعادي',
    street: 'القرية الذكية / شارع اللاسلكي',
    isDefault: false,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 'BLD-2026-8841',
    date: '2026-10-24',
    status: 'delivered',
    items: [
      {
        id: 'cat-adult-chicken-10k',
        slug: 'cat-adult-chicken-10k',
        nameAr: 'طعام جاف للقطط البالغة · دجاج',
        nameEn: 'Adult Cat Dry Food · Chicken',
        image: '/packs/cat-adult-pack.png',
        price: 840,
        qty: 1,
        weight: '10 كجم',
      },
      {
        id: 'cat-kitten-chicken-10k',
        slug: 'cat-kitten-chicken-10k',
        nameAr: 'طعام جاف للكيتن والقطط الصغيرة',
        nameEn: 'Kitten Dry Food · Chicken & Milk',
        image: '/packs/cat-kitten-pack.png',
        price: 890,
        qty: 1,
        weight: '10 كجم',
      },
    ],
    subtotal: 1730,
    shipping: 55,
    total: 1785,
    governorate: 'الجيزة',
    address: 'شارع الهرم، بجوار محطة المترو، عمارة 14 الدور 3',
  },
  {
    id: 'ord_102',
    orderNumber: 'BLD-2026-9104',
    date: '2026-11-01',
    status: 'processing',
    items: [
      {
        id: 'dog-adult-chicken-15k',
        slug: 'dog-adult-chicken-15k',
        nameAr: 'طعام جاف للكلاب البالغة · دجاج',
        nameEn: 'Adult Dog Dry Food · Chicken',
        image: '/packs/dog-adult-pack.png',
        price: 980,
        qty: 2,
        weight: '15 كجم',
      },
    ],
    subtotal: 1960,
    shipping: 55,
    total: 2015,
    governorate: 'الجيزة',
    address: 'شارع الهرم، بجوار محطة المترو، عمارة 14 الدور 3',
  },
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      pets: INITIAL_PETS,
      addresses: INITIAL_ADDRESSES,
      orders: INITIAL_ORDERS,

      login: async (emailOrPhone, _password) => {
        // Simple client-side simulation with delay for smooth UX
        await new Promise((res) => setTimeout(res, 500));
        
        if (!emailOrPhone.trim()) {
          return { success: false, error: 'برجاء إدخال البريد الإلكتروني أو رقم الهاتف' };
        }

        // If logging in as demo user or any user, create/populate session
        const namePart = emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'صديق بلدي';
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const loggedUser: User = {
          id: 'usr_' + Date.now(),
          name: emailOrPhone === DEMO_USER.email || emailOrPhone === DEMO_USER.phone ? DEMO_USER.name : formattedName,
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@baladi.pet`,
          phone: emailOrPhone.match(/^[0-9+]+$/) ? emailOrPhone : '01099887766',
          governorate: 'الجيزة',
          address: 'القاهرة والجيزة، مصر',
          avatar: '🐾',
          preferredSpecies: 'both',
          createdAt: new Date().toISOString().split('T')[0],
        };

        set({
          user: loggedUser,
          isAuthenticated: true,
        });

        return { success: true };
      },

      register: async (data) => {
        await new Promise((res) => setTimeout(res, 600));

        if (!data.name.trim() || !data.email.trim() || !data.phone.trim()) {
          return { success: false, error: 'برجاء ملء جميع البيانات المطلوبة' };
        }

        const newUser: User = {
          ...data,
          id: 'usr_' + Date.now(),
          avatar: data.preferredSpecies === 'cats' ? '🐱' : data.preferredSpecies === 'dogs' ? '🐕' : '🐾',
          createdAt: new Date().toISOString().split('T')[0],
        };

        set({
          user: newUser,
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (data) => {
        const current = get().user;
        if (!current) return;
        set({
          user: { ...current, ...data },
        });
      },

      changePassword: async (_oldPass, newPass) => {
        await new Promise((res) => setTimeout(res, 500));
        if (!newPass || newPass.length < 6) {
          return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام' };
        }
        return { success: true };
      },

      resetPassword: async (emailOrPhone, newPass) => {
        await new Promise((res) => setTimeout(res, 600));
        if (!emailOrPhone.trim()) {
          return { success: false, error: 'برجاء إدخال البريد الإلكتروني أو رقم الهاتف' };
        }
        if (!newPass || newPass.length < 6) {
          return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام' };
        }
        return { success: true };
      },

      addPet: (pet) => {
        const newPet: Pet = {
          ...pet,
          id: 'pet_' + Date.now(),
        };
        set({ pets: [newPet, ...get().pets] });
      },

      removePet: (id) => {
        set({ pets: get().pets.filter((p) => p.id !== id) });
      },

      addAddress: (address) => {
        const newAddress: UserAddress = {
          ...address,
          id: 'addr_' + Date.now(),
        };
        const updated = address.isDefault
          ? get().addresses.map((a) => ({ ...a, isDefault: false }))
          : get().addresses;
        set({ addresses: [...updated, newAddress] });
      },

      removeAddress: (id) => {
        set({ addresses: get().addresses.filter((a) => a.id !== id) });
      },

      setDefaultAddress: (id) => {
        set({
          addresses: get().addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        });
      },

      addOrder: (order) => {
        set({
          orders: [order, ...get().orders],
        });
      },
    }),
    {
      name: 'baladi-auth',
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        pets: s.pets,
        addresses: s.addresses,
        orders: s.orders,
      }),
    }
  )
);
