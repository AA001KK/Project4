const users = [
    { id: 1, name: 'Ali Valiyev', email: 'ali@gmail.com', role: 'Admin' },
    { id: 2, name: 'Zarina Karimova', email: 'zarina@mail.com', role: 'User' },
    { id: 3, name: 'Shahboz Ergashev', email: 'shahboz@gmail.com', role: 'User' }
  ];
  
  function renderUsers() {
    const tbody = document.getElementById('users-body');
    tbody.innerHTML = ''; // tozalash
  
    users.forEach((user, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td class="actions">
          <button class="edit" onclick="editUser(${user.id})">Tahrirlash</button>
          <button class="delete" onclick="deleteUser(${user.id})">O'chirish</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  function editUser(id) {
    const user = users.find(u => u.id === id);
    alert(`Tahrirlash: ${user.name}`);
  }
  
  function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);
    if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      users.splice(index, 1);
      renderUsers();
    }
  }
  
  renderUsers();
  