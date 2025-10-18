/* =====================================================
   Energy Bar Research - Application Logic
   No frameworks, no external dependencies
   ===================================================== */

// Configuration - Edit product data and form URLs here
const CONFIG = {
  products: [
    {
      id: 'honey-crunch',
      name: 'Honey Crunch',
      usp: 'Real honey and wholesome oats for sustained energy throughout your day.',
      ingredients: 'Oats, Honey, Almonds, Brown Rice Syrup, Sunflower Seeds, Sea Salt',
      formUrl: 'https://forms.google.com/honey-crunch-form', // Replace with actual URL
      imagePlaceholder: 'Honey Crunch Product Image'
    },
    {
      id: 'rxbar',
      name: 'RXBAR',
      usp: 'Simple ingredients you can see and pronounce, with no added sugar.',
      ingredients: 'Egg Whites, Dates, Cashews, Almonds, Natural Flavors',
      formUrl: 'https://forms.google.com/rxbar-clif-shared-form', // Replace with actual URL
      imagePlaceholder: 'RXBAR Product Image'
    },
    {
      id: 'clif-bar',
      name: 'Clif Bar',
      usp: 'Plant-based protein and organic ingredients to fuel your adventures.',
      ingredients: 'Organic Oats, Organic Brown Rice Syrup, Soy Protein Isolate, Organic Cane Syrup, Organic Cashew Butter',
      formUrl: 'https://forms.google.com/rxbar-clif-shared-form', // Replace with actual URL
      imagePlaceholder: 'Clif Bar Product Image'
    }
  ]
};

// Application State
const state = {
  randomizedProducts: [],
  viewedCards: new Set(), // Track which cards have been viewed (60%+ visible)
  currentCardIndex: 0,
  compareScreenUnlocked: false
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

function renderCompareScreen() {
  const compareScreen = document.getElementById('compare-screen');
  const compareGrid = document.getElementById('compare-grid');

  compareGrid.innerHTML = '';

  // Use same randomized order
  state.randomizedProducts.forEach(product => {
    const miniCard = createMiniCard(product);
    compareGrid.appendChild(miniCard);
  });

  // Show compare screen, hide card deck and progress
  document.getElementById('card-deck').classList.add('hidden');
  document.getElementById('progress-indicator').classList.add('hidden');
  compareScreen.classList.remove('hidden');
}

function createMiniCard(product) {
  const miniCard = document.createElement('div');
  miniCard.className = 'mini-card';
  miniCard.setAttribute('role', 'article');
  miniCard.setAttribute('aria-label', `${product.name} summary`);

  miniCard.innerHTML = `
    <h3>${product.name}</h3>
    <p class="mini-usp">${product.usp}</p>
    <p class="mini-ingredients"><strong>Ingredients:</strong> ${product.ingredients}</p>
    <button class="select-button" data-product-id="${product.id}" aria-label="Select ${product.name}">
      Select
    </button>
  `;

  // Add click handler to Select button
  const selectButton = miniCard.querySelector('.select-button');
  selectButton.addEventListener('click', () => handleSelect(product));

  return miniCard;
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
            if (state.viewedCards.size === state.randomizedProducts.length) {
              state.compareScreenUnlocked = true;
              console.log('All cards viewed - Compare screen unlocked');
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
  const cardDeck = document.getElementById('card-deck');
  const nextIndex = currentIndex + 1;

  // If there's a next card, scroll to it
  if (nextIndex < state.randomizedProducts.length) {
    const nextCard = document.getElementById(`card-${nextIndex}`);
    nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Last card - check if compare screen should be shown
    if (state.compareScreenUnlocked) {
      renderCompareScreen();
    } else {
      // Not all cards viewed yet - alert user
      alert('Please view all energy bars before continuing. Swipe through all cards.');
    }
  }
}

function handleSelect(product) {
  console.log(`User selected: ${product.name}`);

  // Redirect to form URL in same tab
  window.location.href = product.formUrl;
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
