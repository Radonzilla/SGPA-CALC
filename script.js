// Constants
const GRADES = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'F': 0
};

// DOM Elements
const subjectsContainer = document.getElementById('subjects-container');
const addSubjectButton = document.getElementById('add-subject');
const calculateButton = document.getElementById('calculate-sgpa');
const resultCard = document.getElementById('result-card');
const totalCreditsElement = document.getElementById('total-credits');
const totalPointsElement = document.getElementById('total-points');
const sgpaValueElement = document.getElementById('sgpa-value');
const themeToggle = document.getElementById('theme-toggle');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add initial two subject rows
    addSubjectRow();
    addSubjectRow();
    
    // Set up event listeners
    addSubjectButton.addEventListener('click', addSubjectRow);
    calculateButton.addEventListener('click', calculateSGPA);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// Create and add a new subject row
function addSubjectRow() {
    const rowIndex = document.querySelectorAll('.subject-row').length + 1;
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.innerHTML = `
        <input type="text" class="subject-input subject-name" placeholder="Subject ${rowIndex}" aria-label="Subject name">
        <input type="number" class="subject-input subject-credit" min="1" max="10" placeholder="Credits" aria-label="Credits" value="3">
        <select class="subject-input subject-grade" aria-label="Grade">
            <option value="" disabled selected>Grade</option>
            ${Object.keys(GRADES).map(grade => `<option value="${grade}">${grade}</option>`).join('')}
        </select>
        <button class="btn-remove" aria-label="Remove subject">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Set up remove button event listener
    const removeButton = row.querySelector('.btn-remove');
    removeButton.addEventListener('click', () => {
        row.classList.add('fade-out');
        setTimeout(() => {
            row.remove();
            updateSubjectNumbers();
        }, 300);
    });
    
    // Add row with animation
    row.style.opacity = '0';
    row.style.transform = 'translateY(20px)';
    subjectsContainer.appendChild(row);
    
    // Trigger reflow for animation
    void row.offsetWidth;
    
    // Apply animation
    row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    row.style.opacity = '1';
    row.style.transform = 'translateY(0)';
    
    // Add focus to the subject name input
    const subjectInput = row.querySelector('.subject-name');
    subjectInput.focus();
    
    // Add smooth scrolling if many subjects
    if (rowIndex > 5) {
        row.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
}

// Update subject numbers after deletion
function updateSubjectNumbers() {
    const subjectRows = document.querySelectorAll('.subject-row');
    subjectRows.forEach((row, index) => {
        const subjectInput = row.querySelector('.subject-name');
        if (subjectInput.value === '' || subjectInput.value.startsWith('Subject ')) {
            subjectInput.placeholder = `Subject ${index + 1}`;
        }
    });
}

// Calculate SGPA
function calculateSGPA() {
    const subjects = document.querySelectorAll('.subject-row');
    
    // Validate inputs
    let isValid = true;
    let errorMessage = '';
    
    if (subjects.length === 0) {
        showNotification('Please add at least one subject');
        return;
    }
    
    subjects.forEach((subject, index) => {
        const creditInput = subject.querySelector('.subject-credit');
        const gradeInput = subject.querySelector('.subject-grade');
        
        // Validate credits
        if (!creditInput.value || isNaN(creditInput.value) || creditInput.value < 1 || creditInput.value > 10) {
            creditInput.style.borderColor = 'var(--danger)';
            isValid = false;
            errorMessage = 'Credits must be between 1 and 10';
        } else {
            creditInput.style.borderColor = 'var(--border)';
        }
        
        // Validate grade
        if (!gradeInput.value) {
            gradeInput.style.borderColor = 'var(--danger)';
            isValid = false;
            errorMessage = errorMessage || 'Please select a grade for all subjects';
        } else {
            gradeInput.style.borderColor = 'var(--border)';
        }
    });
    
    if (!isValid) {
        showNotification(errorMessage);
        return;
    }
    
    // Calculate SGPA
    let totalCredits = 0;
    let totalPoints = 0;
    
    subjects.forEach(subject => {
        const credits = parseInt(subject.querySelector('.subject-credit').value);
        const grade = subject.querySelector('.subject-grade').value;
        const gradePoint = GRADES[grade];
        
        totalCredits += credits;
        totalPoints += credits * gradePoint;
    });
    
    const sgpa = totalPoints / totalCredits;
    
    // Display results with animation
    totalCreditsElement.textContent = totalCredits;
    totalPointsElement.textContent = totalPoints;
    sgpaValueElement.textContent = sgpa.toFixed(2);
    
    resultCard.classList.remove('hidden');
    
    // Add pulse animation
    sgpaValueElement.classList.add('pulse');
    setTimeout(() => {
        sgpaValueElement.classList.remove('pulse');
    }, 3000);
    
    // Scroll to results
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Toggle theme
function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        // Switch to light mode
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
        showNotification('Light mode enabled');
    } else {
        // Switch to dark mode
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
        showNotification('Dark mode enabled');
    }
}

// Show notification
function showNotification(message) {
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}