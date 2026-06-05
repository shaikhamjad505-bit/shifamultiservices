class Database {
    constructor() {
        this.initDatabase();
    }

    initDatabase() {
        if (!localStorage.getItem('shifaDB')) {
            const initialData = {
                owners: [],
                customers: [],
                bills: [],
                payments: []
            };
            localStorage.setItem('shifaDB', JSON.stringify(initialData));
        }
    }

    registerOwner(ownerData) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        if (db.owners.some(o => o.email === ownerData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        const owner = {
            id: Date.now(),
            ...ownerData,
            createdAt: new Date().toISOString()
        };
        db.owners.push(owner);
        localStorage.setItem('shifaDB', JSON.stringify(db));
        return { success: true, owner };
    }

    loginOwner(email, password) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        const owner = db.owners.find(o => o.email === email && o.password === password);
        if (owner) {
            return { success: true, owner };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    addCustomer(ownerId, customerData) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        const customer = {
            id: Date.now(),
            ownerId,
            ...customerData,
            createdAt: new Date().toISOString()
        };
        db.customers.push(customer);
        localStorage.setItem('shifaDB', JSON.stringify(db));
        return { success: true, customer };
    }

    getCustomers(ownerId) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        return db.customers.filter(c => c.ownerId === ownerId).sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    deleteCustomer(customerId, ownerId) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        db.customers = db.customers.filter(c => !(c.id === customerId && c.ownerId === ownerId));
        localStorage.setItem('shifaDB', JSON.stringify(db));
        return { success: true };
    }

    createBill(ownerId, billData) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        const bill = {
            id: Date.now(),
            billNumber: 'BILL-' + Date.now(),
            ownerId,
            status: 'pending',
            ...billData,
            createdAt: new Date().toISOString()
        };
        db.bills.push(bill);
        localStorage.setItem('shifaDB', JSON.stringify(db));
        return { success: true, bill };
    }

    getBills(ownerId, status = null) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        let bills = db.bills.filter(b => b.ownerId === ownerId);
        if (status) {
            bills = bills.filter(b => b.status === status);
        }
        bills = bills.map(bill => {
            const customer = db.customers.find(c => c.id === bill.customerId);
            return { ...bill, customerName: customer?.name || 'Unknown' };
        });
        return bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    deleteBill(billId, ownerId) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        db.bills = db.bills.filter(b => !(b.id === billId && b.ownerId === ownerId));
        localStorage.setItem('shifaDB', JSON.stringify(db));
        return { success: true };
    }

    recordPayment(billId, ownerId, paymentData) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        const bill = db.bills.find(b => b.id === billId && b.ownerId === ownerId);
        if (!bill) {
            return { success: false, message: 'Bill not found' };
        }
        const payment = {
            id: Date.now(),
            billId,
            ...paymentData,
            createdAt: new Date().toISOString()
        };
        db.payments.push(payment);
        const totalPaid = db.payments.filter(p => p.billId === billId).reduce((sum, p) => sum + p.amount, 0);
        bill.status = totalPaid >= bill.amount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
        localStorage.setItem('shifaDB', JSON.stringify(db));
        return { success: true, payment };
    }

    getPayments(ownerId) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        const payments = db.payments.map(payment => {
            const bill = db.bills.find(b => b.id === payment.billId);
            const customer = db.customers.find(c => c.id === bill?.customerId);
            return {
                ...payment,
                billNumber: bill?.billNumber,
                billAmount: bill?.amount,
                customerName: customer?.name
            };
        });
        return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getDashboardStats(ownerId) {
        const db = JSON.parse(localStorage.getItem('shifaDB'));
        const customers = db.customers.filter(c => c.ownerId === ownerId);
        const bills = db.bills.filter(b => b.ownerId === ownerId);
        const payments = db.payments.filter(p => {
            const bill = db.bills.find(b => b.id === p.billId);
            return bill?.ownerId === ownerId;
        });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const pendingBills = bills.filter(b => b.status === 'pending');
        const pendingAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0);
        return {
            totalCustomers: customers.length,
            totalRevenue,
            pendingBills: pendingBills.length,
            pendingAmount,
            recentBills: bills.slice(-5).reverse().map(bill => ({
                ...bill,
                customerName: db.customers.find(c => c.id === bill.customerId)?.name || 'Unknown'
            }))
        };
    }
}

const db = new Database();
