export const whatsappNumber = "593939271656";

export const fallbackProducts = [
  { id: 9001, name: "HGE Label Pro", brand: "HGE", category: "Etiquetadoras y cintas", description: "Etiquetadora térmica portátil para uso comercial.", stock: 20, local: "Plaza París", image: "assets/products/etiquetadoras.svg", status: "Promoción", isFeatured: true, isPromotion: true, createdAt: "2026-06-01" },
  { id: 9002, name: "Smartphone HGE Demo", brand: "HGE", category: "Celulares", description: "Equipo demostrativo del catálogo de celulares.", stock: null, local: "Consultar", image: "assets/products/celulares.svg", status: "Destacado", isFeatured: true, isPromotion: false, createdAt: "2026-06-01" },
  { id: 9003, name: "Incubadora digital 48 huevos", brand: "AgroHome", category: "Incubadoras", description: "Incubadora automática con control digital.", stock: 11, local: "Plaza del Valle", image: "assets/products/incubadoras.svg", status: "Nuevo", isFeatured: true, isPromotion: false, createdAt: "2026-06-01" },
  { id: 9004, name: "Deshidratadora 5 bandejas", brand: "FoodMax", category: "Deshidratadoras", description: "Deshidratadora de alimentos con temperatura ajustable.", stock: 19, local: "Oficina Norte", image: "assets/products/deshidratadoras.svg", status: "Destacado", isFeatured: true, isPromotion: false, createdAt: "2026-06-01" },
  { id: 9005, name: "Selladora al vacío compacta", brand: "SealPro", category: "Selladoras al vacío", description: "Selladora automática para conservación de alimentos.", stock: 24, local: "Plaza París", image: "assets/products/selladoras.svg", status: "Promoción", isFeatured: true, isPromotion: true, createdAt: "2026-06-01" },
  { id: 9006, name: "Esquiladora profesional", brand: "PetCare", category: "Esquiladoras", description: "Esquiladora silenciosa de alta precisión.", stock: 18, local: "Plaza del Valle", image: "assets/products/esquiladoras.svg", status: "Destacado", isFeatured: true, isPromotion: false, createdAt: "2026-06-01" },
  { id: 9007, name: "Batería recargable para cámara", brand: "CamPower", category: "Baterías de cámaras", description: "Batería de reemplazo de alta capacidad.", stock: 27, local: "Oficina Norte", image: "assets/products/baterias-camara.svg", status: "Nuevo", isFeatured: true, isPromotion: false, createdAt: "2026-06-01" },
  { id: 9008, name: "Trípode compacto", brand: "NovaTech", category: "Accesorios", description: "Trípode ajustable para cámara y celular.", stock: 36, local: "Plaza París", image: "assets/products/accesorios-hge.svg", status: "Destacado", isFeatured: true, isPromotion: false, createdAt: "2026-06-01" }
];

export const categoryOrder = [
  "Etiquetadoras y cintas",
  "Celulares",
  "Incubadoras",
  "Deshidratadoras",
  "Selladoras al vacío",
  "Esquiladoras",
  "Baterías de cámaras",
  "Accesorios"
];

export const categoryIcons = {
  "Etiquetadoras y cintas": "tag",
  "Celulares": "smartphone",
  "Incubadoras": "egg",
  "Deshidratadoras": "wind",
  "Selladoras al vacío": "package-check",
  "Esquiladoras": "scissors",
  "Baterías de cámaras": "battery-charging",
  "Accesorios": "cable"
};

export const storeLocations = {
  "Plaza París": {
    publicName: "Local Valle #1",
    address: "Centro Comercial Plaza París, locales 18-19 (piso 2), frente a Tablita Tártaro, Quito, Ecuador",
    phone: "0980424765",
    mapQuery: "Centro Comercial Plaza Paris, Quito, Ecuador"
  },
  "Plaza del Valle": {
    publicName: "Local Valle #2",
    address: "CC. Plaza del Valle, local B-06 (celulares y accesorios), Quito, Ecuador",
    phone: "0997300813",
    mapQuery: "CC Plaza del Valle, local B-06, Quito, Ecuador"
  },
  "Oficina Norte": {
    publicName: "Local Norte Quito",
    address: "Av. Edmundo Carvajal, portón negro, piso 2, Quito, Ecuador",
    phone: "0997938407",
    mapQuery: "Somos HGE Technology, Av. Edmundo Carvajal Oe2-10 y Av. de la Prensa N44, Quito, Ecuador"
  }
};

export const storeAddresses = Object.fromEntries(
  Object.entries(storeLocations).map(([name, store]) => [name, store.address])
);

const realProductFiles = ["data/real-products.json", "data/extra-products.json"];
const catalogSource = "Catálogo real HGE";

async function fetchJson(file) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
  return response.json();
}

export async function loadCatalog() {
  const [simulatedResult, phonesResult, ...realResults] = await Promise.allSettled([
    fetchJson("data/products.json"),
    fetchJson("data/phones.json"),
    ...realProductFiles.map(fetchJson)
  ]);

  let simulated = simulatedResult.status === "fulfilled" ? simulatedResult.value : fallbackProducts;
  if (simulatedResult.status === "rejected") console.warn(simulatedResult.reason);

  const phones = phonesResult.status === "fulfilled"
    ? phonesResult.value.map(product => ({ ...product, catalogSource }))
    : [];
  if (phonesResult.status === "rejected") console.warn(phonesResult.reason);

  const realProducts = realResults.flatMap(result => {
    if (result.status === "rejected") {
      console.warn(result.reason);
      return [];
    }

    return result.value.map(product => ({
      ...product,
      catalogSource,
      catalogFlyer: false
    }));
  });

  if (realProducts.length || phones.length) {
    const realCategories = new Set([
      ...realProducts.map(product => product.category),
      ...phones.map(product => product.category)
    ]);
    simulated = simulated.filter(product => !realCategories.has(product.category));
  }

  return [...realProducts, ...phones, ...simulated];
}
