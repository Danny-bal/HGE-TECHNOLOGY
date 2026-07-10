import { categoryIcons, categoryOrder, loadCatalog, storeAddresses, storeLocations, whatsappNumber } from "./scripts/catalog.js";

const { createApp, nextTick } = window.Vue;

createApp({
  data() {
    const requestedCategory = new URLSearchParams(window.location.search).get("categoria");
    const categoryView = categoryOrder.includes(requestedCategory) ? requestedCategory : "";
    return {
      products: [],
      categoryView,
      loading: true,
      mobileMenuOpen: false,
      selectedProduct: null,
      visibleLimit: 12,
      iconFrame: null,
      lightTheme: localStorage.getItem("hge-theme") === "light",
      filters: {
        search: "",
        category: categoryView,
        brand: "",
        local: "",
        promotion: false,
        available: false,
        sort: "recent"
      }
    };
  },

  computed: {
    categories() {
      return categoryOrder;
    },

    brands() {
      const products = this.categoryView
        ? this.products.filter(product => product.category === this.categoryView)
        : this.products;
      return [...new Set(products.map(product => product.brand))]
        .sort((a, b) => a.localeCompare(b, "es"));
    },

    stores() {
      return Object.keys(storeAddresses);
    },

    inStockCount() {
      return this.products.filter(product => Number(product.stock) > 0).length;
    },

    promotions() {
      return this.products.filter(product => product.isPromotion);
    },

    categoryStats() {
      return categoryOrder.map(name => ({
        name,
        icon: categoryIcons[name],
        count: this.products.filter(product => product.category === name).length
      }));
    },

    storeStats() {
      return this.stores.map(name => {
        const location = storeLocations[name];
        return {
          name,
          ...location,
          mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery)}&output=embed`,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.mapQuery)}`
        };
      });
    },

    metrics() {
      return [
        { label: "Total productos", value: this.products.length, detail: "portafolio multcategoría", icon: "package-search" },
        { label: "Con stock", value: this.inStockCount, detail: "referencias disponibles", icon: "circle-check-big" },
        { label: "En promoción", value: this.promotions.length, detail: "oportunidades activas", icon: "badge-percent" },
        { label: "Categorías", value: this.categories.length, detail: "líneas comerciales", icon: "layout-grid" },
        { label: "Locales", value: this.stores.length, detail: "puntos de atención", icon: "map-pin" },
        { label: "Cotización", value: "WhatsApp", detail: "atención personalizada", icon: "message-square-quote" }
      ];
    },

    filteredProducts() {
      const query = this.normalize(this.filters.search);
      const results = this.products.filter(product => {
        const haystack = this.normalize(`${product.name} ${product.brand} ${product.category} ${product.description}`);
        const matchesSearch = !query || haystack.includes(query);
        const matchesCategory = !this.filters.category || product.category === this.filters.category;
        const matchesBrand = !this.filters.brand || product.brand === this.filters.brand;
        const matchesLocal = !this.filters.local || product.local === this.filters.local;
        const matchesPromotion = !this.filters.promotion || product.isPromotion;
        const matchesAvailability = !this.filters.available || Number(product.stock) > 0;
        return matchesSearch && matchesCategory && matchesBrand && matchesLocal && matchesPromotion && matchesAvailability;
      });

      return [...results].sort((a, b) => {
        if (this.filters.sort === "name") return a.name.localeCompare(b.name, "es");
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },

    paginatedProducts() {
      return this.filteredProducts.slice(0, this.visibleLimit);
    },

    hasActiveFilters() {
      return Boolean(
        this.filters.search || (this.filters.category && this.filters.category !== this.categoryView) || this.filters.brand ||
        this.filters.local || this.filters.promotion || this.filters.available ||
        this.filters.sort !== "recent"
      );
    },

    generalWhatsappLink() {
      const message = "Hola, deseo recibir información sobre los productos de HGE Technology. ¿Me puede ayudar?";
      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    },

    currentYear() {
      return new Date().getFullYear();
    }
  },

  watch: {
    filters: {
      deep: true,
      handler() {
        this.visibleLimit = 12;
      }
    }
  },

  async mounted() {
    document.addEventListener("keydown", this.handleKeydown);
    this.applyTheme();
    if (this.categoryView) document.title = `${this.categoryView} | HGE Technology`;
    await this.loadProducts();
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },

  updated() {
    this.refreshIcons();
  },

  methods: {
    async loadProducts() {
      this.products = await loadCatalog();
      this.loading = false;

      await nextTick();
      this.refreshIcons();
    },

    normalize(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    },

    stockLabel(product) {
      if (product.stock == null) return "Consultar stock";
      if (Number(product.stock) === 0) return "Agotado";
      return `${product.stock} en stock`;
    },

    productLocation(product) {
      return product.local === "Consultar" ? "Disponibilidad por confirmar" : product.local;
    },

    badgeClass(product) {
      if (product.isPromotion || product.status === "Promoción") return "badge-promo";
      if (product.status === "Nuevo") return "badge-new";
      if (product.status === "Destacado") return "badge-featured";
      return "badge-normal";
    },

    whatsappLink(product) {
      const message = `Hola, estoy interesado en el producto ${product.name}. ¿Me puede ayudar con más información?`;
      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    },

    categoryPageLink(category) {
      return `index.html?categoria=${encodeURIComponent(category)}#productos`;
    },

    filterByStore(store) {
      this.filters.local = store;
      nextTick(() => document.querySelector("#productos")?.scrollIntoView({ behavior: "smooth" }));
    },

    clearFilters() {
      this.filters = {
        search: "",
        category: this.categoryView,
        brand: "",
        local: "",
        promotion: false,
        available: false,
        sort: "recent"
      };
    },

    openProduct(product) {
      this.selectedProduct = product;
      document.body.classList.add("modal-open");
      nextTick(() => {
        this.refreshIcons();
        this.$refs.modalClose?.focus();
      });
    },

    closeProduct() {
      this.selectedProduct = null;
      document.body.classList.remove("modal-open");
    },

    handleKeydown(event) {
      if (event.key === "Escape") {
        this.mobileMenuOpen = false;
        if (this.selectedProduct) this.closeProduct();
      }
    },

    toggleTheme() {
      this.lightTheme = !this.lightTheme;
      localStorage.setItem("hge-theme", this.lightTheme ? "light" : "dark");
      this.applyTheme();
    },

    applyTheme() {
      document.documentElement.classList.toggle("light-theme", this.lightTheme);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", this.lightTheme ? "#f4f7f3" : "#050705");
    },

    refreshIcons() {
      if (!window.lucide || this.iconFrame) return;
      this.iconFrame = requestAnimationFrame(() => {
        window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
        this.iconFrame = null;
      });
    }
  }
}).mount("#app");
