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


function getGradeOptions() {
    let options = '<option value="">-- Pilih Indeks --</option>';
    for (const grade in gradePoints) {
        options += `<option value="${grade}">${grade}</option>`;
    }
    return options;
}

function addCourse() {
    const tableBody = document.querySelector('#courseTable tbody');
    const newRow = tableBody.insertRow();
    
    // 1. Add class for the "pop-in" animation (Starts hidden/small, pops to normal)
    newRow.classList.add('new-row');
    
    const gradeCell = newRow.insertCell(0);
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade';
    gradeSelect.innerHTML = getGradeOptions();
    // REMOVED: gradeSelect.onchange = calculateGPA; 
    gradeCell.appendChild(gradeSelect);

    const creditCell = newRow.insertCell(1);
    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.className = 'credits';
    creditInput.min = '1';
    creditInput.value = '3';
    // REMOVED: creditInput.oninput = calculateGPA; 
    creditCell.appendChild(creditInput);

    
    const deleteCell = newRow.insertCell(2);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    
    // Updated delete function to include the "pop-out" animation
    deleteButton.onclick = function() {
        const rowToRemove = this.closest('tr'); // Get the parent row (<tr>)
        if (rowToRemove) {
            // Add the removing class to trigger the pop-out animation
            rowToRemove.classList.add('removing');
            
            // Wait for the animation/transition to finish (0.3s defined in CSS)
            rowToRemove.addEventListener('animationend', () => {
                rowToRemove.remove(); // Remove the row from the DOM
                // calculateGPA(); // Removed: No need to auto-calculate after removal
            }, { once: true }); // Only listen for the event once
        }
    };
    deleteCell.appendChild(deleteButton);

    // To trigger the 'pop-in' transition, we remove the initial class shortly after insertion.
    setTimeout(() => {
        newRow.classList.remove('new-row');
    }, 10);
}

function calculateGPA() {
    const rows = document.querySelectorAll('#courseTable tbody tr');
    let totalQualityPoints = 0;
    let totalCreditHours = 0;
    let validCourses = 0;
    let incompleteRows = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Skip rows that are currently animating out
        if (row.classList.contains('removing')) {
            continue;
        }

        const gradeInput = row.querySelector('.grade');
        const creditInput = row.querySelector('.credits');

        const grade = gradeInput ? gradeInput.value : '';
        const credits = creditInput ? parseFloat(creditInput.value) : 0;
        
        const gradeValid = gradePoints.hasOwnProperty(grade);
        const creditsValid = !isNaN(credits) && credits > 0;
        
        // CHECK FOR INCOMPLETE ROWS
        if ((!grade || !creditsValid) && row.style.display !== 'none') {
            incompleteRows++;
        }

        if (gradeValid && creditsValid) {
            const gradeValue = gradePoints[grade];
            const qualityPoints = gradeValue * credits;
            
            totalQualityPoints += qualityPoints;
            totalCreditHours += credits;
            validCourses++;
        }
    }
    
    // ISSUE 2 FIX: Check for incomplete rows and warn
    if (incompleteRows > 0) {
        alert(`Peringatan: Ada ${incompleteRows} baris mata kuliah yang belum diisi indeks atau SKS-nya. Harap lengkapi data.`);
        return; // Stop calculation if warning is issued
    }


    const gpa = (totalCreditHours > 0) ? (totalQualityPoints / totalCreditHours) : 0;
    const resultElement = document.getElementById('result');
    
    if (validCourses === 0 && totalCreditHours === 0) {
        resultElement.textContent = 'IP Anda Semester Ini: 0.00';
    } else {
        resultElement.textContent = `IP Anda Semester Ini: ${gpa.toFixed(2)}`;
    }
}

function clearCourses() {
    // Clear all rows with a fade-out effect, then clear the container
    const rows = document.querySelectorAll('#courseTable tbody tr');
    let delay = 0;
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add('removing');
            row.addEventListener('animationend', () => {
                row.remove();
                if (index === rows.length - 1) { // Check if the last row has been removed
                    document.getElementById('result').textContent = 'IP Anda Semester Ini: 0.00';
                }
            }, { once: true });
        }, delay);
        // Stagger the effect slightly
        delay += 50; 
    });

    if (rows.length === 0) {
        document.getElementById('result').textContent = 'IP Anda Semester Ini: 0.00';
    }
}

window.onload = function() {
    addCourse();
    addCourse();
    addCourse();
};