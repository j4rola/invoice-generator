// Generate invoice ID when page loads
window.onload = function() {
    generateInvoiceId();
    document.getElementById('invoiceDate').valueAsDate = new Date();
    addItemRow(); // Add first item row
    toggleInvoiceType(); // Set up initial invoice type
}

function generateInvoiceId() {
    const prefix = 'INV';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceId = `${prefix}-${timestamp}-${random}`;
    document.getElementById('invoiceNumber').value = invoiceId;
}

function toggleInvoiceType() {
    const type = document.querySelector('input[name="invoiceType"]:checked').value;
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = ''; // Clear existing items
    addItemRow(); // Add new item row with correct format
    
    // Update preview header
    const headerRow = document.getElementById('previewItemsHeader');
    if (type === 'services') {
        headerRow.innerHTML = `
            <tr>
                <th style="width: 40%">Description</th>
                <th class="quantity-column" style="width: 20%">Hours</th>
                <th class="price-column" style="width: 20%">Rate</th>
                <th class="price-column" style="width: 20%">Total</th>
            </tr>`;
    } else {
        headerRow.innerHTML = `
            <tr>
                <th style="width: 40%">Description</th>
                <th class="quantity-column" style="width: 20%">Quantity</th>
                <th class="price-column" style="width: 20%">Price</th>
                <th class="price-column" style="width: 20%">Total</th>
            </tr>`;
    }
}

function addItemRow() {
    const type = document.querySelector('input[name="invoiceType"]:checked').value;
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    
    if (type === 'services') {
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" class="item-description">
            <input type="number" placeholder="Hours" class="item-hours" oninput="calculateRowTotal(this.parentElement)">
            <input type="number" placeholder="Rate" class="item-rate" oninput="calculateRowTotal(this.parentElement)">
            <input type="text" placeholder="Total" class="item-total" readonly>
        `;
    } else {
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" class="item-description">
            <input type="number" placeholder="Quantity" class="item-quantity" oninput="calculateRowTotal(this.parentElement)">
            <input type="number" placeholder="Price" class="item-price" oninput="calculateRowTotal(this.parentElement)">
            <input type="text" placeholder="Total" class="item-total" readonly>
        `;
    }
    
    document.getElementById('itemsList').appendChild(itemRow);
}

function calculateRowTotal(row) {
    const type = document.querySelector('input[name="invoiceType"]:checked').value;
    let total = 0;
    
    if (type === 'services') {
        const hours = parseFloat(row.querySelector('.item-hours').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        total = hours * rate;
    } else {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        total = quantity * price;
    }
    
    row.querySelector('.item-total').value = `$${total.toFixed(2)}`;
    updateRunningTotal();
}

function updateRunningTotal() {
    let total = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const totalText = row.querySelector('.item-total').value;
        total += parseFloat(totalText.replace('$', '')) || 0;
    });
    document.getElementById('runningTotal').textContent = `Total: $${total.toFixed(2)}`;
}

async function downloadPDF() {
    // Create a clean version for PDF
    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';
    pdfContent.style.backgroundColor = 'white';
    
    // Get all the values
    const companyName = document.getElementById('previewCompanyName').textContent;
    const companyAddress = document.getElementById('previewCompanyAddress').innerHTML;
    const clientName = document.getElementById('previewClientName').textContent;
    const clientAddress = document.getElementById('previewClientAddress').innerHTML;
    const invoiceNumber = document.getElementById('previewInvoiceNumber').textContent;
    const invoiceDate = document.getElementById('previewInvoiceDate').textContent;
    const itemsTable = document.getElementById('previewItems').innerHTML;
    const total = document.getElementById('previewTotal').textContent;

    console.log(` TEST ${total}`)

    // Create clean HTML structure
    pdfContent.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: black;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <h2 style="color: #4f46e5; font-size: 24px; margin-bottom: 10px;">${companyName}</h2>
                    <div style="font-size: 14px;">${companyAddress}</div>
                </div>
                <div style="text-align: right;">
                    <h1 style="font-size: 28px; color: #4f46e5; margin-bottom: 10px;">INVOICE</h1>
                    <p style="font-size: 14px;">Invoice #: ${invoiceNumber}</p>
                    <p style="font-size: 14px;">Date: ${invoiceDate}</p>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="font-size: 16px; margin-bottom: 10px;">Bill To:</h3>
                <p style="font-size: 14px;">${clientName}</p>
                <div style="font-size: 14px;">${clientAddress}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 10px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; width: 40%;">Description</th>
                        <th style="text-align: center; padding: 10px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; width: 20%;">Hours</th>
                        <th style="text-align: right; padding: 10px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; width: 20%;">Rate</th>
                        <th style="text-align: right; padding: 10px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsTable}
                </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <h3 style="font-size: 20px; color: #4f46e5;">Total: $${total}</h3>
            </div>
        </div>
    `;

    // Generate PDF with inline styles
    const opt = {
        margin: [0.5, 0.5],
        filename: `invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait'
        }
    };

    try {
        // Append temporarily to document
        document.body.appendChild(pdfContent);
        await html2pdf().set(opt).from(pdfContent).save();
        document.body.removeChild(pdfContent);
    } catch (error) {
        console.error('Error generating PDF:', error);
        if (document.body.contains(pdfContent)) {
            document.body.removeChild(pdfContent);
        }
        alert('There was an error generating the PDF. Please try again.');
    }
}

// Also modify generateInvoice to ensure content is updated
function generateInvoice() {
    console.log('Generating invoice preview...');
    
    // Update preview with form data
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const clientName = document.getElementById('clientName').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const invoiceDate = document.getElementById('invoiceDate').value;

    console.log('Form values:', { companyName, companyAddress, clientName, clientAddress, invoiceNumber, invoiceDate });

    document.getElementById('previewCompanyName').textContent = companyName;
    document.getElementById('previewCompanyAddress').innerHTML = companyAddress.replace(/\n/g, '<br>');
    document.getElementById('previewClientName').textContent = clientName;
    document.getElementById('previewClientAddress').innerHTML = clientAddress.replace(/\n/g, '<br>');
    document.getElementById('previewInvoiceNumber').textContent = invoiceNumber;
    document.getElementById('previewInvoiceDate').textContent = invoiceDate;

    // Generate items table
    const itemsTable = document.getElementById('previewItems');
    itemsTable.innerHTML = '';
    let total = 0;
    const type = document.querySelector('input[name="invoiceType"]:checked').value;

    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        let quantity, rate, itemTotal;
        
        if (type === 'services') {
            quantity = parseFloat(row.querySelector('.item-hours').value) || 0;
            rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        } else {
            quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            rate = parseFloat(row.querySelector('.item-price').value) || 0;
        }
        
        itemTotal = quantity * rate;
        total += itemTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${description}</td>
            <td class="quantity-column">${quantity}</td>
            <td class="price-column">$${rate.toFixed(2)}</td>
            <td class="price-column">$${itemTotal.toFixed(2)}</td>
        `;
        itemsTable.appendChild(tr);
    });

    document.getElementById('previewTotal').textContent = total.toFixed(2);
    document.getElementById('previewSection').style.display = 'block';

    console.log('Preview generated. Content:', document.getElementById('invoice').innerHTML);
}
