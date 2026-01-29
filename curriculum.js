const gradePoints = {
    'A': 4.0,
    'AB': 3.5,
    'B': 3.0,
    'BC': 2.5,
    'C': 2.0,
    'D': 1.0,
    'E': 0.0
};

// Generates the dropdown options
function getGradeOptions() {
    let options = '<option value="">-- Indeks --</option>';
    for (const grade in gradePoints) {
        options += `<option value="${grade}">${grade}</option>`;
    }
    return options;
}

// THE MASTER ROW RENDERER
// Matches exactly 5 columns: Kode, Nama, SKS, Indeks, Action
function renderCourseRow(code = '', name = '', sks = '') {
    const tableBody = document.querySelector('#courseTable tbody');
    const newRow = tableBody.insertRow();
    newRow.classList.add('new-row');

    // Cell 0: Kode Mata Kuliah
    const cell0 = newRow.insertCell(0);
    cell0.innerHTML = `<input type="text" value="${code}" placeholder="e.g. KI1101" style="text-align: center;">`;

    // Cell 1: Nama Mata Kuliah
    const cell1 = newRow.insertCell(1);
    cell1.innerHTML = `<input type="text" value="${name}" placeholder="Nama Mata Kuliah" style="width: 100%;">`;

    // Cell 2: SKS
    const cell2 = newRow.insertCell(2);
    cell2.innerHTML = `<input type="number" class="credits" value="${sks}" min="0" placeholder="0" style="text-align: center;">`;

    // Cell 3: Indeks (Dropdown)
    const cell3 = newRow.insertCell(3);
    const select = document.createElement('select');
    select.className = 'grade';
    select.innerHTML = getGradeOptions();
    cell3.appendChild(select);

    // Cell 4: Delete Button
    const cell4 = newRow.insertCell(4);
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.className = 'btn-delete';
    btn.onclick = () => {
        newRow.classList.add('removing');
        newRow.addEventListener('animationend', () => {
            newRow.remove();
        }, { once: true });
    };
    cell4.appendChild(btn);

    // Entrance Animation
    setTimeout(() => {
        newRow.classList.remove('new-row');
    }, 10);
}

// Function for the "Tambah Baris Manual" button
function addCourse() {
    renderCourseRow('', '', ''); // Adds a totally blank row
}

function createSemesterBlock(semesterNum, title, courses = []) {
    const container = document.getElementById('semesterContainer');
    
    const semDiv = document.createElement('div');
    semDiv.className = 'semester-block new-row';
    semDiv.innerHTML = `
        <div class="sem-header">
            <h3>${title}</h3>
            <button onclick="this.closest('.semester-block').remove()" class="btn-delete">Hapus Semester</button>
        </div>
        <table class="courseTable">
            <thead>
                <tr>
                    <th style="width: 15%;">Kode</th>
                    <th style="width: 45%;">Nama Matkul</th>
                    <th style="width: 15%;">SKS</th>
                    <th style="width: 15%;">Indeks</th>
                    <th style="width: 10%;"></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <button onclick="addManualRow(this)" class="btn-add-row">+ Baris</button>
    `;

    container.appendChild(semDiv);
    const tbody = semDiv.querySelector('tbody');

    // If we have preloaded courses, add them now
    courses.forEach(c => {
        renderRowIntoTable(tbody, c.code, c.name, c.sks);
    });

    // If it's an empty custom semester, add one blank row
    if (courses.length === 0) {
        renderRowIntoTable(tbody);
    }
}

// Helper to render rows inside a specific table
function renderRowIntoTable(tbody, code='', name='', sks='') {
    const row = tbody.insertRow();
    row.innerHTML = `
        <td><input type="text" value="${code}" placeholder="KI1101"></td>
        <td><input type="text" value="${name}" placeholder="Nama Matkul"></td>
        <td><input type="number" class="credits" value="${sks}" placeholder="0"></td>
        <td>
            <select class="grade">
                ${getGradeOptions()} 
            </select>
        </td>
        <td><button onclick="this.closest('tr').remove()" class="btn-delete">X</button></td>
    `;
}

// Logic to Fetch JSON and loop through 8 semesters
async function preloadAllSemesters() {
    try {
        const response = await fetch('data/chem-curriculum-temp.json');
        const data = await response.json();
        
        document.getElementById('semesterContainer').innerHTML = ''; // Clear current

        for (let i = 1; i <= 8; i++) {
            const semCourses = data.curriculum.filter(c => c.semester === i);
            createSemesterBlock(i, `Semester ${i}`, semCourses);
        }
    } catch (e) {
        alert("Pastikan server berjalan untuk memuat JSON!");
    }
}

function addEmptySemester() {
    createSemesterBlock(null, "Semester Custom", []);
}

function addManualRow(btn) {
    const tbody = btn.closest('.semester-block').querySelector('tbody');
    renderRowIntoTable(tbody);
}

// Calculate IPK (Cumulative)
function calculateOverallGPA() {
    const allCredits = document.querySelectorAll('.credits');
    const allGrades = document.querySelectorAll('.grade');
    
    let totalPoints = 0;
    let totalSKS = 0;

    allGrades.forEach((select, index) => {
        const grade = select.value;
        const sks = parseFloat(allCredits[index].value);
        
        if (gradePoints[grade] !== undefined && !isNaN(sks)) {
            totalPoints += (gradePoints[grade] * sks);
            totalSKS += sks;
        }
    });

    const ipk = totalSKS > 0 ? (totalPoints / totalSKS) : 0;
    document.getElementById('totalResult').textContent = `IPK Total: ${ipk.toFixed(2)}`;
}

async function preloadAllSemesters() {
    try {
        // Using a relative path to your "data" folder
        const response = await fetch('data/chem-curriculum-temp.json');
        
        if (!response.ok) {
            throw new Error(`Gagal memuat file: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        const container = document.getElementById('semesterContainer');
        container.innerHTML = ''; // Reset container

        // Loop through semesters 1 to 8
        for (let i = 1; i <= 8; i++) {
            const semCourses = data.curriculum.filter(c => c.semester === i);
            
            // Only create the block if there are courses for that semester
            if (semCourses.length > 0) {
                createSemesterBlock(i, `Semester ${i}`, semCourses);
            }
        }
        
        console.log("Curriculum successfully loaded!");

    } catch (e) {
        console.error("Detailed Error:", e);
        alert("Waduh! Ada masalah: " + e.message + "\n\nPastikan folder bernama 'data' dan file bernama 'chem-curriculum-temp.json'");
    }
}


function calculateGPA() {
    const rows = document.querySelectorAll('#courseTable tbody tr');
    let totalQualityPoints = 0;
    let totalCreditHours = 0;
    let validCourses = 0;
    let incompleteRows = 0;

    rows.forEach(row => {
        if (row.classList.contains('removing')) return;

        const gradeInput = row.querySelector('.grade');
        const creditInput = row.querySelector('.credits');

        const grade = gradeInput ? gradeInput.value : '';
        const credits = creditInput ? parseFloat(creditInput.value) : 0;
        
        const gradeValid = gradePoints.hasOwnProperty(grade);
        const creditsValid = !isNaN(credits) && credits > 0;

        if (!grade || !creditsValid) {
            incompleteRows++;
        }

        if (gradeValid && creditsValid) {
            totalQualityPoints += (gradePoints[grade] * credits);
            totalCreditHours += credits;
            validCourses++;
        }
    });

    if (incompleteRows > 0) {
        alert(`Perhatian: Ada ${incompleteRows} baris yang belum lengkap.`);
        return;
    }

    const gpa = (totalCreditHours > 0) ? (totalQualityPoints / totalCreditHours) : 0;
    document.getElementById('result').textContent = `IP Anda Semester Ini: ${gpa.toFixed(2)}`;
}

function calculateOverallGPA() {
    const allRows = document.querySelectorAll('#semesterContainer tr');
    const courseMap = new Map(); // Key: Course Code, Value: { gradeValue, sks }

    allRows.forEach(row => {
        if (row.querySelector('th') || row.classList.contains('removing')) return;

        // Note: Using nth-child or specific selectors to get code, grade, and sks
        const codeInput = row.cells[0].querySelector('input');
        const creditInput = row.cells[2].querySelector('input');
        const gradeSelect = row.cells[3].querySelector('select');

        if (codeInput && gradeSelect && creditInput) {
            const code = codeInput.value.trim().toUpperCase();
            const grade = gradeSelect.value;
            const sks = parseFloat(creditInput.value);

            if (code && gradePoints[grade] !== undefined && !isNaN(sks) && sks > 0) {
                const currentGradeValue = gradePoints[grade];

                // REPLACEMENT LOGIC:
                // If course code isn't in the map, add it.
                // If it IS in the map, only replace if the new grade is higher.
                if (!courseMap.has(code) || currentGradeValue > courseMap.get(code).gradeValue) {
                    courseMap.set(code, { gradeValue: currentGradeValue, sks: sks });
                }
            }
        }
    });

    let totalQualityPoints = 0;
    let totalCreditsForGPA = 0;
    let totalSksLulus = 0;

    // Now calculate using the filtered Map
    courseMap.forEach((data) => {
        totalQualityPoints += (data.gradeValue * data.sks);
        totalCreditsForGPA += data.sks;

        if (data.gradeValue >= 2.0) { // Grade C or above
            totalSksLulus += data.sks;
        }
    });

    const ipk = totalCreditsForGPA > 0 ? (totalQualityPoints / totalCreditsForGPA) : 0;
    
    document.getElementById('totalResult').textContent = `IPK Total: ${ipk.toFixed(2)}`;
    document.getElementById('totalSKSCount').textContent = `Total SKS Lulus: ${totalSksLulus}`;
}

function clearCourses() {
    const tableBody = document.querySelector('#courseTable tbody');
    tableBody.innerHTML = '';
    document.getElementById('result').textContent = 'IP Anda Semester Ini: 0.00';
}

// Initial state: start with a clean table or one empty row
window.onload = function() {
    addCourse();
    addCourse();
    addCourse();
    // You can leave this empty or add one blank course
    // addCourse(); 
};