// Event handler for the Item form
frappe.ui.form.on('Item', {
    refresh(frm) {
        // Add custom button to generate barcode
        frm.add_custom_button('Generate Barcode', () => {
            // Generate a new EAN-13 barcode
            const ean13Barcode = generate_ean13();
            // Add the generated barcode to the 'barcodes' child table
            const child = frm.add_child('barcodes');
            frappe.model.set_value(child.doctype, child.name, 'barcode', ean13Barcode);
            // Refresh the 'barcodes' field to show the new entry
            frm.refresh_field('barcodes');

            frm.save().then(() => {
                frappe.show_alert({
                    message: __('Form saved successfully with barcode {0}!', [ean13Barcode]),
                    indicator: 'green'
                });
            });
        });

        // Add custom button to print barcode
        frm.add_custom_button('Print Barcode', () => {
            // Get the list of barcodes associated with this item
            let barcodes = frm.doc.barcodes || [];

            // Create HTML content for the dialog, containing buttons for each barcode
            let dialogContent = '<div id="barcode-buttons">';
            barcodes.forEach(function (barcode) {
                dialogContent += '<button class="barcode-button btn btn-primary" data-barcode="' + barcode.barcode + '">' + barcode.barcode + '</button>';
            });
            dialogContent += '</div>';

            // Create and show a dialog for barcode selection
            let dialog = new frappe.ui.Dialog({
                title: 'Print Barcode',
                fields: [
                    {
                        fieldname: 'barcode_buttons',
                        label: 'Select Barcode',
                        fieldtype: 'HTML',
                        options: dialogContent
                    }
                ],
                primary_action_label: 'Print',
                primary_action: function () {
                    // Get the selected barcode
                    let selectedButton = dialog.get_field('barcode_buttons').$wrapper.find('.barcode-button.active');
                    let selectedBarcode = selectedButton ? selectedButton.attr('data-barcode') : null;

                    if (selectedBarcode) {
                        // Create a hidden iframe to render the print format directly for printing
                        let printFrame = document.createElement('iframe');
                        printFrame.style.position = 'absolute';
                        printFrame.style.width = '0px';
                        printFrame.style.height = '0px';
                        printFrame.style.border = 'none';
                        document.body.appendChild(printFrame);

                        let baseUrl = window.location.origin; // Use the current window location as base URL
                        let doctype = 'Item';
                        let name = frm.doc.name;
                        let format = 'Barcode size 35mm x 15mm';
                        let barcode = selectedBarcode;

                        // Construct the print URL
                        let url = baseUrl + '/printview?' +
                            'doctype=' + encodeURIComponent(doctype) +
                            '&name=' + encodeURIComponent(name) +
                            '&format=' + encodeURIComponent(format) +
                            '&barcode=' + encodeURIComponent(barcode) +
                            '&trigger_print=1';

                        // Load the print format in the iframe
                        printFrame.src = url;

                        // Trigger the print dialog when the content is fully loaded
                        printFrame.onload = function() {
                            printFrame.contentWindow.print();
                            // Remove the iframe after printing
                            setTimeout(() => {
                                document.body.removeChild(printFrame);
                            }, 1000);
                        };
                    }

                    // Hide the dialog after printing
                    dialog.hide();
                }
            });

            // Show the dialog
            dialog.show();

            // Add click event to barcode buttons for selection
            dialog.$wrapper.find('.barcode-button').on('click', function () {
                dialog.$wrapper.find('.barcode-button').removeClass('active');
                $(this).addClass('active');
            });
        });
    }
});

// Function to generate EAN-13 barcode
function generate_ean13() {
    // Generate a random 9-digit product code
    let productCode = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    let barcode = productCode;
    // Add the check digit to complete the EAN-13 barcode
    return barcode + calculate_check_digit(barcode);
}

// Function to calculate the check digit for EAN-13 barcode
function calculate_check_digit(barcode) {
    // Convert barcode string to array of digits
    const digits = barcode.split('').map(Number);
    let evenSum = 0, oddSum = 0;
    
    // Calculate sums for odd and even positioned digits
    digits.forEach((digit, index) => {
        if (index % 2 === 0) {
            oddSum += digit;
        } else {
            evenSum += digit;
        }
    });
    
    // Calculate the total sum and determine the check digit
    const totalSum = oddSum * 3 + evenSum;
    const nextTen = Math.ceil(totalSum / 10) * 10;
    return nextTen - totalSum;
}
