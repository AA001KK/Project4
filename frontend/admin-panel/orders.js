const modalOverlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");

const inputClient = document.getElementById("inputClient");
const inputLocation = document.getElementById("inputLocation");
const inputStatus = document.getElementById("inputStatus");
const inputPrice = document.getElementById("inputPrice");
const inputDate = document.getElementById("inputDate");

function editProduct(button) {
  const row = button.closest("tr");

  const client = row.querySelector(".author-name").textContent.trim();
  const location = row.querySelector(".location").textContent.trim();
  const status = row.querySelector(".status").textContent.trim();
  const price = row.querySelector(".price").textContent.trim();
  const date = row.querySelector(".last-login").textContent.trim();

  inputClient.value = client;
  inputLocation.value = location;
  inputStatus.value = status;
  inputPrice.value = price;
  inputDate.value = date;

  modalOverlay.style.display = "block";
}

closeBtn.onclick = () => {
  modalOverlay.style.display = "none";
};

saveBtn.onclick = () => {
  alert("Ma'lumotlar saqlandi (yoki serverga jo‘natiladi)");
  modalOverlay.style.display = "none";
};

window.onclick = (e) => {
  if (e.target == modalOverlay) {
    modalOverlay.style.display = "none";
  }
};



// 

const selectAll = document.getElementById('selectAll');
const checkbox = document.querySelectorAll('.checkbox');

selectAll.addEventListener('change', function () {
  checkbox.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
});


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

  const selectAllCheckbox = document.getElementById('selectAll');
  const individualCheckboxes = document.querySelectorAll('.checkbox');

  selectAllCheckbox.addEventListener('change', function() {
      individualCheckboxes.forEach(checkbox => {
          checkbox.checked = selectAllCheckbox.checked;
      });
  });

  function confirmDelete(button) {
      const confirmation = confirm("Are you sure you want to delete this item?");
      
      if (confirmation) {
          const row = button.closest('tr'); 
          row.remove();
      }
  }

  document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', function() {
          confirmDelete(button);
      });
  });

