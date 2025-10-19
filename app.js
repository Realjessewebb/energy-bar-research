/* =====================================================
   Energy Bar Research - Application Logic
   No frameworks, no external dependencies
   ===================================================== */

// Configuration - Edit product data and form URL here
const CONFIG = {
  // Single Google Form URL for all products
  formUrl: 'https://forms.gle/YOUR_FORM_ID', // Replace with actual Google Form URL

  products: [
    {
      id: 'honey-crunch',
      name: 'Honey Crunch',
      usp: 'Real honey and wholesome oats for sustained energy throughout your day.',
      ingredients: 'Oats, Honey, Almonds, Brown Rice Syrup, Sunflower Seeds, Sea Salt',
      imagePlaceholder: 'Honey Crunch Product Image'
    },
    {
      id: 'rxbar',
      name: 'RXBAR',
      usp: 'Simple ingredients you can see and pronounce, with no added sugar.',
      ingredients: 'Egg Whites, Dates, Cashews, Almonds, Natural Flavors',
      imagePlaceholder: 'RXBAR Product Image'
    },
    {
      id: 'clif-bar',
      name: 'Clif Bar',
      usp: 'Plant-based protein and organic ingredients to fuel your adventures.',
      ingredients: 'Organic Oats, Organic Brown Rice Syrup, Soy Protein Isolate, Organic Cane Syrup, Organic Cashew Butter',
      imagePlaceholder: 'Clif Bar Product Image'
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

      <div class="product-image" role="img" aria-label="${product.imagePlaceholder}">
        ${product.imagePlaceholder}
      </div>

      <p class="usp">${product.usp}</p>

      <div class="ingredients-section">
        <h3>Ingredients</h3>
        <p class="ingredients">${product.ingredients}</p>
      </div>

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
