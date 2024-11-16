// Generate invoice ID when page loads
window.onload = function() {
    generateInvoiceId();
    document.getElementById('invoiceDate').valueAsDate = new Date();
    addItemRow(); // Add first item row
    toggleInvoiceType(); // Set up initial invoice type
}

function generateInvoice() {
    // Assign form fields to variables
    const companyNameInput = document.getElementById('companyName');
    const companyAddressInput = document.getElementById('companyAddress');
    const clientNameInput = document.getElementById('clientName');
    const clientAddressInput = document.getElementById('clientAddress');
    const invoiceNumberInput = document.getElementById('invoiceNumber');
    const invoiceDateInput = document.getElementById('invoiceDate');
    const itemsList = document.getElementById('itemsList');

    // Assign preview elements to variables
    const previewCompanyName = document.getElementById('previewCompanyName');
    const previewCompanyAddress = document.getElementById('previewCompanyAddress');
    const previewClientName = document.getElementById('previewClientName');
    const previewClientAddress = document.getElementById('previewClientAddress');
    const previewInvoiceNumber = document.getElementById('previewInvoiceNumber');
    const previewInvoiceDate = document.getElementById('previewInvoiceDate');
    const previewItems = document.getElementById('previewItems');
    const previewTotal = document.getElementById('previewTotal');

    // Populate preview elements with input values
    previewCompanyName.innerText = companyNameInput.value.trim() || "Your Company Name";
    previewCompanyAddress.innerText = companyAddressInput.value.trim() || "Your Address";
    previewClientName.innerText = clientNameInput.value.trim() || "Client Name";
    previewClientAddress.innerText = clientAddressInput.value.trim() || "Client Address";
    previewInvoiceNumber.innerText = invoiceNumberInput.value.trim() || "00001";
    previewInvoiceDate.innerText = invoiceDateInput.value || new Date().toLocaleDateString();

    // Populate items list (example assumes items are manually added to #itemsList)
    if (itemsList.children.length > 0) {
        previewItems.innerHTML = ''; // Clear previous items
        Array.from(itemsList.children).forEach((itemRow) => {
            const clonedRow = itemRow.cloneNode(true); // Clone each item row
            previewItems.appendChild(clonedRow); // Add it to the preview
        });
    } else {
        previewItems.innerHTML = "<tr><td>No items added.</td></tr>";
    }

    // Calculate total (this assumes rows have a data-price attribute or similar)
    let total = 0;
    Array.from(itemsList.children).forEach((itemRow) => {
        const priceCell = itemRow.querySelector('.price'); // Adjust based on your structure
        const price = parseFloat(priceCell?.innerText || 0);
        total += price;
    });
    previewTotal.innerText = total.toFixed(2);
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
}

async function downloadPDF() {
    const element = document.getElementById('invoice');
    console.log(element)
    const opt = {
        margin: [0.5, 0.5],
        filename: `invoice-${document.getElementById('invoiceNumber').value}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true
        },
        jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait'
        }
    };

    try {
        const pdf = await html2pdf().set(opt).from(element).save();
        return pdf;
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
    }
}
