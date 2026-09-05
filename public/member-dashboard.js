// Member Dashboard Logic

let currentDate = new Date();
let memberAttendance = [];
let memberId = null;
let memberData = null;

// Check authentication
window.addEventListener('DOMContentLoaded', async () => {
    const userSession = localStorage.getItem('userSession');
    const userRole = localStorage.getItem('userRole');
    
    if (!userSession || userRole !== 'member') {
        window.location.href = '/login.html';
        return;
    }
    
    const user = JSON.parse(userSession);
    memberId = user.id;
    memberData = user;
    
    // Verify member still exists in database
    try {
        const member = await window.supabaseClient.getMemberById(memberId);
        if (!member || !member.active) {
            // Member deleted or deactivated - force logout
            localStorage.removeItem('userSession');
            localStorage.removeItem('userRole');
            alert('Your account has been removed. Please contact the administrator.');
            window.location.href = '/login.html';
            return;
        }
    } catch (error) {
        console.error('Error verifying member:', error);
        // If member not found, logout
        localStorage.removeItem('userSession');
        localStorage.removeItem('userRole');
        window.location.href = '/login.html';
        return;
    }
    
    // Update sidebar profile
    const initial = user.name.charAt(0).toUpperCase();
    document.getElementById('member-avatar').textContent = initial;
    document.getElementById('member-name-sidebar').textContent = user.name;
    document.getElementById('member-email-sidebar').textContent = user.email;
    
    await loadAttendance();
    await loadMemberDetails();
    renderCalendar();
    updateStats();
    loadMembershipPage();
    loadSettingsPage();
    
    // Check if coming from quick-scan (attendance just recorded)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('updated') === 'true') {
        // Reload attendance to show latest
        setTimeout(async () => {
            await loadAttendance();
            renderCalendar();
            updateStats();
        }, 500);
    }
});

async function loadAttendance() {
    try {
        const attendance = await window.supabaseClient.getMemberAttendance(memberId);
        memberAttendance = attendance || [];
        console.log('Loaded attendance records:', memberAttendance);
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

async function loadMemberDetails() {
    try {
        const members = await window.supabaseClient.getAllMembers();
        const member = members.find(m => m.id === memberId);
        if (member) {
            memberData = member;
        }
    } catch (error) {
        console.error('Error loading member details:', error);
    }
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthName = document.getElementById('current-month');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    monthName.textContent = `${monthNames[month]} ${year}`;
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }
    
    // Add days of month
    const today = new Date();
    // Get today's date in local timezone (not UTC)
    const todayStr = today.getFullYear() + '-' + 
                     String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');
    
    console.log('Calendar rendering - Today is:', todayStr);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dateNum = document.createElement('div');
        dateNum.className = 'date-num';
        dateNum.textContent = day;
        
        const statusIcon = document.createElement('div');
        statusIcon.className = 'status-icon';
        
        // Check if it's today
        if (dateStr === todayStr) {
            dayElement.classList.add('today');
        }
        
        // Check if it's in the future
        if (date > today) {
            dayElement.classList.add('future');
        }
        // Check if it's Thursday (gym closed)
        else if (date.getDay() === 4) { // Thursday = 4
            dayElement.classList.add('closed');
            statusIcon.innerHTML = '<i class="fas fa-door-closed"></i>';
        }
        // Check attendance status (only for past and today)
        else {
            const hasAttendance = memberAttendance.some(record => {
                // Parse UTC timestamp and get local date components
                const recordDate = new Date(record.check_time);
                const recordDateStr = recordDate.getFullYear() + '-' + 
                                     String(recordDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                     String(recordDate.getDate()).padStart(2, '0');
                
                // Debug log for today's date
                if (dateStr === todayStr) {
                    console.log('Checking today:', dateStr, 'Record date:', recordDateStr, 'Action:', record.action, 'Raw:', record.check_time);
                }
                
                return recordDateStr === dateStr && record.action === 'checkin';
            });
            
            if (hasAttendance) {
                dayElement.classList.add('present');
                statusIcon.innerHTML = '<i class="fas fa-check"></i>';
            } else if (dateStr <= todayStr) {
                // Only mark as absent if date is today or in the past
                dayElement.classList.add('absent');
                statusIcon.innerHTML = '<i class="fas fa-times"></i>';
            }
        }
        
        dayElement.appendChild(dateNum);
        dayElement.appendChild(statusIcon);
        calendar.appendChild(dayElement);
    }
}

function updateStats() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Count present days for current month (excluding future days and Thursdays)
    let presentDays = 0;
    let totalWorkingDays = 0;
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        
        // Skip future days
        if (date > today) continue;
        
        // Skip Thursdays (gym closed)
        if (date.getDay() === 4) continue;
        
        totalWorkingDays++;
        
        const dateStr = date.toISOString().split('T')[0];
        const hasAttendance = memberAttendance.some(record => {
            const recordDate = new Date(record.check_time).toISOString().split('T')[0];
            return recordDate === dateStr && record.action === 'checkin';
        });
        
        if (hasAttendance) presentDays++;
    }
    
    // Calculate total all-time visits (unique check-in days)
    const uniqueCheckInDates = new Set();
    memberAttendance.forEach(record => {
        if (record.action === 'checkin') {
            const dateStr = new Date(record.check_time).toISOString().split('T')[0];
            uniqueCheckInDates.add(dateStr);
        }
    });
    const totalVisits = uniqueCheckInDates.size;
    
    const attendanceRate = totalWorkingDays > 0 
        ? Math.round((presentDays / totalWorkingDays) * 100) 
        : 0;
    
    // Calculate current streak
    const currentStreak = calculateStreak();
    
    document.getElementById('total-present').textContent = presentDays;
    document.getElementById('total-visits').textContent = totalVisits;
    document.getElementById('attendance-rate').textContent = attendanceRate + '%';
    document.getElementById('current-streak').textContent = currentStreak;
    
    // Update recent activity
    updateRecentActivity();
}

function calculateStreak() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
        // Skip Thursdays (gym closed)
        if (checkDate.getDay() === 4) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
        }
        
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasAttendance = memberAttendance.some(record => {
            const recordDate = new Date(record.check_time).toISOString().split('T')[0];
            return recordDate === dateStr && record.action === 'checkin';
        });
        
        if (!hasAttendance) break;
        
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        
        // Stop if we've gone back too far
        if (streak > 365) break;
    }
    
    return streak;
}

function updateRecentActivity() {
    const activityList = document.getElementById('recent-activity');
    
    // Get last 5 attendance records
    const recentRecords = memberAttendance
        .sort((a, b) => new Date(b.check_time) - new Date(a.check_time))
        .slice(0, 5);
    
    if (recentRecords.length === 0) {
        activityList.innerHTML = `
            <div class="no-activity">
                <i class="fas fa-calendar-times"></i>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = recentRecords.map(record => {
        const date = new Date(record.check_time);
        const actionClass = record.action === 'checkin' ? '' : 'checkout';
        const actionIcon = record.action === 'checkin' ? 'sign-in-alt' : 'sign-out-alt';
        const actionLabel = record.action === 'checkin' ? 'Check-In' : 'Check-Out';
        
        const timeStr = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        return `
            <div class="activity-item ${actionClass}">
                <div class="activity-icon">
                    <i class="fas fa-${actionIcon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-type">${actionLabel}</div>
                    <div class="activity-time">${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function logout() {
    localStorage.removeItem('userSession');
    localStorage.removeItem('userRole');
    window.location.href = '/login.html';
}

// Load Membership Page
function loadMembershipPage() {
    if (!memberData) return;
    
    const membershipType = memberData.membership_type || 'Basic';
    const joinDate = memberData.join_date 
        ? new Date(memberData.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
    
    // Update membership badge
    const badge = document.getElementById('membership-badge');
    badge.textContent = membershipType;
    badge.className = 'membership-badge ' + membershipType.toLowerCase();
    
    // Update membership details
    document.getElementById('member-name-membership').textContent = memberData.name;
    document.getElementById('member-email-membership').textContent = memberData.email;
    document.getElementById('member-phone-membership').textContent = memberData.phone || 'N/A';
    document.getElementById('join-date-membership').textContent = joinDate;
    document.getElementById('membership-type').textContent = membershipType;
    document.getElementById('member-id-display').textContent = '#' + memberData.id.substring(0, 8).toUpperCase();
}

// Load Settings Page
function loadSettingsPage() {
    if (!memberData) return;
    
    document.getElementById('settings-name').value = memberData.name;
    document.getElementById('settings-email').value = memberData.email;
    document.getElementById('settings-phone').value = memberData.phone || '';
}

// Profile form submit
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('settings-name').value;
    const phone = document.getElementById('settings-phone').value;
    
    try {
        // Update member profile (you'll need to implement this in supabase-client.js)
        const result = await window.supabaseClient.updateMemberProfile(memberId, { name, phone });
        
        if (result.success) {
            showAlert('Profile updated successfully!', 'success');
            memberData.name = name;
            memberData.phone = phone;
            
            // Update sidebar
            document.getElementById('member-name-sidebar').textContent = name;
            
            // Update session
            const session = JSON.parse(localStorage.getItem('userSession'));
            session.name = name;
            localStorage.setItem('userSession', JSON.stringify(session));
            
            // Reload membership page
            loadMembershipPage();
        } else {
            showAlert('Failed to update profile: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showAlert('Error updating profile', 'error');
        console.error(error);
    }
});

// Password form submit
document.getElementById('password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('New password must be at least 6 characters long!', 'warning');
        return;
    }
    
    try {
        // Check if function exists
        if (typeof window.supabaseClient.changePassword !== 'function') {
            showAlert('Password change function not available. Please refresh the page and try again.', 'error');
            console.error('changePassword function not found on window.supabaseClient');
            return;
        }
        
        // Change password
        const result = await window.supabaseClient.changePassword(memberId, currentPassword, newPassword);
        
        if (!result) {
            showAlert('Failed to change password: No response from server', 'error');
            return;
        }
        
        if (result.success) {
            showAlert('Password changed successfully!', 'success');
            document.getElementById('password-form').reset();
        } else {
            showAlert('Failed to change password: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showAlert('Error changing password: ' + error.message, 'error');
        console.error('Password change error:', error);
    }
});

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Custom alert function
function showAlert(message, type = 'success', title = null) {
    const modal = document.getElementById('custom-alert-modal');
    const icon = document.getElementById('alert-icon');
    const titleEl = document.getElementById('alert-title');
    const messageEl = document.getElementById('alert-message');
    
    // Set icon based on type
    icon.className = 'modal-icon ' + type;
    if (type === 'success') {
        icon.innerHTML = '<i class="fas fa-check-circle"></i>';
        titleEl.textContent = title || 'Success!';
    } else if (type === 'error') {
        icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        titleEl.textContent = title || 'Error';
    } else if (type === 'warning') {
        icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        titleEl.textContent = title || 'Warning';
    }
    
    messageEl.textContent = message;
    modal.style.display = 'flex';
}

function closeAlertModal() {
    document.getElementById('custom-alert-modal').style.display = 'none';
}

// Update current date
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = dateStr;
    }
}

// Page navigation
function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.onclick) return; // Skip logout button
            
            e.preventDefault();
            const page = item.getAttribute('data-page');
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active page
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            
            // Update page title
            const titles = {
                'dashboard': { title: 'Dashboard', subtitle: 'Your gym stats and attendance' },
                'membership': { title: 'Membership', subtitle: 'Your membership details' },
                'settings': { title: 'Settings', subtitle: 'Manage your account' }
            };
            
            const pageInfo = titles[page];
            document.getElementById('page-title-text').textContent = pageInfo.title;
            document.getElementById('page-subtitle-text').textContent = pageInfo.subtitle;
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('sidebar-overlay').classList.remove('active');
            }
        });
    });
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    initializeNavigation();
});
