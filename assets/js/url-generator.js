what// JavaScript Document

// Last modified 1/20/25 by Trevor Smith

// Create the input elements initially but keep them hidden
var webLinkVendorNameInput = $('<input type="text" id="WebsiteLinkingVendorName" placeholder="Enter the Vendor Name">').hide();
var tradePublicationNameInput = $('<input type="text" id="TradePublicationName" placeholder="Enter Trade Publication Name">').hide();
var tradePublicationLinkInput = $('<input type="text" id="TradePublicationLinkName" placeholder="Enter Trade Publication Link Name">').hide();
var marketoFolderLabel = $('<label>*Marketo Folder :</label>').hide();
var marketoFolderNameInput = $('<input type="text" id="MarketoFolderName">').hide();
var marketoFolderNameTooltip = $('<div class="helper-text"><em>Enter the Full Marketo Folder Name (i.e. <strong>EM-20240710-MedicomSterilization-12097-FL-DNTL</strong>)</em></div>').hide(); 
var qrCodeContentLabel = $('<label>*QR Code Content :</label>').hide();
var qrCodeContentInput = $('<input type="text" id="QRCodeContent">').hide();
var qrCodeContentTooltip = $('<div class="helper-text"><em>Enter the product name or category for the QR code (i.e. <strong>Alloys</strong>). <a href="https://new.express.adobe.com/tools/generate-qr-code" target="_blank">Visit Adobe QR Code Generator &rarr;</a></em></div>').hide();     

// Append the input elements to the container
$('#webLinkContainer').append(webLinkVendorNameInput);
$('#tradePubContainer').append(tradePublicationNameInput, tradePublicationLinkInput);
$('#marketoFolderName').append(marketoFolderLabel, marketoFolderNameInput, marketoFolderNameTooltip);
$('#qrCodeContent').append(qrCodeContentLabel, qrCodeContentInput, qrCodeContentTooltip);

// Generic function to show/hide input fields and their containers
function toggleInputFields(checkboxes, container, elements) {
    if ($(checkboxes).is(':checked')) {
        $(container).parent().fadeIn().css('display', 'block');
        elements.forEach(function(el) {
            $(el).fadeIn().slideDown();
        });
    } else {
        elements.forEach(function(el) {
            $(el).slideUp().fadeOut();
        });
        $(container).parent().slideUp().fadeOut();
    }
    generateTaggedURLs();
}

// Event listener for email and email featured banner checkboxes
$('#emailCheckbox, #emailFeaturedBannerCheckbox').change(function() {
    toggleInputFields(
        '#emailCheckbox, #emailFeaturedBannerCheckbox', 
        '#mktoFolderwrapper', 
        [marketoFolderLabel, marketoFolderNameInput, marketoFolderNameTooltip]
    );
});

// Event listener for QR code checkboxes
$('.qrCodeCheckbox').change(function() {
    toggleInputFields(
        '.qrCodeCheckbox:checked', 
        '#qrCodeWrapper', 
        [qrCodeContentLabel, qrCodeContentInput, qrCodeContentTooltip]
    );
    checkParentCheckbox($(this).closest(".customSubcategories")); // Check parent checkboxes
});

// Event listener for MarketoFolderName and QRCodeContent input fields
$(marketoFolderNameInput).add(qrCodeContentInput).on('input', function() {
    generateTaggedURLs(); // Regenerate URLs when there is input in the fields
});

   
document.getElementById('updates-toggle').addEventListener('click', function() {
    const updatesBar = document.querySelector('.updates-bar');
    updatesBar.classList.toggle('active');
});
   

$(document).ready(function() {
    populateAndRemoveUTM();

    // Ensure URLs are generated immediately after UTM parameters are parsed
    if (checkRequiredFields()) {
        generateTaggedURLs();
    }

    // Trigger the UTM population and element visibility checks when input fields change
    $('#PageURL, #inputDate, #inputProject, #inputJobNumber, #inputDivision, #inputPricing').on('input', function () {
        populateAndRemoveUTM(); // Populate fields with UTM params
        checkAndShowElements(); // Show/hide elements based on input
        // Only generate URLs if required fields are filled
        if (checkRequiredFields()) {
            generateTaggedURLs();
        }
    });

    // To ensure URLs are generated after pasting
    $('#PageURL').on('paste', function () {
        setTimeout(function () { // Give the paste action time to complete
            populateAndRemoveUTM();
            checkAndShowElements();
            if (checkRequiredFields()) {
                generateTaggedURLs();
            }
        }, 100);
    });
   
    // Function to check if all required fields are filled
    function checkRequiredFields() {
        return $('#PageURL').val().trim() !== '' &&
            $('#inputDate').val().trim() !== '' &&
            $('#inputProject').val().trim() !== '' &&
            $('#inputJobNumber').val().trim() !== '' &&
            $('#inputDivision').val().trim() !== '' &&
            $('#inputPricing').val().trim() !== '';
    }
// Function to get UTM parameters from the URL
function getUrlParams() {
    var params = {};
    var url = $('#PageURL').val(); // Get the URL from the PageURL input field
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    if (queryString) {
        queryString = queryString.split('#')[0];
        var arr = queryString.split('&');
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split('=');
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            params[paramName] = decodeURIComponent(paramValue);
        }
    }
    return params;
}

// Helper function to convert date from YYYYMMDD to YYYY-MM-DD (for <input type="date">)
function formatDate(yyyymmdd) {
    var year = yyyymmdd.substring(0, 4);
    var month = yyyymmdd.substring(4, 6);
    var day = yyyymmdd.substring(6, 8);
    return year + '-' + month + '-' + day; // Format for <input type="date">
}

// Function to parse and validate the utm_campaign parameter
function parseUtmCampaign(utm_campaign) {
    var parts = utm_campaign.split('-');
    if (parts.length === 3) { // Ensure it contains three sections
        return {
            inputDate: formatDate(parts[0]), // Convert the date to YYYY-MM-DD
            inputProject: parts[1],
            inputJobNumber: parts[2]
        };
    } else {
        return null; // Invalid format
    }
}

// Function to animate the transfer of UTM parameters into form fields
function animateTransfer(text, targetElement) {
    var placeholder = $('<span>').text(text).css({
        position: 'absolute',
        left: $('#PageURL').offset().left,
        top: $('#PageURL').offset().top,
        zIndex: 1000,
        fontSize: '13.3333px',
        color: '#0072bc',
        background: '#fff',
        border: '1px solid #0072bc',
        padding: '2px 4px',
        borderRadius: '4px',
    });

    $('body').append(placeholder);

    placeholder.animate({
        left: $(targetElement).offset().left,
        top: $(targetElement).offset().top
    }, 800, function () {
        $(targetElement).val(text); // Populate the target input field
        placeholder.fadeOut(300, function () {
            $(this).remove(); // Remove the animation element after fading
        });
        checkAndShowElements(); // Check conditions after transfer
    });
}

function validateBaseUrl() {
    const baseUrlInput = $('#PageURL');
    const baseUrlLabel = $('#labelPageURL');
    const baseUrlValue = baseUrlInput.val().trim();

    // Regular expression to validate a base URL format
    const regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}([\/\w \.-]*)*\/?$/;

    // Remove existing warning message for this input, if any
    $(baseUrlLabel).siblings('.promo-warning').remove();

    // Check if the base URL matches the regex
    if (!regex.test(baseUrlValue)) {
        // Show warning using the reusable function
        showErrorIcon(baseUrlLabel, "Please enter a valid base URL (e.g., example.com or www.example.com).");
        // Add red border to the input field
        baseUrlInput.css('border', '2px solid red');
    } else {
        // Reset the input border if input is valid
        baseUrlInput.css('border', '1px solid #888');
    }
}

// Attach the validation function to the base URL input event
$('#PageURL').on('input', function() {
    validateBaseUrl();
});


function validateItemCodes() {
    const itemCodesInput = $('#inputItems');
    const itemCodesLabel = $('#labelItems');
    const itemCodesValue = itemCodesInput.val().trim();
    
    // Regular expression to validate the format: 7 digits separated by commas
    const regex = /^(\d{7})(,\d{7})*$/;

    // Remove existing warning message for this input, if any
    $(itemCodesLabel).siblings('.promo-warning').remove();

    if (!regex.test(itemCodesValue)) {
        // Show warning using the reusable function
        showErrorIcon(itemCodesLabel, "Item codes must be 7-digit numbers separated by commas.");
    } else {
        // Reset the input border if input is valid
        itemCodesInput.css('border', '1px solid #888');
    }
}

// Attach the validation function to the item codes input event
$('#inputItems').on('input', function() {
    validateItemCodes();
});
  
 
function validatePromoCode() {
    const promoInput = $('#inputPromo');
    const promoLabel = $('#labelPromo');
    const promoValue = promoInput.val().trim();

    // Remove existing warning message for this input, if any
    $(promoLabel).siblings('.promo-warning').remove();

    // Check if the promo code has more than 3 letters
    if (promoValue.length > 3) {
        // Show warning using the reusable function
        showErrorIcon(promoLabel, "Promo codes are typically three (3) characters, e.g., ABC");
    } else {
        // Reset the input border if input is valid
        promoInput.css('border', '1px solid #888');
    }
}

// Attach the validation function to the promo code input event
$('#inputPromo').on('input', function() {
    validatePromoCode();
});

   function validateJobNumber() {
    const jobNumberInput = $('#inputJobNumber');
    const jobNumberLabel = $('#labelJobNumber');
    const jobNumberValue = jobNumberInput.val().trim();

    // Regular expression to validate the format: NNLLNNNN (2 digits, 2 letters, 4 digits)
    const regex = /^\d{2}[A-Za-z]{2}\d{4}$/;

    // Remove existing warning message for this input, if any
    $(jobNumberLabel).siblings('.promo-warning').remove();

    // Check if the job number matches the regex
    if (!regex.test(jobNumberValue)) {
        // Show warning using the reusable function
        showErrorIcon(jobNumberLabel, "Job number must be in the format ##LL#### (# = number, L = letter - the two letters specify the division abbreviation, e.g., 24DS2828).");
    } else {
        // Reset the input border if input is valid
        jobNumberInput.css('border', '1px solid #888');
    }
}

// Attach the validation function to the job number input event
$('#inputJobNumber').on('input', function() {
    validateJobNumber();
});


// Function to populate the input fields with UTM info
function populateAndRemoveUTM() {
    var urlField = $('#PageURL');
    var url = urlField.val().trim();
    var params = getUrlParams();

    if (params.productid) {
        animateTransfer(params.productid, '#inputItems');
    }
    if (params.promocode) {
        animateTransfer(params.promocode, '#inputPromo');
    }
    if (params.cdivid) {
        animateTransfer(params.cdivid, '#inputDivision');
    }
    if (params.dp) {
        animateTransfer(params.dp, '#inputPricing');
    }

    // Check and parse utm_campaign
    if (params.utm_campaign) {
        var campaignData = parseUtmCampaign(params.utm_campaign);
        if (campaignData) {
            $('#inputDate').val(campaignData.inputDate); // Set date in YYYY-MM-DD format
            animateTransfer(campaignData.inputProject, '#inputProject');
            animateTransfer(campaignData.inputJobNumber, '#inputJobNumber');
        }
    }

    var cleanUrl = url.split('?')[0]; // Remove the query parameters
    urlField.val(cleanUrl); // Set the cleaned URL

    // After the animations complete, fade out the UTM parameters from the PageURL
  setTimeout(function () {
    var baseUrl = url.split('?')[0]; // The base URL without parameters

    // Directly set the cleaned URL (without UTM) to the input field
    urlField.val(baseUrl); // Update the cleaned URL (without UTM)

    // Optionally, you can clear the URL value if desired
    // urlField.val(''); // Uncomment this line if you want to clear the field after setting the new URL

    checkAndShowElements();
     generateTaggedURLs();
     // Check conditions after setting the URL
}, 1000); // Delayed to match the animation

}

// Check if all required fields have values, then show or hide elements
function checkAndShowElements() {
    var allFieldsFilled = $('#PageURL').val().trim() !== '' &&
        $('#inputDate').val().trim() !== '' &&
        $('#inputProject').val().trim() !== '' &&
        $('#inputJobNumber').val().trim() !== '' &&
        $('#inputDivision').val().trim() !== '' &&
        $('#inputPricing').val().trim() !== '';

    if (allFieldsFilled) {
        $('#url-list-log').slideDown();
        $('#copy-all-btn').fadeIn();
        $('#createdByTrevor').fadeIn();
    } else {
        $('#url-list-log').slideUp();
        $('#copy-all-btn').fadeOut();
        $('#createdByTrevor').fadeOut();
    }
}

// Trigger the UTM population and element visibility checks when the PageURL field changes or on page load
$('#PageURL, #inputDate, #inputProject, #inputJobNumber, #inputDivision, #inputPricing').on('input', function () {
    populateAndRemoveUTM();
    checkAndShowElements();
    generateTaggedURLs();
});

// To ensure animations work after pasting
$('#PageURL').on('paste', function () {
   setTimeout(function () { // Give the paste action time to complete
   populateAndRemoveUTM();
   checkAndShowElements();
   generateTaggedURLs();
    }, 100);
});

// Initial call to populate the UTM fields and check element visibility on page load
   populateAndRemoveUTM();
   checkAndShowElements();
   generateTaggedURLs();

    function areAllSubcategoriesUnchecked($customSubcategories) {
        var checkedCount = $customSubcategories.find("input[type='checkbox']:checked").length;
        if (checkedCount > 0) {
            return false; // Return false if any checkbox is checked
        } else {
            var nestedUnchecked = $customSubcategories.find(".customSubcategories").toArray().every(function(subcategory) {
                return areAllSubcategoriesUnchecked($(subcategory));
            });
            return nestedUnchecked; // Return true if all nested checkboxes are unchecked
        }
    }
    // Function to check/uncheck parent checkboxes based on child checkboxes
    function checkParentCheckbox($customSubcategories) {
        var $overallParent = $(".dropdown-parent"); 
        var $allSubcategoryCheckboxes = $overallParent.closest(".dropdown-wrapper").find(".customSubcategories input[type='checkbox']");
        var allSubcategoriesUnchecked = $allSubcategoryCheckboxes.filter(':checked').length === 0;
        $overallParent.prop('checked', allSubcategoriesUnchecked);
        var $parentDropdownWrapper = $customSubcategories.closest(".dropdown-wrapper");
        while ($parentDropdownWrapper.length > 0) {
            var $parentCheckbox = $parentDropdownWrapper.prev().find(".customCheckbox");
            var $allParentSubcategoryCheckboxes = $parentDropdownWrapper.find(".customSubcategories input[type='checkbox']");
            var allParentSubcategoriesUnchecked = $allParentSubcategoryCheckboxes.filter(':checked').length === 0;
            $parentCheckbox.prop('checked', allParentSubcategoriesUnchecked);
            $parentDropdownWrapper = $parentDropdownWrapper.closest(".dropdown-wrapper").parent().closest(".dropdown-wrapper");
        }
    }

// Combined event listener for checkboxes and input fields
$(document).on('change input', '#websiteLinkingAgreementCheckbox, #tradePublicationCheckbox, #TradePublicationName, #TradePublicationLinkName, #WebsiteLinkingVendorName', function() {
    // Handle websiteLinkingAgreementCheckbox
    if ($('#websiteLinkingAgreementCheckbox').is(':checked')) {
        webLinkVendorNameInput.fadeIn().slideDown();
    } else {
        webLinkVendorNameInput.slideUp().fadeOut();
    }

    // Handle tradePublicationCheckbox and related inputs
    if ($('#tradePublicationCheckbox').is(':checked')) {
        tradePublicationNameInput.fadeIn().slideDown();
        tradePublicationLinkInput.fadeIn().slideDown();
    } else {
        tradePublicationNameInput.slideUp().fadeOut();
        tradePublicationLinkInput.slideUp().fadeOut();
    }

    // Call the function to regenerate the URLs
    generateTaggedURLs();
});
    // When any of the checkboxes are changed
    $("input[name='group']").change(function() {
        $(".customSubcategories").each(function() {
            var $customSubcategories = $(this);
            generateTaggedURLs(); // Regenerate URLs to reflect changes in checkboxes
            // If any subcategory checkbox is checked, check the custom checkbox
            if ($customSubcategories.find("input[type='checkbox']:checked").length > 0) {
                $customSubcategories.closest(".dropdown-wrapper").find(".customCheckbox").prop('checked', true);
                generateTaggedURLs(); // Regenerate URLs after checking the custom checkbox
            }
            // If all subcategory checkboxes are unchecked, uncheck the custom checkbox
            if (areAllSubcategoriesUnchecked($customSubcategories)) {
                $customSubcategories.closest(".dropdown-wrapper").find(".customCheckbox").prop('checked', false);
                generateTaggedURLs(); // Regenerate URLs after unchecking the custom checkbox
            }
            // Check/uncheck parent checkboxes
            checkParentCheckbox($customSubcategories);
        });
    });
    // When the custom checkbox is clicked
    $(".customCheckbox").click(function() {
        var isChecked = $(this).prop('checked'); // Check if the checkbox is checked
        var $customSubcategories = $(this).closest(".dropdown-wrapper").find(".customSubcategories");
        // Update all subcategory checkboxes based on the state of custom checkbox
        $customSubcategories.find("input[type='checkbox']").prop('checked', isChecked);
        generateTaggedURLs(); // Regenerate URLs to reflect changes in checkboxes
        // Check/uncheck parent checkboxes
        checkParentCheckbox($customSubcategories);
    });
    // Hide the url-list-log element and the "Copy All" button initially
    $('#url-list-log').hide();
    $('#copy-all-btn').hide();
    $('#createdByTrevor').hide();
    $('.customSubcategories').hide();
    // Add change event listener to checkboxes
    $('input[type="checkbox"]').change(function() {
        checkAndShowElements();
        generateTaggedURLs();
    });
    // Add input event listener to input elements
    $('input[type="text"]').on('input', function() {
        checkAndShowElements();
        generateTaggedURLs();
    });
    // Add event listener for "Copy All" button
    document.getElementById("copy-all-btn").addEventListener("click", copyAllContent);
    // Generate tagged URLs on page load
    generateTaggedURLs();
    // When a dropdown-parent is clicked, toggle its corresponding customSubcategories with smooth animation
    $(".dropdown-parent").click(function() {
        var $customSubcategories = $(this).closest(".dropdown-wrapper").find(".customSubcategories").first();
        $customSubcategories.slideToggle();
        $(this).closest(".dropdown-wrapper").find(".arrow").first().toggleClass("rotated");
    });
    // Hide the url-list-log element and the "Copy All" button initially
    $('#url-list-log').hide();
    $('#copy-all-btn').hide();
    $('#createdByTrevor').hide();
    $('.customSubcategories').hide();
    // Add change event listener to checkboxes
    $('input[type="checkbox"]').change(function() {
        checkAndShowElements();
        generateTaggedURLs();
    });
    // Add input event listener to input elements
    $('input[type="text"]').on('input', function() {
        checkAndShowElements();
        generateTaggedURLs();
    });
    const selectedIds = [];
    // Function to copy all content within url-list-log div
    function copyAllContent() {
        var urlListLog = document.getElementById("url-list-log");
        var range = document.createRange();
        range.selectNode(urlListLog);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        // Provide feedback to the user
        alert("Content copied to clipboard!");
    }
    // Event listener for Copy All button
    document.getElementById("copy-all-btn").addEventListener("click", copyAllContent);
    // Add event listener to checkboxes
    $('input[type="checkbox"]').change(function() {
        generateTaggedURLs(); // Regenerate URLs when checkboxes change
    });
});
// Function to check if all subcategory checkboxes are unchecked
function areAllSubcategoriesUnchecked($customSubcategories) {
    var checkedCount = $customSubcategories.find("input[type='checkbox']:checked").length;
    if (checkedCount > 0) {
        return false;
    } else {
        var nestedUnchecked = $customSubcategories.find(".customSubcategories").toArray().every(function(subcategory) {
            return areAllSubcategoriesUnchecked($(subcategory));
        });
        return nestedUnchecked;
    }
}
// Function to check/uncheck parent checkboxes based on child checkboxes
function checkParentCheckbox($customSubcategories) {
    var $parentDropdownWrapper = $customSubcategories.closest(".dropdown-wrapper");
    var $parentCheckbox = $parentDropdownWrapper.find(".customCheckbox");
    var isChecked = $customSubcategories.find("input[type='checkbox']:checked").length > 0;
    $parentCheckbox.prop('checked', isChecked);
    // If all child checkboxes are unchecked, uncheck the parent checkbox
    if (!isChecked && $customSubcategories.find("input[type='checkbox']").length > 0) {
        $parentCheckbox.prop('checked', false);
    }
    // Recursively check parent's parent until reaching the top-level dropdown
    if (!isChecked && $parentDropdownWrapper.parent().hasClass("customSubcategories")) {
        checkParentCheckbox($parentDropdownWrapper.parent());
    }
}
   
function checkAndShowElements() {
    // Check if all required fields have input
    var allFieldsFilled = $('#PageURL').val().trim() !== '' &&
        $('#inputDate').val().trim() !== '' &&
        $('#inputProject').val().trim() !== '' &&
        $('#inputJobNumber').val().trim() !== '' &&
        $('#inputDivision').val().trim() !== '' &&
        $('#inputPricing').val().trim() !== '';

    if (allFieldsFilled) {
        // Show the URL list and the "Copy All" button if all fields are filled
        $('#url-list-log').slideDown();
        $('#copy-all-btn').fadeIn();
        $('#createdByTrevor').fadeIn();
    } else {
        // Hide the URL list and the "Copy All" button if any field is missing
        $('#url-list-log').slideUp();
        $('#copy-all-btn').fadeOut();
        $('#createdByTrevor').fadeOut();
    }
}
   
   
function showErrorIcon(labelElement, message) {
    // Remove existing warning for the specific label element
    $(labelElement).siblings('.promo-warning').remove();

    // Add red border to the associated input field
    const inputField = $(labelElement).next('input'); // Assuming the input is immediately after the label
    inputField.css('border', '2px solid red');

    // SVG for warning icon
    const warningIcon = `
        <span class="promo-warning" style="position: absolute; color: red; font-size: 0.85em; margin-left: 0.5em;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <g stroke="#EF3E42" stroke-width="2.23">
                    <circle fill="#ffffff" cx="10" cy="10" r="8.5652"/>
                    <path d="M10,4.188V12.657M10,13.438V15.813"/>
                </g>
            </svg>
            <span class="tooltip" style="display:none; position: absolute; min-width: 150px; top: 100%; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.9); font-size: 12px; line-height: 15.6px; border: 1px solid red; border-radius: 5px; padding: 5px; z-index: 10;">${message}</span>
        </span>
    `;

    // Append the warning icon and message after the label element
    $(labelElement).after(warningIcon);

    // Show tooltip on hover
    $(labelElement).siblings('.promo-warning').hover(
        function() {
            $(this).find('.tooltip').show();
        },
        function() {
            $(this).find('.tooltip').hide();
        }
    );
}

   
function generateTaggedURLs() {
    // Define constants and extract input values
    const baseUrl = $('#PageURL').val().trim();
    const items = $('#inputItems').val().trim().replace(/\s/g, '');
    const promo = $('#inputPromo').val().trim().toUpperCase();
    const date = $('#inputDate').val().trim().replace(/-/g, '');
    const project = $('#inputProject').val().trim().replace(/\s/g, '');
    const jobNumber = $('#inputJobNumber').val().trim().replace(/\s/g, '').toUpperCase();
    const keyword = $('#inputKeyword').val().trim().replace(/\s/g, '');
    const division = $('#inputDivision').val().trim();
    const pricing = $('#inputPricing').val().trim();
    const inputUrl = $('#inputVanity').val().trim();
    const lastIndex = inputUrl.lastIndexOf("/");
    const vanity = lastIndex !== -1 ? inputUrl.substring(lastIndex + 1) : inputUrl;
    var dateProjectJob = '&utm_campaign=' + date + '-' + project + '-' + jobNumber;
    const webLinkVendorName = $('#WebsiteLinkingVendorName').val().trim();
    const tradePublicationName = $('#TradePublicationName').val().trim();
    const tradePublicationLink = $('#TradePublicationLinkName').val().trim();
    const isEmailChecked = $('#emailCheckbox').is(':checked');
    const marketoFolderName = $('#MarketoFolderName').val().trim();
    const qrCode = $('#QRCodeContent').val().trim().replace(/\s/g, '');
    var urls = [
        {
            category: "Paid Search Ads",
            subcategories: [
                {
                    name: "Google",
                    urls: ["utm_source=Google&utm_medium=CPC"],
                    contentutm: ["PaidSearchGoogle"]
                },
                {
                    name: "Bing",
                    urls: ["utm_source=Bing&utm_medium=CPC"],
                    contentutm: ["PaidSearchBing"]
                }
            ]
        },
        {
            category: "Email",
            subcategories: [
                {
                    name: "MarketoSCS",
                    urls: ["utm_source=MarketoSCS&utm_medium=Email"],
                    tier2subcategories: [
                        { name: "Henry Schein Logo", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["Logo"] },
                        { name: "Shop Button", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["Shop"] },
                        { name: "Account Button", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["Account"] },
                        { name: "Hero Partner Image", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["HeaderImage"] },
                        { name: "Main CTA", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["CTA"] },
                        { name: "Supplies", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["Supplies"] },
                        { name: "Repair Solutions", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["RepairSolutions"] },
                        { name: "Featured Offers", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["FeaturedOffers"] },
                        { name: "Help", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["Help"] }
                    ]
                },
                {
                    name: "MarketoMktg",
                    urls: ["utm_source=MarketoMktg&utm_medium=Email"],
                    tier2subcategories: [
                        { name: "Henry Schein Logo", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["Logo"] },
                        { name: "Shop Button", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["Shop"] },
                        { name: "Account Button", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["Account"] },
                        { name: "Hero Partner Image", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["HeaderImage"] },
                        { name: "Main CTA", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["CTA"] },
                        { name: "Supplies", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["Supplies"] },
                        { name: "Repair Solutions", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["RepairSolutions"] },
                        { name: "Featured Offers", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["FeaturedOffers"] },
                        { name: "Help", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["Help"] }
                    ]
                }
            ]
        },
        {
            category: "Email Featured Banner",
            subcategories: [
                { name: "MarketoSCS Featured Banner", urls: ["utm_source=MarketoSCS&utm_medium=Email"], contentutm: ["EmailFeaturedBanner"] },
                { name: "MarketoMktg Featured Banner", urls: ["utm_source=MarketoMktg&utm_medium=Email"], contentutm: ["EmailFeaturedBanner"] }
            ]
        },
        {
            category: "Paid Display Ads",
            subcategories: [
                { name: "AdRoll", urls: ["utm_source=AdRoll&utm_medium=Display"], contentutm: ["AdRollBanner"] },
                { name: "AdAdvance", urls: ["utm_source=AdAdvance&utm_medium=Display"], contentutm: ["AdAdvanceBanner"] },
                { name: "RichRelevance", urls: ["utm_source=RichRelevance&utm_medium=Display"], contentutm: ["RichRelevanceBanner"] }
            ]
        },
        {
            category: "Narvar",
            subcategories: [
                { name: "Website", urls: ["utm_source=Narvar&utm_medium=Website"], contentutm: ["NarvarBannerWebsite"] },
                { name: "Email", urls: ["utm_source=Narvar&utm_medium=Email"], contentutm: ["NarvarBannerEmail"] }
            ]
        },
  
       
        {
            category: "Social",
            subcategories: [
                {
                    name: "Instagram",
                    urls: ["utm_source=Instagram&utm_medium=Social"],
                    tier2subcategories: [
                        {name: "Instagram 1", urls: ["utm_source=Instagram&utm_medium=Social"], contentutm: ["SocialBannerInstagram1"] },
                       {name:  "Instagram 2", urls: ["utm_source=Instagram&utm_medium=Social"], contentutm: ["SocialBannerInstagram2"] },
                       { name: "Instagram 3", urls: ["utm_source=Instagram&utm_medium=Social"], contentutm: ["SocialBannerInstagram3"] },
                       { name: "Instagram 4", urls: ["utm_source=Instagram&utm_medium=Social"], contentutm: ["SocialBannerInstagram4"] }
                        
                    ]
                },
                {
                    name: "Twitter",
                    urls: ["utm_source=Twitter&utm_medium=Social"],
                    tier2subcategories: [
                        {name: "Twitter 1", urls: ["utm_source=Twitter&utm_medium=Social"], contentutm: ["SocialBannerTwitter1"] },
                        {name: "Twitter 2", urls: ["utm_source=Twitter&utm_medium=Social"], contentutm: ["SocialBannerTwitter2"] }
                      
                        
                    ]
                },
               {
                    name: "Facebook",
                    urls: ["utm_source=Facebook&utm_medium=Social"],
                    tier2subcategories: [
                        {name: "Facebook 1", urls: ["utm_source=Facebook&utm_medium=Social"], contentutm: ["SocialBannerFacebook1"] },
                        {name: "Facebook 2", urls: ["utm_source=Facebook&utm_medium=Social"], contentutm: ["SocialBannerFacebook2"] },
                          {name: "Facebook 3", urls: ["utm_source=Facebook&utm_medium=Social"], contentutm: ["SocialBannerFacebook3"] }
                      
                        
                    ]
                },
               { name: "YouTube", urls: ["utm_source=YouTube&utm_medium=Social"], contentutm: ["SocialBannerYouTube"] },
                { name: "LinkedIn", urls: ["utm_source=LinkedIn&utm_medium=Social"], contentutm: ["SocialBannerLinkedIn"] }
    
            ]
        },
       
       
        {
            category: "Website Linking Agreement",
            subcategories: [
                { name: "Website Linking Agreement", urls: ["utm_medium=Referral"] }
            ]
        },
        {
            category: "Trade Publication",
            subcategories: [
                { name: "Trade Publication Email", urls: ["&utm_medium=Email"] },
                { name: "Trade Publication Website", urls: ["&utm_medium=Website"] }
            ]
        },
        {
            category: "Vanity URLs",
            subcategories: [
                { name: "Vanity URL External (Standard)", urls: ["utm_source=External&utm_medium=VanityURL"], contentutm: ["VanityURL"] }
            ]
        },
        {
            category: "QR Code",
            subcategories: [
                { name: "Nxtbook", urls: ["utm_source=Nxtbook&utm_medium=QRCode"] },
                { name: "External", urls: ["utm_source=External&utm_medium=QRCode"] }
               
            ]
        },
        {
            category: "Telesales",
            subcategories: [
                { name: "Telesales Campaign", urls: ["utm_source=Telesales&utm_medium=Phone"], contentutm: ["TelesalesLink"] }
            ]
        }
    ];

    // Function to sanitize URL by removing duplicate '&' characters
function sanitizeURL(url) {
    let [base, queryString] = url.split('?');
    if (queryString) {
        queryString = queryString
            .split('&')
            .filter(param => param) // Remove empty parameters
            .join('&');
        return `${base}?${queryString}`;
    }
    return base;
}
   
    // Clear the list
    var urlListLog = document.getElementById("url-list-log");
    urlListLog.innerHTML = '';

urls.forEach(function(group) {
    if (baseUrl !== '' && date !== '' && project !== '' && jobNumber !== '' && division !== '' && pricing !== '') {
        if (group.category === "Email" && marketoFolderName === '' || group.category === "Email Featured Banner" && marketoFolderName === '' || (group.category === "QR Code" && qrCode === '')) {
            return; // Skip Email and Email Featured Banner categories if MarketoFolderName is empty, Skip QR Code if qrCodeContent is empty
        }
        var categoryDiv = document.createElement("div");
        categoryDiv.id = group.category.replace(/\s/g, '-').replace(/\(/g, '-').replace(/\)/g, '').replace(/\W/g, "");
        var categoryHeader = document.createElement("h2");
        categoryHeader.textContent = group.category;
        categoryDiv.appendChild(categoryHeader);
        urlListLog.appendChild(categoryDiv);

        group.subcategories.forEach(function(subcategory) {
            var subcategoryContainer = document.createElement("div");
            subcategoryContainer.className = "subcategory-container";
            subcategoryContainer.id = group.category.replace(/\s/g, '-').replace(/\(/g, '-').replace(/\)/g, '').replace(/\W/g, "") + subcategory.name.replace(/\s/g, '-').replace(/\(/g, '-').replace(/\)/g, '').replace(/\W/g, "");
            var subcategoryHeader = document.createElement("h3");
            subcategoryHeader.textContent = subcategory.name;
            subcategoryContainer.appendChild(subcategoryHeader);

            var hasTier2Subcategories = subcategory.tier2subcategories && subcategory.tier2subcategories.length > 0;

            if (!hasTier2Subcategories) {
                subcategory.urls.forEach(function(url) {
                    var finalUrl = baseUrl.includes('?') ? baseUrl + '&' : baseUrl + '?';

                    // Check if baseUrl contains henryschein.com
                    if (baseUrl.includes('henryschein')) {
                        if (items !== '') {
                            finalUrl += 'productid=' + items + '&';
                        }
                        if (promo !== '') {
                            finalUrl += 'promocode=' + promo.toUpperCase() + '&';  // Uppercase promocode
                        }
                        if (pricing !== 'dp=false' && pricing !== '') {
                            finalUrl += pricing + '&';
                        }           
                    }

                    if (webLinkVendorName !== '' && group.category === "Website Linking Agreement") {
                        finalUrl += '&utm_source=' + webLinkVendorName + '&' + url;
                    }
                    if (tradePublicationName !== '' && group.category === "Trade Publication") {
                        finalUrl += '&utm_source=TradePublication-' + tradePublicationName + url;
                    }
                    if (url !== '' && group.category !== "Trade Publication" && group.category !== "Website Linking Agreement") {
                        finalUrl += url;
                    }
                    if ((group.category === "Email" || group.category === "Email Featured Banner") && marketoFolderName !== '') {
                        finalUrl += '&utm_campaign=' + marketoFolderName;
                    } else if (date !== '' && project !== '' && jobNumber !== '') {
                        finalUrl += dateProjectJob;
                    }
                    if (tradePublicationLink !== '' && group.category === "Trade Publication") {
                        finalUrl += '&utm_content=' + tradePublicationLink;
                    }
                    if (subcategory.contentutm && group.category !== "Vanity URLs") {
                        finalUrl += '&utm_content=' + subcategory.contentutm;
                    }
                    if (subcategory.contentutm && group.category === "Vanity URLs") {
                        finalUrl += '&utm_content=' + subcategory.contentutm + vanity;
                    }

                    if (group.category === "QR Code") {
                        finalUrl += '&utm_content=' + qrCode;
                    }

                    if (group.category === "Website Linking Agreement") {
                        finalUrl += '&utm_content=WebsiteLinkingAgreement';
                    }
                    

                    // Check if baseUrl contains henryschein.com
                    if (baseUrl.includes('henryschein')) {
                     finalUrl += '&utm_term=' + division;
                     finalUrl += '&cdivid=' + division;
                       
                     if (division === 'specialmarkets') { // Update this condition
                        finalUrl += '_d';
                    }

                       
                       // Check if items has more than 23 commas
                    if ((items.match(/,/g) || []).length > 23) {
                        finalUrl += '&browsingmode=p';
                    }
                    }

                    // Convert the rest of the URL to lowercase but keep the promocode uppercase
                    var lowerFinalUrl = finalUrl.toLowerCase();
                    lowerFinalUrl = lowerFinalUrl.replace(/promocode=[^&]*/i, 'promocode=' + promo.toUpperCase());

                    lowerFinalUrl = sanitizeURL(lowerFinalUrl);  // Keep URL formatting and sanitization
                    var urlParagraph = document.createElement("p");
                    var urlAnchor = document.createElement("a");
                    urlAnchor.href = lowerFinalUrl;  // Use the modified lowercase URL
                    urlAnchor.textContent = lowerFinalUrl;  // Display the modified lowercase URL
                    urlAnchor.target = "_blank";
                    urlParagraph.appendChild(urlAnchor);
                    subcategoryContainer.appendChild(urlParagraph);
                });
            }

            if (hasTier2Subcategories) {
                var tier2subcategoryContainer = document.createElement("div");
                tier2subcategoryContainer.className = "tier2subcategory-container";
                subcategory.tier2subcategories.forEach(function(tier2subcategory) {
                    var tier2subcategoryDiv = document.createElement("div");
                    tier2subcategoryDiv.id = subcategory.name.replace(/\s/g, '-').replace(/\(/g, '-').replace(/\)/g, '').replace(/\W/g, "");
                    var finalUrl = baseUrl.includes('?') ? baseUrl + '&' : baseUrl + '?';

                    // Check if baseUrl contains henryschein.com
                    if (baseUrl.includes('henryschein')) {
                        if (items !== '') {
                            finalUrl += 'productid=' + items + '&';
                        }
                        if (promo !== '') {
                            finalUrl += 'promocode=' + promo.toUpperCase() + '&';  // Uppercase promocode
                        }
                        if (pricing !== 'dp=false' && pricing !== '') {
                            finalUrl += pricing + '&';
                        }
                    }

                    if (tier2subcategory.urls && tier2subcategory.urls.length > 0) {
                        finalUrl += '&' + tier2subcategory.urls.join('&');
                    }
                    if ((group.category === "Email" || group.category === "Email Featured Banner") && marketoFolderName !== '') {
                        finalUrl += '&utm_campaign=' + marketoFolderName;
                    } else if (date !== '' && project !== '' && jobNumber !== '') {
                        finalUrl += dateProjectJob;
                    }
                    if (tier2subcategory.contentutm && group.category !== "Vanity URLs") {
                        if (!finalUrl.includes('utm_content=')) {
                            finalUrl += (finalUrl.includes('?') ? '&' : '') + 'utm_content=' + tier2subcategory.contentutm;
                        }
                    }
                    if (tier2subcategory.contentutm && group.category === "Vanity URLs") {
                        if (!finalUrl.includes('utm_content=')) {
                            finalUrl += (finalUrl.includes('?') ? '&' : '') + 'utm_content=' + tier2subcategory.contentutm + vanity;
                        }
                    }

                    if (group.category === "QR Code") {
                        finalUrl += '&utm_content=' + qrCode;
                    }

                    if (tier2subcategory.contentutm && group.category === "Email" && !finalUrl.includes('utm_content=')) {
                        if (!finalUrl.includes('utm_content=')) {
                            finalUrl += (finalUrl.includes('?') ? '&' : '') + 'utm_content=' + tier2subcategory.contentutm;
                        }
                    }
                    if (group.category === "Website Linking Agreement") {
                        finalUrl += '&utm_source=WebsiteLinkingAgreement&';
                    }
                  
                     if (baseUrl.includes('henryschein')) {
                       
                         finalUrl += '&utm_term=' + division;
                       finalUrl += '&cdivid=' + division;
                           if (division === 'specialmarkets') { // Update this condition
                        finalUrl += '_d';
                    }


                    // Check if items has more than 23 commas
                    if ((items.match(/,/g) || []).length > 23) {
                        finalUrl += '&browsingmode=p';
                    }
                     }
                   
                    // Convert the rest of the URL to lowercase but keep the promocode uppercase
                    var lowerFinalUrl = finalUrl.toLowerCase();
                    lowerFinalUrl = lowerFinalUrl.replace(/promocode=[^&]*/i, 'promocode=' + promo.toUpperCase());

                    lowerFinalUrl = sanitizeURL(lowerFinalUrl);  // Keep URL formatting and sanitization
                    var tier2subcategoryHeading = document.createElement("h4");
                    tier2subcategoryHeading.textContent = tier2subcategory.name;
                    tier2subcategoryDiv.appendChild(tier2subcategoryHeading);
                    var tier2subcategoryParagraph = document.createElement("p");
                    var urlAnchor = document.createElement("a");
                    urlAnchor.href = lowerFinalUrl;  // Use the modified lowercase URL
                    urlAnchor.textContent = lowerFinalUrl;  // Display the modified lowercase URL
                    urlAnchor.target = "_blank";
                    tier2subcategoryParagraph.appendChild(urlAnchor);
                    tier2subcategoryDiv.appendChild(tier2subcategoryParagraph);
                    tier2subcategoryContainer.appendChild(tier2subcategoryDiv);
                });
                subcategoryContainer.appendChild(tier2subcategoryContainer);
            }
            categoryDiv.appendChild(subcategoryContainer);
        });
    }
});

    $('input[type="checkbox"]').each(function() {
        var id = $(this).val().replace(/\W/g, '');
        if ($(this).is(':checked')) {
            $('#' + id).css('display', 'block');
        } else {
            $('#' + id).css('display', 'none');
        }
    });
}