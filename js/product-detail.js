// DOM Elements
const productDetailsContainer = document.getElementById('product-details');
const productLoading = document.getElementById('product-loading');
const productImage = document.getElementById('product-image');
const productTitle = document.getElementById('product-title');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const productSpecs = document.getElementById('product-specs');
const productAvailability = document.getElementById('product-availability');
const availabilityText = document.getElementById('availability-text');
const productCategory = document.getElementById('product-category');
const productName = document.getElementById('product-name');
const relatedProducts = document.getElementById('related-products');
const quantityInput = document.getElementById('quantity');
const decreaseQuantityBtn = document.getElementById('decrease-quantity');
const increaseQuantityBtn = document.getElementById('increase-quantity');
const addToCartBtn = document.getElementById('add-to-cart');
const whatsappButton = document.getElementById('whatsapp-button');

// Tab elements
const docTabs = document.querySelectorAll('.doc-tab');
const tabContents = document.querySelectorAll('.tab-pane');

const apiBaseUrl = 'https://fnmalic.pythonanywhere.com/api/client/products';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Extract product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        fetchProductDetails(productId);
    } else {
        showError('No product ID found in the URL');
    }
    
    // Set up event listeners
    setupQuantityControls();
    setupTabs();
    setupThumbnails();
});

// Fetch product details from API
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${apiBaseUrl}/${productId}/`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const product = await response.json();
        displayProductDetails(product);
        // fetchRelatedProducts(product.category);
     
    } catch (error) {
        console.error('Error fetching product details:', error);
        showError('Failed to load product details. Please try again later.');
    }
}

function displayProductDetails(product) {
    // Hide loading indicator and show details
    productLoading.classList.add('hidden');
    productDetailsContainer.classList.remove('hidden');
    
    // Update breadcrumb
    productCategory.textContent = product.category || 'Uncategorized';
    productName.textContent = product.name;
    
    // Update product details
    document.title = `${product.name} - LabCraft`;
    productTitle.textContent = product.name;
    productPrice.textContent = formatPrice(product.price_with_tax);
    productDescription.textContent = product.description || 'No description available.';
    
    // Handle product images
    if (product.image_urls) {
        // Check if image_urls is an array or single string
        if (Array.isArray(product.image_urls)) {
            productImage.src = product.image_urls; // Use the first image as main
            productImage.alt = product.name;
            setupProductImages(product.image_urls);
        } else {
            // If it's a single string
            productImage.src = product.image_urls;
            productImage.alt = product.name;
            // Create an array with the single URL for thumbnails
            setupProductImages([product.image_urls]);
        }
    } else {
        productImage.src = 'https://via.placeholder.com/300x200?text=No+Image';
        productImage.alt = "No image available";
    }
    
    // Update availability status
    const isAvailable = product.available !== false && (product.quantity > 0);
    updateAvailabilityStatus(isAvailable, product.quantity);
    
    // Set up specifications
    if (product.specifications) {
        displaySpecifications(product.specifications);
    } else {
        productSpecs.innerHTML = '<p class="col-span-2 text-gray-500">No specifications available.</p>';
    }
    
    // Set up WhatsApp button with product info
    setupWhatsAppButton(product);
}

// Format price with currency symbol
function formatPrice(price) {
    if (price === undefined || price === null) return '$0.00';
    
    return `XAF ${parseFloat(price).toFixed(2)}`;
}

// Display product specifications
function displaySpecifications(specs) {
    productSpecs.innerHTML = '';
    
    // If specs is an object
    if (typeof specs === 'object' && specs !== null && !Array.isArray(specs)) {
        Object.entries(specs).forEach(([key, value]) => {
            productSpecs.innerHTML += `
                <div class="font-medium">${formatSpecKey(key)}:</div>
                <div class="text-gray-600">${value}</div>
            `;
        });
    } 
    // If specs is an array
    else if (Array.isArray(specs)) {
        specs.forEach(spec => {
            if (typeof spec === 'object' && spec !== null) {
                const key = Object.keys(spec)[0];
                const value = spec[key];
                productSpecs.innerHTML += `
                    <div class="font-medium">${formatSpecKey(key)}:</div>
                    <div class="text-gray-600">${value}</div>
                `;
            }
        });
    } 
    // If specs is a string
    else if (typeof specs === 'string') {
        productSpecs.innerHTML = `<p class="col-span-2">${specs}</p>`;
    }
}

// Format specification key for display
function formatSpecKey(key) {
    // Convert camelCase or snake_case to Title Case with spaces
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

// Update availability status
function updateAvailabilityStatus(isAvailable, quantity) {
    if (isAvailable) {
        productAvailability.className = 'text-green-600';
        productAvailability.innerHTML = `<i class="fas fa-check-circle mr-2"></i>`;
        availabilityText.textContent = `In Stock (${quantity} available)`;
        
        // Enable add to cart button
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        productAvailability.className = 'text-red-600';
        productAvailability.innerHTML = `<i class="fas fa-times-circle mr-2"></i>`;
        availabilityText.textContent = 'Out of Stock';
        
        // Disable add to cart button
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Set up quantity input controls
function setupQuantityControls() {
    decreaseQuantityBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    increaseQuantityBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
    });
    
    // Prevent manual input of invalid values
    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        
        if (isNaN(value) || value < 1) {
            quantityInput.value = 1;
        } else {
            quantityInput.value = value;
        }
    });
}

// Setup WhatsApp contact button
function setupWhatsAppButton(product) {
    const phoneNumber = '+237696787112'; // Replace with actual WhatsApp number
    const message = encodeURIComponent(`Hi, I'm interested in the ${product.name} (Item #${product.id}). Is it available?`);
    whatsappButton.href = `https://wa.me/${phoneNumber}?text=${message}`;
}

// Setup product image thumbnails
function setupProductImages(imageUrls) {
    const thumbnails = document.querySelectorAll('.thumbnail img');
    
    // Set main image
    productImage.src = imageUrls;
    
    // Set thumbnail images
    thumbnails.forEach((thumbnail, index) => {
        if (index < imageUrls.length) {
            thumbnail.src = imageUrls[index];
            thumbnail.parentElement.classList.remove('hidden');
            
            // Add click event to switch main image
            thumbnail.addEventListener('click', () => {
                productImage.src = imageUrls;
                
                // Update thumbnail borders
                document.querySelectorAll('.thumbnail').forEach(t => {
                    t.classList.remove('border-primary');
                    t.classList.add('border-transparent');
                });
                thumbnail.parentElement.classList.remove('border-transparent');
                thumbnail.parentElement.classList.add('border-primary');
            });
        } else {
            thumbnail.parentElement.classList.add('hidden');
        }
    });
}

// Setup tab functionality
function setupTabs() {
    docTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            docTabs.forEach(t => {
                t.classList.remove('border-primary', 'text-primary');
                t.classList.add('border-transparent', 'hover:text-primary', 'hover:border-primary');
            });
            
            // Add active class to clicked tab
            tab.classList.add('border-primary', 'text-primary');
            tab.classList.remove('border-transparent', 'hover:text-primary', 'hover:border-primary');
            
            // Hide all tab content
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show selected tab content
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-content`).classList.remove('hidden');
        });
    });
}

// Setup thumbnail click events
function setupThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => {
                t.classList.remove('border-primary');
                t.classList.add('border-transparent');
            });
            
            // Add active class to clicked thumbnail
            thumbnail.classList.remove('border-transparent');
            thumbnail.classList.add('border-primary');
            
            // Update main image
            const thumbnailImg = thumbnail.querySelector('img');
            productImage.src = thumbnailImg.src;
        });
    });
}

// Fetch and display related products
async function fetchRelatedProducts(category) {
    if (!category) return;
    
    try {
        const response = await fetch(`${apiBaseUrl}/recommendations/`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Filter out current product and display others
        const urlParams = new URLSearchParams(window.location.search);
        const currentProductId = urlParams.get('id');
        
        const filteredProducts = products.filter(product => 
            product.id !== parseInt(currentProductId)
        ).slice(0, 4);
        
        displayRelatedProducts(filteredProducts);
    } catch (error) {
        console.error('Error fetching related products:', error);
        relatedProducts.innerHTML = '<p class="text-gray-500">Failed to load related products.</p>';
    }
}

// Display related products
function displayRelatedProducts(products) {
    relatedProducts.innerHTML = '';
    
    if (!products || products.length === 0) {
        relatedProducts.innerHTML = '<p class="text-gray-500 col-span-full text-center">No related products found.</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300';
        
        // Handle missing image
        const imageUrl = product.image_urls?.[0] || '/api/placeholder/300/200?text=No+Image';
        
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.name}" class="w-full h-36 object-cover">
                <div class="p-4">
                    <h3 class="font-semibold text-dark mb-2 truncate">${product.name}</h3>
                    <p class="text-primary font-bold">${formatPrice(product.price)}</p>
                </div>
            </a>
        `;
        
        relatedProducts.appendChild(productCard);
    });
}
// Display error message
function showError(message) {
    productLoading.innerHTML = `
        <div class="text-center py-8">
            <p class="text-red-500">${message}</p>
            <button id="return-to-products" class="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
                Return to Products
            </button>
        </div>
    `;
    
    document.getElementById('return-to-products')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Add to cart functionality
addToCartBtn.addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const quantity = parseInt(quantityInput.value);
    
    // Get current cart or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            quantity: quantity,
            dateAdded: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show confirmation
    showAddToCartConfirmation();
});

// Show add to cart confirmation
function showAddToCartConfirmation() {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    confirmationDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <p>Product added to cart!</p>
        </div>
    `;
    
    document.body.appendChild(confirmationDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        confirmationDiv.remove();
    }, 3000);
}