document.addEventListener('DOMContentLoaded', function () {
    const vakancesContainer = document.getElementById('vakances-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const kategorijuSelect = document.getElementById('kategoriju-select');
    const darbaVietaSelect = document.getElementById('darba-vieta-select');
    const citySelect = document.getElementById('city-select');
    const sortBySelect = document.getElementById('sort-by');
    const sortOrderSelect = document.getElementById('sort-order');
    const clearFiltersButton = document.getElementById('clear-filters');

    let vakances = [];
    let filteredVakances = [];
    let currentPage = 1;
    const itemsPerPage = 30;

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

    function getVietaKey(vieta) {
        if (!vieta) return '';
        const parts = vieta.trim().split(' ');
        if (parts.length >= 2 && parts[parts.length - 1] === "nov.") {
            return parts.slice(-2).join(' ');
        }
        return parts.slice(-1)[0];
    }

    function extractCityOrNovads(vieta) {
        if (!vieta) return '';
        const parts = vieta.split(',').map(p => p.trim()).filter(Boolean);
        // Known cities
        const knownCities = ['Rīga', 'Jūrmala', 'Liepāja', 'Daugavpils', 'Ventspils', 'Jelgava', 'Jēkabpils', 'Valmiera', 'Ogre', 'Cēsis', 'Sigulda', 'Salaspils', 'Tukums', 'Kuldīga', 'Saldus', 'Bauska', 'Olaine', 'Talsi', 'Dobele', 'Līvāni', 'Madona', 'Gulbene', 'Alūksne', 'Balvi', 'Preiļi', 'Krāslava', 'Aizkraukle', 'Limbaži', 'Smiltene'];
        if (knownCities.includes(parts[0])) return parts[0];
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i].toLowerCase();
            if (p.includes('novads') || p.includes('nov.') || p.includes('pagasts')) {
                return parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
            }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
            if (knownCities.includes(parts[i])) return parts[i];
        }
        for (let i = parts.length - 1; i >= 0; i--) {
            if (!/^\d{4,}$/.test(parts[i]) && !/^LV-\d{4,}$/.test(parts[i]) && !/\d+$/.test(parts[i])) {
                return parts[i];
            }
        }
        return parts[parts.length - 1];
    }

    function renderVakances() {
        vakancesContainer.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageVakances = filteredVakances.slice(start, end);

        if (pageVakances.length === 0) {
            vakancesContainer.innerHTML = `<div class="vakance-card"><h2>Nav rezultātu</h2></div>`;
        } else {
            for (let vakance of pageVakances) {
                let alga = vakance['Alga_no']
                if (alga<100){
                    alga += ' EUR/h';
                }
                else{
                    alga += ' EUR'
                }
                const kategorija = vakance['Vakances_kategorija'] || '';
                const ikona = kategorijuIkonas[kategorija] || '';
                vakancesContainer.innerHTML += `
                    <div class="vakance-card">
                        <h2>${vakance['Vakances_nosaukums'] || ''}</h2>
                        <p><strong>Darba vieta:</strong> ${vakance['Vieta'] || ''}</p>
                        <p><strong>Darba apraksts:</strong> <a href="${vakance['Vakances_paplasinats_apraksts'] || '#'}" target="_blank">Apskatīt</a></p>
                        <p><strong>Kategorija:</strong> ${kategorija}</p>
                        <h3>Alga no: ${alga || ''}</h3>     
                        <p><strong>Publicēšanas datums:</strong> ${vakance['Aktualizacijas_datums'] || ''}</p>
                        <div class="vakance-ikona">${ikona}</div>
                    </div>
                `;
            }
        }

        const totalPages = Math.max(1, Math.ceil(filteredVakances.length / itemsPerPage));
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

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

        // Sorting
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
                    valA = new Date(a['Publicēšanas_datums']);
                    valB = new Date(b['Publicēšanas_datums']);
                }
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        currentPage = 1;
        renderVakances();
    }

    prevPageButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderVakances();
        }
    });

    nextPageButton.addEventListener('click', function () {
        const totalPages = Math.ceil(filteredVakances.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderVakances();
        }
    });

    kategorijuSelect.addEventListener('change', filterVakances);
    darbaVietaSelect.addEventListener('change', filterVakances);
    searchButton.addEventListener('click', filterVakances);
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') filterVakances();
    });
    sortBySelect.addEventListener('change', filterVakances);
    sortOrderSelect.addEventListener('change', filterVakances);

    clearFiltersButton.addEventListener('click', function () {
        kategorijuSelect.value = "";
        darbaVietaSelect.value = "";
        citySelect.value = "";
        searchInput.value = "";
        sortBySelect.value = "alphabetic";
        sortOrderSelect.value = "asc";
        filterVakances();
    });

    fetch('vakances.csv')
        .then(response => response.text())
        .then(csvText => {
            vakances = Papa.parse(csvText, { header: true }).data
                .filter(v => Object.values(v).some(val => val && val.trim() !== ''));

            // Populate categories
            const kategorijas = Array.from(new Set(
                vakances.map(v => v['Vakances_kategorija']).filter(Boolean)
            )).sort((a, b) => a.localeCompare(b, 'lv'));
            kategorijuSelect.innerHTML = `<option value="">Visas kategorijas</option>`;
            kategorijas.forEach(kategorija => {
                kategorijuSelect.innerHTML += `<option value="${kategorija}">${kategorija}</option>`;
            });

            const darbaVietas = Array.from(new Set(
                vakances.map(v => extractCityOrNovads(v['Vieta'])).filter(Boolean)
            )).sort((a, b) => a.localeCompare(b, 'lv'));
            darbaVietaSelect.innerHTML = `<option value="">Visas darba vietas</option>`;
            darbaVietas.forEach(vieta => {
                darbaVietaSelect.innerHTML += `<option value="${vieta}">${vieta}</option>`;
            });

            filteredVakances = vakances;
            renderVakances();
        });
});
