/* =========================================
   MOBILE SHOP - PURCHASE BILLING
   SCRIPT.JS
========================================= */


/* =========================================
   GST RATES
========================================= */

const CGST_RATE = 0.10; // 10%
const SGST_RATE = 0.09; // 9%

/*
   Total GST = 10% + 9%
             = 19%
*/


/* =========================================
   PRODUCT DATA
========================================= */

const products = [
    {
        id: 1,
        name: "Samsung Galaxy A15",
        imei: "123456789012345",
        price: 23990
    },
    {
        id: 2,
        name: "Redmi 13C",
        imei: "987654321098765",
        price: 10999
    },
    {
        id: 3,
        name: "Samsung Galaxy A15",
        imei: "123456789012346",
        price: 23990
    },
    {
        id: 4,
        name: "Samsung Galaxy A15",
        imei: "123456789012347",
        price: 23990
    },
    {
        id: 5,
        name: "Samsung Galaxy A15",
        imei: "123456789012348",
        price: 23990
    },
    {
        id: 6,
        name: "Samsung Galaxy A15",
        imei: "123456789012349",
        price: 23990
    }
];


/* =========================================
   CART
========================================= */

let cart = [];


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Set today's date
    const dateInput = document.getElementById("purchaseDate");

    if (dateInput) {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        dateInput.value = `${year}-${month}-${day}`;
    }


    // Product search
    const searchInput = document.getElementById("productSearch");

    if (searchInput) {
        searchInput.addEventListener("input", searchProducts);
    }


    // Paid amount
    const paidAmountInput = document.getElementById("paidAmount");

    if (paidAmountInput) {
        paidAmountInput.addEventListener("input", calculateBalance);
    }


    // Discount
    const discountInput = document.getElementById("discount");

    if (discountInput) {
        discountInput.addEventListener("input", function () {
            calculateBill();
        });
    }


    // First calculation
    calculateBill();

});


/* =========================================
   ADD PRODUCT TO CART
========================================= */

function addToCart(productId) {

    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        return;
    }


    /*
       Check whether same product already exists
    */

    const existingProduct = cart.find(function (item) {
        return item.id === productId;
    });


    if (existingProduct) {

        existingProduct.qty += 1;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            imei: product.imei,
            price: product.price,
            qty: 1
        });

    }


    renderCart();

    calculateBill();

}


/* =========================================
   RENDER CART
========================================= */

function renderCart() {

    const cartItems = document.getElementById("cartItems");

    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px; color:#9aa3b1;">
                    No products added
                </td>
            </tr>
        `;

        return;
    }


    cart.forEach(function (item, index) {

        const amount = item.price * item.qty;


        const row = document.createElement("tr");


        row.innerHTML = `
            <td>${index + 1}</td>

            <td>
                ${item.name}
            </td>

            <td>
                ${item.imei}
            </td>

            <td>

                <div style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                ">

                    <button
                        onclick="decreaseQty(${item.id})"
                        title="Decrease"
                        style="
                            width:24px;
                            height:24px;
                            border:1px solid #d9dfe8;
                            border-radius:4px;
                            background:#fff;
                        "
                    >
                        −
                    </button>

                    <span style="
                        min-width:22px;
                        text-align:center;
                    ">
                        ${item.qty}
                    </span>

                    <button
                        onclick="increaseQty(${item.id})"
                        title="Increase"
                        style="
                            width:24px;
                            height:24px;
                            border:1px solid #d9dfe8;
                            border-radius:4px;
                            background:#fff;
                        "
                    >
                        +
                    </button>

                </div>

            </td>

            <td>
                ₹ ${formatNumber(item.price)}
            </td>

            <td>
                ₹ ${formatNumber(amount)}
            </td>

            <td>

                <button
                    onclick="removeFromCart(${item.id})"
                    title="Remove"
                    style="
                        color:#dc3545;
                    "
                >
                    🗑
                </button>

            </td>
        `;


        cartItems.appendChild(row);

    });


    renderSummaryProducts();

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQty(productId) {

    const item = cart.find(function (product) {
        return product.id === productId;
    });


    if (!item) {
        return;
    }


    item.qty += 1;


    renderCart();

    calculateBill();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQty(productId) {

    const item = cart.find(function (product) {
        return product.id === productId;
    });


    if (!item) {
        return;
    }


    if (item.qty > 1) {

        item.qty -= 1;

    } else {

        cart = cart.filter(function (product) {
            return product.id !== productId;
        });

    }


    renderCart();

    calculateBill();

}


/* =========================================
   REMOVE PRODUCT
========================================= */

function removeFromCart(productId) {

    cart = cart.filter(function (item) {
        return item.id !== productId;
    });


    renderCart();

    calculateBill();

}


/* =========================================
   SEARCH PRODUCTS
========================================= */

function searchProducts() {

    const searchInput = document.getElementById("productSearch");

    if (!searchInput) {
        return;
    }


    const searchText = searchInput.value
        .toLowerCase()
        .trim();


    const productCards = document.querySelectorAll(".product-card");


    productCards.forEach(function (card) {

        const productName =
            (card.dataset.name || "").toLowerCase();

        const imei =
            (card.dataset.imei || "").toLowerCase();


        if (
            productName.includes(searchText) ||
            imei.includes(searchText)
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


/* =========================================
   CALCULATE BILL
========================================= */

function calculateBill() {

    let totalAmount = 0;
    let totalItems = 0;


    /*
       Calculate cart total
    */

    cart.forEach(function (item) {

        totalAmount += item.price * item.qty;

        totalItems += item.qty;

    });


    /*
       Show total items
    */

    const totalItemsElement =
        document.getElementById("totalItems");

    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }


    /*
       Show total amount
    */

    const totalAmountElement =
        document.getElementById("totalAmount");

    if (totalAmountElement) {

        totalAmountElement.textContent =
            "₹ " + formatNumber(totalAmount);

    }


    /*
       GST / Non-GST calculation
    */

    const gstSection =
        document.getElementById("gstSection");

    const nonGstSection =
        document.getElementById("nonGstSection");


    const gstButton =
        document.getElementById("gstBtn");

    const nonGstButton =
        document.getElementById("nonGstBtn");


    /*
       Check which tax mode is active
    */

    const gstActive =
        gstButton &&
        gstButton.classList.contains("active");


    if (gstActive) {

        if (gstSection) {
            gstSection.style.display = "block";
        }

        if (nonGstSection) {
            nonGstSection.style.display = "none";
        }


        calculateGST(totalAmount);


    } else {

        if (gstSection) {
            gstSection.style.display = "none";
        }

        if (nonGstSection) {
            nonGstSection.style.display = "block";
        }


        calculateNonGST(totalAmount);

    }


    /*
       Balance
    */

    calculateBalance();

}


/* =========================================
   GST CALCULATION
========================================= */

function calculateGST(totalAmount) {

    /*
       Discount
       -----------------------------
       Current UI has discount only
       under Non-GST.

       Therefore GST bill uses
       totalAmount directly.
    */

    const taxableAmount = totalAmount;


    /*
       CGST = 10%
    */

    const cgstAmount =
        taxableAmount * CGST_RATE;


    /*
       SGST = 9%
    */

    const sgstAmount =
        taxableAmount * SGST_RATE;


    /*
       Total GST
       10% + 9% = 19%
    */

    const totalGST =
        cgstAmount + sgstAmount;


    /*
       Net Amount
    */

    const netAmount =
        taxableAmount + totalGST;


    /*
       Display GST Total Amount
    */

    const gstTotalAmount =
        document.getElementById("gstTotalAmount");

    if (gstTotalAmount) {

        gstTotalAmount.textContent =
            "₹ " + formatNumber(taxableAmount);

    }


    /*
       Display CGST
    */

    const cgstElement =
        document.getElementById("cgst");

    if (cgstElement) {

        cgstElement.textContent =
            "₹ " + formatNumber(cgstAmount);

    }


    /*
       Display SGST
    */

    const sgstElement =
        document.getElementById("sgst");

    if (sgstElement) {

        sgstElement.textContent =
            "₹ " + formatNumber(sgstAmount);

    }


    /*
       Display Net Amount
    */

    const netAmountElement =
        document.getElementById("netAmount");

    if (netAmountElement) {

        netAmountElement.textContent =
            "₹ " + formatNumber(netAmount);

    }

}


/* =========================================
   NON-GST CALCULATION
========================================= */

function calculateNonGST(totalAmount) {

    const discountInput =
        document.getElementById("discount");


    let discount = 0;


    if (discountInput) {

        discount =
            parseFloat(discountInput.value) || 0;

    }


    /*
       Discount cannot be greater
       than total amount
    */

    if (discount > totalAmount) {

        discount = totalAmount;

        if (discountInput) {
            discountInput.value = discount;
        }

    }


    /*
       Non-GST Net Amount
    */

    const netAmount =
        totalAmount - discount;


    /*
       Total Amount
    */

    const nonGstTotal =
        document.getElementById("nonGstTotal");

    if (nonGstTotal) {

        nonGstTotal.textContent =
            "₹ " + formatNumber(totalAmount);

    }


    /*
       Net Amount
    */

    const nonGstNet =
        document.getElementById("nonGstNet");

    if (nonGstNet) {

        nonGstNet.textContent =
            "₹ " + formatNumber(netAmount);

    }

}


/* =========================================
   TAX TYPE SELECTION
========================================= */

function selectTax(type) {

    const gstButton =
        document.getElementById("gstBtn");

    const nonGstButton =
        document.getElementById("nonGstBtn");


    const gstSection =
        document.getElementById("gstSection");

    const nonGstSection =
        document.getElementById("nonGstSection");


    if (type === "gst") {

        /*
           GST active
        */

        gstButton.classList.add("active");

        nonGstButton.classList.remove("active");


        gstSection.style.display = "block";

        nonGstSection.style.display = "none";


    } else {

        /*
           Non-GST active
        */

        gstButton.classList.remove("active");

        nonGstButton.classList.add("active");


        gstSection.style.display = "none";

        nonGstSection.style.display = "block";

    }


    calculateBill();

}


/* =========================================
   SUMMARY PRODUCTS
========================================= */

function renderSummaryProducts() {

    const summaryProducts =
        document.getElementById("summaryProducts");


    if (!summaryProducts) {
        return;
    }


    summaryProducts.innerHTML = "";


    cart.forEach(function (item) {

        const amount =
            item.price * item.qty;


        const productRow =
            document.createElement("div");


        productRow.style.display = "flex";
        productRow.style.justifyContent = "space-between";
        productRow.style.alignItems = "center";
        productRow.style.padding = "8px 0";
        productRow.style.borderBottom =
            "1px solid #f0f2f5";


        productRow.innerHTML = `

            <div style="
                min-width:0;
                padding-right:8px;
            ">

                <div style="
                    font-size:11px;
                    font-weight:600;
                    color:#3d4859;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                ">
                    ${item.name}
                </div>

                <div style="
                    font-size:10px;
                    color:#8992a0;
                    margin-top:3px;
                ">
                    Qty: ${item.qty}
                </div>

            </div>

            <strong style="
                font-size:11px;
                color:#1769c2;
                white-space:nowrap;
            ">
                ₹ ${formatNumber(amount)}
            </strong>

        `;


        summaryProducts.appendChild(productRow);

    });

}


/* =========================================
   GET CURRENT NET AMOUNT
========================================= */

function getCurrentNetAmount() {

    let totalAmount = 0;


    cart.forEach(function (item) {

        totalAmount += item.price * item.qty;

    });


    const gstButton =
        document.getElementById("gstBtn");


    const gstActive =
        gstButton &&
        gstButton.classList.contains("active");


    /*
       GST
    */

    if (gstActive) {

        const cgst =
            totalAmount * CGST_RATE;

        const sgst =
            totalAmount * SGST_RATE;


        return totalAmount + cgst + sgst;

    }


    /*
       Non-GST
    */

    let discount = 0;


    const discountInput =
        document.getElementById("discount");


    if (discountInput) {

        discount =
            parseFloat(discountInput.value) || 0;

    }


    if (discount > totalAmount) {
        discount = totalAmount;
    }


    return totalAmount - discount;

}


/* =========================================
   BALANCE CALCULATION
========================================= */

function calculateBalance() {

    const netAmount =
        getCurrentNetAmount();


    const paidAmountInput =
        document.getElementById("paidAmount");


    let paidAmount = 0;


    if (paidAmountInput) {

        paidAmount =
            parseFloat(paidAmountInput.value) || 0;

    }


    /*
       Balance
       = Net Amount - Paid Amount
    */

    const balance =
        netAmount - paidAmount;


    const balanceElement =
        document.getElementById("balanceAmount");


    if (balanceElement) {

        balanceElement.textContent =
            "₹ " + formatNumber(balance);

    }

}


/* =========================================
   CLEAR PURCHASE
========================================= */

function clearPurchase() {

    const confirmClear =
        confirm("Clear the current purchase?");


    if (!confirmClear) {
        return;
    }


    /*
       Empty cart
    */

    cart = [];


    /*
       Purchase number
    */

    const purchaseNo =
        document.getElementById("purchaseNo");

    if (purchaseNo) {
        purchaseNo.value = "SB-0001";
    }


    /*
       Customer name
    */

    const customerName =
        document.getElementById("customerName");

    if (customerName) {
        customerName.value = "";
    }


    /*
       GST number
    */

    const gstNo =
        document.getElementById("gstNo");

    if (gstNo) {
        gstNo.value = "";
    }


    /*
       Paid amount
    */

    const paidAmount =
        document.getElementById("paidAmount");

    if (paidAmount) {
        paidAmount.value = 0;
    }


    /*
       Discount
    */

    const discount =
        document.getElementById("discount");

    if (discount) {
        discount.value = 0;
    }


    /*
       Product search
    */

    const searchInput =
        document.getElementById("productSearch");

    if (searchInput) {

        searchInput.value = "";

        searchProducts();

    }


    /*
       Set GST as default
    */

    selectTax("gst");


    /*
       Render
    */

    renderCart();

    calculateBill();

}


/* =========================================
   SAVE PURCHASE
========================================= */

function savePurchase() {

    /*
       Basic validation
    */

    if (cart.length === 0) {

        alert("Please add at least one product.");

        return;

    }


    const purchaseNo =
        document.getElementById("purchaseNo").value.trim();


    const customerName =
        document.getElementById("customerName").value.trim();


    if (purchaseNo === "") {

        alert("Please enter Purchase Number.");

        return;

    }


    if (customerName === "") {

        alert("Please enter Customer Name.");

        return;

    }


    const netAmount =
        getCurrentNetAmount();


    const paidAmount =
        parseFloat(
            document.getElementById("paidAmount").value
        ) || 0;


    /*
       Purchase details
    */

    const purchaseData = {

        purchaseNo: purchaseNo,

        date:
            document.getElementById("purchaseDate").value,

        customerName: customerName,

        paymentOption:
            document.querySelector(
                'input[name="paymentOption"]:checked'
            )?.value || "",

        products: cart,

        netAmount: netAmount,

        paidAmount: paidAmount,

        balance: netAmount - paidAmount

    };


    console.log(
        "Purchase Data:",
        purchaseData
    );


    alert(
        "Purchase saved successfully!"
    );

}


/* =========================================
   PRINT PURCHASE
========================================= */

function printPurchase() {

    if (cart.length === 0) {

        alert("Please add at least one product before printing.");

        return;

    }


    window.print();

}


/* =========================================
   NUMBER FORMAT
========================================= */

function formatNumber(number) {

    return Number(number).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}