// This file contains translations for all text in the application
// It allows the website to switch between English and Vietnamese

const translations = {
    // English translations (default)
    "en": {
        "main-title": "WELCOME TO OUR WEDDING",
        "subtitle": "FIND YOUR TABLE AND SEE WHO YOU'LL BE CELEBRATING WITH!",
        "find-table": "FIND YOUR TABLE",
        "search-placeholder": "ENTER YOUR FULL NAME",
        "search-button": "FIND MY TABLE",
        "side-prompt": "I am a guest of:",
        "bride-side": "The Bride",
        "groom-side": "The Groom",
        "seated-at": "You are seated at:",
        "seat-number": "Your seat number is:",
        "seated-with": "You are seated with:",
        "table-location": "Table Location:",
        "no-result": "Sorry, we couldn't find your name. Please try again or check with the wedding hosts.",
        "back-button": "Back to Search",
        "try-again": "Try Again",
        "assistance-message": "IF YOU NEED ASSISTANCE, PLEASE ASK ONE OF OUR USHERS OR WEDDING PARTY MEMBERS.",
        "fuzzy-match": "Showing closest match for",
        "multiple-matches": "Multiple Matches Found",
        "select-correct": "Please select your correct entry:",
        "select-btn": "This is me",
        "verify-details": "Please Verify Your Details",
        "is-this-you": "Is this you?",
        "yes-correct": "Yes, this is correct",
        "no-not-me": "No, this is not me",
        "search-by-name": "Search by Name",
        "search-by-table": "Search by Table",
        "enter-table-number": "Enter Table Number",
        
        // Venue element labels
        "stage-label": "Stage",
        "brideGroom-label": "Bride and Groom",
        "cakeGifts-label": "Cake & Gifts",
        "bar-label": "BAR",
        "vipTable-label": "VIP Table",
        "danceFloor-label": "Dance Floor"
    },
    
    // Vietnamese translations
    "vi": {
        "main-title": "CHÀO MỪNG ĐẾN DỰ TIỆC CƯỚI",
        "subtitle": "TÌM BÀN CỦA BẠN VÀ XEM BẠN SẼ CHUNG VUI VỚI AI!",
        "find-table": "TÌM BÀN CỦA BẠN",
        "search-placeholder": "NHẬP TÊN ĐẦY ĐỦ CỦA BẠN",
        "search-button": "TÌM BÀN CỦA TÔI",
        "side-prompt": "Tôi là khách mời của:",
        "bride-side": "Cô Dâu",
        "groom-side": "Chú Rể",
        "seated-at": "Bạn được xếp chỗ tại:",
        "seat-number": "Số ghế của bạn là:",
        "seated-with": "Bạn ngồi cùng với:",
        "table-location": "Vị trí bàn:",
        "no-result": "Xin lỗi, chúng tôi không thể tìm thấy tên của bạn. Vui lòng thử lại hoặc liên hệ với cô dâu chú rể.",
        "back-button": "Quay Lại Tìm Kiếm",
        "try-again": "Thử Lại",
        "assistance-message": "NẾU BẠN CẦN HỖ TRỢ, VUI LÒNG HỎI MỘT TRONG CÁC PHỤC VỤ HOẶC THÀNH VIÊN TRONG ĐOÀN CƯỚI.",
        "fuzzy-match": "Hiển thị kết quả gần nhất cho",
        "multiple-matches": "Tìm Thấy Nhiều Kết Quả",
        "select-correct": "Vui lòng chọn thông tin chính xác của bạn:",
        "select-btn": "Đây là tôi",
        "verify-details": "Vui Lòng Xác Nhận Thông Tin",
        "is-this-you": "Đây có phải là bạn không?",
        "yes-correct": "Vâng, thông tin chính xác",
        "no-not-me": "Không, đây không phải là tôi",
        "search-by-name": "Tìm theo Tên",
        "search-by-table": "Tìm theo Bàn",
        "enter-table-number": "Nhập Số Bàn"
        
        // Venue element labels
        "stage-label": "Sân Khấu",
        "brideGroom-label": "Cô Dâu và Chú Rể",
        "cakeGifts-label": "Bánh & Quà Tặng",
        "bar-label": "Quầy Bar",
        "vipTable-label": "Bàn VIP",
        "danceFloor-label": "Sàn Nhảy"
    }
};

// Function to update seat number text based on language
function getSeatNumberText(seatNumber, language) {
    if (language === 'en') {
        return `Your seat number is: ${seatNumber}`;
    } else {
        return `Số ghế của bạn là: ${seatNumber}`;
    }
}
