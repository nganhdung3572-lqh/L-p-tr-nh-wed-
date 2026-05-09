// ============ DATA MANAGEMENT ============
class WeddingPlanner {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('weddingUsers')) || {
            'demo@wedding.com': {
                password: 'demo123',
                brideName: 'Sarah',
                groomName: 'John'
            }
        };
        this.currentUser = null;
        this.weddingData = {};
    }

    saveUser(email, password, brideName, groomName) {
        this.users[email] = { password, brideName, groomName };
        localStorage.setItem('weddingUsers', JSON.stringify(this.users));
    }

    authenticateUser(email, password) {
        if (this.users[email] && this.users[email].password === password) {
            this.currentUser = email;
            this.loadWeddingData();
            return true;
        }
        return false;
    }

    loadWeddingData() {
        const stored = localStorage.getItem(`wedding_${this.currentUser}`);
        this.weddingData = stored ? JSON.parse(stored) : this.getDefaultData();
    }

    getDefaultData() {
        return {
            date: '',
            location: '',
            totalBudget: 25000,
            guests: [],
            budget: {
                'Venue & Catering': 7500,
                'Decorations & Flowers': 3750,
                'Photography & Videography': 3000,
                'Music & Entertainment': 2500,
                'Attire': 2000,
                'Rings & Invitations': 2500,
                'Transportation': 1000,
                'Miscellaneous': 750
            },
            tasks: [],
            vendors: []
        };
    }

    saveWeddingData() {
        localStorage.setItem(`wedding_${this.currentUser}`, JSON.stringify(this.weddingData));
    }
}

const planner = new WeddingPlanner();

// ============ LOGIN & REGISTRATION ============
function toggleForm(e) {
    e.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleText = document.getElementById('toggleText');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleText.innerHTML = "Don't have an account? <a href='#' onclick='toggleForm(event)'>Register here</a>";
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleText.innerHTML = "Already have an account? <a href='#' onclick='toggleForm(event)'>Login here</a>";
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    if (planner.authenticateUser(email, password)) {
        showMainApp();
        updateDashboard();
    } else {
        alert('Invalid email or password');
    }
}

function handleRegister() {
    const brideName = document.getElementById('regBrideName').value.trim();
    const groomName = document.getElementById('regGroomName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!brideName || !groomName || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (planner.users[email]) {
        alert('Email already exists');
        return;
    }

    planner.saveUser(email, password, brideName, groomName);
    alert('Account created! Please login');
    toggleForm({ preventDefault: () => {} });
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = '';
}

function handleLogout() {
    planner.currentUser = null;
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
}

// ============ TAB SWITCHING ============
function switchTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// ============ DASHBOARD ============
function updateWeddingInfo() {
    planner.weddingData.date = document.getElementById('weddingDate').value;
    planner.weddingData.location = document.getElementById('weddingLocation').value;
    planner.weddingData.totalBudget = parseFloat(document.getElementById('totalBudgetInput').value);
    
    planner.saveWeddingData();
    updateDashboard();
    alert('Wedding details saved!');
}

function updateDashboard() {
    const data = planner.weddingData;

    // Fill in input fields
    document.getElementById('weddingDate').value = data.date;
    document.getElementById('weddingLocation').value = data.location;
    document.getElementById('totalBudgetInput').value = data.totalBudget;

    // Calculate days until wedding
    if (data.date) {
        const weddingDate = new Date(data.date);
        const today = new Date();
        const daysLeft = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));
        document.getElementById('daysUntil').textContent = daysLeft > 0 ? daysLeft : '0';
    }

    // Update guest count
    document.getElementById('guestCountStat').textContent = data.guests.length;

    // Update budget
    const totalAllocated = Object.values(data.budget).reduce((a, b) => a + b, 0);
    const percentageUsed = Math.round((totalAllocated / data.totalBudget) * 100);
    document.getElementById('budgetUsedStat').textContent = percentageUsed + '%';

    // Update budget categories
    updateBudgetCategories();

    // Update progress bars
    updateProgressBars();

    // Update guest list
    renderGuestsList();

    // Update tasks
    renderTasksList();

    // Update vendors
    renderVendorsList();
}

function updateBudgetCategories() {
    const container = document.getElementById('budgetCategories');
    container.innerHTML = '';

    let totalBudget = planner.weddingData.totalBudget;
    let totalAllocated = 0;

    for (const [category, amount] of Object.entries(planner.weddingData.budget)) {
        totalAllocated += amount;
        const percentage = ((amount / totalBudget) * 100).toFixed(1);

        const categoryHTML = `
            <div class="category-item">
                <div class="category-header">
                    <h4>${category}</h4>
                    <input type="number" class="category-input" value="${amount}" min="0" step="0.01" 
                           onchange="updateBudgetAmount('${category}', this.value)">
                </div>
                <div class="category-info">
                    <span class="category-amount">$${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    <span class="category-percent">${percentage}%</span>
                </div>
            </div>
        `;
        container.innerHTML += categoryHTML;
    }

    // Update summary
    document.getElementById('totalBudgetDisplay').textContent = '$' + planner.weddingData.totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('totalAllocated').textContent = '$' + totalAllocated.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('remainingBudget').textContent = '$' + (planner.weddingData.totalBudget - totalAllocated).toLocaleString('en-US', {minimumFractionDigits: 2});
}

function updateBudgetAmount(category, amount) {
    planner.weddingData.budget[category] = parseFloat(amount);
    planner.saveWeddingData();
    updateBudgetCategories();
}

function updateProgressBars() {
    const data = planner.weddingData;
    
    // Guest progress (assuming target of 100 guests)
    const guestProgress = Math.min((data.guests.length / 100) * 100, 100);
    document.getElementById('guestProgressBar').style.width = guestProgress + '%';
    document.getElementById('guestProgress').textContent = Math.round(guestProgress) + '%';

    // Budget progress
    const totalAllocated = Object.values(data.budget).reduce((a, b) => a + b, 0);
    const budgetProgress = (totalAllocated / data.totalBudget) * 100;
    document.getElementById('budgetProgressBar').style.width = budgetProgress + '%';
    document.getElementById('budgetProgress').textContent = Math.round(budgetProgress) + '%';

    // Vendor progress
    const bookedVendors = data.vendors.filter(v => v.status === 'booked').length;
    const vendorProgress = data.vendors.length > 0 ? (bookedVendors / data.vendors.length) * 100 : 0;
    document.getElementById('vendorProgressBar').style.width = vendorProgress + '%';
    document.getElementById('vendorProgress').textContent = Math.round(vendorProgress) + '%';
}

// ============ GUESTS MANAGEMENT ============
function addGuest() {
    const name = document.getElementById('guestName').value.trim();
    const email = document.getElementById('guestEmail').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const group = document.getElementById('guestGroup').value;
    const side = document.getElementById('guestSide').value;

    if (!name || !group || !side) {
        alert('Please fill in name, group, and side');
        return;
    }

    const guest = {
        id: Date.now(),
        name,
        email,
        phone,
        group,
        side,
        rsvp: 'pending'
    };

    planner.weddingData.guests.push(guest);
    planner.saveWeddingData();

    document.getElementById('guestName').value = '';
    document.getElementById('guestEmail').value = '';
    document.getElementById('guestPhone').value = '';
    document.getElementById('guestGroup').value = '';
    document.getElementById('guestSide').value = '';

    renderGuestsList();
    updateProgressBars();
}

function renderGuestsList() {
    const tbody = document.getElementById('guestsList');
    tbody.innerHTML = '';

    planner.weddingData.guests.forEach(guest => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest.name}</td>
            <td>${guest.email}</td>
            <td>${guest.phone}</td>
            <td>${guest.group}</td>
            <td>${guest.side}</td>
            <td>
                <select onchange="updateGuestRsvp(${guest.id}, this.value)">
                    <option value="pending" ${guest.rsvp === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${guest.rsvp === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="declined" ${guest.rsvp === 'declined' ? 'selected' : ''}>Declined</option>
                </select>
            </td>
            <td>
                <button class="btn-danger" onclick="deleteGuest(${guest.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('guestCount').textContent = planner.weddingData.guests.length;
}

function updateGuestRsvp(id, rsvp) {
    const guest = planner.weddingData.guests.find(g => g.id === id);
    if (guest) {
        guest.rsvp = rsvp;
        planner.saveWeddingData();
    }
}

function deleteGuest(id) {
    planner.weddingData.guests = planner.weddingData.guests.filter(g => g.id !== id);
    planner.saveWeddingData();
    renderGuestsList();
    updateProgressBars();
}

// ============ TIMELINE/TASKS ============
function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;

    if (!name || !dueDate) {
        alert('Please enter task name and due date');
        return;
    }

    const task = {
        id: Date.now(),
        name,
        dueDate,
        priority,
        completed: false
    };

    planner.weddingData.tasks.push(task);
    planner.saveWeddingData();

    document.getElementById('taskName').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = 'medium';

    renderTasksList();
}

function renderTasksList() {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';

    planner.weddingData.tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        const taskHTML = `
            <div class="timeline-item ${task.priority}">
                <div class="task-info">
                    <h4 style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.name}</h4>
                    <div class="task-meta">
                        <span>📅 ${new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>${daysLeft > 0 ? daysLeft + ' days left' : 'Due today'}</span>
                        <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                    </div>
                </div>
                <div>
                    <button class="btn-success" onclick="toggleTask(${task.id})" style="margin-right: 10px;">
                        ${task.completed ? '✓ Done' : 'Mark Done'}
                    </button>
                    <button class="btn-danger" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
        container.innerHTML += taskHTML;
    });
}

function toggleTask(id) {
    const task = planner.weddingData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        planner.saveWeddingData();
        renderTasksList();
    }
}

function deleteTask(id) {
    planner.weddingData.tasks = planner.weddingData.tasks.filter(t => t.id !== id);
    planner.saveWeddingData();
    renderTasksList();
}

// ============ VENDORS MANAGEMENT ============
function addVendor() {
    const name = document.getElementById('vendorName').value.trim();
    const category = document.getElementById('vendorCategory').value;
    const phone = document.getElementById('vendorPhone').value.trim();
    const email = document.getElementById('vendorEmail').value.trim();
    const cost = parseFloat(document.getElementById('vendorCost').value);
    const status = document.getElementById('vendorStatus').value;

    if (!name || !category) {
        alert('Please enter vendor name and category');
        return;
    }

    const vendor = {
        id: Date.now(),
        name,
        category,
        phone,
        email,
        cost: isNaN(cost) ? 0 : cost,
        status
    };

    planner.weddingData.vendors.push(vendor);
    planner.saveWeddingData();

    document.getElementById('vendorName').value = '';
    document.getElementById('vendorCategory').value = '';
    document.getElementById('vendorPhone').value = '';
    document.getElementById('vendorEmail').value = '';
    document.getElementById('vendorCost').value = '';
    document.getElementById('vendorStatus').value = 'pending';

    renderVendorsList();
    updateProgressBars();
}

function renderVendorsList() {
    const tbody = document.getElementById('vendorsList');
    tbody.innerHTML = '';

    planner.weddingData.vendors.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendor.name}</td>
            <td>${vendor.category}</td>
            <td>${vendor.phone}</td>
            <td>${vendor.email}</td>
            <td>$${vendor.cost.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>
                <span class="vendor-status ${vendor.status}">
                    ${vendor.status.toUpperCase()}
                </span>
            </td>
            <td>
                <button class="btn-danger" onclick="deleteVendor(${vendor.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteVendor(id) {
    planner.weddingData.vendors = planner.weddingData.vendors.filter(v => v.id !== id);
    planner.saveWeddingData();
    renderVendorsList();
    updateProgressBars();
}