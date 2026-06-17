// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Smooth scrolling for anchor links
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

const quoteItems = new Map();
const quoteList = document.querySelector('#quoteList');
const quoteEmpty = document.querySelector('#quoteEmpty');
const quoteCount = document.querySelector('#quoteCount');
const quoteTotal = document.querySelector('#quoteTotal');
const contactForm = document.querySelector('#contactForm');
const orderNumberInput = document.querySelector('#orderNumberInput');

const quoteTotalPrice = document.querySelector('#quoteTotalPrice');
const quoteSummaryInput = document.querySelector('#quoteSummaryInput');
const messageInput = document.querySelector('#message');
const quoteContactBtn = document.querySelector('#quoteContactBtn');
const quoteClearBtn = document.querySelector('#quoteClearBtn');
const whatsappQuoteLink = document.querySelector('#whatsappQuoteLink');
const whatsappBaseUrl = 'https://wa.me/4915563826835';

function formatPrice(value) {
    return `${value.toLocaleString('de-DE')}€`;
}

function buildQuoteSummary() {
    if (quoteItems.size === 0) {
        return '';
    }

    const lines = Array.from(quoteItems.values()).map((item) => {
        const subtotal = item.price * item.quantity;
        return `- ${item.name}: ${item.quantity} x ${formatPrice(item.price)}/Tag = ${formatPrice(subtotal)}/Tag`;
    });
    const total = Array.from(quoteItems.values()).reduce((sum, item) => sum + item.price * item.quantity, 0);

    return `Ausgewählte Artikel:\n${lines.join('\n')}\nGesamtpreis pro Tag: ${formatPrice(total)}`;
}

function updateQuoteTargets() {
    const summary = buildQuoteSummary();

    if (quoteSummaryInput) {
        quoteSummaryInput.value = summary;
    }

    if (whatsappQuoteLink) {
        const text = summary
            ? `Hallo, ich möchte ein Angebot für folgende Artikel anfragen:\n\n${summary}`
            : 'Hallo, ich möchte ein Angebot für Eventequipment anfragen.';
        whatsappQuoteLink.href = `${whatsappBaseUrl}?text=${encodeURIComponent(text)}`;
    }
}

function renderQuote() {
    if (!quoteList || !quoteEmpty || !quoteCount || !quoteTotal || !quoteTotalPrice) {
        return;
    }

    quoteList.innerHTML = '';

    const items = Array.from(quoteItems.values());
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    quoteCount.textContent = totalQuantity === 1 ? '1 Artikel' : `${totalQuantity} Artikel`;
    quoteEmpty.hidden = items.length > 0;
    quoteTotal.hidden = items.length === 0;
    quoteTotalPrice.textContent = formatPrice(totalPrice);

    items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'quote-item';
        row.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <span>${formatPrice(item.price)}/Tag · ${formatPrice(item.price * item.quantity)}/Tag</span>
            </div>
            <div class="quote-item-actions">
                <div class="quote-quantity" aria-label="Menge für ${item.name}">
                    <button type="button" data-action="decrease" data-name="${item.name}" aria-label="Menge reduzieren">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-action="increase" data-name="${item.name}" aria-label="Menge erhöhen">+</button>
                </div>
                <button type="button" class="quote-remove-btn" data-action="remove" data-name="${item.name}">Entfernen</button>
            </div>
        `;
        quoteList.appendChild(row);
    });

    updateQuoteTargets();
}

document.querySelectorAll('.quote-add-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const card = button.closest('.product-card');
        if (!card) {
            return;
        }

        const name = card.dataset.productName;
        const price = Number(card.dataset.productPrice);
        const currentQuantity = quoteItems.get(name)?.quantity || 1;
        const requestedQuantity = window.prompt(`Wie viele "${name}" möchten Sie hinzufügen?`, currentQuantity);

        if (requestedQuantity === null) {
            return;
        }

        const quantity = Number.parseInt(requestedQuantity, 10);
        if (!Number.isInteger(quantity) || quantity < 1) {
            window.alert('Bitte geben Sie eine gültige Menge ein.');
            return;
        }

        quoteItems.set(name, { name, price, quantity });
        renderQuote();
    });
});

if (quoteList) {
    quoteList.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }

        const item = quoteItems.get(button.dataset.name);
        if (!item) {
            return;
        }

        if (button.dataset.action === 'increase') {
            item.quantity += 1;
        }

        if (button.dataset.action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity < 1) {
                quoteItems.delete(item.name);
            }
        }

        if (button.dataset.action === 'remove') {
            quoteItems.delete(item.name);
        }

        renderQuote();
    });
}

if (quoteClearBtn) {
    quoteClearBtn.addEventListener('click', () => {
        quoteItems.clear();
        renderQuote();
    });
}

if (quoteContactBtn) {
    quoteContactBtn.addEventListener('click', () => {
        const summary = buildQuoteSummary();
        const requestNumber = orderNumberInput?.value || generateRequestNumber();

        if (summary && messageInput && messageInput.value.trim() === '') {
            messageInput.value = 
            `Hallo, ich möchte ein Angebot anfragen.\n\n` +
            `Anfragenummer: ${requestNumber}\n\n` +
            `${summary}`;
        }
    });
}

function generateRequestNumber() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replaceAll('-', '');
    const random = Math.floor(100000 + Math.random() * 900000);

    return `D2D-${date}-${random}`;
}

if (contactForm && orderNumberInput) {
    contactForm.addEventListener('submit', () => {
        orderNumberInput.value = generateRequestNumber();
    });
}

renderQuote();
