document.addEventListener("DOMContentLoaded", function () {
  function includeHTML(url, containerId) {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        updateGridTemplateColumns();
        let container = document.getElementById(containerId);
        if (container) {
          container.innerHTML += data;
        }
        const employees = JSON.parse(localStorage.getItem("employees")) || [];
        const departmentCounts = {};
        employees.forEach((employee) => {
          const department = employee.department;
          departmentCounts[department] =
            (departmentCounts[department] || 0) + 1;
        });
        const departmentList = document.getElementById("departmentList");
        departmentList.innerHTML = "";
        function generateDepartmentListItem(departmentName, employeeCount) {
          return `
            <li onclick="filterByEach('${departmentName
              .trim()
              .toLowerCase()}')">
                <a href="#">
                    <div class="dept-details">
                        <div class="dept-names" >${departmentName}</div>
                        <div class="employee-dept-count">${employeeCount}</div>
                    </div>
                </a>
            </li>
        `;
        }
        for (const departmentName in departmentCounts) {
          const employeeCount = departmentCounts[departmentName];
          const departmentListItemHTML = generateDepartmentListItem(
            departmentName,
            employeeCount
          );
          departmentList.insertAdjacentHTML(
            "beforeend",
            departmentListItemHTML
          );
        }
        updateGridTemplateColumns();
        checkScreenSize();
        updateGridTemplateColumns();
        const allCheckboxes = document.querySelectorAll(".check-box-col input");
        document.addEventListener("change", function (event) {
          const target = event.target;
          if (target.matches(".check-box-col input")) {
            toggleDeleteButtonVisibility();
          }
        });

        window.addEventListener("resize", function () {
          checkScreenSize();
        });

        if (url == "addEmployee.html") {
          const form = document.getElementById("employeeForm");
          form.addEventListener("submit", handleFormSubmit);
          const inputFields = form.querySelectorAll(
            "input[required], select[required]"
          );
          inputFields.forEach(function (input) {
            input.addEventListener("focus", function () {
              if (this.value.trim() === "") {
                showErrorMessage(this);
              }
            });
            input.addEventListener("input", function () {
              if (this.value.trim() === "") {
                showErrorMessage(this);
              } else {
                hideErrorMessage(this);
              }
            });
            input.addEventListener("blur", function () {
              hideErrorMessage(this);
            });
          });
          const profileImageInput =
            document.getElementById("profileImageInput");
          const addProfilePhotoButton = document.getElementById(
            "addProfilePhotoButton"
          );

          addProfilePhotoButton.addEventListener("click", function (event) {
            event.preventDefault();
            profileImageInput.click();
          });
          profileImageInput.addEventListener("change", function (event) {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
              const reader = new FileReader();
              reader.onload = function () {
                const profileImagePreview = document.getElementById(
                  "profileImagePreview"
                );
                profileImagePreview.src = reader.result;
              };
              reader.readAsDataURL(selectedFile);
            }
          });
        }
        if (url == "employees.html") {
          loadEmployees();
          generateAlphabetButtons();
          const deleteButton = document.querySelector(".delete-button");
        }
        if (url == "addRoles.html") {
          var selected = document.querySelector(".select-selected");
          var options = document.querySelector(".select-items");
          selected.addEventListener("click", function () {
            options.classList.toggle("select-hide");
          });
          var checkboxes = document.querySelectorAll(
            ".select-items input[type='checkbox']"
          );
          checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener("click", function () {
              var selectedOptions = [];
              checkboxes.forEach(function (cb) {
                if (cb.checked) {
                  selectedOptions.push(cb.value);
                }
              });
              selected.textContent = selectedOptions.length
                ? selectedOptions.join(", ")
                : "Select an option";
            });
          });
        }
        addCheckboxEventListener();
      })
      .catch((error) => console.error(`Error fetching ${url}:`, error));
  }

  includeHTML("sidebar.html", "include-sidebar");
  includeHTML("header.html", "include-header");
  includeHTML("employees.html", "include-employees");
  includeHTML("addEmployee.html", "include-add-employee");
  includeHTML("role.html", "include-role");
  includeHTML("addRoles.html", "include-new-role");
  includeHTML("roleDesc.html", "include-role-desc");

  function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById("employeeForm");
    const formData = new FormData(form);

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
    const profileImageInput = formData.get("profileImage");

    let profileImageBase64 = "";
    if (profileImageInput) {
      const reader = new FileReader();
      reader.readAsDataURL(profileImageInput);
      reader.onload = function () {
        profileImageBase64 = reader.result;
        saveToLocalStorage(
          empNo,
          firstName,
          lastName,
          dob,
          email,
          mobileNumber,
          joiningDate,
          location,
          jobTitle,
          department,
          assignManager,
          assignProject,
          profileImageBase64
        );
        form.reset();
        const defaultImageSource = "../assets/default-user.png";
        const profileImagePreview = document.getElementById(
          "profileImagePreview"
        );
        profileImagePreview.src = defaultImageSource;
        alert("Employee data has been stored in local storage!");
        renderEmployees(getAllEmployeesFromLocalStorage());
      };
    } else {
      saveToLocalStorage(
        empNo,
        firstName,
        lastName,
        dob,
        email,
        mobileNumber,
        joiningDate,
        location,
        jobTitle,
        department,
        assignManager,
        assignProject,
        profileImageBase64
      );
      form.reset();
      alert("Employee data has been stored in local storage!");
      renderEmployees(getAllEmployeesFromLocalStorage());
    }
    window.location.reload(true);
  }

  function saveToLocalStorage(
    empNo,
    firstName,
    lastName,
    dob,
    email,
    mobileNumber,
    joiningDate,
    location,
    jobTitle,
    department,
    assignManager,
    assignProject,
    profileImageBase64
  ) {
    let existingData = JSON.parse(localStorage.getItem("employees")) || [];
    const employeeData = {
      empNo: empNo,
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      email: email,
      mobileNumber: mobileNumber,
      joiningDate: joiningDate,
      location: location,
      jobTitle: jobTitle,
      department: department,
      assignManager: assignManager,
      assignProject: assignProject,
      profileImageBase64: profileImageBase64,
    };
    existingData.push(employeeData);
    localStorage.setItem("employees", JSON.stringify(existingData));
  }

  function getAllEmployeesFromLocalStorage() {
    return JSON.parse(localStorage.getItem("employees")) || [];
  }

  function showErrorMessage(input) {
    var nextSpan = input.nextElementSibling;
    nextSpan.classList.add("active");
  }

  function hideErrorMessage(input) {
    var nextSpan = input.nextElementSibling;
    nextSpan.classList.remove("active");
  }

  function checkScreenSize() {
    var sideBar = document.querySelector(".sidebar");
    if (sideBar) {
      if (window.innerWidth <= 900) {
        sideBar.classList.remove("active");
      } else {
        sideBar.classList.add("active");
      }
    }
  }
});

function toggleDeleteButtonVisibility() {
  const deleteButton = document.querySelector(".btn-delete");
  const allCheckboxes = document.querySelectorAll(".check-box-col input");
  let anyChecked = false;
  allCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      anyChecked = true;
      return;
    }
  });
  deleteButton.disabled = !anyChecked;
}

function deleteSelectedRows() {
  const allCheckboxes = document.querySelectorAll(".check-box-col input");
  let selectedRows = [];
  allCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      let row = checkbox.closest("tr");
      selectedRows.push(row);
    }
  });
  let existingData = JSON.parse(localStorage.getItem("employees")) || [];
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
  alert(selectedRows.length + " rows deleted");
  location.reload();
}

function loadEmployees() {
  let employees = localStorage.getItem("employees");
  if (employees) {
    employees = JSON.parse(employees);
    renderEmployees(employees);
  }
}

function filterEmployeesByAlphabet(alphabet, element) {
  var alphBtns = document.querySelectorAll(".alph-btn");
  var filterBtn = document.querySelector(".icon-filter");
  alphBtns.forEach(function (btn) {
    if (btn !== element) {
      btn.classList.remove("active");
    }
  });
  element.classList.toggle("active");
  var noActiveAlphabets = true;
  alphBtns.forEach(function (btn) {
    if (btn.classList.contains("active")) {
      noActiveAlphabets = false;
    }
  });
  let employees = JSON.parse(localStorage.getItem("employees")) || [];
  if (noActiveAlphabets) {
    filterBtn.classList.remove("active");
    renderEmployees(employees);
    return;
  }
  let filteredEmployees = employees.filter(function (employee) {
    let fullName = (employee.firstName + " " + employee.lastName).toUpperCase();
    return fullName.startsWith(alphabet);
  });
  filterBtn.classList.add("active");
  renderEmployees(filteredEmployees);
}

function tableToCSV() {
  let table = document.querySelector(".employees-table");
  let columnsToRemove = ["STATUS", "more_horiz"];
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
  downloadCSVFile(csvContent);
}

function downloadCSVFile(csvContent) {
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "employees.csv");
  link.click();
}

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
      removeContainers.forEach(function (removeContainer) {
        let container = document.querySelector(removeContainer);
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
      removeActiveSubSec.forEach(function (activeSubSec) {
        let container = document.querySelector(activeSubSec);
        if (container.classList.contains("active")) {
          container.classList.remove("active");
        }
      });
      containerSelectors.forEach(function (containerSelector) {
        let container = document.querySelector(containerSelector);
        container.classList.add("active");
      });
    }
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
  let addEmployeePage = document.querySelector(".add-roles-container");
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
    gridContainer.style.gridTemplateColumns = "5% 95%";
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

function selectOption(option) {
  var dropdownButton = option.closest(".dropdown").querySelector(".filter-btn");
  var dropdownContent = option
    .closest(".dropdown")
    .querySelector(".dropdown-content");
  option.classList.toggle("selected");
  option.classList.toggle("active");
  var selectedOptions = dropdownContent.querySelectorAll(
    ".dropdown-options.selected"
  );
  var selectedCount = selectedOptions.length;
  if (selectedCount === 0) {
    dropdownButton.querySelector("div").textContent =
      dropdownButton.getAttribute("data-default-text");
    loadEmployees();
  } else {
    dropdownButton.querySelector("div").textContent =
      selectedCount + " Selected";
  }
  var filterRightButtons = document.querySelector(".filter-container-right");
  if (selectedCount > 0) {
    document.querySelector(".btn-reset").disabled = false;
    document.querySelector(".btn-apply").disabled = false;
  } else {
    document.querySelector(".btn-reset").disabled = true;
    document.querySelector(".btn-apply").disabled = true;
  }
}

function resetFilter() {
  var dropdownButtons = document.querySelectorAll(".filter-btn");
  var dropdownOptions = document.querySelectorAll(".dropdown-options");
  var filterRightButtons = document.querySelector(".filter-container-right");
  var dropdown = document.querySelector(".dropdown");
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
  loadEmployees();
}

let direction = "ascending";
function filterByEach(departmentName) {
  const filters = { department: [departmentName] };
  const employees = localStorage.getItem("employees");
  if (employees) {
    const parsedEmployees = JSON.parse(employees);
    renderEmployees(parsedEmployees, filters);
  }
  document.querySelector(".btn-reset").disabled = false;
}

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
  var existingData = JSON.parse(localStorage.getItem("employees")) || [];
  existingData.splice(rowIndex, 1);
  localStorage.setItem("employees", JSON.stringify(existingData));
  tableRow.remove();
  loadEmployees();
  alert("Row deleted");
  location.reload();
}

function handleFormCancel() {
  const form = document.getElementById("employeeForm");
  form.reset();
  const defaultImageSource = "../assets/default-user.png";
  const profileImagePreview = document.getElementById("profileImagePreview");
  profileImagePreview.src = defaultImageSource;
}

function updateFilteredResults() {
  const employees = JSON.parse(localStorage.getItem("employees"));
  const selectedFilters = getSelectedFilters();
  console.log(selectedFilters);
  renderEmployees(employees, selectedFilters);
}

function renderEmployees(employees, selectedFilters = {}) {
  toggleDeleteButtonVisibility();
  const tableBody = document.querySelector(".employees-table tbody");
  tableBody.innerHTML = "";
  employees.forEach(function (employee) {
    const firstName = employee.firstName ? employee.firstName : "N/A";
    const lastName = employee.lastName ? employee.lastName : "N/A";
    const email = employee.email ? employee.email : "N/A";
    const location = employee.location ? employee.location : "N/A";
    const department = employee.department ? employee.department : "N/A";
    const role = employee.jobTitle ? employee.jobTitle : "N/A";
    const empNo = employee.empNo ? employee.empNo : "N/A";
    const status = "Active";
    const joiningDate = employee.joiningDate ? employee.joiningDate : "N/A";
    const profileImageBase64 = employee.profileImageBase64;
    if (
      Object.keys(selectedFilters).length === 0 ||
      ((!selectedFilters.status ||
        selectedFilters.status.includes(status.trim().toLowerCase())) &&
        (!selectedFilters.location ||
          selectedFilters.location.includes(location.trim().toLowerCase())) &&
        (!selectedFilters.department ||
          selectedFilters.department.includes(department.trim().toLowerCase())))
    ) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="check-box-col"><input type="checkbox"/></td>
        <td class="col col-user">
          <div class="profile-card emp-card">
            <img src="${profileImageBase64}" alt="Employee Image" class="employee-img" />
            <div class="profile-details">
              <p class="profile-name">${firstName} ${lastName}</p>
              <p class="profile-email">${email}</p>
            </div>
          </div>
        </td>
        <td class="col col-location">${location}</td>
        <td class="col col-department">${department}</td>
        <td class="col col-role">${role}</td>
        <td class="col col-emp-no">${empNo}</td>
        <td class="col col-status">
          <div class="btn-active">${status}</div>
        </td>
        <td class="col col-join-dt">${joiningDate}</td>
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
    }
  });
}

const selectedFilters = {};
function getSelectedFilters() {
  const selectedFilters = {};
  const selectedStatusOptions = document.querySelectorAll(
    ".dropdown-status .dropdown-options.selected.active"
  );
  if (selectedStatusOptions.length > 0) {
    selectedFilters.status = [];
    selectedStatusOptions.forEach((option) => {
      selectedFilters.status.push(
        option.getAttribute("value").trim().toLowerCase()
      );
    });
  }

  // Retrieve selected location
  const selectedLocationOptions = document.querySelectorAll(
    ".dropdown-location .dropdown-options.selected.active"
  );
  if (selectedLocationOptions.length > 0) {
    selectedFilters.location = [];
    selectedLocationOptions.forEach((option) => {
      selectedFilters.location.push(
        option.getAttribute("value").trim().toLowerCase()
      );
    });
  }

  // Retrieve selected department
  const selectedDepartmentOptions = document.querySelectorAll(
    ".dropdown-department .dropdown-options.selected.active"
  );
  if (selectedDepartmentOptions.length > 0) {
    selectedFilters.department = [];
    selectedDepartmentOptions.forEach((option) => {
      selectedFilters.department.push(
        option.getAttribute("value").trim().toLowerCase()
      );
    });
  }

  return selectedFilters;
}
function generateAlphabetButtons() {
    const alphabetsContainer = document.getElementById("alphabetsContainer");
    for (let i = 65; i <= 90; i++) {
        const alphabetChar = String.fromCharCode(i);
        const alphabetButton = document.createElement("div");
        alphabetButton.classList.add("alph-btn", `btn-${alphabetChar.toLowerCase()}`);
        alphabetButton.textContent = alphabetChar;
        alphabetButton.addEventListener("click", function () {
            filterEmployeesByAlphabet(alphabetChar, this);
        });
        alphabetsContainer.appendChild(alphabetButton);
    }
}

