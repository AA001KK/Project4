
  const selectAll = document.getElementById('selectAll');
  const checkbox = document.querySelectorAll('.checkbox');
  
  selectAll.addEventListener('change', function () {
    checkbox.forEach(checkbox => {
      checkbox.checked = selectAll.checked;
    });
  });
  
  
  // Sahifa yuklanganda tugmalarni aniqlash
  document.addEventListener("DOMContentLoaded", function () {
    const editButtons = document.querySelectorAll(".btn-edit");

    editButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        console.log("Edit bosildi");

        // Hohlovchi funksiya yoki modal chaqirish joyi:
        alert("Edit bosildi! Bu yerga o'zgartirish oynasi chiqishi mumkin.");
      });
    });
  });
  
