// Kad lapa ir ielādēta, izpilda galveno funkcionalitāti
document.addEventListener('DOMContentLoaded', function () {
    // Galveno elementu atlase no DOM
    const vakancesContainer = document.getElementById('vakances-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const kategorijuSelect = document.getElementById('kategoriju-select');
    const darbaVietaSelect = document.getElementById('darba-vieta-select');
    const sortBySelect = document.getElementById('sort-by');
    const sortOrderSelect = document.getElementById('sort-order');
    const clearFiltersButton = document.getElementById('clear-filters');

    // Datu masīvi un lapošanas mainīgie
    let vakances = [];
    let filteredVakances = [];
    let currentPage = 1;
    const itemsPerPage = 30;

    // Kategoriju ikonas (Font Awesome) pēc kategorijas nosaukuma
    const kategorijuIkonas = {
        "Bankas / Apdrošināšana / Finanses/Grāmatvedība": `<i class="fa-solid fa-piggy-bank" style="color: #63E6BE;"></i>`,
        "Būvniecība / Nekustamais īpašums": `<i class="fa-solid fa-house-chimney-user" style="color: #d65151;"></i>`,
        "Cita": `<i class="fa-solid fa-ellipsis" style="color: #f5c000;"></i>`,
        "Drošība / Glābšanas dienesti / Aizsardzība": `<i class="fa-solid fa-shield-halved" style="color: #74C0FC;"></i>`,
        "Ēdināšana / Pārtikas rūpniecība": `<i class="fa-solid fa-money-bill-wheat" style="color: #63E6BE;"></i>`,
        "Elektronika / Enerģētika / Elektroenerģija": `<i class="fa-solid fa-bolt" style="color: #FFD43B;"></i>`,
        "Informācijas tehnoloģijas / Telekomunikācijas": `<i class="fa-solid fa-computer" style="color: #7283fd;"></i>`,
        "Izglītība / Zinātne": `<i class="fa-solid fa-graduation-cap" style="color: #65e68c;"></i>`,
        "Jurisprudence / Tieslietas": `<i class="fa-solid fa-scale-balanced" style="color: #ffb83d;"></i>`,
        "Kultūra / Māksla": `<i class="fa-solid fa-masks-theater" style="color: #B197FC;"></i>`,
        "Lauksaimniecība / Vide": `<i class="fa-solid fa-seedling" style="color: #6ee665;"></i>`,
        "Mediji / Sabiedriskās attiecības": `<i class="fa-solid fa-satellite-dish" style="color: #fd7272;"></i>`,
        "Pakalpojumi": `<i class="fa-solid fa-handshake-angle" style="color: #65e6dd;"></i>`,
        "Ražošana": `<i class="fa-solid fa-industry" style="color: #fdb172;"></i>`,
        "Tirdzniecība / Mārketings": `<i class="fa-solid fa-store" style="color: #e66565;"></i>`,
        "Transports / Loģistika": `<i class="fa-solid fa-truck-fast" style="color: #72a7fd;"></i>`,
        "Tūrisms / Viesnīcas": `<i class="fa-solid fa-suitcase-rolling" style="color: #65e690;"></i>`,
        "Vadība / Administrēšana": `<i class="fa-solid fa-user-tie" style="color: #7277fd;"></i>`,
        "Valsts pārvalde": `<i class="fa-solid fa-building-columns" style="color: #72e1fd;"></i>`,
        "Veselības aprūpe / Sociālā aprūpe": `<i class="fa-solid fa-hand-holding-medical" style="color: #65e6aa;"></i>`
    };

    // Palīgfunkcija: atgriež novada vai pilsētas nosaukumu no adreses
    function extractCityOrNovads(vieta) {
        if (!vieta) return '';
        const parts = vieta.split(',').map(p => p.trim()).filter(Boolean);
        // Zināmās pilsētas
        const zinamasPilsētas = ['Rīga', 'Jūrmala', 'Liepāja', 'Daugavpils', 'Ventspils', 'Jelgava', 'Jēkabpils', 'Valmiera', 'Ogre', 'Cēsis', 'Sigulda', 'Salaspils', 'Tukums', 'Kuldīga', 'Saldus', 'Bauska', 'Olaine', 'Talsi', 'Dobele', 'Līvāni', 'Madona', 'Gulbene', 'Alūksne', 'Balvi', 'Preiļi', 'Krāslava', 'Aizkraukle', 'Limbaži', 'Smiltene'];
        if (zinamasPilsētas.includes(parts[0])) return parts[0];
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i].toLowerCase();
            if (p.includes('novads') || p.includes('nov.') || p.includes('pagasts')) {
                return parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
            }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
            if (zinamasPilsētas.includes(parts[i])) return parts[i];
        }
        for (let i = parts.length - 1; i >= 0; i--) {
            if (!/^\d{4,}$/.test(parts[i]) && !/^LV-\d{4,}$/.test(parts[i]) && !/\d+$/.test(parts[i])) {
                return parts[i];
            }
        }
        return parts[parts.length - 1];
    }

    // Funkcija, kas attēlo vakances kartītes
    function renderVakances() {
        vakancesContainer.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageVakances = filteredVakances.slice(start, end);

        // Ja nav rezultātu
        if (pageVakances.length === 0) {
            vakancesContainer.innerHTML = `<div class="vakance-card"><h2>Nav rezultātu</h2></div>`;
        } else {
            // Izvada katru vakanci kā kartīti
            for (let vakance of pageVakances) {
                let alga = vakance['Alga_no'];
                if (alga < 100) {
                    alga += ' EUR/h';
                } else {
                    alga += ' EUR';
                }
                const kategorija = vakance['Vakances_kategorija'] || '';
                const ikona = kategorijuIkonas[kategorija] || '';
                const datums = vakance.Aktualizacijas_datums
                    ? vakance.Aktualizacijas_datums.replace('T00:00:00', '')
                    : '';
                vakancesContainer.innerHTML += `
                    <div class="vakance-card">
                        <h2>${vakance['Vakances_nosaukums'] || ''}</h2>
                        <p><strong>Darba vieta:</strong> ${vakance['Vieta'] || ''}</p>
                        <p><strong>Darba apraksts:</strong> <a href="${vakance['Vakances_paplasinats_apraksts'] || '#'}" target="_blank">Apskatīt</a></p>
                        <p><strong>Kategorija:</strong> ${kategorija}</p>
                        <h3>Alga no: ${alga || ''}</h3>     
                        <p><strong>Publicēšanas datums:</strong> ${datums || ''}</p>
                        <div class="vakance-ikona">${ikona}</div>
                    </div>
                `;
            }
        }

        // Lapu informācija un pogu stāvoklis
        const totalPages = Math.max(1, Math.ceil(filteredVakances.length / itemsPerPage));
        pageInfo.textContent = `Lapa ${currentPage} no ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Vakances filtrēšana pēc meklēšanas, kategorijas, vietas un kārtošanas
    function filterVakances() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedCategory = kategorijuSelect.value;
        const selectedVieta = darbaVietaSelect.value;
        const sortBy = sortBySelect.value;
        const sortOrder = sortOrderSelect.value;

        filteredVakances = vakances.filter(vakance => {
            const categoryMatch = !selectedCategory || vakance['Vakances_kategorija'] === selectedCategory;
            const vietaKey = extractCityOrNovads(vakance['Vieta']);
            const vietaMatch = !selectedVieta || vietaKey === selectedVieta;
            const searchMatch =
                !query ||
                (vakance['Vakances_nosaukums'] || '').toLowerCase().includes(query) ||
                (vakance['Vieta'] || '').toLowerCase().includes(query) ||
                (vakance['Vakances_kategorija'] || '').toLowerCase().includes(query);
            return categoryMatch && vietaMatch && searchMatch;
        });

        // Kārtošana
        if (sortBy !== 'none') {
            filteredVakances.sort((a, b) => {
                let valA, valB;
                if (sortBy === 'alphabetic') {
                    valA = (a['Vakances_nosaukums'] || '').toLowerCase();
                    valB = (b['Vakances_nosaukums'] || '').toLowerCase();
                } else if (sortBy === 'alga') {
                    valA = parseFloat(a['Alga_no']) || 0;
                    valB = parseFloat(b['Alga_no']) || 0;
                } else if (sortBy === 'datums') {
                    valA = new Date(a['Aktualizacijas_datums']);
                    valB = new Date(b['Aktualizacijas_datums']);
                }
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        currentPage = 1;
        renderVakances();
    }

    // Lapas iepriekšējā poga
    prevPageButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderVakances();
        }
    });

    // Lapas nākamā poga
    nextPageButton.addEventListener('click', function () {
        const totalPages = Math.ceil(filteredVakances.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderVakances();
        }
    });

    // Filtru maiņas notikumi
    kategorijuSelect.addEventListener('change', filterVakances);
    darbaVietaSelect.addEventListener('change', filterVakances);
    searchButton.addEventListener('click', filterVakances);
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') filterVakances();
    });
    sortBySelect.addEventListener('change', filterVakances);
    sortOrderSelect.addEventListener('change', filterVakances);

    // Filtru notīrīšanas poga
    clearFiltersButton.addEventListener('click', function () {
        kategorijuSelect.value = "";
        darbaVietaSelect.value = "";
        if (citySelect) citySelect.value = "";
        searchInput.value = "";
        sortBySelect.value = "alphabetic";
        sortOrderSelect.value = "asc";
        filterVakances();
    });

    // Datu ielāde no Latvijas atvērto datu API (ar CORS starpniekserveri)
    const resourceId = '7f68f6fc-a0f9-4c31-b43c-770e97a06fda';
    const proxy = "https://corsproxy.io/?";
    const apiUrl = "https://data.gov.lv/dati/eng/api/action/datastore_search";
    fetch(proxy + apiUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            resource_id: resourceId,
            limit: 1000
        })
    })
    .then(resp => resp.json())
    .then(data => {
        // Saglabā vakances masīvā
        vakances = data.result.records
            .filter(v => Object.values(v).some(val => val && val.toString().trim() !== ''));

        // Aizpilda kategoriju izvēlni
        const kategorijas = Array.from(new Set(
            vakances.map(v => v['Vakances_kategorija']).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b, 'lv'));
        kategorijuSelect.innerHTML = `<option value="">Visas kategorijas</option>`;
        kategorijas.forEach(kategorija => {
            kategorijuSelect.innerHTML += `<option value="${kategorija}">${kategorija}</option>`;
        });

        // Aizpilda darba vietu izvēlni
        const darbaVietas = Array.from(new Set(
            vakances.map(v => extractCityOrNovads(v['Vieta'])).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b, 'lv'));
        darbaVietaSelect.innerHTML = `<option value="">Visas darba vietas</option>`;
        darbaVietas.forEach(vieta => {
            darbaVietaSelect.innerHTML += `<option value="${vieta}">${vieta}</option>`;
        });

        // Sākotnēji attēlo visas vakances
        filteredVakances = vakances;
        renderVakances();
    });
});
