
const selectAll = document.getElementById('selectAll');
const checkbox = document.querySelectorAll('.checkbox');

selectAll.addEventListener('change', function () {
  checkbox.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
});


  // Qidiruv funksiyasi
  const searchInput = document.querySelector('.search-input input');
  const tableRows = document.querySelectorAll('table tbody tr');

  searchInput.addEventListener('input', function() {
      const searchTerm = searchInput.value.toLowerCase();
      
      tableRows.forEach(row => {
          const nameCell = row.querySelector('.author-name').textContent.toLowerCase();
          const emailCell = row.querySelector('.author-email').textContent.toLowerCase();
          
          if (nameCell.includes(searchTerm) || emailCell.includes(searchTerm)) {
              row.style.display = '';
          } else {
              row.style.display = 'none';
          }
      });
  });

  // "Select All" checkboxni boshqarish
  const selectAllCheckbox = document.getElementById('selectAll');
  const individualCheckboxes = document.querySelectorAll('.checkbox');

  selectAllCheckbox.addEventListener('change', function() {
      individualCheckboxes.forEach(checkbox => {
          checkbox.checked = selectAllCheckbox.checked;
      });
  });

  // Har bir delete tugmasi uchun tasdiqlash va o'chirish
  function confirmDelete(button) {
      const confirmation = confirm("Are you sure you want to delete this item?");
      
      if (confirmation) {
          const row = button.closest('tr'); // Eng yaqin tr elementini topib o'chiradi
          row.remove();
      }
  }

  // Delete tugmasini dinamik tarzda qo'shish
  document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', function() {
          confirmDelete(button);
      });
  });

