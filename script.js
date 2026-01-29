
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
    

    newRow.classList.add('new-row');
    
    const gradeCell = newRow.insertCell(0);
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade';
    gradeSelect.innerHTML = getGradeOptions();

    gradeCell.appendChild(gradeSelect);

    const creditCell = newRow.insertCell(1);
    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.className = 'credits';
    creditInput.min = '1';
    creditInput.value = '3';

    creditCell.appendChild(creditInput);

    
    const deleteCell = newRow.insertCell(2);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    

    deleteButton.onclick = function() {
        const rowToRemove = this.closest('tr');
        if (rowToRemove) {

            rowToRemove.classList.add('removing');
            

            rowToRemove.addEventListener('animationend', () => {
                rowToRemove.remove(); 

            }, { once: true });
        }
    };
    deleteCell.appendChild(deleteButton);

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
        

        if (row.classList.contains('removing')) {
            continue;
        }

        const gradeInput = row.querySelector('.grade');
        const creditInput = row.querySelector('.credits');

        const grade = gradeInput ? gradeInput.value : '';
        const credits = creditInput ? parseFloat(creditInput.value) : 0;
        
        const gradeValid = gradePoints.hasOwnProperty(grade);
        const creditsValid = !isNaN(credits) && credits > 0;
        

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
    

    if (incompleteRows > 0) {
        alert(`Peringatan: Ada ${incompleteRows} baris mata kuliah yang belum diisi indeks atau SKS-nya. Harap lengkapi data.`);
        return;
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

    const rows = document.querySelectorAll('#courseTable tbody tr');
    let delay = 0;
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add('removing');
            row.addEventListener('animationend', () => {
                row.remove();
                if (index === rows.length - 1) {
                    document.getElementById('result').textContent = 'IP Anda Semester Ini: 0.00';
                }
            }, { once: true });
        }, delay);

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