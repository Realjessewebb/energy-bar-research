/* =====================================================
   Energy Bar Research - Application Logic
   No frameworks, no external dependencies
   ===================================================== */

// Configuration - Edit product data and form URL here
const CONFIG = {
  // Single Google Form URL for all products
  formUrl: 'https://forms.gle/xKxGNMgCznxfKvjk9',

  products: [
    {
      id: 'honey-crunch',
      name: 'Honey Crunch',
      description: 'Honey Crunch is a clean, fast-acting source of workout energy made from simple ingredients — raw honey, banana, and air-popped brown rice, with no BS.',
      image: 'honey-crunch.png'
    },
    {
      id: 'rxbar',
      name: 'RXBAR',
      description: 'RXBAR protein bars are made with simple ingredients you can recognize — like egg whites for protein, dates to bind, and nuts for texture.',
      image: 'rxbar.jpg'
    },
    {
      id: 'clif-bar',
      name: 'Clif Bar',
      description: 'CLIF BAR energy bars deliver a blend of plant-based carbs, protein, and fiber for sustained energy — made with organic rolled oats and without high-fructose corn syrup or artificial flavors.',
      image: 'clif-bar.webp'
    }
  ]
};

// Application State
const state = {
  randomizedProducts: [],
  currentCardIndex: 0
};

/* =====================================================
   Initialization
   ===================================================== */

function init() {
  // Randomize product order
  state.randomizedProducts = shuffleArray([...CONFIG.products]);

  // Render card deck
  renderCardDeck();

  console.log('Energy Bar Research initialized');
}

/* =====================================================
   Utility Functions
   ===================================================== */

// Fisher-Yates shuffle for randomizing product order
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* =====================================================
   Rendering Functions
   ===================================================== */

function renderCardDeck() {
  const cardDeck = document.getElementById('card-deck');
  cardDeck.innerHTML = '';

  state.randomizedProducts.forEach((product, index) => {
    const card = createProductCard(product, index);
    cardDeck.appendChild(card);
  });
}

function createProductCard(product, index) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.id = `card-${index}`;
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `${product.name} information card`);

  const isLastCard = index >= state.randomizedProducts.length - 1;
  const buttonClass = isLastCard ? 'next-button continue-button' : 'next-button';
  const buttonText = isLastCard ? 'Continue' : 'Next';

  card.innerHTML = `
    <div class="card-content">
      <h2>${product.name}</h2>

      <img src="${product.image}" alt="${product.name} product" class="product-image">

      <p class="description">${product.description}</p>

      <button class="${buttonClass}" data-index="${index}" aria-label="${buttonText} card">
        ${buttonText}
      </button>
    </div>
  `;

  // Add click handler to Next button
  const nextButton = card.querySelector('.next-button');
  nextButton.addEventListener('click', () => handleNextButton(index));

  return card;
}

function showToastAndRedirect() {
  const toast = document.getElementById('toast');

  // Show toast message
  toast.classList.remove('hidden');

  // Wait 2.5 seconds, then redirect to Google Form
  setTimeout(() => {
    window.location.href = CONFIG.formUrl;
  }, 2500);
}

/* =====================================================
   Event Handlers
   ===================================================== */

function handleNextButton(currentIndex) {
  const nextIndex = currentIndex + 1;

  // If there's a next card, scroll to it
  if (nextIndex < state.randomizedProducts.length) {
    const nextCard = document.getElementById(`card-${nextIndex}`);
    nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Last card - show toast and redirect to form
    console.log('Third "Next" button clicked - triggering redirect');
    showToastAndRedirect();
  }
}

/* =====================================================
   Start Application
   ===================================================== */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
