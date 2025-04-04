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

    // Add event listeners
    if (searchButton) {
        searchButton.addEventListener('click', searchGuest);
        console.log("Search button event listener added");
    } else {
        console.error("Search button not found in the DOM");
    }

    if (nameSearchInput) {
        nameSearchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchGuest();
            }
        });
        console.log("Search input event listener added");
    } else {
        console.error("Search input not found in the DOM");
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
    
    function searchGuest() {
        console.log("Search function called");

        // Check if guest list exists and venue layout exists
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

        // Make sure venue layout exists
        if (!window.venueLayout || !window.venueLayout.tables) {
            console.error("Venue layout is not properly loaded. Current value:", window.venueLayout);
            if (typeof window.initializeVenueMap === 'function') {
                console.log("Attempting to initialize venue map");
                window.initializeVenueMap();
            }
        }

        // Get the search input and normalize it
        const searchName = nameSearchInput.value.trim().toLowerCase();

        // Get the selected side
        const sideInput = document.querySelector('input[name="side"]:checked');
        if (!sideInput) {
            console.error("No side selected");
            return;
        }
        const selectedSide = sideInput.value;

        console.log(`Searching for "${searchName}" on "${selectedSide}" side`);

        // ADDED DEBUG: Log the guest list for debugging
        if (window.guestList) {
            console.log("Available guests sample:", window.guestList.slice(0, 5).map(g => `${g.name} (Table ${g.table})`));
        }

        // Hide previous results
        resultContainer.classList.add('hidden');
        noResultContainer.classList.add('hidden');

        // Don't search if input is empty
        if (!searchName) {
            console.log("Search input is empty");
            return;
        }

        // Find the guest in our data, taking the side into account
        const guest = findGuest(searchName, selectedSide);

        if (guest) {
            console.log("Guest found:", guest);

            // ADDED: Make sure guest has a tableObject
            if (!guest.tableObject && guest.table) {
                // Try to find the table in venueLayout
                if (window.venueLayout && window.venueLayout.tables) {
                    guest.tableObject = window.venueLayout.tables.find(t => t.id === parseInt(guest.table));
                    console.log("Added tableObject to guest:", guest.tableObject);
                }
            }

            // Display guest information
            displayGuestInfo(guest);

            // If the search name doesn't exactly match the name, show a message
            const guestNameLower = guest.name.toLowerCase();
            const vietnameseLower = guest.vietnamese_name ? guest.vietnamese_name.toLowerCase() : '';

            if (guestNameLower !== searchName && vietnameseLower !== searchName) {
                // Create or update a fuzzy match notice
                let fuzzyNotice = document.getElementById('fuzzyMatchNotice');

                if (!fuzzyNotice) {
                    fuzzyNotice = document.createElement('p');
                    fuzzyNotice.id = 'fuzzyMatchNotice';
                    fuzzyNotice.style.fontStyle = 'italic';
                    fuzzyNotice.style.marginTop = '10px';
                    fuzzyNotice.style.fontSize = '0.9rem';
                    fuzzyNotice.style.color = '#666';

                    // Insert it after the guest name
                    guestNameElement.parentNode.insertBefore(fuzzyNotice, guestNameElement.nextSibling);
                }

                // Set the message based on language
                const message = window.currentLanguage === 'en'
                    ? `Showing closest match for "${nameSearchInput.value}"`
                    : `Hiển thị kết quả gần nhất cho "${nameSearchInput.value}"`;

                fuzzyNotice.textContent = message;
            } else {
                // Remove any existing fuzzy match notice
                const fuzzyNotice = document.getElementById('fuzzyMatchNotice');
                if (fuzzyNotice) {
                    fuzzyNotice.remove();
                }
            }
        } else {
            console.log("Guest not found");
            // Show no result message
            noResultContainer.classList.remove('hidden');
        }
    }
});
