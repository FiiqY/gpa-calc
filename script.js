// Grade point mapping (Standard 4.0 scale with +/-)
const gradePoints = {
    'A': 4.0,
    'AB': 3.5,
    'B': 3.0,
    'BC': 2.5,
    'C': 2.0,
    'D': 1.0,
    'E': 0.0
};

// Function to generate the grade dropdown options
function getGradeOptions() {
    let options = '<option value="">-- Select Grade --</option>';
    for (const grade in gradePoints) {
        options += `<option value="${grade}">${grade}</option>`;
    }
    options += `<option value="S">S (Satisfactory - No GPA)</option>`;
    return options;
}

// Function to add a new course row to the table
function addCourse() {
    const tableBody = document.querySelector('#courseTable tbody');
    const newRow = tableBody.insertRow();
    
    // Cell for Grade dropdown
    const gradeCell = newRow.insertCell(0);
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade';
    gradeSelect.innerHTML = getGradeOptions();
    gradeCell.appendChild(gradeSelect);

    // Cell for Credit Hours input
    const creditCell = newRow.insertCell(1);
    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.className = 'credits';
    creditInput.min = '1';
    creditInput.value = '3'; // Default to 3 credits
    creditCell.appendChild(creditInput);

    // Add a delete button to the end of the row
    const deleteCell = newRow.insertCell(2);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = function() {
        tableBody.removeChild(newRow);
        calculateGPA(); // Recalculate after deletion
    };
    deleteCell.appendChild(deleteButton);
}

// Function to calculate the Semester GPA
function calculateGPA() {
    const gradeInputs = document.querySelectorAll('.grade');
    const creditInputs = document.querySelectorAll('.credits');
    
    let totalQualityPoints = 0;
    let totalCreditHours = 0;
    let validCourses = 0;

    for (let i = 0; i < gradeInputs.length; i++) {
        const grade = gradeInputs[i].value;
        const credits = parseFloat(creditInputs[i].value);
        
        // Skip rows with invalid or incomplete data
        if (!grade || isNaN(credits) || credits <= 0) {
            continue;
        }

        // Check if the grade is one that contributes to GPA (not S, P, CR, etc.)
        if (gradePoints.hasOwnProperty(grade)) {
            const gradeValue = gradePoints[grade];
            const qualityPoints = gradeValue * credits;
            
            totalQualityPoints += qualityPoints;
            totalCreditHours += credits;
            validCourses++;
        }
        // Note: Grades like 'S' (Satisfactory) are generally skipped and do not affect GPA
    }

    const gpa = (totalCreditHours > 0) ? (totalQualityPoints / totalCreditHours) : 0;
    const resultElement = document.getElementById('result');
    
    if (validCourses === 0 && totalCreditHours === 0) {
        resultElement.textContent = 'Your Semester GPA: 0.00';
    } else {
        resultElement.textContent = `Your Semester GPA: ${gpa.toFixed(2)}`;
    }
}

// Function to clear all course rows and reset the result
function clearCourses() {
    document.querySelector('#courseTable tbody').innerHTML = '';
    document.getElementById('result').textContent = 'Your Semester GPA: 0.00';
}

// Initialize with a few empty rows when the page loads
window.onload = function() {
    addCourse();
    addCourse();
    addCourse();
};