// Generate invoice ID when page loads
window.onload = function() {
    generateInvoiceId();
    document.getElementById('invoiceDate').valueAsDate = new Date();
    addItemRow(); // Add only one initial row
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
    
    // Update preview header without clearing items
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

function deleteRow(button) {
    const row = button.parentElement;
    row.remove();
    updateRunningTotal();
}

function addItemRow() {
    const type = document.querySelector('input[name="invoiceType"]:checked').value;
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.dataset.type = type; // Add data attribute to track item type
    
    if (type === 'services') {
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" class="item-description">
            <input type="number" placeholder="Hours" class="item-hours" oninput="calculateRowTotal(this.parentElement)">
            <input type="number" placeholder="Rate" class="item-rate" oninput="calculateRowTotal(this.parentElement)">
            <input type="text" placeholder="Total" class="item-total" readonly>
            <button onclick="deleteRow(this)" class="delete-row">&times;</button>
        `;
    } else {
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" class="item-description">
            <input type="number" placeholder="Quantity" class="item-quantity" oninput="calculateRowTotal(this.parentElement)">
            <input type="number" placeholder="Price" class="item-price" oninput="calculateRowTotal(this.parentElement)">
            <input type="text" placeholder="Total" class="item-total" readonly>
            <button onclick="deleteRow(this)" class="delete-row">&times;</button>
        `;
    }
    
    document.getElementById('itemsList').appendChild(itemRow);
}

function calculateRowTotal(row) {
    const type = row.dataset.type; // Use the stored type instead of radio button
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

function generateInvoice() {
    // Update preview with form data
    document.getElementById('previewCompanyName').textContent = document.getElementById('companyName').value;
    document.getElementById('previewCompanyAddress').innerHTML = document.getElementById('companyAddress').value.replace(/\n/g, '<br>');
    document.getElementById('previewClientName').textContent = document.getElementById('clientName').value;
    document.getElementById('previewClientAddress').innerHTML = document.getElementById('clientAddress').value.replace(/\n/g, '<br>');
    document.getElementById('previewInvoiceNumber').textContent = document.getElementById('invoiceNumber').value;
    document.getElementById('previewInvoiceDate').textContent = document.getElementById('invoiceDate').value;

    // Generate items table
    const itemsTable = document.getElementById('previewItems');
    itemsTable.innerHTML = '';
    let total = 0;

    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const type = row.dataset.type;
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
    document.getElementById('downloadButton').style.display = 'block';
}

async function downloadPDF() {
    // First ensure the preview is generated
    generateInvoice();
    
    const element = document.getElementById('invoice');
    
    try {
        // Create the PDF
        const doc = new jspdf.jsPDF('p', 'pt', 'letter');
        
        // Get canvas from HTML content
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: true
        });
        
        // Canvas dimensions
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Add image to PDF
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Save the PDF
        doc.save(`invoice-${document.getElementById('invoiceNumber').value}.pdf`);
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Error generating PDF. Please try again.');
    }
}
