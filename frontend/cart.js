const cartItemsDiv = document.getElementById('cart-items');
const cart = JSON.parse(localStorage.getItem('cart')) || [];

if (cart.length === 0) {
  cartItemsDiv.innerHTML = "<p>Savat bo‘sh!</p>";
} else {
  cart.forEach(item => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <img src="${item.image}" width="100">
      <h4>${item.name}</h4>
      <p>Narxi: $${item.price}</p>
      <hr>
    `;
    cartItemsDiv.appendChild(productDiv);
  });
}


$(document).ready(function () {
  let $addQuantity = $(".btn-quantity.plus"),
      $minusQuantity = $(".btn-quantity.minus"),
      $removeItem = $(".btn-remove");

  $addQuantity.on("click", function (e) {
    e.preventDefault();
    let $item = $(this).parents(".item"),
        $quantityField = $item.find(".quantity_field"),
        currentQuantity = $quantityField.val(),
        nextQuantity = parseFloat(currentQuantity) + 1;

    $item.find(".current_quantity").html(nextQuantity);
    $quantityField.val(nextQuantity);

    calculateTotal();
  });

  $minusQuantity.on("click", function (e) {
    e.preventDefault();
    let $item = $(this).parents(".item"),
        $quantityField = $item.find(".quantity_field"),
        currentQuantity = $quantityField.val();
    let prevQuantity = currentQuantity <= 1 ? 0 : parseFloat(currentQuantity) - 1;

    $item.find(".current_quantity").html(prevQuantity);
    $quantityField.val(prevQuantity);

    calculateTotal();
  });

  $removeItem.on("click", function () {
    let $item = $(this).parents(".item");
    $item.remove();

    calculateTotal();
  });

  let calculateTotal = function () {
    let newSubTotal = 0;
    $(".quantity_field").each(function () {
      let quantity = $(this).val(),
          price = $(this).data("price");

      newSubTotal += parseFloat(quantity * price);
    });

    $(".sub-total .amount").html("£" + newSubTotal.toFixed(2));

    let withTax = newSubTotal * 1.2;

    let newTotal = withTax;

    $(".total .amount").html("Total" + " " + "£" + newTotal.toFixed(2));
  };

  calculateTotal();
});