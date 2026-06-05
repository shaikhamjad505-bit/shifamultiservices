class Auth {
    static saveSession(owner) {
        localStorage.setItem('currentOwner', JSON.stringify(owner));
        localStorage.setItem('isLoggedIn', 'true');
    }

    static getCurrentOwner() {
        return JSON.parse(localStorage.getItem('currentOwner'));
    }

    static logout() {
        localStorage.removeItem('currentOwner');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '../pages/login.html';
    }

    static isAuthenticated() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
}

function checkAuth() {
    if (!Auth.isAuthenticated()) {
        window.location.href = '../pages/login.html';
    }
}

function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.maxWidth = '400px';
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
    if (e.target.classList.contains('close')) {
        const modal = e.target.closest('.modal');
        if (modal) modal.style.display = 'none';
    }
});
