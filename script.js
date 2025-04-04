document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const nameSearchInput = document.getElementById('nameSearch');
    const searchButton = document.getElementById('searchButton');
    const resultContainer = document.getElementById('resultContainer');
    const noResultContainer = document.getElementById('noResultContainer');
    const guestNameElement = document.getElementById('guestName');
    const tableNameElement = document.getElementById('tableName');
    const seatNumberElement = document.getElementById('seatNumber');
    const tablematesListElement = document.getElementById('tablematesList');
    const venueMapElement = document.getElementById('venueMap');
    const englishBtn = document.getElementById('englishBtn');
    const vietnameseBtn = document.getElementById('vietnameseBtn');
    const backButton = document.getElementById('backButton');
    const tryAgainButton = document.getElementById('tryAgainButton');

    // Set default language as a global variable
    window.currentLanguage = 'en';

    // Check if there's a saved language preference in localStorage
    if (localStorage.getItem('weddinglanguage')) {
        window.currentLanguage = localStorage.getItem('weddinglanguage');
    }

    // Add this logging code to check if data is loading
    console.log("DOM fully loaded");

   // Add this to the end of the DOMContentLoaded event in script.js

    // Replace the search button event handler with our enhanced version
    if (searchButton) {
        // Remove existing event listener (if any)
        searchButton.removeEventListener('click', searchGuest);
        
        // Add new enhanced search function
        searchButton.addEventListener('click', searchGuest);
        console.log("Enhanced search button event listener added");
    }
    
    // Also update the keyup event for the search input
    if (nameSearchInput) {
        // Remove existing event listeners
        nameSearchInput.removeEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchGuest();
            }
        });
        
        // Add new event listener
        nameSearchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchGuest();
            }
        });
        console.log("Enhanced search input event listener added");
    }

    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', function() {
            resultContainer.classList.add('hidden');
            nameSearchInput.value = '';

            // Remove highlighting from all tables
            document.querySelectorAll('.table').forEach(table => {
                table.classList.remove('highlighted');
            });
        });
        console.log("Back button event listener added");
    }

    // Try again button functionality
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', function() {
            noResultContainer.classList.add('hidden');
            nameSearchInput.value = '';
            nameSearchInput.focus();
        });
        console.log("Try again button event listener added");
    }

    // Add language button event listeners
    if (englishBtn) {
        englishBtn.addEventListener('click', function() {
            setLanguage('en');
        });
        console.log("English button event listener added");
    }

    if (vietnameseBtn) {
        vietnameseBtn.addEventListener('click', function() {
            setLanguage('vi');
        });
        console.log("Vietnamese button event listener added");
    }

    // Function to set language
    function setLanguage(lang) {
        window.currentLanguage = lang;

        // Save language preference to localStorage
        localStorage.setItem('weddinglanguage', window.currentLanguage);

        // Update the language button state
        updateLanguageButtonState();

        // Apply translations
        applyTranslations();

        // Reinitialize the venue map with new language
        if (typeof window.initializeVenueMap === 'function') {
            console.log('Reinitializing venue map after language change');
            window.initializeVenueMap();
        }
    }

    // Function to update language button state
    function updateLanguageButtonState() {
        if (window.currentLanguage === 'en') {
            englishBtn.classList.add('active');
            vietnameseBtn.classList.remove('active');
        } else {
            vietnameseBtn.classList.add('active');
            englishBtn.classList.remove('active');
        }
    }

    // Set initial active language button
    updateLanguageButtonState();

    // Function to apply translations to all elements
    function applyTranslations() {
        // Get all elements with the data-lang-key attribute
        const elements = document.querySelectorAll('[data-lang-key]');

        // Update each element with the corresponding translation
        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');

            // Handle input placeholders separately
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[window.currentLanguage][key];
            } else if (element.tagName === 'BUTTON') {
                element.textContent = translations[window.currentLanguage][key];
            } else {
                element.textContent = translations[window.currentLanguage][key];
            }
        });

        // Update any dynamic content that's currently visible
        if (!resultContainer.classList.contains('hidden') && seatNumberElement.textContent) {
            const seatNumberMatch = seatNumberElement.textContent.match(/\d+/);
            if (seatNumberMatch) {
                const seatNumber = seatNumberMatch[0];
                seatNumberElement.textContent = getSeatNumberText(seatNumber, window.currentLanguage);
            }
        }
    }

    // Make the applyTranslations function globally available
    window.applyTranslations = applyTranslations;

    // FIXED: Find guest function
    function findGuest(searchName, side) {
        // Make sure guestList exists
        if (!window.guestList || !Array.isArray(window.guestList)) {
            console.error('Guest list is not properly initialized');
            return null;
        }

        console.log(`Finding guest: name="${searchName}", side="${side}"`);

        // IMPROVEMENT: Make search more robust by trimming spaces, handling special characters, etc.
        const normalizedSearchName = searchName.toLowerCase().trim();

        // First try an exact match - case insensitive
        const exactMatch = window.guestList.find(guest => {
            // Convert to lowercase and trim for case-insensitive comparison
            const guestNameNormalized = (guest.name || "").toLowerCase().trim();
            const vietnameseNameNormalized = (guest.vietnamese_name || "").toLowerCase().trim();

            // Compare with guest side - convert to lowercase for consistent comparison
            const guestSide = (guest.side || "").toLowerCase();
            const searchSide = side.toLowerCase();

            return guestSide === searchSide && (
                guestNameNormalized === normalizedSearchName ||
                vietnameseNameNormalized === normalizedSearchName
            );
        });

        if (exactMatch) {
            console.log("Found exact match:", exactMatch.name);
            return exactMatch;
        }

        // Then try partial matches
        const partialMatch = window.guestList.find(guest => {
            // Converting to lowercase and trimming
            const guestNameNormalized = (guest.name || "").toLowerCase().trim();
            const vietnameseNameNormalized = (guest.vietnamese_name || "").toLowerCase().trim();

            // Compare with guest side - convert to lowercase
            const guestSide = (guest.side || "").toLowerCase();
            const searchSide = side.toLowerCase();

            return guestSide === searchSide && (
                guestNameNormalized.includes(normalizedSearchName) ||
                normalizedSearchName.includes(guestNameNormalized) ||
                vietnameseNameNormalized.includes(normalizedSearchName) ||
                normalizedSearchName.includes(vietnameseNameNormalized)
            );
        });

        if (partialMatch) {
            console.log("Found partial match:", partialMatch.name);
            return partialMatch;
        }

        // If no exact or partial match, try fuzzy matching
        console.log("No exact or partial match found, trying fuzzy matching");
        return findClosestMatch(searchName, side);
    }

    // Function to find the closest matching guest using fuzzy matching
    function findClosestMatch(searchName, side) {
        if (!window.guestList || !Array.isArray(window.guestList)) {
            return null;
        }

        // Filter guests by side - normalize to lowercase for consistent comparison
        const sideGuests = window.guestList.filter(guest =>
            (guest.side || "").toLowerCase() === side.toLowerCase()
        );

        // No guests on this side
        if (sideGuests.length === 0) {
            console.log(`No guests found on ${side} side`);
            return null;
        }

        let bestMatch = null;
        let bestScore = 0;

        // Calculate similarity score for each guest
        sideGuests.forEach(guest => {
            // Check similarity with English name
            const nameScore = calculateSimilarity(searchName, (guest.name || "").toLowerCase());

            // Check similarity with Vietnamese name if available
            let vnNameScore = 0;
            if (guest.vietnamese_name) {
                vnNameScore = calculateSimilarity(searchName, guest.vietnamese_name.toLowerCase());
            }

            // Use the better score between English and Vietnamese names
            const bestGuestScore = Math.max(nameScore, vnNameScore);

            console.log(`Guest "${guest.name}" similarity score: ${bestGuestScore.toFixed(2)}`);

            // Update the best match if this score is better
            if (bestGuestScore > bestScore) {
                bestScore = bestGuestScore;
                bestMatch = guest;
            }
        });

        console.log(`Best match: ${bestMatch ? bestMatch.name : 'none'} with score ${bestScore.toFixed(2)}`);

        // Only return a match if the similarity is above a threshold (0.4 or 40% similar)
        return bestScore > 0.4 ? bestMatch : null;
    }

    // Function to calculate similarity between two strings
    function calculateSimilarity(str1, str2) {
        // Simple similarity algorithm (can be improved)
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        let hits = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.indexOf(shorter[i]) !== -1) {
                hits++;
            }
        }

        return hits / longer.length;
    }

    // Function to highlight a table, including VIP table (ID 46)
    function highlightTable(tableId) {
        console.log('Highlighting table:', tableId);
        
        // Remove highlight from all tables and fixed elements
        document.querySelectorAll('.table, .fixed-element').forEach(element => {
            element.classList.remove('highlighted');
        });
        
        // Convert tableId to a number if it's a string
        const tableIdNum = parseInt(tableId);
        
        // Check if this is the VIP table (table 46)
        if (tableIdNum === 46) {
            // Multiple approaches to find the VIP table element
            let vipElementFound = false;
            
            // Approach 1: Find by ID containing "vipTable"
            const vipElements = document.querySelectorAll('[id*="vipTable"]');
            if (vipElements.length > 0) {
                vipElements.forEach(element => {
                    element.classList.add('highlighted');
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    vipElementFound = true;
                });
            }
            
            // Approach 2: Find by data attribute
            if (!vipElementFound) {
                const dataElements = document.querySelectorAll('[data-table-id="46"]');
                if (dataElements.length > 0) {
                    dataElements.forEach(element => {
                        element.classList.add('highlighted');
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        vipElementFound = true;
                    });
                }
            }
            
            // Approach 3: Find by class and text content
            if (!vipElementFound) {
                const fixedElements = document.querySelectorAll('.fixed-element');
                for (const element of fixedElements) {
                    if (element.textContent.toLowerCase().includes('vip')) {
                        element.classList.add('highlighted');
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        vipElementFound = true;
                        break;
                    }
                }
            }
            
            if (!vipElementFound) {
                console.error('VIP Table element could not be found');
            }
        } else {
            // Regular table highlighting
            const tableElement = document.getElementById(`table-${tableIdNum}`);
            if (tableElement) {
                tableElement.classList.add('highlighted');
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                console.error(`Table element with ID table-${tableIdNum} not found`);
            }
        }
        
        return true; // Return success
    }

    // Function to display guest information
    function displayGuestInfo(guest) {
        if (!guest) {
            console.error("displayGuestInfo called with null guest");
            return;
        }

        console.log("Displaying guest info:", guest);

        // Show the result container
        resultContainer.classList.remove('hidden');

        // Set guest name
        if (guestNameElement) {
            guestNameElement.textContent = guest.name;
        }

        // Check if this is a VIP table guest
        const isVipGuest = guest.table === 46 || (guest.tableObject && guest.tableObject.id === 46);

        // Set table name based on whether it's a VIP table
        if (tableNameElement) {
            if (isVipGuest) {
                // Get the correct translation for VIP Table
                const vipTableText = window.currentLanguage === 'vi' ? 'Bàn VIP' : 'VIP Table';
                tableNameElement.textContent = vipTableText;
            } else if (guest.tableObject && guest.tableObject.name) {
                tableNameElement.textContent = guest.tableObject.name;
            } else {
                tableNameElement.textContent = `Table ${guest.table}`;
            }
        }

        // Set seat number
        if (seatNumberElement) {
            seatNumberElement.textContent = guest.seat ? getSeatNumberText(guest.seat, window.currentLanguage) : '';
        }

        // Highlight the table
        highlightTable(guest.table);

        // Display tablemates
        if (tablematesListElement) {
            tablematesListElement.innerHTML = ''; // Clear previous list

            // Find tablemates based on guest's table
            let tablemates = [];
            
            if (isVipGuest) {
                // For VIP guests, find other VIP guests
                tablemates = window.guestList.filter(g => 
                    (g.table === 46 || (g.tableObject && g.tableObject.id === 46)) && 
                    g.name !== guest.name
                );
            } else if (guest.tableObject && guest.tableObject.guests) {
                // Use the tableObject's guest list if available
                tablemates = guest.tableObject.guests.filter(g => g.name !== guest.name);
            } else if (guest.table) {
                // Otherwise find guests at the same table number
                tablemates = window.guestList.filter(g => 
                    g.table === guest.table && 
                    g.name !== guest.name
                );
            }
            
            console.log("Tablemates:", tablemates);

            if (tablemates.length > 0) {
                tablemates.forEach(tablemate => {
                    const li = document.createElement('li');
                    li.textContent = tablemate.name;
                    tablematesListElement.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = window.currentLanguage === 'en' ? 'No other guests at this table' : 'Không có khách nào khác ở bàn này';
                tablematesListElement.appendChild(li);
            }
        }
    }

    // Function to get the correct seat number text based on the language
    function getSeatNumberText(seatNumber, lang) {
        if (lang === 'vi') {
            return `Số ghế của bạn là: ${seatNumber}`;
        } else {
            return `Seat number ${seatNumber}`;
        }
    }

    // Make sure the highlightTable function is globally available
    window.highlightTable = highlightTable;

    // Initialize the application by loading data and setting up the UI
    if (typeof window.initializeFromCSV === 'function') {
        window.initializeFromCSV();
    } else {
        console.error("initializeFromCSV function not found. Ensure csv-processor.js is loaded.");
    }
    
    // Add this to script.js

// Function to search for all matching guests
function searchGuest() {
    console.log("Enhanced search function called");

    // Check if guest list exists and is properly loaded
    if (!window.guestList || !Array.isArray(window.guestList) || window.guestList.length === 0) {
        console.error("Guest list is not properly loaded. Current value:", window.guestList);

        // Try loading sample data if available
        if (typeof window.loadSampleGuestData === 'function') {
            console.log("Attempting to load sample guest data");
            window.loadSampleGuestData();
        } else {
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.textContent = "Error: Guest list not loaded. Please try refreshing the page.";
                errorMsg.classList.remove('hidden');
            }
            return;
        }
    }

    // Get the search input and normalize it
    const searchName = nameSearchInput.value.trim();
    const searchNameLower = searchName.toLowerCase();

    // Get the selected side (still useful for sorting/prioritizing results)
    const sideInput = document.querySelector('input[name="side"]:checked');
    if (!sideInput) {
        console.error("No side selected");
        return;
    }
    const selectedSide = sideInput.value;

    console.log(`Searching for "${searchName}"`);

    // Hide previous results
    resultContainer.classList.add('hidden');
    noResultContainer.classList.add('hidden');

    // Don't search if input is empty
    if (!searchName) {
        console.log("Search input is empty");
        return;
    }

    // Find ALL matching guests regardless of side
    const exactMatches = window.guestList.filter(guest => {
        const guestNameLower = (guest.name || "").toLowerCase().trim();
        const vietnameseNameLower = (guest.vietnamese_name || "").toLowerCase().trim();

        return guestNameLower === searchNameLower || vietnameseNameLower === searchNameLower;
    });

    // If no exact matches, try partial matches
    const partialMatches = window.guestList.filter(guest => {
        // Skip if it's already an exact match
        const guestNameLower = (guest.name || "").toLowerCase().trim();
        const vietnameseNameLower = (guest.vietnamese_name || "").toLowerCase().trim();

        if (guestNameLower === searchNameLower || vietnameseNameLower === searchNameLower) {
            return false; // Skip exact matches
        }

        return guestNameLower.includes(searchNameLower) || 
               searchNameLower.includes(guestNameLower) ||
               vietnameseNameLower.includes(searchNameLower) ||
               searchNameLower.includes(vietnameseNameLower);
    });

    // Combine exact and partial matches, prioritizing exact
    const allMatches = [...exactMatches, ...partialMatches];

    // If no matches found, try fuzzy matching
    if (allMatches.length === 0) {
        console.log("No matches found, trying fuzzy matching");
        const fuzzyMatches = findFuzzyMatches(searchName);
        allMatches.push(...fuzzyMatches);
    }

    // Process based on number of matches
    if (allMatches.length === 0) {
        // No matches found at all
        console.log("No matches found");
        noResultContainer.classList.remove('hidden');
    }
    else if (allMatches.length === 1) {
        // Only one match - show it directly
        console.log("Single match found:", allMatches[0].name);
        displayGuestInfo(allMatches[0]);
    }
    else {
        // Multiple matches - prioritize matches from the selected side
        console.log(`${allMatches.length} matches found, showing selection interface`);
        
        // Sort matches to prioritize the selected side
        allMatches.sort((a, b) => {
            // If one match is on the selected side and the other isn't, prioritize the one on the selected side
            if ((a.side === selectedSide) && (b.side !== selectedSide)) return -1;
            if ((a.side !== selectedSide) && (b.side === selectedSide)) return 1;
            
            // If both are exact matches or both are partial matches, keep original order
            return 0;
        });
        
        // Show the selection interface
        showGuestSelectionInterface(allMatches);
    }
}

// Function to find fuzzy matches
function findFuzzyMatches(searchName) {
    if (!window.guestList || !Array.isArray(window.guestList)) {
        return [];
    }

    let bestMatches = [];
    const minimumScore = 0.4; // Minimum similarity threshold (40%)

    // Calculate similarity score for each guest
    window.guestList.forEach(guest => {
        // Check similarity with English name
        const nameScore = calculateSimilarity(searchName.toLowerCase(), (guest.name || "").toLowerCase());

        // Check similarity with Vietnamese name if available
        let vnNameScore = 0;
        if (guest.vietnamese_name) {
            vnNameScore = calculateSimilarity(searchName.toLowerCase(), guest.vietnamese_name.toLowerCase());
        }

        // Use the better score between English and Vietnamese names
        const bestGuestScore = Math.max(nameScore, vnNameScore);

        // Only consider guests with scores above the threshold
        if (bestGuestScore > minimumScore) {
            // Add the score to the guest object for sorting later
            const scoredGuest = {...guest, similarityScore: bestGuestScore};
            bestMatches.push(scoredGuest);
        }
    });

    // Sort by score, highest first
    bestMatches.sort((a, b) => b.similarityScore - a.similarityScore);

    // Take top matches only (limit to first 5)
    return bestMatches.slice(0, 5);
}

// Interface for selecting between multiple matches
function showGuestSelectionInterface(matches) {
    // Create a container for the selection interface
    const selectionContainer = document.createElement('div');
    selectionContainer.id = 'matchSelectionContainer';
    selectionContainer.className = 'selection-overlay';
    
    // Get translations for UI elements
    const titleText = window.translations[window.currentLanguage]["multiple-matches"] || "Multiple Matches Found";
    const instructionText = window.translations[window.currentLanguage]["select-correct"] || "Please select your correct entry:";
    const backText = window.translations[window.currentLanguage]["back-button"] || "Back to Search";
    
    // Create the HTML content
    selectionContainer.innerHTML = `
        <div class="selection-card">
            <h3>${titleText}</h3>
            <p>${instructionText}</p>
            <ul id="matchesList" class="matches-list"></ul>
            <button id="cancelSelectionBtn" class="cancel-button">${backText}</button>
        </div>
    `;
    
    // Add to the document
    document.body.appendChild(selectionContainer);
    
    const matchesList = document.getElementById('matchesList');
    
    // Get translations for the side labels
    const brideText = window.translations[window.currentLanguage]["bride-side"] || "The Bride";
    const groomText = window.translations[window.currentLanguage]["groom-side"] || "The Groom";
    const selectBtnText = window.translations[window.currentLanguage]["select-btn"] || "Select";
    const seatedAtText = window.translations[window.currentLanguage]["seated-at"] || "Seated at:";
    
    // Add each match to the list
    matches.forEach((guest, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'match-item';
        
        // Make sure guest has a tableObject
        if (!guest.tableObject && guest.table) {
            // Try to find the table in venueLayout
            if (window.venueLayout && window.venueLayout.tables) {
                guest.tableObject = window.venueLayout.tables.find(t => t.id === parseInt(guest.table));
            }
        }
        
        // Get table name or use table number as fallback
        const tableName = guest.tableObject && guest.tableObject.name 
            ? guest.tableObject.name 
            : `Table ${guest.table}`;
        
        // Create more detailed info to help users identify themselves
        const side = guest.side === 'bride' ? brideText : groomText;
            
        listItem.innerHTML = `
            <div class="match-details">
                <span class="match-name">${guest.name}</span>
                <div class="match-info">
                    <div><strong>${side}</strong></div>
                    <div>${seatedAtText} <strong>${tableName}</strong></div>
                </div>
            </div>
            <button class="select-match-btn" data-index="${index}">${selectBtnText}</button>
        `;
        
        matchesList.appendChild(listItem);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.select-match-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            selectionContainer.remove();
            displayGuestInfo(matches[index]);
        });
    });
    
    // Cancel button
    document.getElementById('cancelSelectionBtn').addEventListener('click', function() {
        selectionContainer.remove();
    });
    
    // Add CSS for the selection interface
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .selection-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .selection-card {
            background-color: white;
            border-radius: 15px;
            padding: 30px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .selection-card h3 {
            text-align: center;
            margin-bottom: 15px;
            font-family: 'Playfair Display', serif;
            color: #333;
        }
        
        .selection-card p {
            text-align: center;
            margin-bottom: 20px;
            color: #666;
        }
        
        .matches-list {
            list-style: none;
            padding: 0;
            margin-bottom: 20px;
        }
        
        .match-item {
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s;
        }
        
        .match-item:hover {
            border-color: #c896e0;
            background-color: #faf5ff;
        }
        
        .match-name {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
            font-size: 1.1rem;
        }
        
        .match-info {
            color: #666;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .select-match-btn {
            background-color: #c896e0;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 15px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .select-match-btn:hover {
            background-color: #b57ad1;
        }
        
        .cancel-button {
            background-color: #f2f2f2;
            color: #666;
            border: none;
            border-radius: 8px;
            padding: 10px 15px;
            cursor: pointer;
            display: block;
            margin: 0 auto;
            transition: background-color 0.3s;
        }
        
        .cancel-button:hover {
            background-color: #e6e6e6;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .selection-card {
                padding: 20px;
                width: 95%;
            }
            
            .match-item {
                flex-direction: column;
                align-items: stretch;
            }
            
            .select-match-btn {
                margin-top: 10px;
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}
