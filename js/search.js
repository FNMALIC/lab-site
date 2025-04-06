// DOM Elements
const searchInput = document.getElementById('search-input');
let searchTimeout = null;
const searchResultsContainer = document.createElement('div');
searchResultsContainer.className = 'absolute z-10 bg-white w-full mt-1 rounded-lg shadow-lg max-h-80 overflow-y-auto';
searchResultsContainer.style.display = 'none';

// Initialize the search functionality
function setupSearch() {
    if (!searchInput) return;
    
    // Insert search results container after search input
    searchInput.parentNode.appendChild(searchResultsContainer);
    
    // Set up event listeners for search input
    searchInput.addEventListener('input', function() {
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout to prevent too many requests while typing
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            
            if (query.length >= 2) {
                searchProducts(query);
            } else {
                searchResultsContainer.style.display = 'none';
            }
        }, 300); // Delay of 300ms
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !searchResultsContainer.contains(event.target)) {
            searchResultsContainer.style.display = 'none';
        }
    });
    
    // Handle submit of search form
    searchInput.form?.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query.length >= 2) {
            // Redirect to products page with search query
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    });
}

// Search products based on query
async function searchProducts(query) {
    try {
        const response = await fetch(`${apiBaseUrl}?search=${encodeURIComponent(query)}&limit=5`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const products = await response.json();
        displaySearchResults(products, query);
    } catch (error) {
        console.error('Error searching products:', error);
        searchResultsContainer.innerHTML = `
            <div class="p-4 text-red-500">
                Failed to search products. Please try again.
            </div>
        `;
        searchResultsContainer.style.display = 'block';
    }
}

// Display search results
function displaySearchResults(products, query) {
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="p-4 text-gray-500">
                No products found matching "${query}".
            </div>
        `;
        searchResultsContainer.style.display = 'block';
        return;
    }
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.className = 'divide-y divide-gray-200';
    
    products.forEach(product => {
        const listItem = document.createElement('li');
        
        // Handle missing image
        const imageUrl = product.image_urls?.[0] || '/api/placeholder/60/60?text=No+Image';
        
        // Format price
        const price = product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Price unavailable';
        
        listItem.className = 'hover:bg-gray-50';
        listItem.innerHTML = `
            <a href="product.html?id=${product.id}" class="flex items-center p-3">
                <img src="${imageUrl}" alt="${product.name}" class="w-12 h-12 object-cover rounded mr-3">
                <div class="flex-1">
                    <h4 class="font-medium text-dark">${product.name}</h4>
                    <p class="text-sm text-gray-600">${product.category || 'Uncategorized'}</p>
                </div>
                <div class="text-primary font-semibold">${price}</div>
            </a>
        `;
        
        resultsList.appendChild(listItem);
    });
    
    // Add "View all results" link
    const viewAllItem = document.createElement('li');
    viewAllItem.className = 'bg-gray-50 hover:bg-gray-100';
    viewAllItem.innerHTML = `
        <a href="products.html?search=${encodeURIComponent(query)}" class="block p-3 text-center text-primary font-medium">
            View all results for "${query}"
            <i class="fas fa-arrow-right ml-1"></i>
        </a>
    `;
    
    resultsList.appendChild(viewAllItem);
    searchResultsContainer.appendChild(resultsList);
    searchResultsContainer.style.display = 'block';
}

// Export the setup function
window.setupSearch = setupSearch;