// Global variables
let html5QrCode;
let currentMembers = [];
// QR codes are URLs that auto-record attendance for logged-in member
const CHECKIN_QR_TEXT = "https://darkknightfitness.vercel.app/quick-scan?action=checkin";
const CHECKOUT_QR_TEXT = "https://darkknightfitness.vercel.app/quick-scan?action=checkout";
let currentAction = null;
let scannerActive = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is member trying to access admin dashboard
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'member') {
        // Members should not access admin dashboard
        window.location.href = '/member-dashboard.html';
        return;
    }
    
    // Check if admin is logged in
    const userSession = localStorage.getItem('userSession');
    if (!userSession || userRole !== 'admin') {
        window.location.href = '/login.html';
        return;
    }
    
    initializeNavigation();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    generateQRCodes();
    loadDashboard();
    loadMembers();
    loadAccountRequests(); // Load pending count on startup
    setupEventListeners();
    
    // Auto-start QR scanner when on attendance page
    const attendancePage = document.getElementById('attendance');
    if (attendancePage && attendancePage.classList.contains('active')) {
        startMainQRScanner();
    }
});

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    document.querySelectorAll('#current-date, #attendance-date, #success-date').forEach(el => {
        if (el) el.textContent = dateString;
    });
    
    document.querySelectorAll('#attendance-time, #success-time').forEach(el => {
        if (el) el.textContent = timeString;
    });
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.dataset.page;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            // Stop scanner if leaving attendance page
            if (scannerActive && targetPage !== 'attendance') {
                stopMainQRScanner();
            }
            
            // Start scanner if entering attendance page
            if (targetPage === 'attendance') {
                setTimeout(() => startMainQRScanner(), 300);
            }
            
            // Load page data
            if (targetPage === 'dashboard') loadDashboard();
            if (targetPage === 'reports') loadReports();
            if (targetPage === 'members') loadMembers();
            if (targetPage === 'account-requests') loadAccountRequests();
        });
    });
    
    // Mobile menu toggle with overlay
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Create mobile overlay if it doesn't exist
    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    const mobileOverlay = document.querySelector('.mobile-overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking nav item on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                mobileOverlay.classList.remove('active');
            }
        });
    });
}

// Generate QR Codes
function generateQRCodes() {
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined' || !QRCode.toCanvas) {
        console.error('QRCode library not available');
        return;
    }
    
    console.log('Generating QR codes...');
    
    // Dashboard QR codes
    QRCode.toCanvas(CHECKIN_QR_TEXT, { width: 250, margin: 2 }, (error, canvas) => {
        if (!error) {
            const container = document.getElementById('qr-checkin');
            if (container) {
                container.innerHTML = '';
                container.appendChild(canvas);
            }
            
            // Also for QR page
            const largeContainer = document.getElementById('qr-large-checkin');
            if (largeContainer) {
                QRCode.toCanvas(CHECKIN_QR_TEXT, { width: 350, margin: 2 }, (err, cnv) => {
                    if (!err) {
                        largeContainer.innerHTML = '';
                        largeContainer.appendChild(cnv);
                    }
                });
            }
        }
    });
    
    QRCode.toCanvas(CHECKOUT_QR_TEXT, { width: 250, margin: 2 }, (error, canvas) => {
        if (!error) {
            const container = document.getElementById('qr-checkout');
            if (container) {
                container.innerHTML = '';
                container.appendChild(canvas);
            }
            
            // Also for QR page
            const largeContainer = document.getElementById('qr-large-checkout');
            if (largeContainer) {
                QRCode.toCanvas(CHECKOUT_QR_TEXT, { width: 350, margin: 2 }, (err, cnv) => {
                    if (!err) {
                        largeContainer.innerHTML = '';
                        largeContainer.appendChild(cnv);
                    }
                });
            }
        }
    });
}

// QR Tab switching
document.querySelectorAll('.qr-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.qr-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.qr-canvas').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const qrType = tab.dataset.qr;
        document.getElementById(`qr-${qrType}`).classList.add('active');
    });
});

// Event Listeners
function setupEventListeners() {
    // Cancel member selection
    const cancelBtn = document.getElementById('cancel-selection');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('member-selection-modal').style.display = 'none';
            document.getElementById('member-selection-modal').classList.remove('show');
            currentAction = null;
        });
    }
    
    // Close success modal
    const closeSuccessBtn = document.getElementById('close-success-modal');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            document.getElementById('success-modal').style.display = 'none';
            document.getElementById('success-modal').classList.remove('show');
        });
    }
    
    // Member search in selection modal
    const memberSearchInput = document.getElementById('member-search-input');
    if (memberSearchInput) {
        memberSearchInput.addEventListener('input', filterMemberList);
    }
    
    // Add member button
    // Member search and filter
    const membersSearch = document.getElementById('members-search');
    if (membersSearch) {
        membersSearch.addEventListener('input', filterMembers);
    }
    
    const membershipFilter = document.getElementById('membership-filter');
    if (membershipFilter) {
        membershipFilter.addEventListener('change', filterMembers);
    }
    
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterMembers);
    }
    
    // Add Member button - removed functionality
    const addMemberBtn = document.getElementById('add-member-btn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            const modal = document.getElementById('add-member-modal');
            modal.style.display = 'flex';
            modal.classList.add('show');
        });
    }
    
    // Close modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            const modal = document.getElementById('add-member-modal');
            modal.style.display = 'none';
            modal.classList.remove('show');
        });
    }
    
    // Close modal on background click
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('add-member-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    });
    
    // Download/Print QR
    const downloadBtn = document.getElementById('download-qr');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQR);
    }
    
    const printBtn = document.getElementById('print-qr');
    if (printBtn) {
        printBtn.addEventListener('click', printQR);
    }
}

// Main QR Scanner (Always on in Attendance page)
function startMainQRScanner() {
    if (scannerActive) return;
    
    html5QrCode = new Html5Qrcode("reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };
    
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onMainScanSuccess,
        onScanError
    ).then(() => {
        scannerActive = true;
    }).catch(err => {
        console.error("Camera error:", err);
        document.getElementById('qr-scanner-main').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 15px;"></i>
                <p><strong>Camera Access Denied</strong></p>
                <p>Please allow camera permissions to scan QR codes.</p>
            </div>
        `;
    });
}

function stopMainQRScanner() {
    if (html5QrCode && scannerActive) {
        html5QrCode.stop().then(() => {
            scannerActive = false;
        }).catch(err => {
            console.error('Error stopping scanner:', err);
        });
    }
}

function onMainScanSuccess(decodedText) {
    // Support both URL format and plain text for admin scanner
    const isCheckin = decodedText.includes('action=checkin') || decodedText === CHECKIN_QR_TEXT;
    const isCheckout = decodedText.includes('action=checkout') || decodedText === CHECKOUT_QR_TEXT;
    
    if (isCheckin) {
        currentAction = 'checkin';
        html5QrCode.pause();
        showMemberSelectionModal('Check-In');
    } else if (isCheckout) {
        currentAction = 'checkout';
        html5QrCode.pause();
        showMemberSelectionModal('Check-Out');
    } else {
        // Invalid QR code - show brief alert
        const reader = document.getElementById('reader');
        const originalContent = reader.innerHTML;
        reader.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #FEE2E2; color: #DC2626; border-radius: 12px;">
                <i class="fas fa-times-circle" style="font-size: 3em; margin-bottom: 10px;"></i>
                <p><strong>Invalid QR Code</strong></p>
                <p>Please scan the gym QR code</p>
            </div>
        `;
        setTimeout(() => {
            reader.innerHTML = originalContent;
        }, 2000);
    }
}

function onScanError(errorMessage) {
    // Ignore continuous scan errors
}

// Show member selection modal after successful QR scan
function showMemberSelectionModal(actionType) {
    const modal = document.getElementById('member-selection-modal');
    const title = document.getElementById('scan-action-title');
    const badge = document.getElementById('scan-action-badge');
    
    if (actionType === 'Check-In') {
        title.textContent = 'Check In to Gym';
        badge.className = 'action-badge-large checkin';
        badge.innerHTML = '<i class="fas fa-sign-in-alt"></i> CHECK IN';
    } else {
        title.textContent = 'Check Out from Gym';
        badge.className = 'action-badge-large checkout';
        badge.innerHTML = '<i class="fas fa-sign-out-alt"></i> CHECK OUT';
    }
    
    // Load members into modal
    displayMembersInModal();
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Focus search input
    setTimeout(() => {
        document.getElementById('member-search-input').focus();
    }, 300);
}

// Display members in selection modal
function displayMembersInModal() {
    const container = document.getElementById('members-scroll-list');
    
    if (!currentMembers || currentMembers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>No members found</p>
            </div>
        `;
        return;
    }
    
    const sorted = [...currentMembers].sort((a, b) => a.name.localeCompare(b.name));
    
    container.innerHTML = sorted.map(member => {
        const initial = member.name.charAt(0).toUpperCase();
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
        const color = colors[member.name.charCodeAt(0) % colors.length];
        
        return `
            <div class="member-select-item" onclick="selectMemberForAttendance('${member.id}', '${member.name.replace(/'/g, "\\'")}')">
                <div class="member-avatar-large" style="background: ${color}">
                    ${initial}
                </div>
                <div class="member-details-full">
                    <div class="member-name-bold">${member.name}</div>
                    <div class="member-meta">
                        <span class="member-type-badge">${member.membership_type || 'Basic'}</span>
                        <span class="member-id">ID: ${member.id.slice(-4)}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
    }).join('');
}

// Filter member list
function filterMemberList() {
    const searchTerm = document.getElementById('member-search-input').value.toLowerCase();
    const items = document.querySelectorAll('.member-select-item');
    
    items.forEach(item => {
        const name = item.querySelector('.member-name-bold').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Select member and process attendance
function selectMemberForAttendance(memberId, memberName) {
    // Close selection modal
    document.getElementById('member-selection-modal').style.display = 'none';
    document.getElementById('member-selection-modal').classList.remove('show');
    
    // Process attendance
    processAttendance(memberId, memberName);
}

// Process attendance
async function processAttendance(memberId, memberName) {
    try {
        // Use Supabase client
        const result = await window.supabaseClient.recordAttendance(memberId, currentAction);
        
        if (result.success) {
            showSuccessModal(result.member, result.attendance);
            
            // Resume scanner after 3 seconds
            setTimeout(() => {
                if (html5QrCode) {
                    html5QrCode.resume();
                }
            }, 3000);
        } else {
            alert(result.error || 'Error recording attendance');
            // Resume scanner
            if (html5QrCode) {
                html5QrCode.resume();
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error recording attendance. Please try again.');
        // Resume scanner
        if (html5QrCode) {
            html5QrCode.resume();
        }
    }
}

// Show success modal
function showSuccessModal(member, attendance) {
    const modal = document.getElementById('success-modal');
    const message = document.getElementById('success-message');
    
    const actionText = attendance.action === 'checkin' ? 'checked-in to' : 'checked-out from';
    message.textContent = `${member.name}, you are successfully ${actionText} FitZone Gym.`;
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Auto close after 5 seconds
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        loadDashboard();
    }, 5000);
    
    // Close on click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            loadDashboard();
        }
    });
}

// Load Dashboard
async function loadDashboard() {
    try {
        // Use Supabase client
        const stats = await window.supabaseClient.getDashboardStats();
        const todayAttendance = await window.supabaseClient.getTodayAttendance();
        
        // Update dashboard stats
        document.getElementById('total-members-dash').textContent = stats.totalMembers;
        document.getElementById('present-today-dash').textContent = stats.todayCheckins;
        document.getElementById('checked-out-dash').textContent = stats.currentlyInGym;
        
        // Display today's attendance
        displayTodayAttendance(todayAttendance);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Display today's attendance table
function displayTodayAttendance(attendance) {
    const container = document.getElementById('today-attendance-list');
    
    if (!attendance || attendance.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #94A3B8;">No attendance records today</div>';
        return;
    }
    
    // Show latest 5 records
    const latest = attendance.slice(-5).reverse();
    
    container.innerHTML = latest.map(record => {
        const memberName = record.members?.name || 'Unknown';
        const initial = memberName.charAt(0).toUpperCase();
        const time = new Date(record.check_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const actionClass = record.action === 'checkin' ? 'checkin' : 'checkout';
        const actionText = record.action === 'checkin' ? 'Checked In' : 'Checked Out';
        
        return `
            <div class="attendance-row">
                <div class="member-info-cell">
                    <div class="member-avatar">${initial}</div>
                    <span class="member-name">${memberName}</span>
                </div>
                <span>${record.member_id?.slice(-4) || 'N/A'}</span>
                <span>${record.action === 'checkin' ? time : '-'}</span>
                <span>${record.action === 'checkout' ? time : '-'}</span>
                <span class="status-badge ${actionClass}">
                    <i class="fas fa-circle"></i>
                    ${actionText}
                </span>
            </div>
        `;
    }).join('');
}

// Load Members
async function loadMembers() {
    try {
        // Use Supabase client
        currentMembers = await window.supabaseClient.getAllMembers();
        displayMembers();
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Display members
function displayMembers() {
    const container = document.getElementById('members-list');
    
    if (!currentMembers || currentMembers.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px; color: #94A3B8;"><i class="fas fa-users" style="font-size: 4em; margin-bottom: 20px; display: block;"></i><h3>No Members Yet</h3><p>Approve account requests to add members</p></div>';
        return;
    }
    
    // Calculate status for each member
    const membersWithStatus = currentMembers.map(member => {
        const expiryDate = member.membership_expiry ? new Date(member.membership_expiry) : null;
        const today = new Date();
        const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : null;
        
        let status = 'active';
        if (!expiryDate) {
            status = 'active';
        } else if (daysUntilExpiry < 0) {
            status = 'expired';
        } else if (daysUntilExpiry <= 7) {
            status = 'expiring';
        }
        
        return { ...member, status, daysUntilExpiry, expiryDate };
    });
    
    // Store for filtering
    window.allMembersData = membersWithStatus;
    
    container.innerHTML = `
        <div class="members-cards-container">
            ${membersWithStatus.map(member => {
                const initial = member.name.charAt(0).toUpperCase();
                const joinDate = member.join_date ? new Date(member.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                const expiryDateStr = member.membership_expiry || '';
                const membershipColor = {
                    'Basic': '#3b82f6',
                    'Premium': '#8b5cf6',
                    'VIP': '#f59e0b'
                }[member.membership_type] || '#64748b';
                
                const statusText = {
                    'active': 'Active',
                    'expiring': `Expires in ${member.daysUntilExpiry} days`,
                    'expired': 'Expired'
                }[member.status];
                
                return `
                    <div class="member-card" data-member-id="${member.id}" data-membership="${member.membership_type}" data-status="${member.status}">
                        <div class="member-card-header">
                            <div class="member-avatar-large" style="background: ${membershipColor}">
                                ${initial}
                            </div>
                            <div class="member-main-info">
                                <div class="member-name-large">${member.name}</div>
                                <span class="member-id-badge">ID: ${member.id.slice(-8)}</span>
                            </div>
                            <span class="status-badge-card ${member.status}">
                                <i class="fas fa-circle" style="font-size: 8px;"></i>
                                ${statusText}
                            </span>
                        </div>
                        
                        <div class="member-card-body">
                            <div class="member-detail-group">
                                <span class="detail-label">Contact</span>
                                <span class="detail-value">
                                    <i class="fas fa-envelope"></i>
                                    ${member.email}
                                </span>
                                <span class="detail-value">
                                    <i class="fas fa-phone"></i>
                                    ${member.phone}
                                </span>
                            </div>
                            
                            <div class="member-detail-group">
                                <span class="detail-label">Membership</span>
                                <span class="membership-badge" style="background: ${membershipColor}; width: fit-content;">
                                    ${member.membership_type === 'VIP' ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-star"></i>'}
                                    ${member.membership_type}
                                </span>
                            </div>
                            
                            <div class="member-detail-group">
                                <span class="detail-label">Join Date</span>
                                <span class="detail-value">
                                    <i class="fas fa-calendar-plus"></i>
                                    ${joinDate}
                                </span>
                            </div>
                        </div>
                        
                        <div class="member-card-footer">
                            <div class="expiry-section">
                                <div class="member-detail-group" style="margin: 0;">
                                    <span class="detail-label">Membership Expiry</span>
                                </div>
                                <div class="expiry-input-wrapper">
                                    <input 
                                        type="date" 
                                        class="expiry-date-input" 
                                        value="${expiryDateStr}"
                                        id="expiry-${member.id}"
                                    >
                                </div>
                                <button class="btn-update-expiry" onclick="updateMembershipExpiry('${member.id}')">
                                    <i class="fas fa-save"></i>
                                    Update
                                </button>
                            </div>
                            
                            <div class="member-actions">
                                <button class="btn-download-history" onclick="downloadMemberHistory('${member.id}', '${member.name}')" title="Download Attendance History">
                                    <i class="fas fa-download"></i>
                                    Download History
                                </button>
                                <button class="btn-delete-member" onclick="confirmDeleteMember('${member.id}', '${member.name}')">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="members-count">
            <strong>${membersWithStatus.length}</strong> total members
        </div>
    `;
}

// Filter members based on search and filters
function filterMembers() {
    const searchTerm = document.getElementById('members-search').value.toLowerCase();
    const membershipFilter = document.getElementById('membership-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const cards = document.querySelectorAll('.member-card');
    
    cards.forEach(card => {
        const memberName = card.querySelector('.member-name-large').textContent.toLowerCase();
        const memberEmail = card.querySelector('.detail-value').textContent.toLowerCase();
        const membershipType = card.dataset.membership;
        const status = card.dataset.status;
        
        const matchesSearch = memberName.includes(searchTerm) || memberEmail.includes(searchTerm);
        const matchesMembership = membershipFilter === 'all' || membershipType === membershipFilter;
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        
        if (matchesSearch && matchesMembership && matchesStatus) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Update membership expiry date
async function updateMembershipExpiry(memberId) {
    const expiryInput = document.getElementById(`expiry-${memberId}`);
    const expiryDate = expiryInput.value;
    
    if (!expiryDate) {
        alert('Please select an expiry date');
        return;
    }
    
    try {
        const result = await window.supabaseClient.updateMemberExpiry(memberId, expiryDate);
        
        if (result.success) {
            // Show success message
            showSuccessMessage('Membership expiry updated successfully!');
            
            // Reload members to update the status badge
            await loadMembers();
        } else {
            alert('Failed to update membership expiry: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error updating expiry:', error);
        alert('Failed to update membership expiry');
    }
}

// Show success message (temporary notification)
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add Member
async function handleAddMember(e) {
    e.preventDefault();
    
    const memberData = {
        name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        phone: document.getElementById('member-phone').value,
        membershipType: document.getElementById('member-type').value
    };
    
    try {
        // Use Supabase client
        const result = await window.supabaseClient.addMember(memberData);
        
        if (result.success) {
            alert('Member added successfully!');
            document.getElementById('add-member-form').reset();
            const modal = document.getElementById('add-member-modal');
            modal.style.display = 'none';
            modal.classList.remove('show');
            loadMembers();
            loadDashboard();
        } else {
            alert(result.error || 'Failed to add member');
        }
    } catch (error) {
        alert('Error adding member');
    }
}

// Add member form submit handler
const addMemberForm = document.getElementById('add-member-form');
if (addMemberForm) {
    addMemberForm.addEventListener('submit', handleAddMember);
}

// Delete Member
function confirmDeleteMember(memberId, memberName) {
    showConfirmModal(
        `Are you sure you want to delete ${memberName}? This action cannot be undone.`,
        async () => {
            try {
                const result = await window.supabaseClient.deleteMember(memberId);
                
                if (result.success) {
                    showSuccessModal(`${memberName} has been removed from the system.`);
                    loadMembers();
                    loadDashboard();
                } else {
                    alert(result.error || 'Failed to delete member');
                }
            } catch (error) {
                alert('Error deleting member');
            }
        }
    );
}

// Load Reports
async function loadReports() {
    try {
        // Use Supabase client
        const allAttendance = await window.supabaseClient.getAllAttendance();
        const todayAttendance = await window.supabaseClient.getTodayAttendance();
        
        const todayCheckins = todayAttendance.filter(a => a.action === 'checkin').length;
        const todayCheckouts = todayAttendance.filter(a => a.action === 'checkout').length;
        const currentlyIn = todayCheckins - todayCheckouts;
        
        document.getElementById('report-checkins').textContent = todayCheckins;
        document.getElementById('report-checkouts').textContent = todayCheckouts;
        document.getElementById('report-current').textContent = currentlyIn;
        
        displayAllRecords(allAttendance);
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Display all records
function displayAllRecords(attendance) {
    const container = document.getElementById('all-records-table');
    
    if (!attendance || attendance.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #94A3B8;">No records found</div>';
        return;
    }
    
    const latest = attendance.slice(0, 50); // Already sorted descending from API
    
    container.innerHTML = `
        <div class="table-header">
            <span>Member Name</span>
            <span>Member ID</span>
            <span>Date</span>
            <span>Time</span>
            <span>Action</span>
        </div>
        ${latest.map(record => {
            const actionClass = record.action === 'checkin' ? 'checkin' : 'checkout';
            const actionText = record.action === 'checkin' ? 'Check-In' : 'Check-Out';
            
            const checkTime = new Date(record.check_time);
            const dateStr = checkTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const timeStr = checkTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            
            const memberName = record.members?.name || 'Unknown';
            const memberId = record.member_id ? '#' + record.member_id.substring(0, 8).toUpperCase() : 'N/A';
            
            return `
                <div class="attendance-row">
                    <span>${memberName}</span>
                    <span>${memberId}</span>
                    <span>${dateStr}</span>
                    <span>${timeStr}</span>
                    <span class="status-badge ${actionClass}">${actionText}</span>
                </div>
            `;
        }).join('')}
    `;
}

// Download QR
function downloadQR() {
    const activeQR = document.querySelector('.qr-canvas.active canvas');
    if (activeQR) {
        const url = activeQR.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gym-qr-code.png';
        a.click();
    }
}

// Print QR
function printQR() {
    const activeQR = document.querySelector('.qr-canvas.active canvas');
    if (activeQR) {
        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(`
            <html>
            <head>
                <title>Gym QR Code</title>
                <style>
                    body { 
                        text-align: center; 
                        font-family: Arial, sans-serif;
                        padding: 40px;
                    }
                    h1 { color: #4F46E5; margin-bottom: 20px; }
                    img { margin: 20px 0; max-width: 400px; }
                    p { font-size: 18px; color: #666; }
                </style>
            </head>
            <body>
                <h1>🏋️ FitZone Gym QR Code</h1>
                <img src="${activeQR.toDataURL()}" />
                <p>Scan to mark your attendance</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

// Print QR Large (from QR page)
function printQRLarge(type) {
    const canvas = document.querySelector(`#qr-large-${type} canvas`);
    if (canvas) {
        const title = type === 'checkin' ? 'Check-In' : 'Check-Out';
        const color = type === 'checkin' ? '#10B981' : '#F59E0B';
        
        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(`
            <html>
            <head>
                <title>Gym ${title} QR Code</title>
                <style>
                    body { 
                        text-align: center; 
                        font-family: Arial, sans-serif;
                        padding: 40px;
                    }
                    h1 { color: ${color}; margin-bottom: 20px; }
                    img { margin: 20px 0; max-width: 400px; border: 4px solid ${color}; border-radius: 12px; }
                    p { font-size: 18px; color: #666; }
                </style>
            </head>
            <body>
                <h1>🏋️ FitZone Gym ${title}</h1>
                <img src="${canvas.toDataURL()}" />
                <p>Scan to ${title.toLowerCase()}</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

// Download QR Large
function downloadQRLarge(type) {
    const canvas = document.querySelector(`#qr-large-${type} canvas`);
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym-${type}-qr-code.png`;
        a.click();
    }
}

// ========== ACCOUNT REQUESTS MANAGEMENT ==========

// Load pending account requests
async function loadAccountRequests() {
    try {
        // Use Supabase client
        const pendingAccounts = await window.supabaseClient.getPendingAccounts();
        
        // Update notification badge
        updatePendingCountBadge(pendingAccounts.length);
        
        displayAccountRequests(pendingAccounts);
    } catch (error) {
        console.error('Error loading account requests:', error);
    }
}

// Update the pending count badge in sidebar
function updatePendingCountBadge(count) {
    const badge = document.getElementById('pending-count-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Display account requests
function displayAccountRequests(accounts) {
    const container = document.getElementById('pending-requests-list');
    
    if (!accounts || accounts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #94A3B8;">
                <i class="fas fa-inbox" style="font-size: 4em; margin-bottom: 20px; display: block;"></i>
                <h3>No Pending Requests</h3>
                <p>All account requests have been processed</p>
            </div>
        `;
        return;
    }
    
    // Create a compact table view for better scalability
    container.innerHTML = `
        <div class="requests-table-container">
            <table class="requests-table">
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Requested</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${accounts.map(account => {
                        const initial = account.name.charAt(0).toUpperCase();
                        const date = new Date(account.created_at).toLocaleDateString();
                        const time = new Date(account.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        
                        return `
                            <tr class="request-row">
                                <td>
                                    <div class="member-cell">
                                        <div class="member-avatar-small">${initial}</div>
                                        <span class="member-name">${account.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="email-text">${account.email}</span>
                                </td>
                                <td>
                                    <span class="phone-text">${account.phone}</span>
                                </td>
                                <td>
                                    <div class="date-cell">
                                        <span class="date-text">${date}</span>
                                        <span class="time-text">${time}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-table-approve" onclick="approveAccount('${account.id}', '${account.name}')" title="Approve">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn-table-reject" onclick="rejectAccount('${account.id}', '${account.name}')" title="Reject">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="requests-summary">
            <span>${accounts.length} pending request${accounts.length !== 1 ? 's' : ''}</span>
        </div>
    `;
}

// Approve account
async function approveAccount(accountId, name) {
    // Show custom approval modal
    showApprovalModal(accountId, name);
}

function showApprovalModal(accountId, name) {
    const modal = document.getElementById('custom-approval-modal');
    document.querySelector('#approval-member-name strong').textContent = name;
    modal.classList.add('show');
    
    // Set up confirm button
    document.getElementById('confirm-approve-btn').onclick = async () => {
        const selectedType = document.querySelector('input[name="membership-type"]:checked').value;
        closeCustomModal('custom-approval-modal');
        await processApproval(accountId, name, selectedType);
    };
}

async function processApproval(accountId, name, membershipType) {
    try {
        // Use Supabase client
        const result = await window.supabaseClient.approveAccount(accountId, membershipType);
        
        if (result.success) {
            showSuccessModal(`Account approved! ${name} can now login and access the gym.`);
            
            // Send welcome email
            if (result.member && window.emailHelper) {
                console.log('Attempting to send welcome email to:', result.member.email);
                const emailResult = await window.emailHelper.sendWelcomeEmail(result.member);
                console.log('Welcome email result:', emailResult);
                if (!emailResult.success) {
                    console.error('Failed to send welcome email:', emailResult.error);
                }
            } else {
                console.log('Email helper not available or member data missing');
            }
            
            loadAccountRequests();
            loadMembers();
            loadDashboard();
        } else {
            alert(result.error || 'Failed to approve account');
        }
    } catch (error) {
        alert('Error approving account');
    }
}

// Reject account
async function rejectAccount(accountId, name) {
    showConfirmModal(
        `Are you sure you want to reject the account request from ${name}?`,
        async () => {
            try {
                const result = await window.supabaseClient.rejectAccount(accountId);
                
                if (result.success) {
                    showSuccessModal(`Account request from ${name} has been rejected.`);
                    loadAccountRequests();
                } else {
                    alert(result.error || 'Failed to reject account');
                }
            } catch (error) {
                alert('Error rejecting account');
            }
        }
    );
}

// Custom modal functions
function showApprovalModal(accountId, name) {
    const modal = document.getElementById('custom-approval-modal');
    document.querySelector('#approval-member-name strong').textContent = name;
    modal.classList.add('show');
    
    document.getElementById('confirm-approve-btn').onclick = async () => {
        const selectedType = document.querySelector('input[name="membership-type"]:checked').value;
        closeCustomModal('custom-approval-modal');
        await processApproval(accountId, name, selectedType);
    };
}

function showSuccessModal(message) {
    const modal = document.getElementById('custom-success-modal');
    document.getElementById('success-modal-message').textContent = message;
    modal.classList.add('show');
}

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal');
    document.getElementById('confirm-modal-message').textContent = message;
    modal.classList.add('show');
    
    document.getElementById('confirm-action-btn').onclick = () => {
        closeCustomModal('custom-confirm-modal');
        onConfirm();
    };
}

function closeCustomModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Check authentication on page load
window.addEventListener('load', () => {
    const userSession = localStorage.getItem('userSession');
    const userRole = localStorage.getItem('userRole');
    
    if (!userSession) {
        // Not logged in, redirect to login page
        window.location.href = '/login.html';
        return;
    }
    
    // Update user profile in top bar
    const userProfileName = document.querySelector('.user-profile span');
    if (userProfileName && userSession) {
        const user = JSON.parse(userSession);
        userProfileName.textContent = user.name;
    }
    
    // Hide admin-only pages for members
    if (userRole === 'member') {
        const adminPages = ['members', 'account-requests', 'qrcode', 'reports', 'settings'];
        adminPages.forEach(pageId => {
            const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
            if (navItem) {
                navItem.style.display = 'none';
            }
        });
        
        // Redirect member to attendance page
        document.querySelector('.nav-item[data-page="attendance"]').click();
    }
});

// Logout function
function logout() {
    localStorage.removeItem('userSession');
    localStorage.removeItem('userRole');
    window.location.href = '/login.html';
}

// Toggle profile menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile')) {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
});


// Download member attendance history as CSV
async function downloadMemberHistory(memberId, memberName) {
    try {
        // Get member attendance
        const attendance = await window.supabaseClient.getMemberAttendance(memberId);
        
        if (!attendance || attendance.length === 0) {
            alert('No attendance history found for this member.');
            return;
        }
        
        // Sort by date descending
        attendance.sort((a, b) => new Date(b.check_time) - new Date(a.check_time));
        
        // Create CSV content
        let csvContent = "Date,Time,Action\n";
        
        attendance.forEach(record => {
            const dateTime = new Date(record.check_time);
            const date = dateTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const time = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const action = record.action === 'checkin' ? 'Check-In' : 'Check-Out';
            
            csvContent += `${date},${time},${action}\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `${memberName.replace(/\s+/g, '_')}_Attendance_History_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showCustomAlert('Attendance history downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading member history:', error);
        showCustomAlert('Failed to download attendance history.', 'error');
    }
}
