// DOM Elements
const productTitle = document.getElementById('product-title');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const productCategory = document.getElementById('product-category');
const productImage = document.getElementById('product-image');
const whatsappButton = document.getElementById('whatsapp-button');
const relatedProductsContainer = document.getElementById('related-products');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const productId = parseInt(getUrlParameter('id'));

    if (isNaN(productId)) {
        // Handle invalid product ID
        displayError('Product not found');
        return;
    }

    // Find the product by ID
    const product = products.find(p => p.id === productId);

    if (!product) {
        // Handle product not found
        displayError('Product not found');
        return;
    }

    // Display product details
    displayProductDetails(product);

    // Display related products
    displayRelatedProducts(product);

    // Set up WhatsApp button
    setupWhatsappButton(product);
});

// Display product details
function displayProductDetails(product) {
    document.title = `${product.name} - OrangeCart`;
    productTitle.textContent = product.name;
    productPrice.textContent = `$${product.price.toFixed(2)}`;
    productDescription.textContent = product.description;
    productImage.src = product.image;
    productImage.alt = product.name;

    // Update category in breadcrumb
    const categoryName = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    productCategory.textContent = categoryName;
}

// Display error message
function displayError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="text-center py-16">
            <h2 class="text-2xl font-bold text-red-500 mb-4">${message}</h2>
            <p class="mb-6">The product you're looking for could not be found.</p>
            <a href="index.html" class="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300">
                Return to Home
            </a>
        </div>
    `;
}

// Display related products (same category)
function displayRelatedProducts(currentProduct) {
    // Find products in the same category, excluding the current product
    const related = products.filter(p =>
        p.category === currentProduct.category && p.id !== currentProduct.id
    );

    // Limit to 4 related products
    const relatedToShow = related.slice(0, 4);

    if (relatedToShow.length === 0) {
        relatedProductsContainer.innerHTML = '<p class="col-span-full text-center text-gray-600">No related products found.</p>';
        return;
    }

    // Clear container
    relatedProductsContainer.innerHTML = '';

    // Add each related product
    relatedToShow.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300';

        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-orange-600 font-bold">$${product.price.toFixed(2)}</span>
                    <a href="product.html?id=${product.id}" class="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition duration-300">
                        View Details
                    </a>
                </div>
            </div>
        `;

        relatedProductsContainer.appendChild(productElement);
    });
}

// Set up WhatsApp button
function setupWhatsappButton(product) {
    // Replace with your actual WhatsApp number
    const whatsappNumber = '1234567890';

    // Create WhatsApp message
    const message = `Hi, I'm interested in ${product.name} (Item #${product.id}) priced at $${product.price.toFixed(2)}. Can you provide more information?`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Set WhatsApp link
    whatsappButton.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

// Function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}