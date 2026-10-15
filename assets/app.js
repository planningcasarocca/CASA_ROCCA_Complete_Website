/* Copy this adapter into assets/app.js. Set ZOHO_PRODUCTS_API to the deployed
 * Apps Script Web App URL ending in /exec. This uses JSONP because static sites
 * may be hosted on a different domain from Apps Script. No Zoho secret is here.
 */

/* =========================================================
 * CASA ROCCA - LIVE PRODUCT CATALOGUE
 * Connected to Zoho Books through Google Apps Script
 * ========================================================= */

const ZOHO_PRODUCTS_API =
  'https://script.google.com/a/macros/casarocca.co.th/s/AKfycbyLfOWtFkdfWg37F8Z4aRn9rDCO_oGe5VyPLyrG1_Xu6kg_UrtPeWhq1kL0D9hctB3xkA/exec';


function escapeHtml(value) {
  return String(value == null ? '' : value).replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c])
  );
}


function getDisplayImageUrl(url) {
  const value = String(url || '').trim();

  if (!value) return '';

  // Convert Google Drive links to an image-display URL.
  const match = value.match(/[?&]id=([^&]+)/);

  if (value.includes('drive.google.com') && match) {
    return 'https://drive.google.com/thumbnail?id='
      + encodeURIComponent(match[1])
      + '&sz=w1200';
  }

  return value;
}


/**
 * Load active products from Website_Products via Apps Script JSONP.
 * Normalize API fields to the field names already used by the website.
 */

function loadZohoProducts() {
  return new Promise((resolve, reject) => {
    const callbackName =
      'crZohoProducts_' +
      Date.now() + '_' +
      Math.floor(Math.random() * 10000);

    const script = document.createElement('script');
    let finished = false;

    const timeout = setTimeout(() => {
      finish(new Error('Timed out loading product catalogue.'));
    }, 20000);

    function finish(error, data) {
      if (finished) return;
      finished = true;

      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();

      if (error) {
        reject(error);
        return;
      }

      if (!data || data.success !== true ||
        !Array.isArray(data.products)) {
        reject(new Error(
          data?.message || 'Invalid response from product API.'
        ));
        return;
      }

      console.log('ตัวอย่างข้อมูลสินค้าจาก API:', data.products.slice(0, 5));
      console.log(
        'ตัวอย่าง URL รูป:',
        data.products.slice(0, 5).map(item => ({
          name: item.name,
          item_id: item.item_id,
          image_url: item.image_url
        }))
      );

      const normalizedProducts = data.products.map(item => ({
        id: String(item.item_id || ''),
        item_id: String(item.item_id || ''),
        name: String(item.name || ''),
        sku: String(item.sku || ''),
        description: String(item.description || ''),
        price: item.rate == null || item.rate === ''
          ? null
          : Number(item.rate),
        unit: String(item.unit || ''),
        status: String(item.status || '').toLowerCase(),

        // ใช้ Category จริงจาก Google Sheets
        category: String(item.category || '').trim(),

        brand: String(item.category || '').trim() || 'Product',
        currency: 'THB',
        imageUrl: String(item.image_url || '').trim()
      }));

      // แสดงสินค้าทั้งหมด แม้บางรายการจะไม่มีรูป
      resolve(normalizedProducts);
    }

    window[callbackName] = data => finish(null, data);

    script.onerror = () => {
      finish(new Error('Could not connect to product API.'));
    };

    script.src =
      ZOHO_PRODUCTS_API +
      (ZOHO_PRODUCTS_API.includes('?') ? '&' : '?') +
      'action=products' +
      '&callback=' + encodeURIComponent(callbackName) +
      '&_=' + Date.now();

    document.head.appendChild(script);
  });
}


/**
 * Render a product card using the existing website design.
 */

function liveProductCard(p) {
  const category = String(p.category || '').trim() || 'Uncategorized';


  const imageUrl = getDisplayImageUrl(p.imageUrl);

  const img = imageUrl
    ? `<div class="product-image">
       <img
         src="${escapeHtml(imageUrl)}"
         alt="${escapeHtml(p.name)}"
         loading="lazy"
         onerror="this.parentElement.classList.add('image-error'); this.style.display='none';"
       >
     </div>`
    : '';


  const price =
    p.price == null || !Number.isFinite(Number(p.price))
      ? 'Contact us for price'
      : new Intl.NumberFormat('en-TH', {
        style: 'currency',
        currency: p.currency || 'THB',
        maximumFractionDigits: 2
      }).format(Number(p.price));

  return `
    <article
      class="tile product-item"
      data-category="${escapeHtml(normalizeCategory(category))}"
      data-search="${escapeHtml([
    p.name, p.sku, p.description, category
  ].join(' ').toLowerCase())}">

      ${img}

      <div class="tile-copy">
        <span class="tag">${escapeHtml(category)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || '')}</p>

        <p class="product-price">
          <strong>${escapeHtml(price)}</strong>
          ${p.unit ? `<span>/ ${escapeHtml(p.unit)}</span>` : ''}
        </p>

        <p class="product-sku">
          ${p.sku ? 'SKU: ' + escapeHtml(p.sku) : ''}
        </p>

        <a class="text-link"
           href="product-detail.html?itemId=${encodeURIComponent(p.id)}">
          View details ↗
        </a>
      </div>
    </article>
  `;
}



const LOGO = 'https://raw.githubusercontent.com/planningcasarocca/Picture/main/beyond-preview.png';
const nav = [['Home', 'index.html'], ['Products', 'products.html'], ['Projects', 'projects.html'], ['Services', 'about.html#services'], ['About Us', 'about.html#about'], ['Catalog', 'catalog.html'], ['Articles', 'articles.html'], ['Contact', 'contact.html']];
const products = [['CASA PORCELAIN', 'Porcelain tile for interior and exterior spaces', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85', 'Porcelain'], ['CASA CERAMIC', 'Ceramic tile for considered interiors', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85', 'Ceramic'], ['CASA WOOD', 'WPC decking, lath, wall and ceiling solutions', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85', 'WPC'], ['CASA FLOOR', 'Luxury vinyl tile in wood, stone and carpet designs', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85', 'LVT'], ['TARKETT', 'Vinyl flooring and specialist flooring solutions', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85', 'Tarkett']];
const designs = [['Wood Design', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80'], ['Marble Design', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80'], ['Stone Design', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=80'], ['Travertine Design', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80'], ['Carpet Design', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80'], ['Artificial Design', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=700&q=80']];
const projects = [['CASA ROCCA Gallery', 'Showroom', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85', 'Showroom materials and design inspiration.'], ['HYATT REGENCY BANGKOK', 'Hospitality', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85', 'Project reference listed on the official website.'], ['HYDE 11', 'Residential', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85', 'Residential project reference.'], ['SIRIRAJ PIYAMAHARAJKARUN', 'Healthcare', 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=85', 'Healthcare project reference.'], ['IKEA BANGYAI', 'Retail & Commercial', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85', 'Retail project reference.'], ['PRIVATE RESIDENCE', 'Residential', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85', 'Residential WPC project reference.']];
const articles = [['พื้นไม้ WPC Decking เปลี่ยนพื้นที่รอบอาคาร ให้เป็นมุมพักผ่อนกลางสวน', 'WPC', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 'แนวทางเลือกไม้พื้น WPC สำหรับพื้นที่ภายนอกและมุมพักผ่อน'], ['กระเบื้องยาง LVT ลายไม้ อัปเกรดงานพื้นสวยสมจริง', 'LVT', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', 'ทำความรู้จักกระเบื้องยางลายไม้และแนวทางเลือกใช้'], ['ดีไซน์สวนสวยด้วยกระเบื้องพอร์ซเลน 2 ซม.', 'Porcelain', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80', 'ไอเดียเลือกวัสดุปูพื้นสำหรับพื้นที่ภายนอก'], ['ฝนตกไม่กลัวพื้นลื่น เลือกวัสดุปูพื้นหน้าฝน', 'Materials', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', 'ข้อควรพิจารณาเรื่องวัสดุและความปลอดภัยในช่วงหน้าฝน'], ['รู้จัก LEED Score มาตรฐานอาคารยุคใหม่', 'Sustainability', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', 'ความรู้เบื้องต้นเกี่ยวกับแนวคิดอาคารเพื่อสิ่งแวดล้อม'], ['เลือกกระเบื้องปูพื้นห้องน้ำอย่างไรให้สวยและปลอดภัย', 'Guides', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 'ข้อควรพิจารณาในการเลือกวัสดุปูพื้นห้องน้ำ']];
function header(active) { return `<div class="topline">Premium flooring & wall materials · for considered spaces</div><header class="header"><div class="wrap nav"><a class="brand" href="index.html" aria-label="CASA ROCCA home"><img src="${LOGO}" alt="CASA ROCCA logo" onerror="this.style.display='none';this.parentElement.innerHTML='<strong style=\'font-size:22px;letter-spacing:.18em\'>CASA ROCCA</strong>'"></a><nav class="navlinks">${nav.map(([n, u]) => `<a class="${active === n ? 'active' : ''}" href="${u}">${n}</a>`).join('')}</nav><div class="navtools"><button class="lang" id="langBtn" aria-label="Switch language">EN / TH</button><button class="hamb" id="hamb" aria-label="Open menu">☰</button></div></div><nav class="mobile-nav" id="mobileNav">${nav.map(([n, u]) => `<a href="${u}">${n}</a>`).join('')}</nav></header>` }
function footer() { return `<footer class="footer"><div class="wrap"><div class="footer-grid"><div><div class="footer-logo"><img src="${LOGO}" alt="CASA ROCCA logo" onerror="this.style.display='none'"></div><p>Thoughtfully selected flooring and wall materials for residential and commercial spaces.</p><p>57 Soi Phaholyothin 11, Phayathai,<br>Bangkok 10400, Thailand</p><p><a href="tel:026185577">02 618 5577</a> · <a href="tel:0891252525">089 125 2525</a></p></div><div><h4>CASA ROCCA</h4><div class="footer-links"><a href="about.html">About Us</a><a href="projects.html">Projects</a><a href="about.html#services">Services</a><a href="contact.html">Contact Us</a></div></div><div><h4>Products</h4><div class="footer-links">${products.map(p => `<a href="products.html?category=${encodeURIComponent(p[3])}">${p[0]}</a>`).join('')}</div></div><div><h4>Contact</h4><div class="footer-links"><a href="mailto:casarocca@casarocca.co.th">casarocca@casarocca.co.th</a><a href="mailto:casarocca.store@gmail.com">casarocca.store@gmail.com</a><a href="https://www.google.com/maps/search/?api=1&query=57+Soi+Phaholyothin+11+Bangkok" target="_blank" rel="noopener">Showroom map ↗</a><a href="contact.html">Send an enquiry ↗</a></div></div></div><div class="footer-bottom"><span>© <span id="year"></span> CASA ROCCA. All rights reserved.</span><span>Premium flooring & wall materials · <a href="contact.html">Privacy & enquiries</a></span></div></div></footer>` }
function cardProduct(p) { return `<article class="tile product-item" data-category="${p[3].toLowerCase()}" data-search="${(p[0] + ' ' + p[1] + ' ' + p[3]).toLowerCase()}"><img src="${p[2]}" alt="${p[0]} flooring material" loading="lazy"><div class="tile-copy"><span class="tag">${p[3]}</span><h3>${p[0]}</h3><p>${p[1]}</p><a class="text-link" href="product-detail.html?brand=${encodeURIComponent(p[0])}">Explore collection ↗</a></div></article>` }
function cardProject(p, i) { return `<a class="project-card" href="project-detail.html?id=${i}" style="--project-fallback:linear-gradient(135deg,#222 0%,#555 48%,#171717 100%)"><img src="${p[2]}" alt="Illustrative image for ${p[0]}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')"><div class="card-copy"><span class="eyebrow">${p[1]}</span><h3>${p[0]}</h3><p>View project ↗</p></div></a>` }
function cardArticle(a, i) { return `<article class="article-card" data-category="${a[1].toLowerCase()}" data-search="${(a[0] + ' ' + a[1] + ' ' + a[3]).toLowerCase()}"><a href="article-detail.html?id=${i}"><img src="${a[2]}" alt="${a[0]}" loading="lazy"></a><div class="meta">${a[1]} · Article</div><h3><a href="article-detail.html?id=${i}">${a[0]}</a></h3><p>${a[3]}</p><a class="text-link" href="article-detail.html?id=${i}">Read article ↗</a></article>` }
function shell(title, active, body, desc = 'CASA ROCCA premium flooring and wall materials') { document.title = title + ' | CASA ROCCA'; document.getElementById('app').innerHTML = header(active) + body + footer(); document.querySelector('meta[name="description"]')?.setAttribute('content', desc); document.getElementById('hamb')?.addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('open')); document.getElementById('year').textContent = new Date().getFullYear(); document.getElementById('langBtn')?.addEventListener('click', () => alert('Thai/English content switching is a planned integration. This demo currently displays English navigation; official Thai content is available at casarocca.co.th.')); }
function home() { shell('Home', 'Home', `<main><section class="hero"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90" alt="Contemporary interior with premium flooring"><div class="wrap hero-content"><div class="eyebrow">Materials for modern living</div><h1>BEYOND EVERY<br><span class="red">LIVING</span> STANDARD.</h1><p>Premium flooring and wall materials designed to elevate every space — from intimate homes to ambitious commercial projects.</p><div class="actions"><a class="btn primary" href="products.html">Explore products ↗</a><a class="btn outline-light" href="projects.html">View projects</a></div></div></section><section class="section"><div class="wrap head"><div><div class="eyebrow">Explore the collections</div><h2>Materials that shape<br>the way we live.</h2></div><p>Discover the CASA ROCCA material families and explore solutions for residential, hospitality, retail and commercial spaces.</p></div><div class="wrap grid brands">${products.map(p => `<a class="brand-card" href="products.html?category=${encodeURIComponent(p[3])}"><img src="${p[2]}" alt="${p[0]} collection" loading="lazy"><div class="card-copy"><div class="eyebrow">${p[3]}</div><h3>${p[0]}</h3><p>${p[1]}</p><span class="text-link">View products ↗</span></div></a>`).join('')}</div></section><section class="section soft"><div class="wrap"><div class="head"><div><div class="eyebrow">Shop by design</div><h2>Find your material.</h2></div><p>Browse by visual direction. Product availability and technical specifications should be confirmed with CASA ROCCA.</p></div><div class="grid tiles">${designs.map(d => `<a class="tile" href="products.html?design=${encodeURIComponent(d[0])}"><img src="${d[1]}" alt="${d[0]} material design" loading="lazy"><div class="tile-copy"><h3>${d[0]}</h3><span class="text-link">Explore ↗</span></div></a>`).join('')}</div></div></section><section class="section"><div class="wrap head"><div><div class="eyebrow">Selected references</div><h2>Projects in context.</h2></div><a class="btn dark" href="projects.html">All projects ↗</a></div><div class="wrap grid projects-grid">${projects.slice(0, 3).map(cardProject).join('')}</div><div class="wrap notice">Project cards use representative imagery. Confirm project photographs and material attribution against the official project pages before publication.</div></section><section class="section dark"><div class="wrap feature-split"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=85" alt="Architectural interior material detail" loading="lazy"><div><div class="eyebrow">The CASA ROCCA philosophy</div><h2>Quality materials.<br><span class="red">Thoughtful spaces.</span></h2><p>CASA ROCCA curates flooring and wall materials with attention to design, suitability and customer needs. Our team supports material selection for homes and project environments.</p><a class="btn primary" href="about.html">About CASA ROCCA ↗</a></div></div></section><section class="section"><div class="wrap head"><div><div class="eyebrow">Ideas & insights</div><h2>Material knowledge.</h2></div><a class="btn" href="articles.html">Read all articles ↗</a></div><div class="wrap grid article-grid">${articles.slice(0, 3).map(cardArticle).join('')}</div></section><section class="section soft"><div class="wrap head"><div><div class="eyebrow">Visit us</div><h2>See materials<br>in person.</h2></div><p>Visit the showroom for material inspiration and speak with the team about your project.</p></div><div class="wrap grid locations"><div class="location"><span class="tag">Showroom</span><h3>CASA ROCCA Gallery</h3><p>57 Soi Phaholyothin 11, Phayathai, Bangkok 10400</p><p>Monday–Friday · 9:00–17:00 (confirm before visiting)</p><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=57+Soi+Phaholyothin+11+Bangkok">View map ↗</a></div><div class="location"><span class="tag">Warehouse</span><h3>CASA ROCCA Warehouse</h3><p>555 Moo 2, Soi Kingkaew 14/1, Racha Thewa, Bang Phli, Samut Prakan 10540</p><p>Monday–Saturday · hours should be confirmed before visiting</p><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=555+Moo+2+Soi+Kingkaew+14%2F1+Samut+Prakan">View map ↗</a></div></div></section><section class="section"><div class="wrap head"><div><div class="eyebrow">Start a conversation</div><h2>Let’s create better<br>spaces together.</h2></div><a class="btn primary" href="contact.html">Contact our team ↗</a></div></section></main>`) }

function productsPage() {
  const params = new URLSearchParams(location.search);

  shell(
    'Products',
    'Products',
    `
      <main>
        <section class="page-hero">
          <div class="wrap">
            <div class="eyebrow">Explore materials</div>
            <h1 class="page-title">Products & collections</h1>
            <p>Browse products by category or search by name, SKU and description.</p>

            <div class="searchbar">
              <input
                id="productSearch"
                placeholder="Search product, SKU or description…"
                aria-label="Search products"
              >
              <button id="searchGo">Search</button>
            </div>

            <div class="filters" id="productFilters">
              <button class="filter active" data-filter="all">All</button>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="wrap grid tiles" id="productGrid">
            <div class="notice">Loading product catalogue…</div>
          </div>

          <div class="wrap notice" id="catalogueNotice">
            Loading live catalogue from Zoho Books.
          </div>
        </section>
      </main>
    `
  );

  const grid = document.getElementById('productGrid');
  const filters = document.getElementById('productFilters');
  const searchInput = document.getElementById('productSearch');
  const searchButton = document.getElementById('searchGo');
  const notice = document.getElementById('catalogueNotice');

  let activeCategory = normalizeCategory(
    params.get('category') || 'all'
  );

  function renderCategoryButtons(items) {
    // เก็บชื่อ Category จริง และตัดหมวดหมู่ซ้ำ
    const categoryMap = new Map();

    items.forEach(product => {
      const label = String(product.category || '').trim();

      if (!label) return;

      const key = normalizeCategory(label);

      if (key && !categoryMap.has(key)) {
        categoryMap.set(key, label);
      }
    });

    const categories = [...categoryMap.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]));

    filters.innerHTML = [
      `<button class="filter" data-filter="all">All</button>`,
      ...categories.map(([key, label]) => `
        <button
          class="filter"
          data-filter="${escapeHtml(key)}"
          title="${escapeHtml(label)}"
        >${escapeHtml(label)}</button>
      `)
    ].join('');

    // ถ้าหมวดหมู่จาก URL ไม่มีอยู่จริง ให้แสดง All
    if (
      activeCategory !== 'all' &&
      !categoryMap.has(activeCategory)
    ) {
      activeCategory = 'all';
    }

    filters.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle(
        'active',
        button.dataset.filter === activeCategory
      );

      button.addEventListener('click', () => {
        activeCategory = button.dataset.filter;

        filters.querySelectorAll('[data-filter]').forEach(item => {
          item.classList.toggle('active', item === button);
        });

        applyProductFilters();
      });
    });
  }

  function applyProductFilters() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    grid.querySelectorAll('.product-item').forEach(card => {
      const category = normalizeCategory(card.dataset.category || '');
      const searchText = String(card.dataset.search || '').toLowerCase();

      const categoryMatches =
        activeCategory === 'all' || category === activeCategory;

      const searchMatches = !query || searchText.includes(query);
      const visible = categoryMatches && searchMatches;

      card.classList.toggle('hide', !visible);

      if (visible) visibleCount++;
    });

    let emptyMessage = document.getElementById('productEmpty');

    if (visibleCount === 0) {
      if (!emptyMessage) {
        emptyMessage = document.createElement('div');
        emptyMessage.id = 'productEmpty';
        emptyMessage.className = 'empty';
        emptyMessage.textContent =
          'No products found in this category.';
        grid.appendChild(emptyMessage);
      }
    } else if (emptyMessage) {
      emptyMessage.remove();
    }
  }

  searchButton.addEventListener('click', applyProductFilters);
  searchInput.addEventListener('input', applyProductFilters);

  loadZohoProducts()
    .then(items => {
      // สร้างปุ่มจาก Category ที่ API ส่งมาจริง
      renderCategoryButtons(items);

      grid.innerHTML = items.length
        ? items.map(liveProductCard).join('')
        : '<div class="empty">No active products available.</div>';

      applyProductFilters();

      const missingCategoryCount = items.filter(
        product => !String(product.category || '').trim()
      ).length;

      notice.textContent = missingCategoryCount
        ? `Live catalogue: ${items.length} products. ` +
        `${missingCategoryCount} products have no Category.`
        : `Live catalogue from Zoho Books: ${items.length} products ` +
        `across ${filters.querySelectorAll('[data-filter]').length - 1} categories.`;
    })
    .catch(error => {
      console.error('Product catalogue error:', error);

      grid.innerHTML = `
        <div class="notice">
          The live product catalogue is temporarily unavailable.
          Please try again later.
        </div>
      `;

      notice.textContent = 'Unable to load the live product catalogue.';
    });
}


/**
 * ทำให้ค่า Category ใช้เปรียบเทียบกันได้
 */
function normalizeCategory(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}


function detailPage() {
  const params = new URLSearchParams(location.search);
  const itemId = params.get('itemId');

  // Product from Zoho Books
  if (itemId && ZOHO_PRODUCTS_API) {
    shell(
      'Product details',
      'Products',
      `
        <main>
          <section class="page-hero">
            <div class="wrap">
              <div class="eyebrow">Product details</div>
              <h1 class="page-title">Loading product…</h1>
            </div>
          </section>

          <section class="section">
            <div class="wrap" id="liveProductDetail">
              <div class="notice">
                Loading product information from Zoho Books…
              </div>
            </div>
          </section>
        </main>
      `
    );

    loadZohoProducts()
      .then(items => {
        const p = items.find(
          item => String(item.id) === String(itemId)
        );

        const target = document.getElementById('liveProductDetail');

        if (!target) return;

        if (!p) {
          target.innerHTML = `
            <div class="empty">
              This product is not available or is no longer published.
            </div>
            <a class="btn" href="products.html">All products</a>
          `;
          return;
        }

        // Format price
        const price =
          p.price == null || !Number.isFinite(Number(p.price))
            ? 'Contact us for price'
            : new Intl.NumberFormat('en-TH', {
                style: 'currency',
                currency: p.currency || 'THB',
                maximumFractionDigits: 2
              }).format(Number(p.price));

        // Convert Google Drive URL into an image-display URL
        const detailImageUrl = getDisplayImageUrl(p.imageUrl);

        // Product image
        const detailImage = detailImageUrl
          ? `
              <div class="product-detail-image">
                <img
                  src="${escapeHtml(detailImageUrl)}"
                  alt="${escapeHtml(p.name)}"
                  loading="eager"
                  onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
                >
              </div>
            `
          : `
              <div class="product-detail-image image-error">
                <div class="doc-icon">CASA ROCCA</div>
              </div>
            `;

        // Render product details
        target.innerHTML = `
          <article class="feature-split product-detail-layout">
            ${detailImage}

            <div class="product-detail-copy">
              <span class="tag">
                ${escapeHtml(p.category || p.brand || 'Product')}
              </span>

              <h2>${escapeHtml(p.name)}</h2>

              <p>
                ${escapeHtml(
                  p.description || 'Product description is not available.'
                )}
              </p>

              <h3 class="product-detail-price">
                ${escapeHtml(price)}
                ${p.unit ? ' / ' + escapeHtml(p.unit) : ''}
              </h3>

              ${
                p.sku
                  ? `<p class="product-detail-sku">SKU: ${escapeHtml(p.sku)}</p>`
                  : ''
              }

              <div class="actions">
                <a
                  class="btn primary"
                  href="contact.html?subject=${encodeURIComponent(
                    'Product enquiry: ' + p.name +
                    (p.sku ? ' (SKU: ' + p.sku + ')' : '')
                  )}"
                >
                  Enquire about this product ↗
                </a>

                <a class="btn" href="products.html">
                  All products
                </a>
              </div>
            </div>
          </article>
        `;

        // Update browser tab title and page heading
        document.title = p.name + ' | CASA ROCCA';

        const pageTitle = document.querySelector('.page-title');

        if (pageTitle) {
          pageTitle.textContent = p.name;
        }
      })
      .catch(error => {
        console.error('Product detail error:', error);

        const target = document.getElementById('liveProductDetail');

        if (target) {
          target.innerHTML = `
            <div class="notice">
              Unable to load product information.
              Please try again later.
            </div>
            <a class="btn" href="products.html">All products</a>
          `;
        }
      });

    return;
  }

  // Existing collection detail page
  const brand = params.get('brand') || 'CASA ROCCA';
  const p = products.find(item => item[0] === brand) || products[0];

  shell(
    p[0],
    'Products',
    `
      <main>
        <section class="page-hero">
          <div class="wrap">
            <div class="eyebrow">Product collection</div>
            <h1 class="page-title">${p[0]}</h1>
            <p>${p[1]}</p>
          </div>
        </section>

        <section class="section">
          <div class="wrap feature-split">
            <img
              src="${p[2]}"
              alt="${p[0]} illustrative collection image"
            >

            <div>
              <span class="tag">${p[3]}</span>
              <h2>${p[0]}</h2>

              <p>
                ${p[1]}. Contact CASA ROCCA for current product
                availability, technical data, samples and installation guidance.
              </p>

              <div class="notice">
                This is a collection overview using illustrative imagery.
                It does not represent a verified SKU or technical specification.
              </div>

              <div class="actions">
                <a class="btn primary" href="contact.html">
                  Ask about this collection ↗
                </a>
                <a class="btn" href="products.html">All products</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    `
  );
}

function aboutPage() { shell('About Us', 'About Us', `<main><section class="page-hero" id="about"><div class="wrap"><div class="eyebrow">About CASA ROCCA</div><h1 class="page-title">Beyond every living standard.</h1><p>CASA ROCCA focuses on curated flooring and wall materials for residential and commercial spaces, bringing together design, quality and guidance for each project.</p></div></section><section class="section"><div class="wrap feature-split"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=85" alt="Interior material and architecture" loading="lazy"><div><div class="eyebrow">Our story</div><h2>Material expertise<br>for considered spaces.</h2><p>The official CASA ROCCA website identifies the company as a flooring and wall-material specialist and presents its CASA ROCCA Standard as a commitment to product quality and customer satisfaction.</p><p>We recommend confirming corporate history, founding milestones and any specific quality claims with the company before using them in formal publications.</p><a class="btn primary" href="contact.html">Talk to our team ↗</a></div></div></section><section class="section dark"><div class="wrap"><div class="head"><div><div class="eyebrow">CASA ROCCA Standard</div><h2>Quality is in the details.</h2></div><p>Material performance varies by product. Always review the relevant technical datasheet before specifying a product.</p></div><div class="grid tiles">${[['Strength', 'Material strength depends on the selected product.'], ['Scratch resistance', 'Check product-specific test data.'], ['Water resistance', 'Confirm suitability for the intended environment.'], ['Design', 'A range of surfaces, patterns and finishes.']].map(x => `<div class="tile" style="padding:24px"><span class="red">✳</span><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div></div></section><section class="section" id="services"><div class="wrap head"><div><div class="eyebrow">How we help</div><h2>Services</h2></div><p>Speak with the CASA ROCCA team about the right materials for your project.</p></div><div class="wrap grid tiles">${[['Product consultation', 'Discuss requirements and suitable material options.'], ['Material selection', 'Compare design directions and application needs.'], ['Project support', 'Coordinate product information for project teams.'], ['Delivery enquiries', 'Confirm delivery coverage and schedules with the team.'], ['Warranty information', 'Request current product-specific warranty terms.'], ['Installation enquiries', 'Ask about installation guidance and available services.']].map(x => `<div class="tile" style="padding:22px"><h3>${x[0]}</h3><p>${x[1]}</p><a class="text-link" href="contact.html">Enquire ↗</a></div>`).join('')}</div></section><section class="section soft"><div class="wrap head"><div><div class="eyebrow">Visit CASA ROCCA</div><h2>Showroom & warehouse</h2></div><a class="btn" href="contact.html">Contact details ↗</a></div><div class="wrap grid locations"><div class="location"><h3>Showroom</h3><p>57 Soi Phaholyothin 11, Phayathai, Bangkok 10400</p><p>Official contact page lists Monday–Friday, 9:00–17:00.</p><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=57+Soi+Phaholyothin+11+Bangkok">View map ↗</a></div><div class="location"><h3>Warehouse</h3><p>555 Moo 2, Soi Kingkaew 14/1, Racha Thewa, Bang Phli, Samut Prakan 10540</p><p>Contact the company to confirm current opening hours.</p><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=555+Moo+2+Soi+Kingkaew+14%2F1+Samut+Prakan">View map ↗</a></div></div></section><section class="section"><div class="wrap head"><div><div class="eyebrow">Have a project in mind?</div><h2>Let’s talk about your space.</h2></div><a class="btn primary" href="contact.html">Contact CASA ROCCA ↗</a></div></section></main>`); }
function projectsPage() { shell('Projects', 'Projects', `<main><section class="page-hero"><div class="wrap"><div class="eyebrow">Project references</div><h1 class="page-title">Materials in real spaces.</h1><p>Browse selected project references. Some gallery imagery below is representative demo imagery and is not the actual project photography.</p><div class="filters" id="projectFilters">${['All', 'Residential', 'Hospitality', 'Healthcare', 'Retail & Commercial', 'Showroom'].map((c, i) => `<button class="filter ${i === 0 ? 'active' : ''}" data-pfilter="${c.toLowerCase()}">${c}</button>`).join('')}</div></div></section><section class="section"><div class="wrap grid projects-grid" id="projectGrid">${projects.map((p, i) => `<div data-pcategory="${p[1].toLowerCase()}">${cardProject(p, i)}</div>`).join('')}</div><div class="wrap notice">Project names are based on references listed on CASA ROCCA’s official project pages; displayed imagery and summaries are placeholders where verified source assets were not embedded. Confirm materials and project details before publication.</div></section></main>`); document.querySelectorAll('[data-pfilter]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('[data-pfilter]').forEach(x => x.classList.toggle('active', x === b)); let f = b.dataset.pfilter; document.querySelectorAll('[data-pcategory]').forEach(el => el.classList.toggle('hide', f !== 'all' && !el.dataset.pcategory.includes(f))) })) }
function projectDetail() { let id = Number(new URLSearchParams(location.search).get('id') || 0); let p = projects[id] || projects[0]; shell(p[0], 'Projects', `<main><section class="page-hero"><div class="wrap"><div class="eyebrow">Project reference · ${p[1]}</div><h1 class="page-title">${p[0]}</h1><p>${p[3]}</p></div></section><section class="section"><div class="wrap feature-split"><img src="${p[2]}" alt="Illustrative image for ${p[0]}" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')"><div><div class="tag">Reference listing</div><h2>${p[0]}</h2><p>${p[3]} The actual project description, design credits, installed products and images should be checked against the official project reference.</p><div class="notice">Demo presentation: image is illustrative and not confirmed as a photograph of this project.</div><a class="btn primary" href="products.html">Explore products ↗</a> <a class="btn" href="projects.html">All projects</a></div></div><div class="wrap section"><div class="head"><div><div class="eyebrow">Related materials</div><h2>Explore collections</h2></div></div><div class="grid tiles">${products.slice(0, 3).map(cardProduct).join('')}</div></div></section></main>`) }
function catalogPage() { shell('Catalog', 'Catalog', `<main><section class="page-hero"><div class="wrap"><div class="eyebrow">Downloads & resources</div><h1 class="page-title">Catalog library</h1><p>Find product families and request current catalogues from CASA ROCCA.</p><div class="filters" id="catalogFilters">${['All', 'Porcelain', 'Ceramic', 'WPC', 'LVT', 'Tarkett'].map((c, i) => `<button class="filter ${i === 0 ? 'active' : ''}" data-cfilter="${c.toLowerCase()}">${c}</button>`).join('')}</div></div></section><section class="section"><div class="wrap grid catalog-grid" id="catalogGrid">${products.map(p => `<article class="catalog-card" data-ccategory="${p[3].toLowerCase()}"><div class="doc-icon">▤</div><span class="tag">${p[3]}</span><h3>${p[0]} catalogue</h3><p>${p[1]}. Request the latest official PDF from the company.</p><a class="btn primary" href="contact.html?subject=${encodeURIComponent('Catalogue request: ' + p[0])}">Request catalogue ↗</a></article>`).join('')}</div><div class="wrap notice">No direct PDF URLs are published here because a verified current PDF file was not confirmed. Buttons open the contact page instead of a fabricated download link.</div></section></main>`); document.querySelectorAll('[data-cfilter]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('[data-cfilter]').forEach(x => x.classList.toggle('active', x === b)); let f = b.dataset.cfilter; document.querySelectorAll('[data-ccategory]').forEach(el => el.classList.toggle('hide', f !== 'all' && el.dataset.ccategory !== f)) })) }
function articlesPage() { shell('Articles', 'Articles', `<main><section class="page-hero"><div class="wrap"><div class="eyebrow">Ideas & material knowledge</div><h1 class="page-title">Articles</h1><p>Guides and insights about flooring and wall materials, applications and design decisions. Titles are drawn from the official CASA ROCCA article listing; summaries are brief descriptions for this demo.</p><div class="searchbar"><input id="articleSearch" placeholder="Search articles…" aria-label="Search articles"><button id="articleSearchBtn">Search</button></div><div class="filters" id="articleFilters">${['All', 'WPC', 'LVT', 'Porcelain', 'Materials', 'Sustainability', 'Guides'].map((c, i) => `<button class="filter ${i === 0 ? 'active' : ''}" data-afilter="${c.toLowerCase()}">${c}</button>`).join('')}</div></div></section><section class="section"><div class="wrap grid article-grid" id="articleGrid">${articles.map(cardArticle).join('')}</div><div class="wrap notice">Publication dates and full article body are not reproduced unless verified from the source. Open the official article library for the latest published versions.</div><div class="wrap" style="margin-top:22px"><a class="btn" href="https://casarocca.co.th/th-articles/" target="_blank" rel="noopener">Official article library ↗</a></div></section></main>`); let f = 'all', q = ''; function apply() { let n = 0; document.querySelectorAll('.article-card').forEach(el => { let ok = (f === 'all' || el.dataset.category === f) && el.dataset.search.includes(q); el.classList.toggle('hide', !ok); if (ok) n++ }); let empty = document.getElementById('articleEmpty'); if (!n && !empty) { empty = document.createElement('div'); empty.id = 'articleEmpty'; empty.className = 'empty'; empty.textContent = 'No articles match your search.'; document.getElementById('articleGrid').append(empty) } if (n) empty?.remove() } document.querySelectorAll('[data-afilter]').forEach(b => b.addEventListener('click', () => { f = b.dataset.afilter; document.querySelectorAll('[data-afilter]').forEach(x => x.classList.toggle('active', x === b)); apply() })); let inp = document.getElementById('articleSearch'); document.getElementById('articleSearchBtn').onclick = () => { q = inp.value.toLowerCase(); apply() }; inp.addEventListener('input', () => { q = inp.value.toLowerCase(); apply() }) }
function articleDetail() { let id = Number(new URLSearchParams(location.search).get('id') || 0), a = articles[id] || articles[0]; shell(a[0], 'Articles', `<main><section class="page-hero"><div class="wrap"><div class="eyebrow">Article · ${a[1]}</div><h1 class="page-title">${a[0]}</h1><p>Material knowledge from CASA ROCCA</p></div></section><section class="section"><article class="wrap feature-split"><img src="${a[2]}" alt="${a[0]} representative image"><div><span class="tag">${a[1]}</span><h2>${a[0]}</h2><p>${a[3]}.</p><p>This page is a demo article detail layout. The complete, authoritative article text and publication date should be loaded from the official CASA ROCCA article page.</p><a class="btn primary" href="https://casarocca.co.th/th-articles/" target="_blank" rel="noopener">Read official articles ↗</a><a class="btn" href="products.html">Related products</a></div></article></section></main>`) }
function contactPage() { shell('Contact Us', 'Contact', `<main><section class="page-hero"><div class="wrap"><div class="eyebrow">Contact CASA ROCCA</div><h1 class="page-title">Let’s talk about your project.</h1><p>Contact the team for product enquiries, catalogue requests, material selection and project support.</p></div></section><section class="section map-section"><div class="wrap"><div class="head"><div><div class="eyebrow">Find us</div><h2>Showroom & warehouse</h2></div><p>Open either location in Google Maps for directions. Map previews are provided by Google Maps.</p></div><div class="map-gallery"><article class="map-card"><iframe title="CASA ROCCA showroom map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=CASA%20ROCCA%20Thailand%2C%2057%20Soi%20Phaholyothin%2011%2C%20Bangkok&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe><div class="map-caption"><div><span class="tag">Showroom</span><h3>CASA ROCCA Thailand</h3><p>57 Soi Phaholyothin 11, Phayathai, Bangkok 10400</p></div><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=CASA+ROCCA+Thailand+57+Soi+Phaholyothin+11+Bangkok">Open in Maps ↗</a></div></article><article class="map-card"><iframe title="CASA ROCCA warehouse map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=CASA%20ROCCA%20Warehouse%2C%20555%20Moo%202%20Soi%20Kingkaew%2014%2F1%2C%20Samut%20Prakan&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe><div class="map-caption"><div><span class="tag">Warehouse</span><h3>CASA ROCCA Warehouse & Outlet</h3><p>555 Moo 2, Soi Kingkaew 14/1, Racha Thewa, Bang Phli, Samut Prakan 10540</p></div><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=CASA+ROCCA+Warehouse+555+Moo+2+Soi+Kingkaew+14%2F1+Samut+Prakan">Open in Maps ↗</a></div></article></div></div></section><section class="section"><div class="wrap contact-layout"><aside class="contact-info"><div class="eyebrow">Contact channels</div><h2>CASA ROCCA</h2><p><strong>Company</strong><br>CASA ROCCA Co., Ltd.</p><p><strong>Telephone</strong><br><a href="tel:026185577">02 618 5577</a><br><a href="tel:0891252525">089 125 2525</a></p><p><strong>Email</strong><br><a href="mailto:casarocca@casarocca.co.th">casarocca@casarocca.co.th</a><br><a href="mailto:casarocca.store@gmail.com">casarocca.store@gmail.com</a></p><p><strong>LINE</strong><br>@casarocca</p><hr style="border-color:#444;margin:24px 0"><p><strong>Showroom</strong><br>57 Soi Phaholyothin 11, Phayathai, Bangkok 10400</p><a class="btn outline-light" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=57+Soi+Phaholyothin+11+Bangkok">Showroom map ↗</a><p style="margin-top:22px"><strong>Warehouse</strong><br>555 Moo 2, Soi Kingkaew 14/1, Racha Thewa, Bang Phli, Samut Prakan 10540</p><a class="btn outline-light" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=555+Moo+2+Soi+Kingkaew+14%2F1+Samut+Prakan">Warehouse map ↗</a></aside><form class="form" id="contactForm"><div class="eyebrow">Send an enquiry</div><h2 style="font-size:32px;margin:8px 0 24px">How can we help?</h2><div class="form-grid"><div class="field"><label for="name">Name *</label><input id="name" name="name" required autocomplete="name"></div><div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required autocomplete="email"></div><div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div><div class="field"><label for="company">Company</label><input id="company" name="company" autocomplete="organization"></div><div class="field full"><label for="type">Inquiry type *</label><select id="type" name="type" required><option value="">Select an enquiry</option><option>Product information</option><option>Catalogue request</option><option>Project support</option><option>Showroom visit</option><option>Other</option></select></div><div class="field full"><label for="message">Message *</label><textarea id="message" name="message" required></textarea></div><div class="field full"><button class="btn primary" type="submit">Validate enquiry ↗</button><div class="message" id="formMessage" role="status"></div><div class="notice">Demo form only: it validates your details in the browser but does not transmit or save them. Connect an approved backend or CRM before launch.</div></div></div></form></div></section></main>`); const params = new URLSearchParams(location.search); if (params.get('subject')) document.getElementById('message').value = params.get('subject'); document.getElementById('contactForm').addEventListener('submit', e => { e.preventDefault(); const f = e.currentTarget; if (!f.reportValidity()) return; document.getElementById('formMessage').textContent = 'Validation successful. Demo only — your enquiry has not been sent. Please email casarocca@casarocca.co.th or connect the form to a backend.'; document.getElementById('formMessage').style.color = '#a30f19' }) }


// Shared page router: each HTML file declares its route with body[data-page].
function initCasaRoccaPage() {
  const page = document.body.dataset.page || 'home';
  const pages = {
    'home': home,
    'products': productsPage,
    'product-detail': detailPage,
    'about': aboutPage,
    'projects': projectsPage,
    'project-detail': projectDetail,
    'catalog': catalogPage,
    'articles': articlesPage,
    'article-detail': articleDetail,
    'contact': contactPage
  };
  (pages[page] || home)();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCasaRoccaPage, { once: true });
} else {
  initCasaRoccaPage();
}
