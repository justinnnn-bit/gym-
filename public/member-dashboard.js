// Member Dashboard Logic

let currentDate = new Date();
let memberAttendance = [];
let memberId = null;

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
    document.getElementById('member-name').textContent = user.name;
    
    await loadAttendance();
    renderCalendar();
    updateStats();
    
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
    } catch (error) {
        console.error('Error loading attendance:', error);
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
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dateNum = document.createElement('div');
        dateNum.className = 'date-num';
        dateNum.textContent = day;
        
        const statusIcon = document.createElement('div');
        statusIcon.className = 'status-icon';
        
        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
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
        // Check attendance status
        else {
            const dateStr = date.toISOString().split('T')[0];
            const hasAttendance = memberAttendance.some(record => {
                const recordDate = new Date(record.check_time).toISOString().split('T')[0];
                return recordDate === dateStr && record.action === 'checkin';
            });
            
            if (hasAttendance) {
                dayElement.classList.add('present');
                statusIcon.innerHTML = '<i class="fas fa-check"></i>';
            } else {
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
    
    // Count present and absent days for current month (excluding future days and Thursdays)
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
    
    const absentDays = totalWorkingDays - presentDays;
    const attendanceRate = totalWorkingDays > 0 
        ? Math.round((presentDays / totalWorkingDays) * 100) 
        : 0;
    
    document.getElementById('total-present').textContent = presentDays;
    document.getElementById('total-absent').textContent = absentDays;
    document.getElementById('attendance-rate').textContent = attendanceRate + '%';
    
    // Update recent activity
    updateRecentActivity();
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
