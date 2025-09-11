// Maintenance Mode JavaScript Redirect
// This script ensures all pages redirect to under-construction.html
// Active until October 13, 2025 at 10:00 AM

(function() {
    'use strict';
    
    // Target date: 48 hours from now
    const maintenanceEndDate = new Date(Date.now() + (48 * 60 * 60 * 1000)).getTime();
    const currentDate = new Date().getTime();
    
    // Check if we're currently in maintenance mode
    const isMaintenanceMode = currentDate < maintenanceEndDate;
    
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // If maintenance is over, remove maintenance mode completely
    if (!isMaintenanceMode) {
        // Store that maintenance is over in localStorage
        localStorage.setItem('maintenanceOver', 'true');
        localStorage.setItem('maintenanceEndTime', maintenanceEndDate.toString());
        
        // If we're on the construction page and maintenance is over, redirect to home
        if (currentPage === 'under-construction.html') {
            window.location.replace('/index.html');
            return;
        }
        
        // Allow normal site access
        return;
    }
    
    // Don't redirect if we're already on the construction page
    if (currentPage === 'under-construction.html') {
        return;
    }
    
    // Redirect to under construction page
    window.location.replace('/under-construction.html');
})();
