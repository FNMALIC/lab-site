const CACHE_DURATION_MINUTES = 5; // How long to keep products in cache
const productCache = {
  data: {},
  timestamp: {},
  isCacheValid: function(key) {
    if (!this.timestamp[key]) return false;
    
    const now = new Date().getTime();
    const cacheTime = this.timestamp[key];
    const diffMinutes = (now - cacheTime) / (1000 * 60);
    
    return diffMinutes < CACHE_DURATION_MINUTES;
  },
  set: function(key, data) {
    this.data[key] = data;
    this.timestamp[key] = new Date().getTime();
  },
  get: function(key) {
    return this.data[key];
  },
  clear: function() {
    this.data = {};
    this.timestamp = {};
  }
};

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoryButtons = document.querySelectorAll('.category');
let currentCategory = 'all';
let currentPage = 1;
const apiBaseUrl = 'https://fnmalic.pythonanywhere.com/api/client/products/';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(currentPage);
    setupCategoryFilters();
    setupPagination();
});

// Fetch products from API
async function fetchProducts(page = 1, category = 'all') {
    try {
        const cacheKey = `products_page${page}`;
        
        // Check if we have valid cached data
        if (productCache.isCacheValid(cacheKey)) {
            console.log('Using cached products data');
            const products = productCache.get(cacheKey);
            displayProducts(products, category);
            return products;
        }
        
        // If no cache or expired, fetch from API
        console.log('Fetching fresh products data from API');
        const url = `${apiBaseUrl}?page=${page}`;
        const response = await fetch(url);
        const products = await response.json();

        // Store in cache
        productCache.set(cacheKey, products);
        
        displayProducts(products, category);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-red-500">Failed to load products. Please try again later.</p>
            </div>
        `;
        return [];
    }
}


// Display products based on current category
function displayProducts(products, category = 'all') {
    // Clear the products grid
    productsGrid.innerHTML = '';

    // Filter products by category if needed
    let productsToDisplay = products;
    if (category !== 'all') {
        productsToDisplay = products.filter(product =>
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Show message if no products in category
    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No products found in this category.</p>
            </div>
        `;
        return;
    }

    // Generate HTML for each product
    productsToDisplay.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create HTML for a product card
function createProductCard(product) {
    const productElement = document.createElement('div');
    productElement.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300';

    // Handle missing image
    const imageUrl = product.image_urls || 'https://via.placeholder.com/300x200?text=No+Image';

    productElement.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
        <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">${product.description || 'No description available'}</p>
            <div class="flex justify-between items-center">
                <span class="text-orange-600 font-bold">${formatPrice(product.price_with_tax)}</span>
                <a href="product.html?id=${product.id}" class="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition duration-300">
                    View Details
                </a>
            </div>
            <div class="text-sm text-gray-500 mt-2">
                ${product.available ?
        `<span class="text-green-500">In Stock (${product.quantity})</span>` :
        '<span class="text-red-500">Out of Stock</span>'}
            </div>
        </div>
    `;

    return productElement;
}

// Format price properly
function formatPrice(price) {
    // Convert to number, handle possible string input
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Price unavailable';

    // Format with 2 decimal places
    return `$${numPrice.toFixed(2)}`;
}

// Set up category filter buttons
function setupCategoryFilters() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the category from the data attribute
            const category = button.dataset.category;
            currentCategory = category;
            currentPage = 1; // Reset to first page when changing categories

            // Update active state
            categoryButtons.forEach(btn => {
                btn.classList.remove('ring-2', 'ring-orange-500');
            });
            button.classList.add('ring-2', 'ring-orange-500');

            // Fetch products with the selected category
            fetchProducts(currentPage, category);
            updatePaginationUI(currentPage);
        });
    });

    // Set "All Products" as active by default
    document.querySelector('[data-category="all"]').classList.add('ring-2', 'ring-orange-500');
}

// Set up pagination
function setupPagination() {
    // Create pagination container if it doesn't exist
    let paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'flex justify-center mt-8 space-x-2';
        productsGrid.parentNode.insertBefore(paginationContainer, productsGrid.nextSibling);
    }

    // Initial pagination UI
    updatePaginationUI(currentPage);
}

// Update pagination UI
function updatePaginationUI(currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    // Previous page button
    const prevButton = document.createElement('button');
    prevButton.className = `px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchProducts(currentPage, currentCategory);
            updatePaginationUI(currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers
    // For simplicity, show at most 5 pages
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(currentPage + 2, 10); i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchProducts(currentPage, currentCategory);
            updatePaginationUI(currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Next page button
    const nextButton = document.createElement('button');
    nextButton.className = 'px-4 py-2 rounded bg-orange-100 text-orange-600 hover:bg-orange-200';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', () => {
        currentPage++;
        fetchProducts(currentPage, currentCategory);
        updatePaginationUI(currentPage);
    });
    paginationContainer.appendChild(nextButton);
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const searchTerm = searchInput.value.trim().toLowerCase();
                searchProducts(searchTerm);
            }
        });

        // Search button click
        const searchButton = searchInput.nextElementSibling;
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const searchTerm = searchInput.value.trim().toLowerCase();
                searchProducts(searchTerm);
            });
        }
    }
}

// Search products
async function searchProducts(searchTerm) {
    if (!searchTerm) {
        // If search is empty, reset to first page with all products
        currentPage = 1;
        currentCategory = 'all';
        fetchProducts(currentPage);
        
        // Show pagination again
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }
        return;
    }

    try {
        const cacheKey = 'products_page1';
        let products;
        
        // Check if we have valid cached data for page 1
        if (productCache.isCacheValid(cacheKey)) {
            console.log('Using cached products data for search');
            products = productCache.get(cacheKey);
        } else {
            // If no cache or expired, fetch from API
            console.log('Fetching fresh products data for search');
            products = await fetchProducts(1); // Fetch page 1
        }

        // Filter products by search term
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );

        // Display filtered products
        displayProducts(filteredProducts, 'all');

        // Update UI to show we're in search mode
        document.querySelectorAll('.category').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-orange-500');
        });

        // Hide pagination during search
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }

    } catch (error) {
        console.error('Error searching products:', error);
    }
}

// Function to force refresh cache
function refreshProductCache() {
    productCache.clear();
    fetchProducts(currentPage, currentCategory);
}

// Function to get URL parameters (for product detail page)
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', setupSearch);