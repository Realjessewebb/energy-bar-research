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
      image: 'honey%20crunch.png'
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
      image: 'clif%20bar.webp'
    }
  ]
};

// Application State
const state = {
  randomizedProducts: [],
  viewedCards: new Set(), // Track which cards have been viewed (60%+ visible)
  currentCardIndex: 0,
  allCardsViewed: false
};

/* =====================================================
   Initialization
   ===================================================== */

function init() {
  // Randomize product order
  state.randomizedProducts = shuffleArray([...CONFIG.products]);

  // Render card deck
  renderCardDeck();

  // Set up scroll tracking for view-all enforcement
  setupScrollTracking();

  // Update progress indicator
  updateProgress();

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

  card.innerHTML = `
    <div class="card-content">
      <h2>${product.name}</h2>

      <img src="${product.image}" alt="${product.name} product" class="product-image">

      <p class="description">${product.description}</p>

      <button class="next-button" data-index="${index}" aria-label="Next card">
        ${index < state.randomizedProducts.length - 1 ? 'Next' : 'Continue'}
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
   Scroll Tracking & View-All Enforcement
   ===================================================== */

function setupScrollTracking() {
  const cardDeck = document.getElementById('card-deck');

  // Use Intersection Observer for precise visibility tracking
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        // Check if card is at least 60% visible
        if (entry.intersectionRatio >= 0.6) {
          const cardId = entry.target.id;
          const cardIndex = parseInt(cardId.split('-')[1]);

          // Mark card as viewed
          if (!state.viewedCards.has(cardIndex)) {
            state.viewedCards.add(cardIndex);
            console.log(`Card ${cardIndex} viewed (${state.viewedCards.size}/${state.randomizedProducts.length})`);

            // Check if all cards have been viewed
            if (state.viewedCards.size === state.randomizedProducts.length && !state.allCardsViewed) {
              state.allCardsViewed = true;
              console.log('All cards viewed - triggering redirect');
              showToastAndRedirect();
            }
          }

          // Update current card index for progress indicator
          state.currentCardIndex = cardIndex;
          updateProgress();
        }
      });
    },
    {
      threshold: [0.6], // Trigger when 60% visible
      root: null
    }
  );

  // Observe all cards
  document.querySelectorAll('.product-card').forEach(card => {
    observer.observe(card);
  });
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
    // Last card - check if all cards have been viewed
    if (!state.allCardsViewed) {
      alert('Please view all energy bars before continuing. Swipe through all cards.');
    }
  }
}

/* =====================================================
   UI Updates
   ===================================================== */

function updateProgress() {
  const currentCardElement = document.getElementById('current-card');
  const totalCardsElement = document.getElementById('total-cards');

  currentCardElement.textContent = state.currentCardIndex + 1;
  totalCardsElement.textContent = state.randomizedProducts.length;
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
