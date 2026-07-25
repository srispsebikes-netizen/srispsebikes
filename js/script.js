// ===== Load Data from Admin Panel =====
let allProducts = [];

function renderProductCard(p) {
    const defaultImage = p.image || '';
    const firstAvailColor = (p.colors||[]).find(c => c.available !== 'no' && c.image);
    const mainImage = firstAvailColor ? firstAvailColor.image : defaultImage;
    const allSoldOut = (p.colors||[]).length > 0 && p.colors.every(c => c.available === 'no');
    const defaultColor = (p.colors||[]).find(c => c.available !== 'no');
    return `
        <div class="product-card" data-selected-color="${defaultColor ? defaultColor.name : ''}">
            <div class="product-image">
                <img class="product-main-img" src="${mainImage}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover;transition:all 0.3s;">
                ${!mainImage ? '<div class="scooter-placeholder-card"><i class="fas fa-motorcycle"></i></div>' : ''}
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                ${allSoldOut ? '<span class="product-badge" style="background:var(--danger);right:auto;left:10px;"><i class="fas fa-times-circle"></i> Sold Out</span>' : ''}
            </div>
            <div class="product-info">
                <h4>${p.name}</h4>
                <p class="product-desc">${p.desc || ''}</p>
                <div class="product-specs">
                    ${p.batteryCapacity ? `<div class="spec-row"><i class="fas fa-battery-full"></i><span class="spec-label">Battery</span><span class="spec-value">${p.batteryCapacity}</span></div>` : ''}
                    ${p.batteryType ? `<div class="spec-row"><i class="fas fa-car-battery"></i><span class="spec-label">Type</span><span class="spec-value">${p.batteryType}</span></div>` : ''}
                    <div class="spec-row"><i class="fas fa-tachometer-alt"></i><span class="spec-label">Speed</span><span class="spec-value">${p.speed} km/h</span></div>
                    <div class="spec-row"><i class="fas fa-road"></i><span class="spec-label">Mileage</span><span class="spec-value">${p.range} km</span></div>
                    ${p.chargeTime ? `<div class="spec-row"><i class="fas fa-charging-station"></i><span class="spec-label">Charge</span><span class="spec-value">${p.chargeTime} hrs</span></div>` : ''}
                </div>
                ${p.colors && p.colors.length ? `
                <div class="color-variants" style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;">
                    ${p.colors.map((c, ci) => `<button type="button" class="color-variant-btn ${c.available!=='no'?'active':''}" data-img="${c.image||''}" data-name="${c.name}" onclick="selectColorVariant(this)" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:50px;border:1px solid ${c.available==='no'?'var(--danger)':'var(--glass-border)'};background:${c.available==='no'?'rgba(255,0,0,0.1)':'var(--glass)'};font-size:11px;cursor:${c.available==='no'?'not-allowed':'pointer'};opacity:${c.available==='no'?'0.5':'1'};transition:all 0.3s;"><span style="width:12px;height:12px;border-radius:50%;background:${c.hex};border:1px solid rgba(255,255,255,0.25);"></span>${c.name} <span style="font-size:9px;color:${c.available==='no'?'var(--danger)':'var(--primary)'};">${c.available==='no'?'Out':'In'}</span></button>`).join('')}
                </div>` : ''}
                <div class="product-price">
                    <span class="price">₹${p.price.toLocaleString()}*</span>
                </div>
                ${allSoldOut ? `<button class="btn btn-disabled btn-sm book-action-btn" disabled data-model="${p.name}">Sold Out</button>` : `<button class="btn btn-primary btn-sm book-action-btn book-now-btn" data-model="${p.name}">Book Now</button>`}
            </div>
        </div>`;
}

window.selectColorVariant = function(btn) {
    const card = btn.closest('.product-card');
    const img = card.querySelector('.product-main-img');
    const newSrc = btn.dataset.img;
    if (btn.style.cursor === 'not-allowed') return;
    if (newSrc) {
        img.style.opacity = '0.5';
        setTimeout(() => {
            img.src = newSrc;
            img.style.opacity = '1';
        }, 150);
    }
    card.querySelectorAll('.color-variant-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    card.dataset.selectedColor = btn.dataset.name;
    const actionBtn = card.querySelector('.book-action-btn');
    if (actionBtn) {
        const isSoldOut = btn.style.cursor === 'not-allowed';
        if (isSoldOut) {
            actionBtn.className = 'btn btn-disabled btn-sm book-action-btn';
            actionBtn.disabled = true;
            actionBtn.textContent = 'Sold Out';
        } else {
            actionBtn.className = 'btn btn-primary btn-sm book-action-btn book-now-btn';
            actionBtn.disabled = false;
            actionBtn.textContent = 'Book Now';
        }
    }
};

function renderProducts(filterColour) {
    const highSpeedGrid = document.getElementById('highSpeedProducts');
    const comfortSpeedGrid = document.getElementById('comfortSpeedProducts');
    const filtered = filterColour ? allProducts.filter(p => (p.colors||[]).some(c => c.name === filterColour)) : allProducts;
    const highSpeed = filtered.filter(p => p.category === 'high-speed');
    const comfortSpeed = filtered.filter(p => p.category === 'comfort-speed');
    highSpeedGrid.innerHTML = highSpeed.map(renderProductCard).join('');
    comfortSpeedGrid.innerHTML = comfortSpeed.map(renderProductCard).join('');
    document.getElementById('highSpeedCategory').style.display = highSpeed.length === 0 ? 'none' : '';
    document.getElementById('comfortSpeedCategory').style.display = comfortSpeed.length === 0 ? 'none' : '';
    document.querySelectorAll('.book-now-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const selectedColor = card.dataset.selectedColor || '';
            const product = allProducts.find(p => p.name === this.dataset.model);
            if (product && selectedColor) {
                const colorObj = product.colors.find(c => c.name === selectedColor);
                if (colorObj && colorObj.available === 'no') {
                    alert('This color is currently sold out. Please select an available color.');
                    return;
                }
            }
            openBookModal(this.dataset.model, selectedColor);
        });
    });
}

function loadAdminData() {
    const contact = JSON.parse(localStorage.getItem('gaura_contact') || '{}');

    let products = JSON.parse(localStorage.getItem('gaura_products') || '[]');
    products = products.map(p => {
        if (!p.colors && p.color) {
            p.colors = [{ hex: p.color, name: p.colorName || 'Default' }];
            delete p.color; delete p.colorName;
        }
        if (!p.colors) p.colors = [];
        return p;
    });
    allProducts = products;
    renderProducts(null);

    // Update model dropdown in contact form
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.innerHTML = '<option value="">Select Model</option>' +
            products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    }

    // Update model dropdown in booking modal
    const bookModelSelect = document.getElementById('bookModelSelect');
    if (bookModelSelect) {
        bookModelSelect.innerHTML = '<option value="">Select Model</option>' +
            products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    }

    // Load Features
    const features = JSON.parse(localStorage.getItem('gaura_features') || '[]');
    const featuresGrid = document.getElementById('featuresGrid');
    if (featuresGrid) {
        if (features.length > 0) {
            featuresGrid.innerHTML = features.map(f => {
                const iconHtml = f.iconImage
                    ? `<img src="${f.iconImage}" alt="${f.title}" style="width:48px;height:48px;object-fit:contain;">`
                    : `<i class="${f.icon}"></i>`;
                return `
                <div class="feature-card">
                    <div class="feature-icon">
                        ${iconHtml}
                    </div>
                    <h4>${f.title}</h4>
                    <p>${f.desc}</p>
                </div>`;
            }).join('');
        } else {
            featuresGrid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">No features added yet.</p>';
        }
    }

    // Load Gallery
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        const images = JSON.parse(localStorage.getItem('gaura_images') || '[]');
        const gallerySection = document.getElementById('gallery');
        if (images.length > 0) {
            galleryGrid.innerHTML = images.map((img, i) => `
                <div class="gallery-item" onclick="openGalleryLightbox(${i})">
                    <img src="${img.data}" alt="${img.name || 'Gallery image'}" loading="lazy">
                    <div class="gallery-overlay">
                        <span class="gallery-name">${img.name || ''}</span>
                        <span class="gallery-type">${img.type || ''}</span>
                    </div>
                </div>
            `).join('');
        } else {
            if (gallerySection) gallerySection.style.display = 'none';
        }
    }

    // Gallery Lightbox
    window._galleryImages = JSON.parse(localStorage.getItem('gaura_images') || '[]');
    window._galleryIndex = 0;
    window.openGalleryLightbox = function(index) {
        const imgs = window._galleryImages;
        if (!imgs.length) return;
        window._galleryIndex = index;
        const img = imgs[index];
        let lightbox = document.getElementById('galleryLightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'galleryLightbox';
            lightbox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;';
            lightbox.innerHTML = `
                <button onclick="closeGalleryLightbox()" style="position:absolute;top:20px;right:20px;background:none;border:none;color:#fff;font-size:32px;cursor:pointer;z-index:10001;">&times;</button>
                <button onclick="galleryPrev()" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:40px;cursor:pointer;">&#10094;</button>
                <img id="lightboxImg" src="" style="max-width:90%;max-height:80vh;border-radius:12px;object-fit:contain;">
                <p id="lightboxCaption" style="color:#ccc;margin-top:12px;font-size:14px;"></p>
                <button onclick="galleryNext()" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:40px;cursor:pointer;">&#10095;</button>
            `;
            document.body.appendChild(lightbox);
            lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeGalleryLightbox(); });
        }
        updateLightbox();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    function updateLightbox() {
        const img = window._galleryImages[window._galleryIndex];
        document.getElementById('lightboxImg').src = img.data;
        document.getElementById('lightboxCaption').textContent = (img.name || '') + (img.type ? ' — ' + img.type : '') + ` (${window._galleryIndex + 1}/${window._galleryImages.length})`;
    }
    window.closeGalleryLightbox = function() {
        const lb = document.getElementById('galleryLightbox');
        if (lb) lb.style.display = 'none';
        document.body.style.overflow = '';
    };
    window.galleryPrev = function() { window._galleryIndex = (window._galleryIndex - 1 + window._galleryImages.length) % window._galleryImages.length; updateLightbox(); };
    window.galleryNext = function() { window._galleryIndex = (window._galleryIndex + 1) % window._galleryImages.length; updateLightbox(); };

    // Gallery keyboard nav
    document.addEventListener('keydown', function(e) {
        const lb = document.getElementById('galleryLightbox');
        if (!lb || lb.style.display !== 'flex') return;
        if (e.key === 'ArrowLeft') window.galleryPrev();
        else if (e.key === 'ArrowRight') window.galleryNext();
        else if (e.key === 'Escape') window.closeGalleryLightbox();
    });

    // WhatsApp Button
    if (contact.whatsapp) {
        const whatsappNum = contact.whatsapp.replace(/[^0-9]/g, '');
        const whatsappBtn = document.getElementById('whatsappBtn');
        if (whatsappBtn) whatsappBtn.href = `https://wa.me/${whatsappNum}`;
    }

    // Phone Button
    if (contact.phone) {
        const phoneNum = contact.phone.replace(/[^0-9+]/g, '');
        const phoneBtn = document.getElementById('phoneBtn');
        if (phoneBtn) phoneBtn.href = `tel:${phoneNum}`;
    }

    // Contact Section
    const contactPhoneLink = document.getElementById('contactPhoneLink');
    const contactWhatsAppLink = document.getElementById('contactWhatsAppLink');
    const contactEmailLink = document.getElementById('contactEmailLink');
    const contactAddressText = document.getElementById('contactAddressText');

    if (contactPhoneLink && contact.phone) {
        const phoneNum = contact.phone.replace(/[^0-9+]/g, '');
        contactPhoneLink.href = `tel:${phoneNum}`;
        contactPhoneLink.textContent = contact.phone;
    }
    if (contactWhatsAppLink && contact.whatsapp) {
        const whatsappNum = contact.whatsapp.replace(/[^0-9]/g, '');
        contactWhatsAppLink.href = `https://wa.me/${whatsappNum}`;
        contactWhatsAppLink.textContent = contact.whatsapp;
    }
    if (contactEmailLink && contact.email) {
        contactEmailLink.href = `mailto:${contact.email}`;
        contactEmailLink.textContent = contact.email;
    }
    if (contactAddressText && contact.address) {
        contactAddressText.textContent = contact.address;
    }

    // Footer Contact
    const footerPhone = document.getElementById('footerPhone');
    const footerWhatsApp = document.getElementById('footerWhatsApp');
    const footerEmail = document.getElementById('footerEmail');
    const footerAddress = document.getElementById('footerAddress');

    if (footerPhone && contact.phone) {
        const phoneNum = contact.phone.replace(/[^0-9+]/g, '');
        footerPhone.href = `tel:${phoneNum}`;
        footerPhone.textContent = contact.phone;
    }
    if (footerWhatsApp && contact.whatsapp) {
        const whatsappNum = contact.whatsapp.replace(/[^0-9]/g, '');
        footerWhatsApp.href = `https://wa.me/${whatsappNum}`;
        footerWhatsApp.textContent = contact.whatsapp;
    }
    if (footerEmail && contact.email) {
        footerEmail.href = `mailto:${contact.email}`;
        footerEmail.textContent = contact.email;
    }
    if (footerAddress && contact.address) {
        footerAddress.textContent = contact.address;
    }

    // Social Links
    const socialFacebook = document.getElementById('socialFacebook');
    const socialInstagram = document.getElementById('socialInstagram');
    const socialYoutube = document.getElementById('socialYoutube');
    const socialWhatsapp = document.getElementById('socialWhatsapp');

    if (socialFacebook && contact.facebook) socialFacebook.href = contact.facebook;
    if (socialInstagram && contact.instagram) socialInstagram.href = contact.instagram;
    if (socialYoutube && contact.youtube) socialYoutube.href = contact.youtube;
    if (socialWhatsapp && contact.whatsapp) {
        const whatsappNum = contact.whatsapp.replace(/[^0-9]/g, '');
        socialWhatsapp.href = `https://wa.me/${whatsappNum}`;
    }

    // Find A Store (Google Maps)
    const findStoreBtn = document.getElementById('findStoreBtn');
    if (findStoreBtn && contact.googleMaps) {
        findStoreBtn.href = contact.googleMaps;
    }

    // Google Reviews CTA
    const googleReviewCta = document.getElementById('googleReviewCta');
    const googleReviewLink = document.getElementById('googleReviewLink');
    if (googleReviewCta && googleReviewLink && contact.googleReview) {
        googleReviewLink.href = contact.googleReview;
        googleReviewCta.style.display = 'flex';
    }

    // Load Theme
    const theme = localStorage.getItem('gaura_theme');
    const customColors = JSON.parse(localStorage.getItem('gaura_customColors') || '{}');

    if (theme === 'custom' && customColors.primary) {
        document.documentElement.style.setProperty('--primary', customColors.primary);
    }

    // Load Settings
    const settings = JSON.parse(localStorage.getItem('gaura_settings') || '{}');
    if (settings.title) document.title = settings.title;
    if (settings.metaDesc) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = settings.metaDesc;
    }

    // Apply Logo Image (home page header) - shows alongside company name
    const siteLogoImg = document.getElementById('siteLogoImg');
    if (settings.logo) {
        if (siteLogoImg) {
            siteLogoImg.src = settings.logo;
            siteLogoImg.style.display = 'block';
        }
    } else {
        if (siteLogoImg) siteLogoImg.style.display = 'none';
    }

    // Apply Company Name
    if (settings.companyName) {
        // Update header logo
        const logoH1 = document.querySelector('.logo a h1');
        if (logoH1) {
            logoH1.textContent = settings.companyName.toUpperCase();
        }
        // Update footer logo
        const footerH3 = document.querySelector('.footer-col h3');
        if (footerH3) {
            footerH3.innerHTML = `${settings.companyName.toUpperCase()} <span>ELECTRIC</span>`;
        }
        // Update mobile nav
        const mobileNavH2 = document.querySelector('.mobile-nav-header h2');
        if (mobileNavH2) {
            mobileNavH2.innerHTML = `${settings.companyName.toUpperCase()} <span>ELECTRIC</span>`;
        }
        // Update footer about
        const footerAbout = document.getElementById('footerAbout');
        if (footerAbout) {
            footerAbout.textContent = `Save The Earth, Ride With ${settings.companyName} Bike. Pioneering electric mobility across India with premium electric scooters.`;
        }
        if (settings.copyright) {
            const footerCopyright = document.getElementById('footerCopyright');
            if (footerCopyright) footerCopyright.textContent = settings.copyright;
        }
        // Update footer products list
        const footerProducts = document.getElementById('footerProducts');
        if (footerProducts && products.length > 0) {
            footerProducts.innerHTML = products.map(p => `<li><a href="#products">${p.name}</a></li>`).join('');
        }
        // Update Features section title
        const featuresTitle = document.getElementById('featuresTitle');
        if (featuresTitle) {
            featuresTitle.innerHTML = settings.featuresTitle
                ? settings.featuresTitle
                : `The <span class="highlight">${settings.companyName}</span> Advantage`;
        }
        const featuresSubtitle = document.getElementById('featuresSubtitle');
        if (featuresSubtitle && settings.featuresSubtitle) {
            featuresSubtitle.textContent = settings.featuresSubtitle;
        }
        // Update WhatsApp booking message
        document.querySelectorAll('.book-now-btn').forEach(btn => {
            btn.dataset.company = settings.companyName;
        });
    }

    // Load Hero Slider Settings
    const hero = JSON.parse(localStorage.getItem('gaura_hero') || '{}');
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length >= 5) {
        const heroData = [
            { title: hero.slide1Title, subtitle: hero.slide1Subtitle, badge: hero.slide1Badge, image: hero.slide1Image, productImage: hero.slide1ProductImage },
            { title: hero.slide2Title, subtitle: hero.slide2Subtitle, badge: hero.slide2Badge, image: hero.slide2Image, productImage: hero.slide2ProductImage },
            { title: hero.slide3Title, subtitle: hero.slide3Subtitle, badge: hero.slide3Badge, image: hero.slide3Image, productImage: hero.slide3ProductImage },
            { title: hero.slide4Title, subtitle: hero.slide4Subtitle, badge: hero.slide4Badge, image: hero.slide4Image, productImage: hero.slide4ProductImage },
            { title: hero.slide5Title, subtitle: hero.slide5Subtitle, badge: hero.slide5Badge, image: hero.slide5Image, productImage: hero.slide5ProductImage }
        ];
        heroData.forEach((h, i) => {
            const slide = slides[i];
            if (!slide) return;
            if (h.image) {
                slide.style.backgroundImage = 'url(' + h.image + ')';
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
            }
            if (h.title) {
                const h1 = slide.querySelector('h1');
                if (h1) h1.innerHTML = h.title;
            }
            if (h.subtitle) {
                const p = slide.querySelector('.hero-content p');
                if (p) p.textContent = h.subtitle;
            }
            if (h.badge) {
                const badge = slide.querySelector('.hero-badge');
                if (badge) badge.textContent = h.badge;
            }
            if (h.productImage) {
                const placeholder = slide.querySelector('.scooter-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = '<img src="' + h.productImage + '" style="max-width:100%;max-height:300px;object-fit:contain;">';
                    placeholder.style.border = 'none';
                    placeholder.style.background = 'transparent';
                }
            }
        });
    }

    // Load Savings Section Settings
    const savings = JSON.parse(localStorage.getItem('gaura_savings') || '{}');
    if (savings.tag) { const el = document.getElementById('savingsTag'); if (el) el.textContent = savings.tag; }
    if (savings.title) { const el = document.getElementById('savingsTitle'); if (el) el.innerHTML = savings.title; }
    if (savings.subtitle) { const el = document.getElementById('savingsSubtitle'); if (el) el.textContent = savings.subtitle; }
    if (savings.card1Title) { const el = document.getElementById('savingsCard1Title'); if (el) el.textContent = savings.card1Title; }
    if (savings.card1Amount) { const el = document.getElementById('savingsCard1Amount'); if (el) el.textContent = savings.card1Amount; }
    if (savings.card1Desc) { const el = document.getElementById('savingsCard1Desc'); if (el) el.textContent = savings.card1Desc; }
    if (savings.card2Title) { const el = document.getElementById('savingsCard2Title'); if (el) el.textContent = savings.card2Title; }
    if (savings.card2Amount) { const el = document.getElementById('savingsCard2Amount'); if (el) el.textContent = savings.card2Amount; }
    if (savings.card2Desc) { const el = document.getElementById('savingsCard2Desc'); if (el) el.textContent = savings.card2Desc; }
    if (savings.card3Title) { const el = document.getElementById('savingsCard3Title'); if (el) el.textContent = savings.card3Title; }
    if (savings.card3Amount) { const el = document.getElementById('savingsCard3Amount'); if (el) el.textContent = savings.card3Amount; }
    if (savings.card3Desc) { const el = document.getElementById('savingsCard3Desc'); if (el) el.textContent = savings.card3Desc; }

    // Load About Section Settings
    const about = JSON.parse(localStorage.getItem('gaura_about') || '{}');
    if (about.title) {
        const aboutTitle = document.getElementById('aboutTitle');
        if (aboutTitle) aboutTitle.innerHTML = about.title;
    }
    if (about.description) {
        const aboutDesc = document.getElementById('aboutDesc');
        if (aboutDesc) aboutDesc.textContent = about.description;
    }
    if (about.stat1) {
        const el = document.getElementById('aboutStat1Num');
        if (el) el.textContent = about.stat1;
    }
    if (about.stat1Label) {
        const el = document.getElementById('aboutStat1Lbl');
        if (el) el.textContent = about.stat1Label;
    }
    if (about.stat2) {
        const el = document.getElementById('aboutStat2Num');
        if (el) el.textContent = about.stat2;
    }
    if (about.stat2Label) {
        const el = document.getElementById('aboutStat2Lbl');
        if (el) el.textContent = about.stat2Label;
    }
    if (about.stat3) {
        const el = document.getElementById('aboutStat3Num');
        if (el) el.textContent = about.stat3;
    }
    if (about.stat3Label) {
        const el = document.getElementById('aboutStat3Lbl');
        if (el) el.textContent = about.stat3Label;
    }
    if (about.image) {
        const aboutImg = document.getElementById('aboutImage');
        if (aboutImg) {
            aboutImg.innerHTML = '<img src="' + about.image + '" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">';
            aboutImg.style.padding = '0';
        }
    }

    // Load Testimonials / Google Reviews
    const testimonials = JSON.parse(localStorage.getItem('gaura_testimonials') || '[]');
    if (testimonials.length > 0) {
        const grid = document.getElementById('testimonialsGrid');
        if (grid) {
            grid.innerHTML = testimonials.map(r => {
                const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
                const photoHtml = r.photo
                    ? '<img src="' + r.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
                    : '<i class="fas fa-user"></i>';
                return '<div class="testimonial-card">' +
                    '<div class="testimonial-content">' +
                        '<div class="testimonial-stars" style="color:#ffc107;margin-bottom:8px;">' + stars + '</div>' +
                        '<p>"' + r.text + '"</p>' +
                    '</div>' +
                    '<div class="testimonial-author">' +
                        '<div class="author-avatar">' + photoHtml + '</div>' +
                        '<div class="author-info">' +
                            '<h4>' + r.name + '</h4>' +
                            '<span>' + (r.designation || '') + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
    }


}

// ===== Book Now Modal =====
function openBookModal(modelName, selectedColor) {
    const modal = document.getElementById('bookModal');
    const modelSelect = document.getElementById('bookModelSelect');
    if (modelSelect && modelName) {
        modelSelect.value = modelName;
    }
    modal.dataset.selectedColor = selectedColor || '';

    const details = document.getElementById('bookProductDetails');
    const product = allProducts.find(p => p.name === modelName);
    if (product && details) {
        details.style.display = 'block';
        document.getElementById('bookProductName').textContent = product.name;
        document.getElementById('bookProductPrice').textContent = '₹' + product.price.toLocaleString();
        document.getElementById('bookProductSpeed').innerHTML = `<i class="fas fa-tachometer-alt"></i> ${product.speed} km/h`;
        document.getElementById('bookProductRange').innerHTML = `<i class="fas fa-road"></i> ${product.range} km`;
        document.getElementById('bookProductBattery').innerHTML = product.batteryCapacity ? `<i class="fas fa-car-battery"></i> ${product.batteryCapacity}` : '';
        const colorObj = selectedColor ? product.colors.find(c => c.name === selectedColor) : null;
        const colorDiv = document.getElementById('bookProductColor');
        if (colorObj) {
            colorDiv.innerHTML = `<span style="width:14px;height:14px;border-radius:50%;background:${colorObj.hex};display:inline-block;border:1px solid rgba(255,255,255,0.3);"></span> ${colorObj.name}`;
        } else {
            colorDiv.innerHTML = '';
        }
        const imgDiv = document.getElementById('bookProductImg');
        const colorImg = colorObj && colorObj.image ? colorObj.image : (product.colors.find(c => c.image) || {}).image || '';
        if (colorImg) {
            imgDiv.innerHTML = `<img src="${colorImg}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            imgDiv.innerHTML = '<i class="fas fa-motorcycle" style="font-size:28px;color:var(--primary);"></i>';
        }
    } else if (details) {
        details.style.display = 'none';
    }

    updateFinalPrice();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateFinalPrice() {
    const modelSelect = document.getElementById('bookModelSelect');
    const discountInput = document.getElementById('bookDiscount');
    const finalPriceInput = document.getElementById('bookFinalPrice');
    if (!modelSelect || !finalPriceInput) return;
    const product = allProducts.find(p => p.name === modelSelect.value);
    if (!product) { finalPriceInput.value = ''; updateAdvancePayment(); return; }
    const discount = parseInt(discountInput.value) || 0;
    const final = product.price - discount;
    finalPriceInput.value = '₹' + final.toLocaleString('en-IN');
    updateAdvancePayment();
}

function updateAdvancePayment() {
    const finalPriceInput = document.getElementById('bookFinalPrice');
    const advanceInput = document.getElementById('bookAdvancePayment');
    const remainingInput = document.getElementById('bookRemainingBalance');
    if (!finalPriceInput || !advanceInput || !remainingInput) return;
    const finalPriceStr = finalPriceInput.value.replace(/[^0-9]/g, '');
    const finalPrice = parseInt(finalPriceStr) || 0;
    const advance = parseInt(advanceInput.value) || 0;
    if (finalPrice === 0) {
        remainingInput.value = '';
        return;
    }
    const remaining = finalPrice - advance;
    if (remaining < 0) {
        advanceInput.value = finalPrice;
        remainingInput.value = '₹0';
    } else {
        remainingInput.value = '₹' + remaining.toLocaleString('en-IN');
    }
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    const advancePaymentInput = document.getElementById('bookAdvancePayment');
    const remainingBalanceInput = document.getElementById('bookRemainingBalance');
    if (advancePaymentInput) advancePaymentInput.value = '';
    if (remainingBalanceInput) remainingBalanceInput.value = '';
}

// ===== Download Booking PDF (SRI SPS E-BIKES style design, with icons) =====
function downloadBookingPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const settings = JSON.parse(localStorage.getItem('gaura_settings') || '{}');
    const companyName = (settings.companyName || 'Sri SPS E-Bikes (Electric)').toUpperCase();
    const contact = JSON.parse(localStorage.getItem('gaura_contact') || '{}');

    const customerName = document.getElementById('bookCustomerName').value.trim();
    const customerLocation = document.getElementById('bookLocation').value.trim();
    const modelName = document.getElementById('bookModelSelect').value;
    const phone = document.getElementById('bookPhone').value.trim();
    const staffName = document.getElementById('bookStaff').value.trim();
    const discount = parseInt(document.getElementById('bookDiscount').value) || 0;
    const advancePayment = parseInt(document.getElementById('bookAdvancePayment').value) || 0;

    if (!customerName || !modelName || !phone) {
        alert('Please fill in customer name, model, and phone before downloading PDF.');
        return;
    }

    const product = allProducts.find(p => p.name === modelName);
    const finalPrice = product ? product.price - discount : 0;
    const remaining = finalPrice - advancePayment;
    const selectedColor = document.getElementById('bookModal').dataset.selectedColor || '';
    const now = new Date();
    const today = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const bookingId = 'GE-' + String(Date.now()).slice(-8);

    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentW = pw - margin * 2;

    // ===== Palette =====
    const green = [0, 150, 60];
    const greenDark = [0, 110, 45];
    const black = [25, 25, 25];
    const gray = [105, 105, 105];
    const blue = [20, 90, 190];
    const red = [200, 30, 30];
    const white = [255, 255, 255];

    // ===== Icon drawing helpers (vector, no external fonts) =====
    const poly = (pts, style) => {
        const rel = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
        doc.lines(rel, pts[0][0], pts[0][1], [1, 1], style, true);
    };
    const icoPerson = (cx, cy, s, col) => {
        doc.setFillColor(...col);
        doc.circle(cx, cy - s * 0.35, s * 0.36, 'F');
        doc.ellipse(cx, cy + s * 0.42, s * 0.58, s * 0.4, 'F');
    };
    const icoPhone = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.35);
        doc.roundedRect(cx - s * 0.42, cy - s * 0.75, s * 0.84, s * 1.5, s * 0.22, s * 0.22, 'S');
        doc.setFillColor(...col);
        doc.circle(cx, cy + s * 0.5, s * 0.1, 'F');
    };
    const icoWhatsApp = (cx, cy, s, col) => {
        doc.setFillColor(...col);
        doc.roundedRect(cx - s * 0.7, cy - s * 0.55, s * 1.4, s * 1.05, s * 0.28, s * 0.28, 'F');
        poly([[cx - s * 0.35, cy + s * 0.4], [cx - s * 0.1, cy + s * 0.4], [cx - s * 0.45, cy + s * 0.78]], 'F');
    };
    const icoLocation = (cx, cy, s, col) => {
        doc.setFillColor(...col);
        doc.circle(cx, cy - s * 0.22, s * 0.4, 'F');
        poly([[cx - s * 0.3, cy], [cx + s * 0.3, cy], [cx, cy + s * 0.7]], 'F');
        doc.setFillColor(...white);
        doc.circle(cx, cy - s * 0.22, s * 0.15, 'F');
    };
    const icoEnvelope = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.32);
        doc.rect(cx - s * 0.7, cy - s * 0.48, s * 1.4, s * 0.96, 'S');
        doc.line(cx - s * 0.68, cy - s * 0.44, cx, cy + s * 0.08);
        doc.line(cx + s * 0.68, cy - s * 0.44, cx, cy + s * 0.08);
    };
    const icoCalendar = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.32);
        doc.roundedRect(cx - s * 0.75, cy - s * 0.6, s * 1.5, s * 1.3, 0.4, 0.4, 'S');
        doc.line(cx - s * 0.4, cy - s * 0.85, cx - s * 0.4, cy - s * 0.45);
        doc.line(cx + s * 0.4, cy - s * 0.85, cx + s * 0.4, cy - s * 0.45);
        doc.line(cx - s * 0.75, cy - s * 0.2, cx + s * 0.75, cy - s * 0.2);
    };
    const icoTag = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.32);
        doc.setFillColor(...white);
        poly([[cx - s * 0.85, cy - s * 0.55], [cx + s * 0.25, cy - s * 0.55], [cx + s * 0.85, cy], [cx + s * 0.25, cy + s * 0.55], [cx - s * 0.85, cy + s * 0.55]], 'FD');
        doc.setFillColor(...col);
        doc.circle(cx - s * 0.4, cy, s * 0.15, 'F');
    };
    const icoWallet = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.32);
        doc.setFillColor(...white);
        doc.roundedRect(cx - s * 0.85, cy - s * 0.55, s * 1.7, s * 1.1, s * 0.2, s * 0.2, 'FD');
        doc.setFillColor(...col);
        doc.circle(cx + s * 0.45, cy, s * 0.16, 'F');
    };
    const icoBox = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.3);
        doc.rect(cx - s * 0.55, cy - s * 0.2, s * 1.1, s * 0.75, 'S');
        doc.line(cx - s * 0.55, cy - s * 0.2, cx - s * 0.3, cy - s * 0.62);
        doc.line(cx + s * 0.55, cy - s * 0.2, cx + s * 0.8, cy - s * 0.62);
        doc.line(cx - s * 0.3, cy - s * 0.62, cx + s * 0.8, cy - s * 0.62);
        doc.line(cx + s * 0.55, cy + s * 0.55, cx + s * 0.8, cy + s * 0.13);
        doc.line(cx + s * 0.8, cy + s * 0.13, cx + s * 0.8, cy - s * 0.62);
    };
    const icoSpeedo = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.32);
        doc.circle(cx, cy, s * 0.62, 'S');
        const ang = -50 * Math.PI / 180;
        doc.line(cx, cy, cx + Math.cos(ang) * s * 0.48, cy + Math.sin(ang) * s * 0.48);
        doc.setFillColor(...col);
        doc.circle(cx, cy, s * 0.1, 'F');
    };
    const icoRoad = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.34);
        doc.line(cx - s * 0.5, cy + s * 0.6, cx - s * 0.15, cy - s * 0.6);
        doc.line(cx + s * 0.5, cy + s * 0.6, cx + s * 0.15, cy - s * 0.6);
        doc.setLineDashPattern([0.5, 0.5], 0);
        doc.line(cx, cy + s * 0.5, cx, cy - s * 0.5);
        doc.setLineDashPattern([], 0);
    };
    const icoBattery = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.3);
        doc.roundedRect(cx - s * 0.7, cy - s * 0.4, s * 1.3, s * 0.8, s * 0.14, s * 0.14, 'S');
        doc.setFillColor(...col);
        doc.rect(cx + s * 0.58, cy - s * 0.16, s * 0.14, s * 0.32, 'F');
        doc.rect(cx - s * 0.5, cy - s * 0.2, s * 0.35, s * 0.4, 'F');
    };
    const icoBolt = (cx, cy, s, col) => {
        doc.setFillColor(...col);
        poly([[cx + s * 0.1, cy - s * 0.7], [cx - s * 0.35, cy + s * 0.05], [cx - s * 0.05, cy + s * 0.05], [cx - s * 0.15, cy + s * 0.7], [cx + s * 0.4, cy - s * 0.1], [cx + s * 0.05, cy - s * 0.1]], 'F');
    };
    // mode 'filled' = solid col shield with a contrasting check (for use on white backgrounds)
    // mode 'outline' = stroke-only shield + check in a single color (for use on dark backgrounds)
    const icoShieldCheck = (cx, cy, s, col, mode) => {
        const shieldPts = [[cx - s * 0.62, cy - s * 0.68], [cx + s * 0.62, cy - s * 0.68], [cx + s * 0.62, cy + s * 0.15], [cx, cy + s * 0.75], [cx - s * 0.62, cy + s * 0.15]];
        doc.setDrawColor(...col);
        doc.setLineWidth(0.4);
        if (mode === 'outline') {
            poly(shieldPts, 'S');
            doc.setLineWidth(0.42);
        } else {
            doc.setFillColor(...col);
            poly(shieldPts, 'F');
            doc.setDrawColor(...white);
            doc.setLineWidth(0.45);
        }
        doc.line(cx - s * 0.26, cy, cx - s * 0.04, cy + s * 0.24);
        doc.line(cx - s * 0.04, cy + s * 0.24, cx + s * 0.3, cy - s * 0.24);
    };
    const icoHeadset = (cx, cy, s, col) => {
        doc.setDrawColor(...col);
        doc.setLineWidth(0.4);
        const steps = 12;
        let px = null, py = null;
        for (let i = 0; i <= steps; i++) {
            const t = Math.PI * (1 - i / steps);
            const nx = cx + Math.cos(t) * s * 0.6;
            const ny = cy - Math.sin(t) * s * 0.55;
            if (px !== null) doc.line(px, py, nx, ny);
            px = nx; py = ny;
        }
        doc.roundedRect(cx - s * 0.72, cy - s * 0.05, s * 0.22, s * 0.42, s * 0.08, s * 0.08, 'S');
        doc.roundedRect(cx + s * 0.5, cy - s * 0.05, s * 0.22, s * 0.42, s * 0.08, s * 0.08, 'S');
    };
    const icoStar = (cx, cy, s, col) => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? s : s * 0.42;
            const ang = -Math.PI / 2 + i * Math.PI / 5;
            pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
        }
        doc.setFillColor(...col);
        poly(pts, 'F');
    };
    const rowIcon = (cx, cy, iconFn) => {
        doc.setFillColor(...white);
        doc.setDrawColor(...green);
        doc.setLineWidth(0.3);
        doc.circle(cx, cy, 2.6, 'FD');
        iconFn(cx, cy, 1.7, green);
    };
    const pillHeader = (x, yy, w, label, iconFn) => {
        doc.setFillColor(...green);
        doc.roundedRect(x, yy, w, 9, 2, 2, 'F');
        if (iconFn) {
            doc.setFillColor(...white);
            doc.circle(x + 6.5, yy + 4.5, 3.2, 'F');
            iconFn(x + 6.5, yy + 4.5, 2.1, green);
        }
        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(label, x + (iconFn ? 13 : 4), yy + 5.8);
    };

    let y = 14;

    // ===== LOGO =====
    let logoW = 0;
    if (settings.logo) {
        try {
            doc.addImage(settings.logo, 'PNG', margin, y - 2, 24, 24);
            logoW = 30;
        } catch (e) {}
    }
    if (!logoW) {
        doc.setFillColor(25, 25, 25);
        doc.roundedRect(margin, y - 2, 22, 24, 3, 3, 'F');
        doc.setDrawColor(...green);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin + 1.5, y - 0.5, 19, 21, 2, 2, 'S');
        doc.setFillColor(...green);
        doc.circle(margin + 11, y + 6.5, 3.3, 'S');
        icoBolt(margin + 11, y + 6.5, 2.6, green);
        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('SPS', margin + 11, y + 14.5, { align: 'center' });
        doc.setFontSize(4.2);
        doc.text('E-BIKES', margin + 11, y + 18, { align: 'center' });
        logoW = 28;
    }

    // ===== COMPANY NAME & TAGLINE =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(...black);
    doc.text(companyName, margin + logoW, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...green);
    doc.text((settings.tagline || 'RIDE SMART • RIDE ELECTRIC • GO GREEN').toUpperCase(), margin + logoW, y + 12);

    // ===== "THANK YOU FOR CHOOSING US" BADGE =====
    const cx = pw - margin - 16;
    const cyBadge = y + 10;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([1, 1], 0);
    doc.circle(cx, cyBadge, 15, 'S');
    doc.setLineDashPattern([], 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...black);
    doc.text('THANK YOU FOR', cx, cyBadge - 8, { align: 'center' });
    icoStar(cx - 5, cyBadge - 3.3, 1, green);
    icoStar(cx, cyBadge - 3.3, 1, green);
    icoStar(cx + 5, cyBadge - 3.3, 1, green);
    doc.setFillColor(...green);
    doc.roundedRect(cx - 13, cyBadge - 0.5, 26, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...white);
    doc.text(companyName, cx, cyBadge + 3, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...black);
    doc.text('CHOOSING US', cx, cyBadge + 9.5, { align: 'center' });

    y += 40;

    // ===== BOOKING CONFIRMATION RIBBON BANNER =====
    const bannerW = 96, bannerH = 11, tip = 8;
    const bannerX = pw / 2 - bannerW / 2;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.5);
    doc.line(margin, y + bannerH / 2, bannerX - tip, y + bannerH / 2);
    doc.line(bannerX + bannerW + tip, y + bannerH / 2, pw - margin, y + bannerH / 2);
    doc.setFillColor(...green);
    poly([
        [bannerX, y], [bannerX + bannerW, y],
        [bannerX + bannerW + tip, y + bannerH / 2],
        [bannerX + bannerW, y + bannerH], [bannerX, y + bannerH],
        [bannerX - tip, y + bannerH / 2]
    ], 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BOOKING CONFIRMATION', pw / 2, y + bannerH / 2 + 2.3, { align: 'center' });
    y += bannerH + 8;

    // ===== BOOKING DATE / ID BAR =====
    doc.setFillColor(248, 250, 248);
    doc.setDrawColor(...green);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'FD');
    icoCalendar(margin + 8, y + 5, 2.6, green);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text('Booking Date:', margin + 13, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(today, margin + 41, y + 6.5);
    doc.setDrawColor(210, 210, 210);
    doc.line(pw / 2, y + 2, pw / 2, y + 8);
    icoTag(pw / 2 + 9, y + 5, 2.4, green);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...black);
    doc.text('Booking ID:', pw / 2 + 15, y + 6.5);
    doc.setTextColor(...greenDark);
    doc.text(bookingId, pw / 2 + 38, y + 6.5);
    y += 16;

    // ===== CUSTOMER DETAILS / PRODUCT DETAILS (two columns) =====
    const colGap = 6;
    const colW = (contentW - colGap) / 2;
    const leftX = margin;
    const rightX = margin + colW + colGap;
    const cardTopY = y;

    // -- Customer card --
    pillHeader(leftX, cardTopY, colW, 'CUSTOMER DETAILS', icoPerson);
    let cy2 = cardTopY + 9;
    const custRows = [
        ['Name', customerName, icoPerson],
        ['Location', customerLocation, icoLocation],
        ['Phone', phone, icoPhone]
    ];
    custRows.forEach(([label, value, iconFn], i) => {
        const bg = i % 2 === 0 ? [255, 255, 255] : [247, 252, 248];
        doc.setFillColor(...bg);
        doc.rect(leftX, cy2, colW, 8.5, 'F');
        doc.setDrawColor(225, 235, 227);
        doc.setLineWidth(0.2);
        doc.rect(leftX, cy2, colW, 8.5, 'S');
        rowIcon(leftX + 5, cy2 + 4.25, iconFn);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...gray);
        doc.text(label, leftX + 10, cy2 + 5.4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...black);
        doc.text(':', leftX + 32, cy2 + 5.4);
        doc.text(value || '-', leftX + 36, cy2 + 5.4);
        cy2 += 8.5;
    });
    const customerCardH = cy2 - cardTopY;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.4);
    doc.roundedRect(leftX, cardTopY, colW, customerCardH, 2, 2, 'S');

    // -- Product card --
    pillHeader(rightX, cardTopY, colW, 'PRODUCT DETAILS', icoBox);
    let py2 = cardTopY + 9;
    if (product) {
        const prodRows = [
            ['Model', product.name],
            ['Color', selectedColor || 'Standard']
        ];
        prodRows.forEach(([label, value], i) => {
            const bg = i % 2 === 0 ? [255, 255, 255] : [247, 252, 248];
            doc.setFillColor(...bg);
            doc.rect(rightX, py2, colW, 8, 'F');
            doc.setDrawColor(225, 235, 227);
            doc.setLineWidth(0.2);
            doc.rect(rightX, py2, colW, 8, 'S');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...gray);
            doc.text(label, rightX + 4, py2 + 5.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...black);
            doc.text(value || '-', rightX + 22, py2 + 5.5);
            py2 += 8;
        });
    }
    const splitY = py2 + 2;
    doc.setDrawColor(220, 230, 222);
    doc.setLineWidth(0.3);
    doc.line(rightX, splitY, rightX + colW, splitY);
    let statsY = splitY + 2;
    if (product) {
        const stats = [
            ['Speed', product.speed + ' km/h', icoSpeedo],
            ['Range', product.range + ' km', icoRoad],
            ['Battery', (product.batteryCapacity || '-') + (product.batteryType ? ' (' + product.batteryType + ')' : ''), icoBattery],
            ['Charge', (product.chargeTime || '-') + ' hrs', icoBolt]
        ];
        const halfW = colW / 2;
        stats.forEach(([label, value, iconFn], idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const sx = rightX + col * halfW;
            const sy = statsY + row * 8.5;
            rowIcon(sx + 5, sy + 4, iconFn);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.3);
            doc.setTextColor(...gray);
            doc.text(label + ':', sx + 10, sy + 5);
            doc.setTextColor(...black);
            doc.text(value, sx + 25, sy + 5);
        });
        statsY += 17;
    }
    if (product) {
        doc.setFillColor(255, 255, 255);
        doc.rect(rightX, statsY, colW, 8, 'F');
        doc.setDrawColor(225, 235, 227);
        doc.setLineWidth(0.2);
        doc.rect(rightX, statsY, colW, 8, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...gray);
        doc.text('Price', rightX + 4, statsY + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...greenDark);
        doc.text('Rs.' + product.price.toLocaleString('en-IN'), rightX + 22, statsY + 5.5);
        statsY += 8;
    }
    const productCardH = statsY - cardTopY + 2;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.4);
    doc.roundedRect(rightX, cardTopY, colW, productCardH, 2, 2, 'S');

    y = cardTopY + Math.max(customerCardH, productCardH) + 8;

    // ===== PAYMENT SUMMARY =====
    pillHeader(margin, y, contentW, 'PAYMENT SUMMARY', icoWallet);
    y += 9;
    const boxH = 26;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentW, boxH, 'S');
    const quarterW = contentW / 4;
    for (let i = 1; i < 4; i++) {
        doc.setDrawColor(225, 235, 227);
        doc.line(margin + quarterW * i, y, margin + quarterW * i, y + boxH);
    }

    // Box 1: Showroom price + discount
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...gray);
    doc.text('Showroom Price', margin + quarterW / 2, y + 9, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text('Rs.' + (product ? product.price.toLocaleString('en-IN') : '0'), margin + quarterW / 2, y + 15, { align: 'center' });
    if (discount > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...red);
        doc.text('- Rs.' + discount.toLocaleString('en-IN'), margin + quarterW / 2, y + 21, { align: 'center' });
    }

    // Box 2: FINAL PRICE (highlighted)
    const b2x = margin + quarterW;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.6);
    doc.roundedRect(b2x + 3, y + 3, quarterW - 6, boxH - 6, 2, 2, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...greenDark);
    doc.text('FINAL PRICE', b2x + quarterW / 2, y + 10, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Rs.' + finalPrice.toLocaleString('en-IN'), b2x + quarterW / 2, y + 19, { align: 'center' });

    // Box 3: Advance Paid
    const b3x = margin + quarterW * 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...gray);
    doc.text('Advance Paid', b3x + quarterW / 2, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...blue);
    doc.text('Rs.' + advancePayment.toLocaleString('en-IN'), b3x + quarterW / 2, y + 17, { align: 'center' });

    // Box 4: Balance Due
    const b4x = margin + quarterW * 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...gray);
    doc.text('Balance Due', b4x + quarterW / 2, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...red);
    doc.text('Rs.' + Math.max(remaining, 0).toLocaleString('en-IN'), b4x + quarterW / 2, y + 17, { align: 'center' });

    y += boxH + 8;

    // ===== SOLD BY ROW =====
    if (staffName) {
        doc.setFillColor(248, 250, 248);
        doc.setDrawColor(...green);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, 10, 2, 2, 'FD');
        icoPerson(margin + 8, y + 5, 2.6, green);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...black);
        doc.text('Sold By:', margin + 13, y + 6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...greenDark);
        doc.text(staffName, margin + 32, y + 6.5);
        y += 14;
    }

    // ===== CONTACT STRIP =====
    const contactItems = [];
    if (contact.phone) contactItems.push(['Phone', contact.phone, icoPhone]);
    if (contact.whatsapp) contactItems.push(['WhatsApp', contact.whatsapp, icoWhatsApp]);
    if (contact.email) contactItems.push(['Email', contact.email, icoEnvelope]);
    if (contact.address) contactItems.push(['Address', contact.address, icoLocation]);
    if (contactItems.length) {
        doc.setDrawColor(225, 235, 227);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentW, 14, 2, 2, 'S');
        const cw = contentW / contactItems.length;
        contactItems.forEach(([label, value, iconFn], i) => {
            const itemX = margin + cw * i;
            rowIcon(itemX + 9, y + 7, iconFn);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...gray);
            doc.text(label, itemX + 15, y + 5.5);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...black);
            const valText = value.length > 20 ? value.slice(0, 18) + '…' : value;
            doc.text(valText, itemX + 15, y + 10.5);
        });
        y += 20;
    }

    // ===== QR + THANK YOU / BADGE / SIGNATURE =====
    const fThirdW = contentW / 3;
    const footTopY = y;
    const qrSize = 22;
    let hasQR = false;
    if (settings.qrCode) {
        try {
            doc.addImage(settings.qrCode, 'PNG', margin, footTopY, qrSize, qrSize);
            hasQR = true;
        } catch (e) {}
    }
    if (!hasQR) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(margin, footTopY, qrSize, qrSize, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...gray);
        doc.text('QR CODE', margin + qrSize / 2, footTopY + qrSize / 2, { align: 'center' });
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...greenDark);
    doc.text('Thank You!', margin + qrSize + 6, footTopY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text('Thank you for choosing ' + companyName + '.', margin + qrSize + 6, footTopY + 13);
    doc.text('We look forward to serving you.', margin + qrSize + 6, footTopY + 18);

    const midX = margin + fThirdW + fThirdW / 2;
    icoShieldCheck(midX, footTopY + 9, 8, green, 'filled');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...black);
    doc.text('SAFE • SMART • SUSTAINABLE', midX, footTopY + 22, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text('GO ELECTRIC. GO GREEN.', midX, footTopY + 27, { align: 'center' });

    const sigX = pw - margin - 50;
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(sigX, footTopY + 18, sigX + 50, footTopY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...black);
    doc.text('Authorized Signature', sigX + 25, footTopY + 23, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...greenDark);
    doc.text(companyName, sigX + 25, footTopY + 28, { align: 'center' });

    // ===== BOTTOM BLACK BAR =====
    const barY = ph - 22;
    doc.setFillColor(20, 20, 20);
    doc.rect(margin - 2, barY, contentW + 4, 9, 'F');
    const barItems = [
        ['100% CUSTOMER SATISFACTION', icoShieldCheck],
        ['QUALITY ASSURANCE', icoShieldCheck],
        ['AFTER SALES SUPPORT', icoHeadset]
    ];
    const barW = (contentW + 4) / 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    barItems.forEach(([label, iconFn], i) => {
        const ix = margin - 2 + barW * i + barW / 2 - (doc.getTextWidth(label) / 2) - 5;
        if (iconFn === icoHeadset) {
            iconFn(ix, barY + 4.5, 2.6, white);
        } else {
            iconFn(ix, barY + 4.5, 2.6, white, 'outline');
        }
        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(label, ix + 4, barY + 5.8);
    });

    // ===== FOOTER NOTE =====
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text('This is a computer-generated booking confirmation and does not require a signature.', pw / 2, barY + 16, { align: 'center' });

    // ===== OUTER BORDER =====
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.8);
    doc.rect(5, 5, pw - 10, ph - 10, 'S');

    // Save PDF
    doc.save('Booking_' + customerName.replace(/\s+/g, '_') + '_' + bookingId + '.pdf');
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    // Load admin data
    loadAdminData();

    // ===== Book Now Modal Events =====
    const bookModal = document.getElementById('bookModal');
    const closeBookModalBtn = document.getElementById('closeBookModal');
    const bookForm = document.getElementById('bookForm');

    if (closeBookModalBtn) {
        closeBookModalBtn.addEventListener('click', closeBookModal);
    }

    if (bookModal) {
        bookModal.addEventListener('click', function(e) {
            if (e.target === bookModal) {
                closeBookModal();
            }
        });
    }

    const bookModelSelectEl = document.getElementById('bookModelSelect');
    const bookDiscountEl = document.getElementById('bookDiscount');
    const bookAdvancePaymentEl = document.getElementById('bookAdvancePayment');
    if (bookModelSelectEl) bookModelSelectEl.addEventListener('change', updateFinalPrice);
    if (bookDiscountEl) bookDiscountEl.addEventListener('input', updateFinalPrice);
    if (bookAdvancePaymentEl) bookAdvancePaymentEl.addEventListener('input', updateAdvancePayment);

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadBookingPDF);
    }

    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const customerName = document.getElementById('bookCustomerName').value.trim();
            const customerLocation = document.getElementById('bookLocation').value.trim();
            const modelName = document.getElementById('bookModelSelect').value;
            const phone = document.getElementById('bookPhone').value.trim();
            const staffName = document.getElementById('bookStaff').value.trim();
            const discount = document.getElementById('bookDiscount').value.trim();

            if (!customerName || !customerLocation || !modelName || !phone || !staffName) {
                alert('Please fill in all required fields');
                return;
            }

            if (phone.length !== 10) {
                alert('Please enter a valid 10-digit mobile number');
                return;
            }

            // Get WhatsApp number from admin settings
            const contact = JSON.parse(localStorage.getItem('gaura_contact') || '{}');
            const whatsappNum = (contact.whatsapp || '919600230055').replace(/[^0-9]/g, '');
            const settings = JSON.parse(localStorage.getItem('gaura_settings') || '{}');
            const companyName = settings.companyName || 'Sri SPS E-Bikes (Electric)';

            // Build message
            const product = allProducts.find(p => p.name === modelName);
            const selectedColor = document.getElementById('bookModal').dataset.selectedColor || '';
            const discountVal = parseInt(discount) || 0;
            const finalPriceVal = product ? product.price - discountVal : 0;
            const advancePaymentVal = parseInt(document.getElementById('bookAdvancePayment').value) || 0;
            const remainingVal = finalPriceVal - advancePaymentVal;

            let msg = `*New Booking Request - ${companyName}* 🛵\n\n`;
            msg += `*1. Customer Name:* ${customerName}\n`;
            msg += `*2. Location:* ${customerLocation}\n`;
            msg += `*3. Phone:* ${phone}\n`;
            msg += `*4. Model:* ${modelName}\n`;
            msg += `*5. Colour:* ${selectedColor || 'Standard'}\n`;
            if (product) {
                msg += `*6. Speed:* ${product.speed} km/h\n`;
                msg += `*7. Mileage:* ${product.range} km\n`;
                msg += `*8. Battery:* ${product.batteryCapacity || '-'}${product.batteryType ? ' (' + product.batteryType + ')' : ''}\n`;
                msg += `*9. Charging Time:* ${product.chargeTime || '-'} hrs\n`;
                msg += `*10. Price:* ₹${product.price.toLocaleString('en-IN')}\n`;
            }
            msg += `*11. Advance Payment:* ₹${advancePaymentVal.toLocaleString('en-IN')}\n`;
            msg += `*12. Final Price:* ₹${finalPriceVal.toLocaleString('en-IN')}\n`;
            msg += `*13. Remaining Balance:* ₹${remainingVal.toLocaleString('en-IN')}\n`;
            msg += `*14. Sold By:* ${staffName}\n`;
            msg += `\n--- Sent from ${companyName} Website ---`;

            const encodedMsg = encodeURIComponent(msg);
            const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedMsg}`;

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Reset form and close modal
            bookForm.reset();
            closeBookModal();
        });
    }

    // ===== Hero Slider =====
    const slides = document.querySelectorAll('.hero-slide');
    const sliderBtns = document.querySelectorAll('.slider-btn');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            sliderBtns[i].classList.remove('active');
        });
        slides[index].classList.add('active');
        sliderBtns[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startSlider() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlider() {
        clearInterval(slideInterval);
    }

    if (sliderBtns.length > 0) {
        sliderBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                stopSlider();
                showSlide(index);
                startSlider();
            });
        });
        startSlider();
    }

    const heroPrevBtn = document.getElementById('heroPrev');
    const heroNextBtn = document.getElementById('heroNext');

    if (heroPrevBtn && slides.length > 0) {
        heroPrevBtn.addEventListener('click', () => {
            stopSlider();
            const prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
            startSlider();
        });
    }

    if (heroNextBtn && slides.length > 0) {
        heroNextBtn.addEventListener('click', () => {
            stopSlider();
            nextSlide();
            startSlider();
        });
    }

    // ===== Mobile Navigation =====
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeNav = document.querySelector('.close-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav ul li a');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });
    }

    if (closeNav) {
        closeNav.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    });

    // ===== Header Scroll Effect =====
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
        }
    });

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Form Submission =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const name = formData.get('fullname');
            const phone = formData.get('mobileno');
            const model = formData.get('model');

            if (!name || !phone) {
                alert('Please fill in all required fields');
                return;
            }

            alert(`Thank you ${name}! Your inquiry for ${model} has been submitted. We will contact you soon.`);
            this.reset();
        });
    }

    // ===== Newsletter Form =====
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }

    // ===== Scroll Animation =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .feature-card, .testimonial-card, .savings-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});


