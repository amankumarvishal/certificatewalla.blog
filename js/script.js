// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Navigation active state
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Navbar scroll effect
    const header = document.querySelector('header');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Show/hide scroll to top button
        const scrollTopBtn = document.querySelector('.scroll-top');
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }
    });

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.innerHTML = '↑';
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const internshipsGrid = document.querySelector('.internships-grid');

    if (searchInput && categoryFilter && internshipsGrid) {
        // Load internships on page load
        loadInternships();

        // Add event listeners for search and filter
        searchInput.addEventListener('input', handleSearch);
        categoryFilter.addEventListener('change', handleSearch);
    }

    // Form submissions
    const internshipForm = document.getElementById('internshipForm');
    if (internshipForm) {
        internshipForm.addEventListener('submit', handleInternshipSubmit);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Load internship details if on details page
    if (currentPage === 'internship-details.html') {
        loadInternshipDetails();
    }
});

// Load internships from API
async function loadInternships() {
    const internshipsGrid = document.querySelector('.internships-grid');
    if (!internshipsGrid) return;

    try {
        const response = await fetch('/api/internships');
        if (!response.ok) throw new Error('Failed to fetch internships');
        
        const internships = await response.json();
        displayInternships(internships);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to load internships', 'error');
    }
}

// Display internships in grid
function displayInternships(internships) {
    const grid = document.querySelector('.internships-grid');
    if (!grid) return;

    grid.innerHTML = internships.map(internship => `
        <div class="internship-card" data-category="${internship.category}" data-aos="fade-up">
            <div class="card-header">
                <h3>${internship.title}</h3>
                <span class="category-tag ${internship.category}">${internship.category}</span>
            </div>
            <p class="company">${internship.company}</p>
            <p class="location">${internship.location}</p>
            <div class="card-details">
                <p>Duration: ${internship.duration} months</p>
                <p>Stipend: $${internship.stipend}/month</p>
            </div>
            <a href="internship-details.html?id=${internship.id}" class="apply-button">View Details</a>
        </div>
    `).join('');
}

// Search and filter internships
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const cards = document.querySelectorAll('.internship-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const company = card.querySelector('.company').textContent.toLowerCase();
        const location = card.querySelector('.location').textContent.toLowerCase();
        const cardCategory = card.dataset.category;
        
        const matchesSearch = title.includes(searchTerm) || 
                            company.includes(searchTerm) || 
                            location.includes(searchTerm);
        const matchesCategory = !category || cardCategory === category;

        card.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
    });
}

// Load internship details
async function loadInternshipDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const internshipId = urlParams.get('id');

    if (!internshipId) {
        showNotification('No internship ID provided', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/internships/${internshipId}`);
        if (!response.ok) throw new Error('Failed to load internship details');
        
        const data = await response.json();
        populateInternshipDetails(data);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading internship details', 'error');
    }
}

// Populate internship details
function populateInternshipDetails(data) {
    document.getElementById('internshipTitle').textContent = data.title;
    document.getElementById('companyName').textContent = data.company;
    document.getElementById('location').textContent = data.location;
    document.getElementById('duration').textContent = `${data.duration} months`;
    document.getElementById('stipend').textContent = `$${data.stipend}/month`;
    document.getElementById('startDate').textContent = new Date(data.startDate).toLocaleDateString();
    document.getElementById('description').textContent = data.description;
    
    const requirementsList = document.getElementById('requirements');
    if (requirementsList) {
        requirementsList.innerHTML = data.requirements.map(req => `<li>${req}</li>`).join('');
    }
}

// Handle internship form submission
async function handleInternshipSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    try {
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'block';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/api/internships', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to post internship');
        }

        showNotification('Internship posted successfully!', 'success');
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to post internship. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        buttonText.style.display = 'block';
        buttonLoader.style.display = 'none';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add styles for the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.backgroundColor = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db';
    notification.style.zIndex = '1000';
    notification.style.animation = 'fadeIn 0.3s ease-out';
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    .scroll-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    }

    .scroll-top.show {
        opacity: 1;
        visibility: visible;
    }

    .scroll-top:hover {
        background-color: var(--primary-dark);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Form submission handling
const internshipForm = document.querySelector('.internship-form');
if (internshipForm) {
    const submitButton = internshipForm.querySelector('.submit-button');
    const buttonLoader = submitButton.querySelector('.button-loader');
    const notification = document.querySelector('.notification');

    internshipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        buttonLoader.style.display = 'block';
        submitButton.querySelector('span').textContent = 'Submitting...';

        try {
            const formData = new FormData(internshipForm);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/internships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to submit internship');
            }

            // Show success notification
            notification.textContent = 'Internship posted successfully!';
            notification.className = 'notification success';
            notification.style.display = 'block';

            // Reset form
            internshipForm.reset();

            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);

        } catch (error) {
            // Show error notification
            notification.textContent = 'Failed to post internship. Please try again.';
            notification.className = 'notification error';
            notification.style.display = 'block';

            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);

        } finally {
            // Reset button state
            submitButton.disabled = false;
            buttonLoader.style.display = 'none';
            submitButton.querySelector('span').textContent = 'Post Internship';
        }
    });

    // Form field focus effects
    const formGroups = internshipForm.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        input.addEventListener('focus', () => {
            group.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            group.classList.remove('focused');
        });
    });
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Message sent successfully!', 'success');
            e.target.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        showNotification('Error sending message. Please try again.', 'error');
        console.error('Error:', error);
    }
} 