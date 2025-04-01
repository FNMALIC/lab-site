// DOM Elements
const searchInput = document.getElementById('search-input');

// Set up search functionality
document.addEventListener('DOMContentLoaded', () => {
    searchInput.addEventListener('input', handleSearch);
});

// Handle search input
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        // If search is empty, show products from current category
        displayProducts(currentCategory);
        return;
    }

    // Filter products by search term
    let filteredProducts = products;

    // Apply category filter if not "all"
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
    }

    // Then apply search filter
    filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );

    // Clear the products grid
    productsGrid.innerHTML = '';

    // Display filtered products
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-lg text-gray-600">No products found matching "${searchInput.value}"</p>
            </div>
        `;
    } else {
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }
}

// Add a function to clear search
function clearSearch() {
    searchInput.value = '';
    displayProducts(currentCategory);
}