function editProfile() {
    const inputs = document.querySelectorAll('#profileForm input');
    inputs.forEach(input => input.disabled = false);
  }