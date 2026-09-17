const STORAGE_KEY = 'maocerta_mz_providers_v1';

const defaultProviders = [
  {
    id: 1,
    name: 'José Mário',
    category: 'Eletricista',
    city: 'Maputo',
    bairro: 'Polana Cimento',
    phone: '842345678',
    price: '500 MT',
    description: 'Instalações elétricas residenciais, tomadas, quadros e manutenção.',
    featured: true
  },
  {
    id: 2,
    name: 'Casa Limpa',
    category: 'Limpeza',
    city: 'Maputo',
    bairro: 'Magoanine',
    phone: '823456789',
    price: '350 MT',
    description: 'Limpeza doméstica semanal, janelas e arrumação geral.',
    featured: true
  },
  {
    id: 3,
    name: 'Técnico Nobre',
    category: 'Reparação de telemóveis',
    city: 'Matola',
    bairro: 'Infulene',
    phone: '843456789',
    price: '250 MT',
    description: 'Troca de ecrã, bateria e reparação de software.',
    featured: false
  },
  {
    id: 4,
    name: 'Pedra & Forte',
    category: 'Pedreiro',
    city: 'Maputo',
    bairro: 'Manga',
    phone: '844567890',
    price: '750 MT',
    description: 'Reparações de paredes, pisos, rebocos e pequenas obras.',
    featured: true
  },
  {
    id: 5,
    name: 'Água Segura',
    category: 'Canalizador',
    city: 'Matola',
    bairro: 'Ndlavela',
    phone: '845678901',
    price: '600 MT',
    description: 'Conserto de torneiras, fugas e instalações de água.',
    featured: false
  },
  {
    id: 6,
    name: 'Rui Explica',
    category: 'Explicador',
    city: 'Maputo',
    bairro: 'Marracuene',
    phone: '846789012',
    price: '400 MT',
    description: 'Aulas de matemática, português e apoio escolar.',
    featured: false
  }
];

let providers = loadProviders();
let deferredPrompt = null;

const publicView = document.getElementById('publicView');
const adminView = document.getElementById('adminView');
const providerGrid = document.getElementById('providerGrid');
const categoryFilter = document.getElementById('categoryFilter');
const cityFilter = document.getElementById('cityFilter');
const searchInput = document.getElementById('searchInput');
const totalProviders = document.getElementById('totalProviders');
const featuredCount = document.getElementById('featuredCount');
const adminTotal = document.getElementById('adminTotal');
const adminFeatured = document.getElementById('adminFeatured');
const adminCities = document.getElementById('adminCities');
const adminTableBody = document.getElementById('adminTableBody');
const providerForm = document.getElementById('providerForm');
const providerDialog = document.getElementById('providerDialog');
const installBtn = document.getElementById('installBtn');
const formCategory = document.getElementById('formCategory');

function loadProviders() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProviders));
      return [...defaultProviders];
    }
    const parsed = JSON.parse(existing);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultProviders];
  } catch (error) {
    console.warn('Erro ao carregar prestadores. Usando iniciais.', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProviders));
    return [...defaultProviders];
  }
}

function saveProviders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function whatsappLink(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? digits.slice(1) : digits;
  return `https://wa.me/258${normalized}`;
}

function populateCategories() {
  const categories = [...new Set(providers.map((provider) => provider.category))].sort();
  const optionHtml = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join('');

  categoryFilter.innerHTML = `<option value="">Todas</option>${optionHtml}`;
  formCategory.innerHTML = `<option value="">Selecione</option>${optionHtml}`;
}

function renderPublicProviders() {
  const search = searchInput.value.trim().toLowerCase();
  const city = cityFilter.value;
  const category = categoryFilter.value;

  const filtered = providers.filter((provider) => {
    const haystack = [
      provider.name,
      provider.category,
      provider.city,
      provider.bairro,
      provider.description
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search);
    const matchesCity = !city || provider.city === city;
    const matchesCategory = !category || provider.category === category;

    return matchesSearch && matchesCity && matchesCategory;
  });

  providerGrid.innerHTML = filtered.length
    ? filtered
        .map(
          (provider) => `
            <article class="provider-card">
              <div class="card-top">
                <div class="avatar">${getInitials(provider.name)}</div>
                <span class="status-pill ${provider.featured ? 'featured' : ''}">
                  ${provider.featured ? 'Destaque' : 'Disponível'}
                </span>
              </div>
              <div class="card-body">
                <h4>${provider.name}</h4>
                <div class="meta-row">
                  <span>${provider.category}</span>
                  <span>•</span>
                  <span>${provider.city}</span>
                  <span>•</span>
                  <span>${provider.bairro}</span>
                </div>
                <p>${provider.description}</p>
              </div>
              <div class="card-bottom">
                <span class="price-tag">${provider.price}</span>
                <a class="whatsapp-btn" href="${whatsappLink(provider.phone)}" target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </article>
          `
        )
        .join('')
    : `<div class="empty-state"><p>Nenhum prestador encontrado para essa pesquisa.</p></div>`;

  totalProviders.textContent = String(providers.length);
  featuredCount.textContent = String(providers.filter((provider) => provider.featured).length);
}

function renderAdminTable() {
  adminTotal.textContent = String(providers.length);
  adminFeatured.textContent = String(providers.filter((provider) => provider.featured).length);
  adminCities.textContent = String(new Set(providers.map((provider) => provider.city)).size);

  adminTableBody.innerHTML = providers
    .map(
      (provider) => `
        <tr>
          <td>${provider.name}</td>
          <td>${provider.category}</td>
          <td>${provider.city}</td>
          <td>${provider.price}</td>
          <td>
            <button class="feature-toggle ${provider.featured ? 'on' : ''}" data-action="toggle-feature" data-id="${provider.id}">
              ${provider.featured ? 'ON' : 'OFF'}
            </button>
          </td>
          <td>
            <button class="danger-btn" data-action="delete" data-id="${provider.id}">Remover</button>
          </td>
        </tr>
      `
    )
    .join('');
}

function refreshAll() {
  populateCategories();
  renderPublicProviders();
  renderAdminTable();
}

function showPublicView() {
  publicView.classList.remove('hidden');
  adminView.classList.add('hidden');
}

function showAdminView() {
  publicView.classList.add('hidden');
  adminView.classList.remove('hidden');
}

function openDialog() {
  providerDialog.showModal();
}

function closeDialog() {
  providerDialog.close();
  providerForm.reset();
}

searchInput.addEventListener('input', renderPublicProviders);
cityFilter.addEventListener('change', renderPublicProviders);
categoryFilter.addEventListener('change', renderPublicProviders);

document.getElementById('adminToggle').addEventListener('click', showAdminView);
document.getElementById('backToPublic').addEventListener('click', showPublicView);
document.getElementById('openAddProvider').addEventListener('click', openDialog);
document.getElementById('closeDialog').addEventListener('click', closeDialog);
document.getElementById('cancelDialog').addEventListener('click', closeDialog);

providerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(providerForm);
  const newProvider = {
    id: Date.now(),
    name: String(formData.get('name') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    city: String(formData.get('city') || '').trim(),
    bairro: String(formData.get('bairro') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    price: String(formData.get('price') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    featured: false
  };

  if (!newProvider.name || !newProvider.category || !newProvider.city || !newProvider.bairro || !newProvider.phone || !newProvider.price || !newProvider.description) {
    return;
  }

  providers = [newProvider, ...providers];
  saveProviders();
  refreshAll();
  closeDialog();
});

adminTableBody.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  const id = Number(target.dataset.id);
  const action = target.dataset.action;

  if (action === 'toggle-feature') {
    providers = providers.map((provider) =>
      provider.id === id ? { ...provider, featured: !provider.featured } : provider
    );
  }

  if (action === 'delete') {
    providers = providers.filter((provider) => provider.id !== id);
  }

  saveProviders();
  refreshAll();
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('SW registration failed:', error);
    });
  });
}

refreshAll();
showPublicView();
