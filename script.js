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
            <input type="number" placeholder="Hours" class="item-hours" onchange="calculateRowTotal(this.parentElement)">
            <input type="number" placeholder="Rate" class="item-rate" onchange="calculateRowTotal(this.parentElement)">
            <input type="text" placeholder="Total" class="item-total" readonly>
        `;
    } else {
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" class="item-description">
            <input type="number" placeholder="Quantity" class="item-quantity" onchange="calculateRowTotal(this.parentElement)">
            <input type="number" placeholder="Price" class="item-price" onchange="calculateRowTotal(this.parentElement)">
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
    document.getElementById('previewClient