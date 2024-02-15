const selectedFilters = {
  alphabet: [],
  status: [],
  department: [],
  location: [],
};

class Employee {
  constructor(
    empNo,
    firstName,
    lastName,
    dob,
    email,
    mobileNumber,
    joiningDate,
    status,
    location,
    jobTitle,
    department,
    assignManager,
    assignProject,
    profileImageBase64
  ) {
    this.empNo = empNo || null;
    this.firstName = firstName || null;
    this.lastName = lastName || null;
    this.dob = dob || null;
    this.email = email || null;
    this.mobileNumber = mobileNumber || null;
    this.joiningDate = joiningDate || null;
    this.status = status || null;
    this.location = location || null;
    this.jobTitle = jobTitle || null;
    this.department = department || null;
    this.assignManager = assignManager || null;
    this.assignProject = assignProject || null;
    this.profileImageBase64 =
      profileImageBase64 || "../assets/default-user.png";
  }
}

(function () {
  function includeHTML(url, containerId) {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        updateGridTemplateColumns();
        let container = document.getElementById(containerId);
        if (container) {
          container.innerHTML += data;
        }
        handlePostProcessing(url);
      })
      .catch((error) => console.error(`Error fetching ${url}:`, error));
  }

  function main() {
    document.addEventListener("DOMContentLoaded", function () {
      includeHTML("./html/sidebar.html", "sidebarContainer");
      includeHTML("./html/header.html", "headerContainer");
      includeHTML("./html/employees.html", "employeesContainer");
      includeHTML("./html/addEmployee.html", "addEmployeesContainer");
      includeHTML("./html/role.html", "roleContainer");
      includeHTML("./html/addRoles.html", "newRoleContainer");
      includeHTML("./html/roleDesc.html", "roleDescContainer");
    });
  }

  function handlePostProcessing(url) {
    populateDepartmentList();
    handleEmployeesPage(url);
    handleAddEmployeePage(url);
    handleAddRolesPage(url);
  }
  main();
})();

//Post processing functions
function populateDepartmentList() {
  const employees = getAllEmployeesFromLocalStorage();
  const departmentCounts = {};
  if (employees) {
    employees.forEach((employee) => {
      const department = employee.department || "Others";
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });
  }
  const departmentList = document.getElementById("departmentList");
  departmentList.innerHTML = "";
  const staticDepartments = [
    "HR",
    "Finance",
    "IT",
    "Product Engineering",
    "UI/UX",
    "Management",
    "Others",
  ];
  staticDepartments.forEach((departmentName) => {
    const employeeCount = departmentCounts[departmentName] || 0;
    const departmentListItemHTML = generateDepartmentListItem(
      departmentName,
      employeeCount
    );
    departmentList.insertAdjacentHTML("beforeend", departmentListItemHTML);
    delete departmentCounts[departmentName];
  });
  for (const departmentName in departmentCounts) {
    const employeeCount = departmentCounts[departmentName];
    const departmentListItemHTML = generateDepartmentListItem(
      departmentName,
      employeeCount
    );
    departmentList.insertAdjacentHTML("beforeend", departmentListItemHTML);
  }
}

function generateDepartmentListItem(departmentName, employeeCount) {
  return `
          <li onclick="sidebarFilter({ 'department': ['${departmentName
            .trim()
            .toLowerCase()}'] })">
            <a href="#">
              <div class="dept-details">
                <div class="dept-names">${departmentName}</div>
                <div class="employee-dept-count">${employeeCount}</div>
              </div>
            </a>
          </li>
          `;
}

function handleEmployeesPage(url) {
  if (url == "./html/employees.html") {
    loadEmployees();
    generateAlphabetButtons();
  }
}

function handleAddEmployeePage(url) {
  if (url == "./html/addEmployee.html") {
    const profileImageInput = document.getElementById("profileImageInput");
    const addProfilePhotoButton = document.getElementById(
      "addProfilePhotoButton"
    );

    if (profileImageInput && addProfilePhotoButton) {
      addProfilePhotoButton.addEventListener("click", openProfileImageInput);
      profileImageInput.addEventListener("change", previewProfileImage);
    }
  }
}

function handleAddRolesPage(url) {
  if (url == "./html/addRoles.html") {
    const selected = document.querySelector(".select-selected");
    const options = document.querySelector(".select-items");
    selected.addEventListener("click", toggleSelectOptions);
    const checkboxes = document.querySelectorAll(
      ".select-items input[type='checkbox']"
    );
    checkboxes.forEach(handleCheckbox);
  }
}

function toggleSelectOptions() {
  const options = document.querySelector(".select-items");
  options.classList.toggle("select-hide");
}

// Generate alphabet buttons for alphabet filtering
function generateAlphabetButtons() {
  const alphabetsContainer = document.getElementById("alphabetsContainer");
  for (let i = 65; i <= 90; i++) {
    const alphabetChar = String.fromCharCode(i);
    const alphabetButton = document.createElement("div");
    alphabetButton.classList.add(
      "alph-btn",
      `btn-${alphabetChar.toLowerCase()}`
    );
    alphabetButton.textContent = alphabetChar;
    alphabetButton.addEventListener("click", function () {
      filterEmployeesByAlphabet(this);
    });
    alphabetsContainer.appendChild(alphabetButton);
  }
}

//Form validation and submission functions
function handleInputField(input) {
  input.addEventListener("focus", validateInput);
  input.addEventListener("input", validateInput);
  input.addEventListener("blur", validateInput);
}

function validateInput() {
  if (this.value.trim() === "") {
    showErrorMessage(this);
  } else {
    hideErrorMessage(this);
  }
}

function openProfileImageInput() {
  document.getElementById("profileImageInput").click();
}

function previewProfileImage(event) {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function () {
      const profileImagePreview = document.getElementById(
        "profileImagePreview"
      );
      if (profileImagePreview) {
        profileImagePreview.src = reader.result;
      }
    };
    reader.readAsDataURL(selectedFile);
  }
}

function showErrorMessage(input) {
  const errorMessage = input.nextElementSibling;
  errorMessage.classList.add("active");
}

function hideErrorMessage(input) {
  const errorMessage = input.nextElementSibling;
  errorMessage.classList.remove("active");
}

function validateForm(formData) {
  const requiredFields = ["empNo", "firstName", "lastName", "email"];
  let formIsValid = true;
  requiredFields.forEach(function (field) {
    const inputElement = document.getElementById(field);
    if (!inputElement.value.trim()) {
      showErrorMessage(inputElement);
      formIsValid = false;
    } else {
      hideErrorMessage(inputElement);
    }
  });

  return formIsValid;
}

function handleFormSubmit() {
  const form = document.getElementById("employeeForm");
  const formData = new FormData(form);

  if (validateForm(formData)) {
    const employee = createEmployeeFromFormData(formData);
    saveEmployeeToLocalStorage(employee);
    form.reset();
    alert("Employee data added successfully!");
    loadEmployees();
  }
}

function handleCheckbox(checkbox) {
  checkbox.addEventListener("click", updateSelectedOptions);
}

function updateSelectedOptions() {
  const checkboxes = document.querySelectorAll(
    ".select-items input[type='checkbox']"
  );
  const selectedOptions = [];
  checkboxes.forEach(function (cb) {
    if (cb.checked) {
      selectedOptions.push(cb.value);
    }
  });
  const selected = document.querySelector(".select-selected");
  selected.textContent = selectedOptions.length
    ? selectedOptions.join(", ")
    : "Select an option";
}

// Responsiveness for SideBar
function handleSidebarResponsive() {
  var sideBar = document.querySelector(".sidebar");
  if (sideBar) {
    if (window.innerWidth <= 900) {
      sideBar.classList.remove("active");
    } else {
      sideBar.classList.add("active");
    }
  }
}


// Functions to get employee data from the form and save it to local storage
function createEmployeeFromFormData(formData) {
  const empNo = formData.get("empNo");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const dob = formData.get("dob");
  const email = formData.get("email");
  const mobileNumber = formData.get("mobileNumber");
  const joiningDate = formData.get("joiningDate");
  const location = formData.get("location");
  const jobTitle = formData.get("jobTitle");
  const department = formData.get("department");
  const assignManager = formData.get("assignManager");
  const assignProject = formData.get("assignProject");

  let profileImageBase64 = "../assets/default-user.png";
  const profileImageInput = formData.get("profileImage");

  if (profileImageInput.size > 0) {
    const reader = new FileReader();
    reader.readAsDataURL(profileImageInput);
    reader.onload = function () {
      profileImageBase64 = reader.result;
      createAndSaveEmployee(empNo, firstName, lastName, dob, email, mobileNumber, joiningDate, location, jobTitle, department, assignManager, assignProject, profileImageBase64);
    };
  } else {
    createAndSaveEmployee(empNo, firstName, lastName, dob, email, mobileNumber, joiningDate, location, jobTitle, department, assignManager, assignProject, profileImageBase64);
  }
}

function createAndSaveEmployee(empNo, firstName, lastName, dob, email, mobileNumber, joiningDate, location, jobTitle, department, assignManager, assignProject, profileImageBase64) {
  const employee = new Employee(
    empNo,
    firstName,
    lastName,
    dob,
    email,
    mobileNumber,
    joiningDate,
    true,
    location,
    jobTitle,
    department,
    assignManager,
    assignProject,
    profileImageBase64
  );

  saveEmployeeToLocalStorage(employee);
}

function saveEmployeeToLocalStorage(employee) {
  let existingData = getAllEmployeesFromLocalStorage() || [];
  if (employee) {
    existingData.push(employee);
    localStorage.setItem("employees", JSON.stringify(existingData));
  }
  const defaultImageSource = "../assets/default-user.png";
  const profileImagePreview = document.getElementById("profileImagePreview");
  profileImagePreview.src = defaultImageSource;
}

function getAllEmployeesFromLocalStorage() {
  return JSON.parse(localStorage.getItem("employees")) || [];
}

function toggleDeleteButtonVisibility() {
  const deleteButton = document.querySelector(".btn-delete");
  const allCheckboxes = document.querySelectorAll(".check-box-col input");
  let anyChecked = false;

  allCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      console.log(checkbox.checked);
      anyChecked = true;
      return;
    }
  });

  deleteButton.disabled = !anyChecked;
}

// Function to delete rows(data) whose checkbox are checked from local storage
function deleteSelectedRows() {
  const allCheckboxes = document.querySelectorAll(".check-box-col input");
  let selectedRows = [];
  allCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      let row = checkbox.closest("tr");
      selectedRows.push(row);
    }
  });
  let existingData = getAllEmployeesFromLocalStorage();
  selectedRows.forEach(function (row) {
    let empNo = row.querySelector(".col-emp-no").textContent;
    let index = existingData.findIndex((emp) => emp.empNo === empNo);
    if (index !== -1) {
      existingData.splice(index, 1);
    }
    row.remove();
  });
  localStorage.setItem("employees", JSON.stringify(existingData));
  toggleDeleteButtonVisibility();
  alert("Successfully deleted " + selectedRows.length + " employees data");
  loadEmployees();
}

function loadEmployees() {
  let employees = getAllEmployeesFromLocalStorage();
  if (employees) {
    renderEmployees(employees);
    
  }
}

// handle filtration of data on basis of alphabets
function filterEmployeesByAlphabet(element) {
  var alphBtns = document.querySelectorAll(".alph-btn");
  var filterBtn = document.querySelector(".icon-filter");
  element.classList.toggle("active");
  filterBtn.classList.add("active");

  selectedFilters.alphabet = [];
  alphBtns.forEach(function (btn) {
    if (btn.classList.contains("active")) {
      selectedFilters.alphabet.push(btn.textContent.trim().toLowerCase());
    }
  });
  var noActiveAlphabets = selectedFilters.alphabet.length === 0;
  if (noActiveAlphabets) {
    filterBtn.classList.remove("active");
  }
  renderEmployees(getFilteredData(selectedFilters));
}

// Handle export of data to CSV
function exportCSV() {
  let csvContent = tableToCSV();
  downloadCSVFile(csvContent);
}

function tableToCSV() {
  let table = document.querySelector(".employees-table");
  let columnsToRemove = ["", "STATUS", "more_horiz"];
  let headers = Array.from(table.querySelectorAll("th")).map((header) => {
    let firstSpan = header.querySelector("span:first-child");
    return firstSpan ? firstSpan.textContent.trim() : "";
  });
  let filteredHeaders = headers.filter(
    (header) => !columnsToRemove.includes(header)
  );
  let rows = table.querySelectorAll("tbody tr");
  let csvContent = '"' + filteredHeaders.join('","') + '"\n';
  rows.forEach((row) => {
    let rowData = Array.from(row.querySelectorAll("td")).map((cell, index) => {
      if (!columnsToRemove.includes(headers[index])) {
        let cellData = cell.textContent.trim();
        return '"' + cellData.replace(/"/g, '""') + '"';
      }
      return "";
    });
    rowData = rowData.filter((cell) => cell !== "");
    if (rowData.length > 0) {
      csvContent += rowData.join(",") + "\n";
    }
  });
  return csvContent;
}

function downloadCSVFile(csvContent) {
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "employees.csv");
  link.click();
}

// Handle grid layout on responsiveness change
function updateGridTemplateColumns() {
  var screenWidth = window.innerWidth;
  var sideBar = document.querySelector(".sidebar");
  var gridContainer = document.querySelector(".grid-container");
  if (screenWidth > 900 && sideBar.classList.contains("active")) {
    gridContainer.style.gridTemplateColumns = "20% 80%";
  } else {
    gridContainer.style.gridTemplateColumns = "100%";
  }
}

function toggleSubSecClass(
  element,
  containerSelectors,
  removeContainers,
  removeActiveSubSec
) {
  if (element.classList.contains("unlocked")) {
    if (element.classList.contains("active")) {
      element.classList.remove("active");
      containerSelectors.forEach(function (containerSelector) {
        let container = document.querySelector(containerSelector);
        container.classList.remove("active");
      });
    } else {
      if (window.innerWidth <= 900) {
        var sideBar = document.querySelector(".sidebar");
        if (sideBar.classList.contains("active")) {
          toggleSideBar();
        }
      }
      document.querySelectorAll(".sub-sec").forEach(function (subSec) {
        subSec.classList.remove("active");
      });
      element.classList.add("active");
      containerSelectors.forEach(function (containerSelector) {
        let container = document.querySelector(containerSelector);
        container.classList.add("active");
      });
    }
    removeContainers.forEach(function (removeContainer) {
      document.querySelector(removeContainer).classList.remove("active");
    });
  }
  resetFilter();
}

function openRoleDescription(element) {
  var rolesDesc1 = document.querySelector(".roles-desc-1");
  var rolesDesc2 = document.querySelector(".roles-desc-2");
  var rolesDescContainer = document.querySelector(".roles-desc-container");
  var rolesContainer = document.querySelector(".roles-container");
  var functionContainerRoles = document.querySelector(
    ".function-container.roles"
  );
  var filterContainer = document.querySelector(".filter-container");
  if (!rolesDescContainer.classList.contains("active")) {
    rolesContainer.classList.remove("active");
    filterContainer.classList.remove("active");
    functionContainerRoles.classList.remove("active");
    rolesDesc1.classList.add("active");
    rolesDesc2.classList.add("active");
    rolesDescContainer.classList.add("active");
  }
}

function toggleSideBarListClass(element, containerSelectors) {
  if (element.classList.contains("active")) {
    element.classList.remove("active");
    containerSelectors.forEach(function (containerSelector) {
      var container = document.querySelector(containerSelector);
      container.classList.remove("active");
    });
  } else {
    element.classList.add("active");
    containerSelectors.forEach(function (containerSelector) {
      var container = document.querySelector(containerSelector);
      container.classList.add("active");
    });
  }
}

function handleAddEmployeeBtn(element, removeContainers) {
  let addEmployeePage = document.querySelector(".add-employee-container");
  if (addEmployeePage.classList.contains("active")) {
    element.classList.remove("active");
  } else {
    removeContainers.forEach(function (removeContainer) {
      let container = document.querySelector(removeContainer);
      container.classList.remove("active");
    });
    addEmployeePage.classList.add("active");
  }
}

function handleAddRoleBtn(element, removeContainers) {
  let addRolesPage = document.querySelector(".add-roles-container");
  if (addRolesPage.classList.contains("active")) {
    element.classList.remove("active");
  } else {
    addRolesPage.classList.add("active");
  }
  removeContainers.forEach(function (removeContainer) {
    let container = document.querySelector(removeContainer);
    container.classList.remove("active");
  });
}

function toggleFilterClass(element, containerSelectors) {
  var employeesContainer = document.querySelector(".sub-sec.employees");
  var btnStatus = document.querySelector(".btn-status");
  if (element.classList.contains("active")) {
    element.classList.remove("active");
    containerSelectors.forEach(function (containerSelector) {
      var container = document.querySelector(containerSelector);
      container.classList.remove("active");
    });
    btnStatus.classList.remove("active");
  } else {
    element.classList.add("active");
    containerSelectors.forEach(function (containerSelector) {
      var container = document.querySelector(containerSelector);
      container.classList.add("active");
    });
    btnStatus.classList.add("active");
  }
}

function toggleAlphBtn(element) {
  var alphBtns = document.querySelectorAll(".alph-btn");
  alphBtns.forEach(function (btn) {
    if (btn !== element) {
      btn.classList.remove("active");
    }
  });
  element.classList.toggle("active");
}

function toggleSideBar() {
  var sideBar = document.querySelector(".sidebar");
  var gridContainer = document.querySelector(".grid-container");
  var sidebarHandleIcon = document.querySelector(".sidebar-handle-icon img");
  if (sideBar.classList.contains("active")) {
    sideBar.classList.remove("active");
    gridContainer.style.gridTemplateColumns = "6% 94%";
    document.querySelectorAll(".sub-sec-left-left img").forEach(function (img) {
      img.style.paddingLeft = "0.5rem";
    });
    document.querySelector(".sidebar-roles-icon").style.paddingLeft = "0.3rem";
    document.querySelector(".sidebar-assign-user-icon").style.paddingLeft =
      "0.3rem";
    sidebarHandleIcon.style.transform = "rotate(-180deg)";
  } else {
    sideBar.classList.add("active");
    gridContainer.style.gridTemplateColumns = "20% 80%";
    document.querySelectorAll(".sub-sec-left-left img").forEach(function (img) {
      img.style.paddingLeft = "1rem";
    });
    document.querySelector(".sidebar-roles-icon").style.paddingLeft = "1rem";
    document.querySelector(".sidebar-assign-user-icon").style.paddingLeft =
      "1rem";
    sidebarHandleIcon.style.transform = "rotate(360deg)";
  }
}

function handleUpdateDismiss() {
  var updateContainer = document.querySelector(".update-message");
  updateContainer.classList.remove("active");
}

function addCheckboxEventListener() {
  var allCheckbox = document.getElementById("all-checkbox");
  const deleteButtonContainer = document.querySelector(".delete-button");
  if (allCheckbox) {
    allCheckbox.addEventListener("change", function () {
      var isChecked = this.checked;
      var checkboxes = document.querySelectorAll(".check-box-col input");
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = isChecked;
      });
    });
    if (allCheckbox.checked) {
      deleteButtonContainer.classList.toggle("active");
    }
  }
}

function handleBurger(burgerContainer) {
  var dropdownContent = document.querySelector(".dropdown-content-header");
  if (dropdownContent.classList.contains("active")) {
    dropdownContent.classList.remove("active");
  } else {
    dropdownContent.classList.add("active");
  }
}

function handleFilterDropdown(element) {
  if (element.classList.contains("active")) {
    element.classList.remove("active");
  } else {
    element.classList.add("active");
  }
}

function resetFilter() {
  var dropdownButtons = document.querySelectorAll(".filter-btn");
  var dropdownOptions = document.querySelectorAll(".dropdown-options");
  var dropdown = document.querySelector(".dropdown");
  var alphBtns = document.querySelectorAll(".alph-btn");
  alphBtns.forEach(function (btn) {
    btn.classList.remove("active");
  });
  dropdownButtons.forEach(function (button) {
    button.querySelector("div").textContent =
      button.getAttribute("data-default-text");
    var dropdownContent = button
      .closest(".dropdown")
      .querySelector(".dropdown-content");
    dropdownContent.classList.remove("active");
  });
  dropdown.classList.remove("active");
  dropdownOptions.forEach(function (dropdownOption) {
    if (dropdownOption.classList.contains("active"))
      dropdownOption.classList.remove("active");
    dropdownOption.classList.remove("selected");
  });
  document.querySelector(".btn-reset").disabled = true;
  document.querySelector(".btn-apply").disabled = true;
  selectedFilters.status = [];
  selectedFilters.department = [];
  selectedFilters.location = [];
  selectedFilters.alphabet = [];
  renderEmployees(getFilteredData(selectedFilters));
}

// handle sorting of columns in the table
function sortTable(n) {
  let table = document.getElementById("employeesTable");
  let switching = true;
  let direction = "ascending";
  let count = 0;
  let rows, i, x, y;
  while (switching) {
    switching = false;
    rows = table.rows;
    let shouldSwitch = false;
    for (i = 1; i < rows.length - 1; i++) {
      x = rows[i].getElementsByTagName("TD")[n].textContent.toLowerCase();
      y = rows[i + 1].getElementsByTagName("TD")[n].textContent.toLowerCase();
      if (
        (direction === "ascending" && x > y) ||
        (direction === "descending" && x < y)
      ) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      count++;
    } else {
      if (count == 0 && direction === "ascending") {
        direction = "descending";
        switching = true;
      }
    }
  }
}

function ellipsisFunction(icon) {
  let menu = icon.nextElementSibling;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function deleteRow(row) {
  var tableRow = row.closest("tr");
  var tableBody = tableRow.parentNode;
  var rowIndex = Array.from(tableBody.children).indexOf(tableRow);
  var existingData = getAllEmployeesFromLocalStorage();
  existingData.splice(rowIndex, 1);
  localStorage.setItem("employees", JSON.stringify(existingData));
  tableRow.remove();
  loadEmployees();
  alert("Employee data deleted successfully!");
  renderEmployees();
}

function handleFormFunctions(form, activeContainers, removeContainers) {
  let errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(function (errorMessage) {
    errorMessage.classList.remove("active");
  });
  activeContainers.forEach(function (container) {
    document.querySelector(container).classList.add("active");
  });
  removeContainers.forEach(function (container) {
    document.querySelector(container).classList.remove("active");
  });
  form.reset();
}

function handleAddEmployeesFormCancel(activeContainers, removeContainers) {
  let form = document.getElementById("employeeForm");
  defaultImageSource = "../assets/default-user.png";
  const profileImagePreview = document.getElementById("profileImagePreview");
  profileImagePreview.src = defaultImageSource;
  handleFormFunctions(form, activeContainers, removeContainers);
}

function handleAddRolesFormCancel(activeContainers, removeContainers) {
  let form = document.getElementById("roleForm");
  handleFormFunctions(form, activeContainers, removeContainers);
}

function getSelectedFilters() {
  const selectedFilters = {
    alphabet: getSelectedAlphabets(),
    status: getSelectedOptions(".dropdown-status"),
    location: getSelectedOptions(".dropdown-location"),
    department: getSelectedOptions(".dropdown-department"),
  };
  return selectedFilters;
}

function getSelectedAlphabets() {
  const selectedAlphabets = [];
  var alphBtns = document.querySelectorAll(".alph-btn");
  alphBtns.forEach(function (btn) {
    if (btn.classList.contains("active")) {
      const alphabet = btn.textContent.trim().toLowerCase();
      if (!selectedAlphabets.includes(alphabet)) {
        selectedAlphabets.push(alphabet);
      }
    }
  });
  return selectedAlphabets;
}

function getSelectedOptions(selector) {
  const selectedOptions = [];
  const selectedElements = document.querySelectorAll(
    `${selector} .dropdown-options.selected`
  );
  selectedElements.forEach((option) => {
    const value = option.getAttribute("value").trim().toLowerCase();
    if (!selectedOptions.includes(value)) {
      selectedOptions.push(value);
    }
  });
  return selectedOptions;
}

function selectOption(option) {
  option.classList.toggle("selected");
  option.classList.toggle("active");

  const value = option.getAttribute("value").trim().toLowerCase();
  const dropdownOptions = document.querySelectorAll(".dropdown-options");

  dropdownOptions.forEach((dropdownOption) => {
    if (dropdownOption.getAttribute("value").trim().toLowerCase() === value) {
      dropdownOption.classList.toggle(
        "selected",
        option.classList.contains("selected")
      );
      dropdownOption.classList.toggle(
        "active",
        option.classList.contains("active")
      );
    }
  });

  handleFilterBar();
}

function handleFilterBar() {
  var dropdownButtons = document.querySelectorAll(".filter-btn");

  var totalSelectedCount = 0;
  dropdownButtons.forEach(function (button) {
    var dropdownContent = button.nextElementSibling;
    var selectedOptions = dropdownContent.querySelectorAll(
      ".dropdown-options.selected.active"
    );
    var selectedCount = selectedOptions.length;
    button.querySelector("div").textContent =
      selectedCount > 0
        ? selectedCount + " Selected"
        : button.getAttribute("data-default-text");
    totalSelectedCount += selectedCount;
  });
  var resetButton = document.querySelector(".btn-reset");
  var applyButton = document.querySelector(".btn-apply");
  if (totalSelectedCount > 0) {
    resetButton.disabled = false;
    applyButton.disabled = false;
  } else {
    updateFilteredResults();
    resetButton.disabled = true;
    applyButton.disabled = true;
  }
}

function sidebarFilter(selectedFilter) {
  let selectedFilters = getSelectedFilters();
  const departmentName = selectedFilter.department[0];
  selectedFilters.department = [departmentName];
  const allDepartmentDivs = document.querySelectorAll(".dropdown-options");
  allDepartmentDivs.forEach((departmentDiv) => {
    const departmentValue = departmentDiv
      .getAttribute("value")
      .trim()
      .toLowerCase();
    const isActiveDepartment =
      selectedFilter.department.includes(departmentValue);
    if (isActiveDepartment) {
      departmentDiv.classList.add("active");
      departmentDiv.classList.add("selected");
    } else {
      departmentDiv.classList.remove("active");
      departmentDiv.classList.remove("selected");
    }
  });
  handleFilterBar();
  const applyButton = document.querySelector(".btn-apply");
  const resetButton = document.querySelector(".btn-reset");
  applyButton.disabled = false;
  resetButton.disabled = false;
  if (selectedFilter.department.length === 0) {
    applyButton.disabled = true;
    resetButton.disabled = true;
  }
  if (selectedFilter.department.length > 0) {
    renderEmployees(getFilteredData(selectedFilters));
  } else {
    renderEmployees();
  }
}

function updateFilteredResults() {
  let selectedFilters = getSelectedFilters();
  console.log("Update Filtered Results", selectedFilters);
  renderEmployees(getFilteredData(selectedFilters));
}

function getFilteredData(selectedFilters = { alphabet: [], status: [], department: [], location: [] }) {
  const employees = getAllEmployeesFromLocalStorage();

  return employees.filter(employee => {
    const firstName = employee.firstName ? employee.firstName.toLowerCase() : "n/a";
    const lastName = employee.lastName ? employee.lastName.toLowerCase() : "n/a";
    const email = employee.email ? employee.email.toLowerCase() : "n/a";
    const location = employee.location ? employee.location.toLowerCase() : "n/a";
    const department = employee.department ? employee.department.toLowerCase() : "n/a";
    const role = employee.jobTitle ? employee.jobTitle.toLowerCase() : "n/a";
    const empNo = employee.empNo ? employee.empNo : "n/a";
    const status = employee.status ? "active" : "inactive";

    const matchesFilters =
      (selectedFilters.alphabet.length === 0 || selectedFilters.alphabet.some(alphabet => firstName.startsWith(alphabet.toLowerCase()))) &&
      (selectedFilters.status.length === 0 || selectedFilters.status.includes(status)) &&
      (selectedFilters.department.length === 0 || selectedFilters.department.includes(department)) &&
      (selectedFilters.location.length === 0 || selectedFilters.location.includes(location));

    return matchesFilters;
  });
}

function renderEmployees(filteredData) {
  const tableBody = document.querySelector(".employees-table tbody");
  tableBody.innerHTML = "";
  console.log(filteredData);
  filteredData.forEach(employee => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="check-box-col"><input type="checkbox"/></td>
      <td class="col col-user">
        <div class="profile-card emp-card">
          <img src="${employee.profileImageBase64}" alt="Employee Image" class="employee-img" />
          <div class="profile-details">
            <p class="profile-name">${employee.firstName} ${employee.lastName}</p>
            <p class="profile-email">${employee.email}</p>
          </div>
        </div>
      </td>
      <td class="col col-location">${employee.location}</td>
      <td class="col col-department">${employee.department}</td>
      <td class="col col-role">${employee.jobTitle}</td>
      <td class="col col-emp-no">${employee.empNo}</td>
      <td class="col col-status">
        <div class="btn-active">${employee.status ? "Active" : "Inactive"}</div>
      </td>
      <td class="col col-join-dt">${employee.joiningDate}</td>
      <td>
        <span class="material-icons-outlined ellipsis-icon" onclick="ellipsisFunction(this)">more_horiz</span>
        <div class="ellipsis-menu">
          <ul>
            <li><a href="#" onclick="viewDetails()">View Details</a></li>
            <li><a href="#" onclick="editRow()">Edit</a></li>
            <li onclick="deleteRow(this)"><a href="#">Delete</a></li>
          </ul>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  populateDepartmentList();
}