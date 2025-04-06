// Set up pagination
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    // Function to create pagination elements
    async function createPagination() {
        try {
            // Fetch total count of products from API
            const response = await fetch(`${apiBaseUrl}count/`);
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            const totalProducts = data.count || 0;
            const productsPerPage = 12; // Matches the limit in fetchProducts
            const totalPages = Math.ceil(totalProducts / productsPerPage);
            
            if (totalPages <= 1) {
                paginationContainer.innerHTML = '';
                return;
            }
            
            // Create pagination UI
            paginationContainer.innerHTML = '';
            const paginationList = document.createElement('ul');
            paginationList.className = 'flex justify-center space-x-2';
            
            // Previous button
            const prevButton = document.createElement('li');
            prevButton.innerHTML = `
                <button class="px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-primary hover:bg-primary-light'}" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
            
            if (currentPage > 1) {
                prevButton.querySelector('button').addEventListener('click', () => {
                    currentPage--;
                    fetchProducts(currentPage, currentCategory);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    createPagination();
                });
            }
            
            paginationList.appendChild(prevButton);
            
            // Page numbers
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Adjust startPage if we're near the end
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // First page button if not visible
            if (startPage > 1) {
                const firstPageButton = document.createElement('li');
                firstPageButton.innerHTML = `
                    <button class="px-3 py-1 rounded-md bg-white border border-gray-300 text-primary hover:bg-primary-light">
                        1
                    </button>
                `;
                
                firstPageButton.querySelector('button').addEventListener('click', () => {
                    currentPage = 1;
                    fetchProducts(currentPage, currentCategory);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    createPagination();
                });
                
                paginationList.appendChild(firstPageButton);
                
                // Add ellipsis if there's a gap
                if (startPage > 2) {
                    const ellipsis = document.createElement('li');
                    ellipsis.innerHTML = `
                        <span class="px-3 py-1">...</span>
                    `;
                    paginationList.appendChild(ellipsis);
                }
            }
            
            // Page number buttons
            for (let i = startPage; i <= endPage; i++) {
                const pageButton = document.createElement('li');
                pageButton.innerHTML = `
                    <button class="px-3 py-1 rounded-md ${i === currentPage ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-primary hover:bg-primary-light'}">
                        ${i}
                    </button>
                `;
                
                if (i !== currentPage) {
                    pageButton.querySelector('button').addEventListener('click', () => {
                        currentPage = i;
                        fetchProducts(currentPage, currentCategory);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        createPagination();
                    });
                }
                
                paginationList.appendChild(pageButton);
            }
            
            // Last page button if not visible
            if (endPage < totalPages) {
                // Add ellipsis if there's a gap
                if (endPage < totalPages - 1) {
                    const ellipsis = document.createElement('li');
                    ellipsis.innerHTML = `
                        <span class="px-3 py-1">...</span>
                    `;
                    paginationList.appendChild(ellipsis);
                }
                
                const lastPageButton = document.createElement('li');
                lastPageButton.innerHTML = `
                    <button class="px-3 py-1 rounded-md bg-white border border-gray-300 text-primary hover:bg-primary-light">
                        ${totalPages}
                    </button>
                `;
                
                lastPageButton.querySelector('button').addEventListener('click', () => {
                    currentPage = totalPages;
                    fetchProducts(currentPage, currentCategory);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    createPagination();
                });
                
                paginationList.appendChild(lastPageButton);
            }
            
            // Next button
            const nextButton = document.createElement('li');
            nextButton.innerHTML = `
                <button class="px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-primary hover:bg-primary-light'}" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
            
            if (currentPage < totalPages) {
                nextButton.querySelector('button').addEventListener('click', () => {
                    currentPage++;
                    fetchProducts(currentPage, currentCategory);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    createPagination();
                });
            }
            
            paginationList.appendChild(nextButton);
            paginationContainer.appendChild(paginationList);
            
        } catch (error) {
            console.error('Error setting up pagination:', error);
            paginationContainer.innerHTML = '';
        }
    }
    
    // Initialize pagination
    createPagination();
    
    // Set up category buttons if they exist
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Update active class
            categoryButtons.forEach(btn => btn.classList.remove('bg-primary', 'text-white'));
            button.classList.add('bg-primary', 'text-white');
            
            // Reset to first page when changing category
            currentPage = 1;
            currentCategory = category;
            
            // Fetch products with new category
            fetchProducts(currentPage, currentCategory);
            
            // Update pagination
            createPagination();
        });
    });
}
function createProductCard(product) {
    const productElement = document.createElement('div');
    productElement.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col';

    // Handle missing image
    const imageUrl = product.image_urls?.[0] || '/api/placeholder/300/200?text=No+Image';

    // Format availability status
    const isAvailable = product.available !== false && product.quantity > 0;
    const availabilityClass = isAvailable ? 'text-green-500' : 'text-red-500';
    const availabilityIcon = isAvailable ? 'fa-check-circle' : 'fa-times-circle';
    const availabilityText = isAvailable ? 
        `In Stock (${product.quantity})` : 
        'Out of Stock';
    
    // Format price
    const price = product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Price unavailable';

    productElement.innerHTML = `
        <div class="relative">
            <a href="product.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                ${product.is_new ? '<span class="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">NEW</span>' : ''}
            </a>
        </div>
        <div class="p-4 flex-1 flex flex-col">
            <a href="product.html?id=${product.id}" class="block">
                <h3 class="text-lg font-medium text-dark mb-2 hover:text-primary transition duration-300">${product.name}</h3>
            </a>
            <p class="text-gray-600 text-sm mb-4 flex-1">${product.short_description || ''}</p>
            <div class="flex justify-between items-center">
                <span class="text-primary font-bold">${price}</span>
                <span class="${availabilityClass}">
                    <i class="fas ${availabilityIcon} mr-1"></i>
                    ${availabilityText}
                </span>
            </div>
            <button class="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition duration-300">
                Add to Cart
            </button>
        </div>
    `;

    return productElement;
}