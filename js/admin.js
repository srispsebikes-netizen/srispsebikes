// ===== Default Data =====
const defaultProducts = [];

const defaultContact = {
    phone: '+91 82200 20922',
    whatsapp: '+91 96002 30055',
    email: 'info@srispsebikes.in',
    address: 'Coimbatore, Tamil Nadu, India',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    facebook: '',
    instagram: '',
    youtube: ''
};

const defaultSettings = {
    companyName: 'Sri SPS E-Bikes (Electric)',
    title: 'Save The Earth, Ride With Sri SPS E-Bikes (Electric)',
    tagline: 'Premium Electric Scooters',
    metaDesc: 'Sri SPS E-Bikes (Electric) - Save The Earth, Ride With Sri SPS E-Bikes (Electric). Premium electric scooters and bikes for sustainable transportation.'
};

const defaultFeatures = [
    { id: 1, title: 'Eco Friendly', icon: 'fas fa-leaf', desc: 'Zero emissions, zero pollution. Help save the planet with every ride.' },
    { id: 2, title: 'Save Money', icon: 'fas fa-rupee-sign', desc: 'Save up to 80% on fuel costs compared to petrol vehicles.' },
    { id: 3, title: 'Fast Charging', icon: 'fas fa-bolt', desc: 'Quick charge technology - full charge in just 3-4 hours.' },
    { id: 4, title: 'Safety First', icon: 'fas fa-shield-alt', desc: 'Advanced safety features including disc brakes and stability control.' },
    { id: 5, title: 'Warranty', icon: 'fas fa-award', desc: 'Comprehensive warranty coverage for complete peace of mind.' },
    { id: 6, title: 'Smart Technology', icon: 'fas fa-cogs', desc: 'LCD display, mobile app connectivity, and GPS tracking.' }
];

// ===== Initialize Data =====
function initializeData() {
    if (!localStorage.getItem('gaura_products')) {
        localStorage.setItem('gaura_products', JSON.stringify([]));
    }
    if (!localStorage.getItem('gaura_contact')) {
        localStorage.setItem('gaura_contact', JSON.stringify(defaultContact));
    }
    if (!localStorage.getItem('gaura_settings')) {
        localStorage.setItem('gaura_settings', JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem('gaura_images')) {
        localStorage.setItem('gaura_images', JSON.stringify([]));
    }
    if (!localStorage.getItem('gaura_features')) {
        localStorage.setItem('gaura_features', JSON.stringify(defaultFeatures));
    }
    if (!localStorage.getItem('gaura_theme')) {
        localStorage.setItem('gaura_theme', 'default');
    }
    if (!localStorage.getItem('gaura_admin')) {
        localStorage.setItem('gaura_admin', JSON.stringify({ username: 'admin', password: 'admin123' }));
    }
}

initializeData();

// ===== Image Compression Utility =====
function compressImage(file, maxWidth, quality) {
    maxWidth = maxWidth || 1200;
    quality = quality || 0.6;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const img = new Image();
                img.onload = function() {
                    try {
                        let w = img.width, h = img.height;
                        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                        const canvas = document.createElement('canvas');
                        canvas.width = w; canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        let compressed = canvas.toDataURL('image/jpeg', quality);
                        if (compressed.length > 500000) {
                            compressed = canvas.toDataURL('image/jpeg', 0.4);
                        }
                        if (compressed.length > 300000) {
                            compressed = canvas.toDataURL('image/jpeg', 0.3);
                        }
                        resolve(compressed);
                    } catch(err) {
                        resolve(e.target.result);
                    }
                };
                img.onerror = function() { resolve(e.target.result); };
                img.src = e.target.result;
            } catch(err) {
                resolve(e.target.result);
            }
        };
        reader.onerror = function() { reject(new Error('File read failed')); };
        reader.readAsDataURL(file);
    });
}

function checkStorageQuota(estimatedBytes = 0) {
    try {
        const testKey = 'storage_test_' + Date.now();
        const testData = 'x'.repeat(Math.max(10000, estimatedBytes));
        localStorage.setItem(testKey, testData);
        localStorage.removeItem(testKey);
        return true;
    } catch(e) {
        return false;
    }
}

function getStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ===== Login Page =====
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');

    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const admin = JSON.parse(localStorage.getItem('gaura_admin'));

        if (username === admin.username && password === admin.password) {
            localStorage.setItem('gaura_loggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid username or password!');
        }
    });
}

// ===== Dashboard Page =====
if (document.getElementById('sidebar')) {
    // Check login
    if (!localStorage.getItem('gaura_loggedIn')) {
        window.location.href = 'login.html';
    }

    // Elements
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const logoutBtn = document.getElementById('logoutBtn');

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            pageTitle.textContent = link.textContent.trim();
            sidebar.classList.remove('active');

            if (section === 'dashboard') loadDashboard();
            if (section === 'products') loadProducts();
            if (section === 'features') loadFeatures();
            if (section === 'contact') loadContact();
            if (section === 'images') loadImages();
            if (section === 'theme') loadTheme();
            if (section === 'settings') loadSettings();
        });
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('gaura_loggedIn');
        window.location.href = 'login.html';
    });

    // ===== Dashboard =====
    function loadDashboard() {
        const products = JSON.parse(localStorage.getItem('gaura_products'));
        const images = JSON.parse(localStorage.getItem('gaura_images'));
        const features = JSON.parse(localStorage.getItem('gaura_features') || '[]');
        const theme = localStorage.getItem('gaura_theme');
        const storageUsage = getStorageUsage();

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalImages').textContent = images.length;
        document.getElementById('totalFeatures').textContent = features.length;
        document.getElementById('currentTheme').textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        document.getElementById('contactStatus').textContent = 'Active';

        const storageEl = document.getElementById('storageUsage');
        if (storageEl) {
            const percent = Math.round((storageUsage / (5 * 1024 * 1024)) * 100);
            storageEl.innerHTML = `
                <div class="stat-icon"><i class="fas fa-database"></i></div>
                <div class="stat-info">
                    <h3>${formatBytes(storageUsage)} / 5 MB</h3>
                    <p>Storage Used</p>
                    <div style="margin-top:6px;height:6px;background:var(--glass-border);border-radius:3px;overflow:hidden;">
                        <div style="width:${percent}%;height:100%;background:${percent>80?'var(--danger)':percent>60?'var(--warning)':'var(--primary)'};transition:width 0.3s;"></div>
                    </div>
                    <small style="color:var(--text-muted);">${percent}% used</small>
                </div>`;
        }

        const recentDiv = document.getElementById('recentProducts');
        recentDiv.innerHTML = products.slice(0, 5).map(p => `
            <div class="recent-item">
                <span>${p.name}</span>
                <span style="color: var(--text-light);">₹${p.price.toLocaleString()}</span>
            </div>
        `).join('');
    }

    // ===== Products =====
    let editingProductId = null;
    let currentColors = [];
    let editingColorIndex = -1;

    function renderColorList() {
        const container = document.getElementById('colorList');
        const addBtn = document.getElementById('addColorBtn');
        if (editingColorIndex >= 0) {
            addBtn.innerHTML = '<i class="fas fa-save"></i> Update Colour';
        } else {
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Colour';
        }
        if (currentColors.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:10px;">No colours added yet</div>';
            return;
        }
        container.innerHTML = currentColors.map((c, i) => `
            <div style="display:flex;align-items:center;gap:10px;background:var(--glass);padding:10px 12px;border-radius:10px;border:1px solid ${editingColorIndex===i?'var(--primary)':'var(--glass-border)'};margin-bottom:6px;">
                ${c.image ? `<img src="${c.image}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;flex-shrink:0;border:1px solid var(--glass-border);" title="${c.name}">` : `<span style="width:32px;height:32px;border-radius:6px;background:${c.hex};display:inline-block;border:2px solid ${c.available==='no'?'var(--danger)':'var(--glass-border)'};flex-shrink:0;${c.available==='no'?'opacity:0.5;':''}"></span>`}
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:var(--text);">${c.name}</div>
                    <div style="font-size:11px;color:${c.available==='no'?'var(--danger)':'var(--primary)'};">${c.available==='no'?'Sold Out':'In Stock'}</div>
                </div>
                <select onchange="toggleColorAvailable(${i},this.value)" style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid var(--glass-border);background:var(--bg);color:${c.available==='no'?'var(--danger)':'var(--primary)'};cursor:pointer;outline:none;">
                    <option value="yes" ${c.available!=='no'?'selected':''}>In Stock</option>
                    <option value="no" ${c.available==='no'?'selected':''}>Sold Out</option>
                </select>
                <button type="button" onclick="editColor(${i})" title="Edit" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:14px;padding:4px;"><i class="fas fa-edit"></i></button>
                <button type="button" onclick="removeColor(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px;padding:4px;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `).join('');
    }

    window.editColor = function(index) {
        editingColorIndex = index;
        const c = currentColors[index];
        document.getElementById('productColor').value = c.hex;
        document.getElementById('productColorName').value = c.name;
        document.getElementById('productColorAvailable').value = c.available || 'yes';
        const preview = document.getElementById('colorImagePreview');
        if (c.image) {
            preview.innerHTML = `<img src="${c.image}" style="width:100%;height:100%;object-fit:cover;">`;
            preview.style.display = 'block';
        } else {
            preview.innerHTML = '';
            preview.style.display = 'none';
        }
        renderColorList();
        document.getElementById('productColorName').focus();
    };

    window.toggleColorAvailable = function(index, value) {
        currentColors[index].available = value;
        renderColorList();
    };

    window.previewColorImage = function(e) {
        const preview = document.getElementById('colorImagePreview');
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    window.removeColor = function(index) {
        currentColors.splice(index, 1);
        renderColorList();
    };

document.getElementById('addColorBtn').addEventListener('click', () => {
        const hex = document.getElementById('productColor').value;
        const name = document.getElementById('productColorName').value.trim();
        const available = document.getElementById('productColorAvailable').value;
        const imgInput = document.getElementById('productColorImage');
        if (!name) { showToast('Enter colour name', 'error'); return; }
        
        const usage = formatBytes(getStorageUsage());
        console.log('Storage usage:', usage);
        
        const processColor = (imageData) => {
            if (editingColorIndex >= 0) {
                currentColors[editingColorIndex] = { hex, name, available, image: imageData || currentColors[editingColorIndex].image || '' };
                editingColorIndex = -1;
                showToast('Colour updated!');
            } else {
                currentColors.push({ hex, name, available, image: imageData || '' });
                showToast('Colour added!');
            }
            document.getElementById('productColorName').value = '';
            document.getElementById('colorImagePreview').innerHTML = '';
            document.getElementById('colorImagePreview').style.display = 'none';
            imgInput.value = '';
            renderColorList();
        };
        if (imgInput.files && imgInput.files[0]) {
            const file = imgInput.files[0];
            // Smaller size for color thumbnails
            compressImage(file, 400, 0.6).then(compressed => {
                if (!checkStorageQuota(compressed.length)) {
                    showToast('Storage full! Delete old images/products first.', 'error');
                    return;
                }
                processColor(compressed);
            }).catch(() => {
                if (!checkStorageQuota(1000)) {
                    showToast('Storage full!', 'error');
                    return;
                }
                processColor('');
            });
        } else {
            processColor(editingColorIndex >= 0 ? currentColors[editingColorIndex].image : '');
        }
    });

    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('gaura_products'));
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category === 'high-speed' ? 'High Speed' : 'Comfort Speed'}</td>
                <td>${p.batteryCapacity || '-'}<br><small style="color:var(--text-muted);">${p.batteryType || ''}</small></td>
                <td>${p.speed} km/h</td>
                <td>${p.range || '-'} km</td>
                <td>${p.chargeTime || '-'} hrs</td>
                <td>₹${p.price.toLocaleString()}</td>
                <td><span style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">${(p.colors||[]).map(c => `<span title="${c.name} (${c.available==='no'?'Sold Out':'In Stock'})" style="width:18px;height:18px;border-radius:50%;background:${c.hex};display:inline-block;border:2px solid ${c.available==='no'?'var(--danger)':'var(--glass-border)'};${c.available==='no'?'opacity:0.5;':''}"></span>`).join('')}${(!p.colors || p.colors.length===0) ? '<span style="color:var(--text-muted);">-</span>' : ''}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Add Product
    document.getElementById('addProductBtn').addEventListener('click', () => {
        editingProductId = null;
        currentColors = [];
        editingColorIndex = -1;
        renderColorList();
        document.getElementById('productModalTitle').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModal').classList.add('active');
    });

    // Save Product
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Save product clicked');
        const name = document.getElementById('productName').value.trim();
        const price = document.getElementById('productPrice').value;
        const speed = document.getElementById('productSpeed').value;
        const range = document.getElementById('productRange').value;
        console.log('Validation:', { name, price, speed, range });
        if (!name) { showToast('Enter model name', 'error'); return; }
        if (!price) { showToast('Enter price', 'error'); return; }
        if (!speed) { showToast('Enter top speed', 'error'); return; }
        if (!range) { showToast('Enter mileage', 'error'); return; }
        const products = JSON.parse(localStorage.getItem('gaura_products') || '[]');
        console.log('Current products:', products.length);
        console.log('Current colors:', currentColors);

        const productData = {
            id: editingProductId || Date.now(),
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value) || 0,
            speed: parseInt(document.getElementById('productSpeed').value) || 0,
            range: document.getElementById('productRange').value,
            chargeTime: document.getElementById('productChargeTime').value,
            batteryCapacity: document.getElementById('productBatteryCapacity').value,
            batteryType: document.getElementById('productBatteryType').value,
            colors: currentColors,
            badge: document.getElementById('productBadge').value,
            desc: document.getElementById('productDesc').value,
            image: ''
        };
        console.log('Product data to save:', productData);

        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = productData;
            } else {
                products.push(productData);
            }
        } else {
            products.push(productData);
        }

        try {
            localStorage.setItem('gaura_products', JSON.stringify(products));
            console.log('Saved successfully');
        } catch (err) {
            console.error('Save failed:', err);
            showToast('Save failed: ' + err.message, 'error');
            return;
        }
        document.getElementById('productModal').classList.remove('active');
        loadProducts();
        showToast(editingProductId ? 'Product updated!' : 'Product added!');
    });

    // Edit Product
    window.editProduct = function(id) {
        const products = JSON.parse(localStorage.getItem('gaura_products'));
        const product = products.find(p => p.id === id);
        editingProductId = id;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productSpeed').value = product.speed;
        document.getElementById('productRange').value = product.range;
        document.getElementById('productChargeTime').value = product.chargeTime || '';
        document.getElementById('productBatteryCapacity').value = product.batteryCapacity || '';
        document.getElementById('productBatteryType').value = product.batteryType || '';
        currentColors = JSON.parse(JSON.stringify(product.colors || []));
        renderColorList();
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productDesc').value = product.desc || '';
        document.getElementById('productModal').classList.add('active');
    };

    // Delete Product
    window.deleteProduct = function(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            let products = JSON.parse(localStorage.getItem('gaura_products'));
            products = products.filter(p => p.id !== id);
            localStorage.setItem('gaura_products', JSON.stringify(products));
            loadProducts();
            showToast('Product deleted!');
        }
    };

    // Close Modal
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('active');
    });
    document.getElementById('cancelModal').addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('active');
    });

    // ===== Features =====
    let editingFeatureId = null;

    function loadFeatures() {
        const features = JSON.parse(localStorage.getItem('gaura_features') || '[]');
        const tbody = document.getElementById('featuresTableBody');
        tbody.innerHTML = features.map(f => {
            const iconHtml = f.iconImage
                ? `<img src="${f.iconImage}" style="width:28px;height:28px;object-fit:contain;border-radius:4px;">`
                : `<i class="${f.icon}" style="font-size:20px;color:var(--primary);"></i>`;
            return `
            <tr>
                <td>${f.id}</td>
                <td>${iconHtml}</td>
                <td><strong>${f.title}</strong></td>
                <td>${f.desc}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editFeature(${f.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteFeature(${f.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // Feature Icon Upload
    let featureIconData = '';
    const featureIconUploadBtn = document.getElementById('featureIconUploadBtn');
    const featureIconFile = document.getElementById('featureIconFile');
    const featureIconPreview = document.getElementById('featureIconPreview');

    featureIconUploadBtn.addEventListener('click', () => featureIconFile.click());

    featureIconFile.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        compressImage(file, 200, 0.8).then(compressed => {
            featureIconData = compressed;
            featureIconPreview.innerHTML = `<img src="${featureIconData}" style="width:100%;height:100%;object-fit:contain;">`;
        }).catch(() => {
            showToast('Image too large! Try smaller file.');
        });
    });

    // Add Feature
    document.getElementById('addFeatureBtn').addEventListener('click', () => {
        editingFeatureId = null;
        document.getElementById('featureModalTitle').textContent = 'Add Feature';
        document.getElementById('featureForm').reset();
        document.getElementById('featureId').value = '';
        featureIconData = '';
        featureIconPreview.innerHTML = '<i class="fas fa-image"></i>';
        document.getElementById('featureModal').classList.add('active');
    });

    // Save Feature
    document.getElementById('featureForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const features = JSON.parse(localStorage.getItem('gaura_features') || '[]');
        const iconClass = document.getElementById('featureIcon').value.trim();

        if (!featureIconData && !iconClass) {
            showToast('Please upload an icon image or enter a FontAwesome class!');
            return;
        }

        const featureData = {
            id: editingFeatureId || Date.now(),
            title: document.getElementById('featureTitle').value,
            icon: iconClass,
            desc: document.getElementById('featureDesc').value
        };

        if (editingFeatureId) {
            const index = features.findIndex(f => String(f.id) === String(editingFeatureId));
            if (index === -1) { showToast('Feature not found!'); return; }
            featureData.iconImage = featureIconData || features[index].iconImage || '';
            features[index] = featureData;
        } else {
            featureData.iconImage = featureIconData || '';
            features.push(featureData);
        }

        localStorage.setItem('gaura_features', JSON.stringify(features));
        document.getElementById('featureModal').classList.remove('active');
        loadFeatures();
        showToast(editingFeatureId ? 'Feature updated!' : 'Feature added!');
        editingFeatureId = null;
    });

    // Edit Feature
    window.editFeature = function(id) {
        const features = JSON.parse(localStorage.getItem('gaura_features') || '[]');
        const feature = features.find(f => f.id === id);
        editingFeatureId = id;
        document.getElementById('featureModalTitle').textContent = 'Edit Feature';
        document.getElementById('featureTitle').value = feature.title;
        document.getElementById('featureIcon').value = feature.icon || '';
        document.getElementById('featureDesc').value = feature.desc;
        featureIconData = feature.iconImage || '';
        featureIconPreview.innerHTML = featureIconData
            ? `<img src="${featureIconData}" style="width:100%;height:100%;object-fit:contain;">`
            : '<i class="fas fa-image"></i>';
        document.getElementById('featureModal').classList.add('active');
    };

    // Delete Feature
    window.deleteFeature = function(id) {
        if (confirm('Are you sure you want to delete this feature?')) {
            let features = JSON.parse(localStorage.getItem('gaura_features') || '[]');
            features = features.filter(f => f.id !== id);
            localStorage.setItem('gaura_features', JSON.stringify(features));
            loadFeatures();
            showToast('Feature deleted!');
        }
    };

    // Close Feature Modal
    document.getElementById('closeFeatureModal').addEventListener('click', () => {
        document.getElementById('featureModal').classList.remove('active');
    });
    document.getElementById('cancelFeatureModal').addEventListener('click', () => {
        document.getElementById('featureModal').classList.remove('active');
    });

    // ===== Contact =====
    function loadContact() {
        const contact = JSON.parse(localStorage.getItem('gaura_contact'));
        document.getElementById('contactPhone').value = contact.phone || '';
        document.getElementById('contactWhatsApp').value = contact.whatsapp || '';
        document.getElementById('contactEmail').value = contact.email || '';
        document.getElementById('contactAddress').value = contact.address || '';
        document.getElementById('contactCity').value = contact.city || '';
        document.getElementById('contactState').value = contact.state || '';
        document.getElementById('contactGoogleMaps').value = contact.googleMaps || '';
        document.getElementById('contactGoogleReview').value = contact.googleReview || '';
        document.getElementById('contactFacebook').value = contact.facebook || '';
        document.getElementById('contactInstagram').value = contact.instagram || '';
        document.getElementById('contactYoutube').value = contact.youtube || '';
    }

    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const contactData = {
            phone: document.getElementById('contactPhone').value,
            whatsapp: document.getElementById('contactWhatsApp').value,
            email: document.getElementById('contactEmail').value,
            address: document.getElementById('contactAddress').value,
            city: document.getElementById('contactCity').value,
            state: document.getElementById('contactState').value,
            googleMaps: document.getElementById('contactGoogleMaps').value,
            googleReview: document.getElementById('contactGoogleReview').value,
            facebook: document.getElementById('contactFacebook').value,
            instagram: document.getElementById('contactInstagram').value,
            youtube: document.getElementById('contactYoutube').value
        };
        localStorage.setItem('gaura_contact', JSON.stringify(contactData));
        showToast('Contact info updated!');
    });

    // ===== Images =====
    function loadImages() {
        const images = JSON.parse(localStorage.getItem('gaura_images'));
        const grid = document.getElementById('imagesGrid');

        if (images.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-light);grid-column:1/-1;text-align:center;padding:40px;">No images uploaded yet.</p>';
            return;
        }

        grid.innerHTML = images.map((img, i) => `
            <div class="image-item">
                <img src="${img.data}" alt="${img.name}">
                <div class="image-item-info">
                    <h4>${img.name}</h4>
                    <p>${img.type}</p>
                </div>
                <div class="image-item-actions">
                    <button class="action-btn delete" onclick="deleteImage(${i})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
}

// Clear All Images
    document.getElementById('clearImagesBtn').addEventListener('click', () => {
        if (confirm('Delete ALL gallery images? This cannot be undone.')) {
            localStorage.setItem('gaura_images', JSON.stringify([]));
            loadImages();
            loadDashboard();
            showToast('All images cleared!');
        }
    });

    // Upload Image
    document.getElementById('addImageBtn').addEventListener('click', () => {
        document.getElementById('imageModal').classList.add('active');
    });

    document.getElementById('imageUploadPreview').addEventListener('click', () => {
        document.getElementById('imageFile').click();
    });

    document.getElementById('imageFile').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imageUploadPreview').innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('imageUploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('imageFile');
        const name = document.getElementById('imageName').value || 'Untitled';
        const type = document.getElementById('imageType').value;

        if (!fileInput.files[0]) {
            alert('Please select an image!');
            return;
        }

        compressImage(fileInput.files[0], 1200, 0.75).then(compressed => {
            if (!checkStorageQuota(compressed.length)) { showToast('Storage full! Delete some images first.'); return; }
            try {
                const images = JSON.parse(localStorage.getItem('gaura_images') || '[]');
                images.push({
                    name: name,
                    type: type,
                    data: compressed,
                    date: new Date().toISOString()
                });
                localStorage.setItem('gaura_images', JSON.stringify(images));
                document.getElementById('imageModal').classList.remove('active');
                this.reset();
                document.getElementById('imageUploadPreview').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Click to select image</p>';
                loadImages();
                showToast('Image uploaded!');
            } catch(e) {
                showToast('Storage full! Delete some images first.');
            }
        }).catch(() => showToast('Image too large!'));
    });

    window.deleteImage = function(index) {
        if (confirm('Delete this image?')) {
            let images = JSON.parse(localStorage.getItem('gaura_images'));
            images.splice(index, 1);
            localStorage.setItem('gaura_images', JSON.stringify(images));
            loadImages();
            showToast('Image deleted!');
        }
    };

    document.getElementById('closeImageModal').addEventListener('click', () => {
        document.getElementById('imageModal').classList.remove('active');
    });
    document.getElementById('cancelImageModal').addEventListener('click', () => {
        document.getElementById('imageModal').classList.remove('active');
    });

    // ===== Theme =====
    function loadTheme() {
        const customColors = JSON.parse(localStorage.getItem('gaura_customColors') || '{}');
        if (customColors.primary) {
            document.getElementById('colorPrimary').value = customColors.primary;
        }
        generateThemePreview();
    }

    function generateThemePreview() {
        const p = document.getElementById('colorPrimary').value;
        document.getElementById('prevPrimary').style.background = p;
    }

    document.getElementById('colorPrimary').addEventListener('input', generateThemePreview);

    document.getElementById('applyCustomTheme').addEventListener('click', () => {
        const p = document.getElementById('colorPrimary').value;
        const colors = { primary: p };
        localStorage.setItem('gaura_customColors', JSON.stringify(colors));
        localStorage.setItem('gaura_theme', 'custom');
        applyCustomColors(colors);
        const msg = document.getElementById('themeAppliedMsg');
        msg.style.display = 'inline';
        setTimeout(() => { msg.style.display = 'none'; }, 2000);
        showToast('Theme applied!');
    });

    function applyCustomColors(c) {
        document.documentElement.style.setProperty('--primary', c.primary);
    }

    // ===== Settings =====
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('gaura_settings'));
        document.getElementById('companyName').value = settings.companyName || '';
        document.getElementById('websiteTitle').value = settings.title || '';
        document.getElementById('websiteTagline').value = settings.tagline || '';
        document.getElementById('featuresTitle').value = settings.featuresTitle || '';
        document.getElementById('featuresSubtitle').value = settings.featuresSubtitle || '';
        document.getElementById('metaDescription').value = settings.metaDesc || '';
        document.getElementById('copyrightText').value = settings.copyright || '';
        

        
        // Load logo preview
        const logoPreviewImg = document.getElementById('logoPreviewImg');
        const logoPlaceholderIcon = document.getElementById('logoPlaceholderIcon');
        const removeLogoBtn = document.getElementById('removeLogoBtn');
        if (settings.logo) {
            logoPreviewImg.src = settings.logo;
            logoPreviewImg.style.display = 'block';
            logoPlaceholderIcon.style.display = 'none';
            removeLogoBtn.style.display = 'inline-flex';
        } else {
            logoPreviewImg.style.display = 'none';
            logoPlaceholderIcon.style.display = 'block';
            removeLogoBtn.style.display = 'none';
        }

        // Load hero slider settings
        const hero = JSON.parse(localStorage.getItem('gaura_hero') || '{}');
        if (hero.slide1Title) document.getElementById('heroSlide1Title').value = hero.slide1Title;
        if (hero.slide1Subtitle) document.getElementById('heroSlide1Subtitle').value = hero.slide1Subtitle;
        if (hero.slide1Badge) document.getElementById('heroSlide1Badge').value = hero.slide1Badge;
        if (hero.slide2Title) document.getElementById('heroSlide2Title').value = hero.slide2Title;
        if (hero.slide2Subtitle) document.getElementById('heroSlide2Subtitle').value = hero.slide2Subtitle;
        if (hero.slide2Badge) document.getElementById('heroSlide2Badge').value = hero.slide2Badge;
        if (hero.slide3Title) document.getElementById('heroSlide3Title').value = hero.slide3Title;
        if (hero.slide3Subtitle) document.getElementById('heroSlide3Subtitle').value = hero.slide3Subtitle;
        if (hero.slide3Badge) document.getElementById('heroSlide3Badge').value = hero.slide3Badge;
        if (hero.slide4Title) document.getElementById('heroSlide4Title').value = hero.slide4Title;
        if (hero.slide4Subtitle) document.getElementById('heroSlide4Subtitle').value = hero.slide4Subtitle;
        if (hero.slide4Badge) document.getElementById('heroSlide4Badge').value = hero.slide4Badge;
        if (hero.slide5Title) document.getElementById('heroSlide5Title').value = hero.slide5Title;
        if (hero.slide5Subtitle) document.getElementById('heroSlide5Subtitle').value = hero.slide5Subtitle;
        if (hero.slide5Badge) document.getElementById('heroSlide5Badge').value = hero.slide5Badge;
        // Load slide images
        [1,2,3,4,5].forEach(n => {
            const key = 'slide' + n + 'Image';
            const preview = document.getElementById('heroSlide' + n + 'Preview');
            const removeBtn = document.getElementById('heroSlide' + n + 'Remove');
            if (hero[key]) {
                preview.innerHTML = '<img src="' + hero[key] + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
                removeBtn.style.display = 'inline-flex';
            } else {
                preview.innerHTML = '<span style="color:var(--text-muted);font-size:12px;">No image</span>';
                removeBtn.style.display = 'none';
            }
            // Load slide product images
            const pKey = 'slide' + n + 'ProductImage';
            const pPreview = document.getElementById('heroSlide' + n + 'ProductPreview');
            const pRemoveBtn = document.getElementById('heroSlide' + n + 'ProductRemove');
            if (pPreview && hero[pKey]) {
                pPreview.innerHTML = '<img src="' + hero[pKey] + '" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">';
                if (pRemoveBtn) pRemoveBtn.style.display = 'inline-flex';
            }
        });
    }

    // Hero slide image upload handlers
    function setupHeroSlideUpload(n) {
        const input = document.getElementById('heroSlide' + n + 'Image');
        if (!input) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = new Image();
                img.onload = function() {
                    try {
                        let w = img.width, h = img.height;
                        if (w > 1200) { h = Math.round(h * 1200 / w); w = 1200; }
                        const canvas = document.createElement('canvas');
                        canvas.width = w; canvas.height = h;
                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                        let compressed = canvas.toDataURL('image/jpeg', 0.7);
                        if (compressed.length > 500000) compressed = canvas.toDataURL('image/jpeg', 0.4);
                        saveHeroSlideImage(n, compressed);
                    } catch(e) {
                        saveHeroSlideImage(n, ev.target.result);
                    }
                };
                img.onerror = function() { saveHeroSlideImage(n, ev.target.result); };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    function saveHeroSlideImage(n, data) {
        try {
            const hero = JSON.parse(localStorage.getItem('gaura_hero') || '{}');
            hero['slide' + n + 'Image'] = data;
            localStorage.setItem('gaura_hero', JSON.stringify(hero));
            document.getElementById('heroSlide' + n + 'Preview').innerHTML = '<img src="' + data + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
            document.getElementById('heroSlide' + n + 'Remove').style.display = 'inline-flex';
            showToast('Slide ' + n + ' image uploaded!');
        } catch(e) {
            showToast('Storage full! Delete some data first.');
        }
    }
    setupHeroSlideUpload(1);
    setupHeroSlideUpload(2);
    setupHeroSlideUpload(3);
    setupHeroSlideUpload(4);
    setupHeroSlideUpload(5);

    window.removeHeroSlideImage = function(n) {
        const hero = JSON.parse(localStorage.getItem('gaura_hero') || '{}');
        delete hero['slide' + n + 'Image'];
        localStorage.setItem('gaura_hero', JSON.stringify(hero));
        document.getElementById('heroSlide' + n + 'Preview').innerHTML = '<span style="color:var(--text-muted);font-size:12px;">No image</span>';
        document.getElementById('heroSlide' + n + 'Remove').style.display = 'none';
        showToast('Slide ' + n + ' image removed!');
    };

    // Hero slide product image upload handlers
    function setupHeroSlideProductUpload(n) {
        const input = document.getElementById('heroSlide' + n + 'ProductImage');
        if (!input) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = new Image();
                img.onload = function() {
                    try {
                        let w = img.width, h = img.height;
                        if (w > 1000) { h = Math.round(h * 1000 / w); w = 1000; }
                        const canvas = document.createElement('canvas');
                        canvas.width = w; canvas.height = h;
                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                        let compressed = canvas.toDataURL('image/jpeg', 0.7);
                        if (compressed.length > 500000) compressed = canvas.toDataURL('image/jpeg', 0.4);
                        saveHeroSlideProductImage(n, compressed);
                    } catch(e) {
                        saveHeroSlideProductImage(n, ev.target.result);
                    }
                };
                img.onerror = function() { saveHeroSlideProductImage(n, ev.target.result); };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    function saveHeroSlideProductImage(n, data) {
        try {
            const hero = JSON.parse(localStorage.getItem('gaura_hero') || '{}');
            hero['slide' + n + 'ProductImage'] = data;
            localStorage.setItem('gaura_hero', JSON.stringify(hero));
            document.getElementById('heroSlide' + n + 'ProductPreview').innerHTML = '<img src="' + data + '" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">';
            document.getElementById('heroSlide' + n + 'ProductRemove').style.display = 'inline-flex';
            showToast('Slide ' + n + ' product image uploaded!');
        } catch(e) {
            showToast('Storage full! Delete some data first.');
        }
    }
    setupHeroSlideProductUpload(1);
    setupHeroSlideProductUpload(2);
    setupHeroSlideProductUpload(3);
    setupHeroSlideProductUpload(4);
    setupHeroSlideProductUpload(5);

    window.removeHeroSlideProductImage = function(n) {
        const hero = JSON.parse(localStorage.getItem('gaura_hero') || '{}');
        delete hero['slide' + n + 'ProductImage'];
        localStorage.setItem('gaura_hero', JSON.stringify(hero));
        document.getElementById('heroSlide' + n + 'ProductPreview').innerHTML = '<i class="fas fa-motorcycle" style="font-size:24px;color:var(--text-muted);"></i>';
        document.getElementById('heroSlide' + n + 'ProductRemove').style.display = 'none';
        showToast('Slide ' + n + ' product image removed!');
    };

    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        const admin = JSON.parse(localStorage.getItem('gaura_admin'));

        if (current !== admin.password) {
            alert('Current password is incorrect!');
            return;
        }
        if (newPass !== confirm) {
            alert('New passwords do not match!');
            return;
        }
        if (newPass.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }

        admin.password = newPass;
        localStorage.setItem('gaura_admin', JSON.stringify(admin));
        this.reset();
        showToast('Password updated!');
    });

    document.getElementById('websiteSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const settings = {
            companyName: document.getElementById('companyName').value,
            title: document.getElementById('websiteTitle').value,
            tagline: document.getElementById('websiteTagline').value,
            featuresTitle: document.getElementById('featuresTitle').value,
            featuresSubtitle: document.getElementById('featuresSubtitle').value,
            metaDesc: document.getElementById('metaDescription').value,
            copyright: document.getElementById('copyrightText').value
        };
        // Preserve existing logo
        const existingSettings = JSON.parse(localStorage.getItem('gaura_settings') || '{}');
        if (existingSettings.logo) settings.logo = existingSettings.logo;
        localStorage.setItem('gaura_settings', JSON.stringify(settings));
        showToast('Settings saved!');
    });

    // Hero Settings Form
    document.getElementById('heroSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const hero = {
            slide1Title: document.getElementById('heroSlide1Title').value,
            slide1Subtitle: document.getElementById('heroSlide1Subtitle').value,
            slide1Badge: document.getElementById('heroSlide1Badge').value,
            slide2Title: document.getElementById('heroSlide2Title').value,
            slide2Subtitle: document.getElementById('heroSlide2Subtitle').value,
            slide2Badge: document.getElementById('heroSlide2Badge').value,
            slide3Title: document.getElementById('heroSlide3Title').value,
            slide3Subtitle: document.getElementById('heroSlide3Subtitle').value,
            slide3Badge: document.getElementById('heroSlide3Badge').value,
            slide4Title: document.getElementById('heroSlide4Title').value,
            slide4Subtitle: document.getElementById('heroSlide4Subtitle').value,
            slide4Badge: document.getElementById('heroSlide4Badge').value,
            slide5Title: document.getElementById('heroSlide5Title').value,
            slide5Subtitle: document.getElementById('heroSlide5Subtitle').value,
            slide5Badge: document.getElementById('heroSlide5Badge').value
        };
        localStorage.setItem('gaura_hero', JSON.stringify(hero));
        showToast('Hero slider settings saved!');
    });

    // About Settings Form
    document.getElementById('aboutSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const about = {
            title: document.getElementById('aboutTitle').value,
            description: document.getElementById('aboutDescription').value,
            stat1: document.getElementById('aboutStat1').value,
            stat1Label: document.getElementById('aboutStat1Label').value,
            stat2: document.getElementById('aboutStat2').value,
            stat2Label: document.getElementById('aboutStat2Label').value,
            stat3: document.getElementById('aboutStat3').value,
            stat3Label: document.getElementById('aboutStat3Label').value
        };
        const existingAbout = JSON.parse(localStorage.getItem('gaura_about') || '{}');
        if (existingAbout.image) about.image = existingAbout.image;
        localStorage.setItem('gaura_about', JSON.stringify(about));
        showToast('About settings saved!');
    });

    // Load About Settings
    (function loadAboutSettings() {
        const about = JSON.parse(localStorage.getItem('gaura_about') || '{}');
        if (about.title) document.getElementById('aboutTitle').value = about.title;
        if (about.description) document.getElementById('aboutDescription').value = about.description;
        if (about.stat1) document.getElementById('aboutStat1').value = about.stat1;
        if (about.stat1Label) document.getElementById('aboutStat1Label').value = about.stat1Label;
        if (about.stat2) document.getElementById('aboutStat2').value = about.stat2;
        if (about.stat2Label) document.getElementById('aboutStat2Label').value = about.stat2Label;
        if (about.stat3) document.getElementById('aboutStat3').value = about.stat3;
        if (about.stat3Label) document.getElementById('aboutStat3Label').value = about.stat3Label;
        const preview = document.getElementById('aboutImagePreview');
        const removeBtn = document.getElementById('aboutImageRemove');
        if (about.image) {
            preview.innerHTML = '<img src="' + about.image + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
            removeBtn.style.display = 'inline-flex';
        }
    })();

    // About Image Upload
    document.getElementById('aboutImageUpload').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            const img = new Image();
            img.onload = function() {
                try {
                    let w = img.width, h = img.height;
                    if (w > 1200) { h = Math.round(h * 1200 / w); w = 1200; }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    let compressed = canvas.toDataURL('image/jpeg', 0.7);
                    if (compressed.length > 500000) compressed = canvas.toDataURL('image/jpeg', 0.4);
                    saveAboutImage(compressed);
                } catch(e) {
                    saveAboutImage(ev.target.result);
                }
            };
            img.onerror = function() { saveAboutImage(ev.target.result); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    function saveAboutImage(data) {
        try {
            const about = JSON.parse(localStorage.getItem('gaura_about') || '{}');
            about.image = data;
            localStorage.setItem('gaura_about', JSON.stringify(about));
            document.getElementById('aboutImagePreview').innerHTML = '<img src="' + data + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
            document.getElementById('aboutImageRemove').style.display = 'inline-flex';
            showToast('About image uploaded!');
        } catch(e) {
            showToast('Storage full! Delete some data first.');
        }
    }

    document.getElementById('aboutImageRemove').addEventListener('click', function() {
        if (confirm('Remove about image?')) {
            const about = JSON.parse(localStorage.getItem('gaura_about') || '{}');
            delete about.image;
            localStorage.setItem('gaura_about', JSON.stringify(about));
            document.getElementById('aboutImagePreview').innerHTML = '<span style="color:var(--text-muted);font-size:12px;">No image</span>';
            document.getElementById('aboutImageRemove').style.display = 'none';
            document.getElementById('aboutImageUpload').value = '';
            showToast('About image removed!');
        }
    });

    // ===== Testimonials / Google Reviews =====
    let testimonialPhotoData = '';

    function renderTestimonialList() {
        const list = document.getElementById('testimonialList');
        const reviews = JSON.parse(localStorage.getItem('gaura_testimonials') || '[]');
        if (reviews.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No reviews added yet.</p>';
            return;
        }
        list.innerHTML = reviews.map((r, i) => {
            const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
            const photoHtml = r.photo ? '<img src="' + r.photo + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">' : '<div style="width:36px;height:36px;border-radius:50%;background:var(--glass);display:flex;align-items:center;justify-content:center;"><i class="fas fa-user" style="font-size:14px;color:var(--text-muted);"></i></div>';
            return '<div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:var(--glass);border:1px solid var(--glass-border);border-radius:10px;">' +
                photoHtml +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="font-size:13px;color:#ffc107;">' + stars + '</div>' +
                    '<div style="font-size:13px;color:var(--text);font-weight:500;">' + r.name + ' <span style="color:var(--text-muted);font-weight:400;">(' + (r.designation || '') + ')</span></div>' +
                    '<div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + r.text + '</div>' +
                '</div>' +
                '<button class="btn btn-sm btn-secondary" onclick="editTestimonial(' + i + ')" style="flex-shrink:0;"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteTestimonial(' + i + ')" style="flex-shrink:0;"><i class="fas fa-trash"></i></button>' +
            '</div>';
        }).join('');
    }
    renderTestimonialList();

    window.editTestimonial = function(i) {
        const reviews = JSON.parse(localStorage.getItem('gaura_testimonials') || '[]');
        const r = reviews[i];
        if (!r) return;
        document.getElementById('testimonialEditIndex').value = i;
        document.getElementById('testimonialName').value = r.name || '';
        document.getElementById('testimonialDesignation').value = r.designation || '';
        document.getElementById('testimonialText').value = r.text || '';
        document.getElementById('testimonialRating').value = r.rating || 5;
        const preview = document.getElementById('testimonialPhotoPreview');
        const removeBtn = document.getElementById('testimonialPhotoRemove');
        if (r.photo) {
            preview.innerHTML = '<img src="' + r.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
            removeBtn.style.display = 'inline-flex';
            testimonialPhotoData = r.photo;
        } else {
            preview.innerHTML = '<i class="fas fa-user" style="font-size:20px;color:var(--text-muted);"></i>';
            removeBtn.style.display = 'none';
            testimonialPhotoData = '';
        }
        document.getElementById('testimonialSubmitText').textContent = 'Update Review';
        document.getElementById('testimonialCancelBtn').style.display = 'inline-flex';
    };

    window.deleteTestimonial = function(i) {
        if (!confirm('Delete this review?')) return;
        const reviews = JSON.parse(localStorage.getItem('gaura_testimonials') || '[]');
        reviews.splice(i, 1);
        localStorage.setItem('gaura_testimonials', JSON.stringify(reviews));
        renderTestimonialList();
        showToast('Review deleted!');
    };

    document.getElementById('testimonialCancelBtn').addEventListener('click', function() {
        document.getElementById('testimonialEditIndex').value = -1;
        document.getElementById('testimonialName').value = '';
        document.getElementById('testimonialDesignation').value = '';
        document.getElementById('testimonialText').value = '';
        document.getElementById('testimonialRating').value = '5';
        document.getElementById('testimonialPhotoPreview').innerHTML = '<i class="fas fa-user" style="font-size:20px;color:var(--text-muted);"></i>';
        document.getElementById('testimonialPhotoRemove').style.display = 'none';
        document.getElementById('testimonialPhoto').value = '';
        document.getElementById('testimonialSubmitText').textContent = 'Add Review';
        document.getElementById('testimonialCancelBtn').style.display = 'none';
        testimonialPhotoData = '';
    });

    document.getElementById('testimonialPhoto').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            testimonialPhotoData = ev.target.result;
            document.getElementById('testimonialPhotoPreview').innerHTML = '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
            document.getElementById('testimonialPhotoRemove').style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('testimonialPhotoRemove').addEventListener('click', function() {
        testimonialPhotoData = '';
        document.getElementById('testimonialPhotoPreview').innerHTML = '<i class="fas fa-user" style="font-size:20px;color:var(--text-muted);"></i>';
        document.getElementById('testimonialPhotoRemove').style.display = 'none';
        document.getElementById('testimonialPhoto').value = '';
    });

    document.getElementById('testimonialForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('testimonialName').value.trim();
        const text = document.getElementById('testimonialText').value.trim();
        if (!name || !text) { showToast('Name and Review are required!', true); return; }
        const review = {
            name: name,
            designation: document.getElementById('testimonialDesignation').value.trim(),
            text: text,
            rating: parseInt(document.getElementById('testimonialRating').value),
            photo: testimonialPhotoData
        };
        const reviews = JSON.parse(localStorage.getItem('gaura_testimonials') || '[]');
        const editIdx = parseInt(document.getElementById('testimonialEditIndex').value);
        if (editIdx >= 0) {
            reviews[editIdx] = review;
            showToast('Review updated!');
        } else {
            reviews.push(review);
            showToast('Review added!');
        }
        localStorage.setItem('gaura_testimonials', JSON.stringify(reviews));
        renderTestimonialList();
        document.getElementById('testimonialForm').reset();
        document.getElementById('testimonialEditIndex').value = -1;
        document.getElementById('testimonialPhotoPreview').innerHTML = '<i class="fas fa-user" style="font-size:20px;color:var(--text-muted);"></i>';
        document.getElementById('testimonialPhotoRemove').style.display = 'none';
        document.getElementById('testimonialSubmitText').textContent = 'Add Review';
        document.getElementById('testimonialCancelBtn').style.display = 'none';
        testimonialPhotoData = '';
    });

    // ===== Savings Section Settings =====
    document.getElementById('savingsSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const savings = {
            tag: document.getElementById('savingsTag').value,
            title: document.getElementById('savingsTitle').value,
            subtitle: document.getElementById('savingsSubtitle').value,
            card1Title: document.getElementById('savingsCard1Title').value,
            card1Amount: document.getElementById('savingsCard1Amount').value,
            card1Desc: document.getElementById('savingsCard1Desc').value,
            card2Title: document.getElementById('savingsCard2Title').value,
            card2Amount: document.getElementById('savingsCard2Amount').value,
            card2Desc: document.getElementById('savingsCard2Desc').value,
            card3Title: document.getElementById('savingsCard3Title').value,
            card3Amount: document.getElementById('savingsCard3Amount').value,
            card3Desc: document.getElementById('savingsCard3Desc').value
        };
        localStorage.setItem('gaura_savings', JSON.stringify(savings));
        showToast('Savings settings saved!');
    });

    // Load Savings Settings
    (function loadSavingsSettings() {
        const savings = JSON.parse(localStorage.getItem('gaura_savings') || '{}');
        if (savings.tag) document.getElementById('savingsTag').value = savings.tag;
        if (savings.title) document.getElementById('savingsTitle').value = savings.title;
        if (savings.subtitle) document.getElementById('savingsSubtitle').value = savings.subtitle;
        if (savings.card1Title) document.getElementById('savingsCard1Title').value = savings.card1Title;
        if (savings.card1Amount) document.getElementById('savingsCard1Amount').value = savings.card1Amount;
        if (savings.card1Desc) document.getElementById('savingsCard1Desc').value = savings.card1Desc;
        if (savings.card2Title) document.getElementById('savingsCard2Title').value = savings.card2Title;
        if (savings.card2Amount) document.getElementById('savingsCard2Amount').value = savings.card2Amount;
        if (savings.card2Desc) document.getElementById('savingsCard2Desc').value = savings.card2Desc;
        if (savings.card3Title) document.getElementById('savingsCard3Title').value = savings.card3Title;
        if (savings.card3Amount) document.getElementById('savingsCard3Amount').value = savings.card3Amount;
        if (savings.card3Desc) document.getElementById('savingsCard3Desc').value = savings.card3Desc;
    })();

    // Logo Upload
    document.getElementById('uploadLogoBtn').addEventListener('click', () => {
        document.getElementById('logoUpload').click();
    });

    document.getElementById('logoPreview').addEventListener('click', () => {
        document.getElementById('logoUpload').click();
    });

    document.getElementById('logoUpload').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            compressImage(file, 400, 0.85).then(compressed => {
                if (!checkStorageQuota()) { showToast('Storage full! Delete some data first.'); return; }
                try {
                    const settings = JSON.parse(localStorage.getItem('gaura_settings') || '{}');
                    settings.logo = compressed;
                    localStorage.setItem('gaura_settings', JSON.stringify(settings));
                    document.getElementById('logoPreviewImg').src = compressed;
                    document.getElementById('logoPreviewImg').style.display = 'block';
                    document.getElementById('logoPlaceholderIcon').style.display = 'none';
                    document.getElementById('removeLogoBtn').style.display = 'inline-flex';
                    showToast('Logo uploaded!');
                } catch(e) {
                    showToast('Storage full! Delete some data first.');
                }
            }).catch(() => showToast('Image too large!'));
        }
    });

    document.getElementById('removeLogoBtn').addEventListener('click', () => {
        if (confirm('Remove logo?')) {
            const settings = JSON.parse(localStorage.getItem('gaura_settings') || '{}');
            delete settings.logo;
            localStorage.setItem('gaura_settings', JSON.stringify(settings));
            document.getElementById('logoPreviewImg').style.display = 'none';
            document.getElementById('logoPreviewImg').src = '';
            document.getElementById('logoPlaceholderIcon').style.display = 'block';
            document.getElementById('removeLogoBtn').style.display = 'none';
            document.getElementById('logoUpload').value = '';
            showToast('Logo removed!');
        }
    });



    // Export Data
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        try {
            const data = {
                products: JSON.parse(localStorage.getItem('gaura_products') || '[]'),
                features: JSON.parse(localStorage.getItem('gaura_features') || '[]'),
                contact: JSON.parse(localStorage.getItem('gaura_contact') || '{}'),
                settings: JSON.parse(localStorage.getItem('gaura_settings') || '{}'),
                theme: localStorage.getItem('gaura_theme') || '',
                images: JSON.parse(localStorage.getItem('gaura_images') || '[]'),
                customColors: JSON.parse(localStorage.getItem('gaura_customColors') || '{}')
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const companyNameForFile = (data.settings && data.settings.companyName)
                ? data.settings.companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : 'company';
            a.download = `${companyNameForFile}-data-backup.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported!');
        } catch (err) {
            alert('Export failed: ' + err.message);
        }
    });

    // Import Data
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.products) localStorage.setItem('gaura_products', JSON.stringify(data.products));
                    if (data.features) localStorage.setItem('gaura_features', JSON.stringify(data.features));
                    if (data.contact) localStorage.setItem('gaura_contact', JSON.stringify(data.contact));
                    if (data.settings) localStorage.setItem('gaura_settings', JSON.stringify(data.settings));
                    if (data.theme) localStorage.setItem('gaura_theme', data.theme);
                    if (data.images) localStorage.setItem('gaura_images', JSON.stringify(data.images));
                    if (data.customColors) localStorage.setItem('gaura_customColors', JSON.stringify(data.customColors));
                    showToast('Data imported successfully!');
                    loadDashboard();
                } catch (err) {
                    alert('Invalid file format!');
                }
            };
            reader.readAsText(file);
        }
    });

    // Reset Data
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        if (confirm('This will reset ALL data to defaults. Are you sure?')) {
            localStorage.removeItem('gaura_products');
            localStorage.removeItem('gaura_features');
            localStorage.removeItem('gaura_contact');
            localStorage.removeItem('gaura_settings');
            localStorage.removeItem('gaura_images');
            localStorage.removeItem('gaura_theme');
            localStorage.removeItem('gaura_customColors');
            initializeData();
            showToast('All data reset to defaults!');
            loadDashboard();
        }
    });

    // Backup Section - Export
    document.getElementById('exportDataBtn2').addEventListener('click', () => {
        document.getElementById('exportDataBtn').click();
    });

    // Backup Section - Import
    document.getElementById('importDataBtn2').addEventListener('click', () => {
        document.getElementById('importFile2').click();
    });

    document.getElementById('importFile2').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.products) localStorage.setItem('gaura_products', JSON.stringify(data.products));
                    if (data.features) localStorage.setItem('gaura_features', JSON.stringify(data.features));
                    if (data.contact) localStorage.setItem('gaura_contact', JSON.stringify(data.contact));
                    if (data.settings) localStorage.setItem('gaura_settings', JSON.stringify(data.settings));
                    if (data.theme) localStorage.setItem('gaura_theme', data.theme);
                    if (data.images) localStorage.setItem('gaura_images', JSON.stringify(data.images));
                    if (data.customColors) localStorage.setItem('gaura_customColors', JSON.stringify(data.customColors));
                    showToast('Data imported successfully!');
                    setTimeout(() => location.reload(), 1000);
                } catch (err) {
                    alert('Invalid file format!');
                }
            };
            reader.readAsText(file);
        }
    });

    // Initial load
    loadDashboard();
}

// ===== Toast Notification =====
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    toastMsg.textContent = message;
    toast.className = isError ? 'toast error show' : 'toast show';
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Close modals on outside click =====
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ===== Auto Capitalize Product Form Inputs =====
document.addEventListener('input', function(e) {
    const el = e.target;
    if (el.id === 'productForm' || el.closest('#productForm')) {
        if ((el.tagName === 'INPUT' && el.type === 'text') || el.tagName === 'TEXTAREA') {
            const pos = el.selectionStart;
            const oldLen = el.value.length;
            el.value = el.value.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
            el.setSelectionRange(pos + (el.value.length - oldLen), pos + (el.value.length - oldLen));
        }
    }
});
