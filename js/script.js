const EMS = (function () {
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

  function includeHTML(url, containerId) {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        globalUtilityFunctions.updateGridTemplateColumns();
        let container = document.getElementById(containerId);
        if (container) {
          container.innerHTML += data;
        }
        handlePostProcessing(url);
      })
      .catch((error) => console.error(`Error fetching ${url}:`, error));
  }

  function handleEmployeesPage(url) {
    if (url == "./html/employees.html") {
      globalUtilityFunctions.loadEmployees();
      employeesPageFunctions.generateAlphabetButtons();
    }
  }

  function handleAddEmployeePage(url) {
    if (url == "./html/addEmployee.html") {
      addEmployeesPageFunctions.populateSelectOptions(
        "location",
        locationOptions
      );
      addEmployeesPageFunctions.populateSelectOptions(
        "jobTitle",
        jobTitleOptions
      );
      addEmployeesPageFunctions.populateSelectOptions(
        "department",
        departmentOptions
      );
      addEmployeesPageFunctions.populateSelectOptions(
        "assignManager",
        managerOptions
      );
      addEmployeesPageFunctions.populateSelectOptions(
        "assignProject",
        projectOptions
      );
      const profileImageInput = document.getElementById("profileImageInput");
      const addProfilePhotoButton = document.getElementById(
        "addProfilePhotoButton"
      );
      if (profileImageInput && addProfilePhotoButton) {
        addProfilePhotoButton.addEventListener(
          "click",
          addEmployeesPageFunctions.openProfileImageInput
        );
        profileImageInput.addEventListener(
          "change",
          addEmployeesPageFunctions.previewProfileImage
        );
      }
    }
  }

  function handleAddRolesPage(url) {
    if (url == "./html/addRoles.html") {
      const selected = document.querySelector(".select-selected");
      const options = document.querySelector(".select-items");
      selected.addEventListener(
        "click",
        globalUtilityFunctions.toggleSelectOptions
      );
      const checkboxes = document.querySelectorAll(
        ".select-items input[type='checkbox']"
      );
      checkboxes.forEach(employeesPageFunctions.handleCheckbox);
    }
  }

  function handlePostProcessing(url) {
    globalUtilityFunctions.handleSidebarResponsive();
    filterFunctions.populateFilterOptions();
    sideBarFunctions.populateDepartmentList();

    handleEmployeesPage(url);
    handleAddEmployeePage(url);
    handleAddRolesPage(url);
  }

  const selectedFilters = {
    alphabet: [],
    status: [],
    department: [],
    location: [],
  };

  const filterOptions = {
    status: ["Active", "Inactive", "All"],
    location: [
      "Hyderabad",
      "Delhi",
      "Mumbai",
      "Bangalore",
      "Seattle",
      "New York",
    ],
    department: [
      "IT",
      "HR",
      "Finance",
      "Product Engineering",
      "UI/UX",
      "Management",
    ],
  };

  const locationOptions = [
    "Select location",
    "Hyderabad",
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Seattle",
    "New York",
  ];

  const jobTitleOptions = [
    "Select job title",
    "UX Designer",
    "Front End Developer",
    "Back End Developer",
    "Full Stack Developer",
    "Android Developer",
    "iOS Developer",
    "Java Developer",
    "Python Developer",
    "PHP Developer",
  ];

  const departmentOptions = [
    "Select department",
    "UI/UX",
    "HR",
    "IT",
    "Product Engineering",
    "Management",
    "Finance",
  ];

  const managerOptions = [
    "Select manager",
    "None",
    "John Doe",
    "Jane Smith",
    "Michael Johnson",
  ];

  const projectOptions = [
    "Select project",
    "None",
    "Project 1",
    "Project 2",
    "Project 3",
  ];

  const sideBarFunctions = {
    toggleSubSecClass: function (
      element,
      containerSelectors,
      removeContainers,
      removeActiveSubSec
    ) {
      const form = document.getElementById("employeeForm");
      if (element.classList.contains("unlocked")) {
        if (element.classList.contains("active")) {
          element.classList.remove("active");
          form.reset();
          addEmployeesPageFunctions.resetProfileImage();
          containerSelectors.forEach(function (containerSelector) {
            let container = document.querySelector(containerSelector);
            container.classList.remove("active");
          });
        } else {
          if (window.innerWidth <= 900) {
            var sideBar = document.querySelector(".sidebar");
            if (sideBar.classList.contains("active")) {
              headerFunctions.toggleSideBar();
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
      filterFunctions.resetFilter();
      globalUtilityFunctions.resetSelectedFiltersState();
    },

    handleUpdateDismiss: function () {
      var updateContainer = document.querySelector(".update-message");
      updateContainer.classList.remove("active");
    },

    sidebarFilter: function (selectedFilter) {
      let selectedFilters = filterFunctions.getSelectedFilters();
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
      filterFunctions.handleFilterBar();
      const applyButton = document.querySelector(".btn-apply");
      const resetButton = document.querySelector(".btn-reset");
      applyButton.disabled = false;
      resetButton.disabled = false;
      if (selectedFilter.department.length === 0) {
        applyButton.disabled = true;
        resetButton.disabled = true;
      }
      if (selectedFilter.department.length > 0) {
        employeesPageFunctions.renderEmployees(
          filterFunctions.getFilteredData(selectedFilters)
        );
      } else {
        employeesPageFunctions.renderEmployees();
      }
    },

    populateDepartmentList: function () {
      const employees =
        globalUtilityFunctions.getAllEmployeesFromLocalStorage();
      const departmentCounts = {};
      if (employees) {
        employees.forEach((employee) => {
          const department = employee.department || "Others";
          departmentCounts[department] =
            (departmentCounts[department] || 0) + 1;
        });
      }
      const departmentList = document.getElementById("departmentList");
      departmentList.innerHTML = "";
      const staticDepartments = filterOptions.department;
      if (!staticDepartments.includes("Others")) {
        staticDepartments.push("Others");
      }
      staticDepartments.forEach((departmentName) => {
        const employeeCount = departmentCounts[departmentName] || 0;
        const departmentListItemHTML = this.generateDepartmentListItem(
          departmentName,
          employeeCount
        );
        departmentList.insertAdjacentHTML("beforeend", departmentListItemHTML);
        delete departmentCounts[departmentName];
      });
      for (const departmentName in departmentCounts) {
        const employeeCount = departmentCounts[departmentName];
        const departmentListItemHTML = this.generateDepartmentListItem(
          departmentName,
          employeeCount
        );
        departmentList.insertAdjacentHTML("beforeend", departmentListItemHTML);
      }
    },

    generateDepartmentListItem: function (departmentName, employeeCount) {
      return `
          <li onclick="EMS.sideBarFunctions.sidebarFilter({ 'department': ['${departmentName
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
    },
  };

  const employeesPageFunctions = {
    exportEmployeesToCSV(filename, excludedColumns) {
      const currentSelectedFilters = filterFunctions.getSelectedFilters();
      const filteredEmployees = filterFunctions.getFilteredData(
        currentSelectedFilters
      );
      globalUtilityFunctions.exportCSV(
        filename,
        excludedColumns,
        filteredEmployees
      );
    },

    handleAddEmployeeBtn: function (element, removeContainers) {
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
    },

    toggleFilterClass: function (element, containerSelectors) {
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
    },

    deleteSelectedRows: function () {
      const allCheckboxes = document.querySelectorAll(".check-box-col input");
      let selectedRows = [];
      allCheckboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
          let row = checkbox.closest("tr");
          selectedRows.push(row);
        }
      });
      let existingData =
        globalUtilityFunctions.getAllEmployeesFromLocalStorage();
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
      globalUtilityFunctions.loadEmployees();
      sideBarFunctions.populateDepartmentList();
    },

    toggleDeleteButtonVisibility: function () {
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
    },

    sortTable: function (column_number) {
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
          x = rows[i]
            .getElementsByTagName("TD")
            [column_number].textContent.toLowerCase();
          y = rows[i + 1]
            .getElementsByTagName("TD")
            [column_number].textContent.toLowerCase();
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
    },

    renderEmployees: function (filteredData) {
      const tableBody = document.querySelector(".employees-table tbody");
      tableBody.innerHTML = "";
      filteredData.forEach((employee) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td class="check-box-col"><input type="checkbox"/></td>
      <td class="col col-user">
        <div class="profile-card emp-card">
          <img src="${
            employee.profileImageBase64
          }" alt="Employee Image" class="employee-img" />
          <div class="profile-details">
            <p class="profile-name">${employee.firstName} ${
          employee.lastName
        }</p>
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
        <span class="material-icons-outlined ellipsis-icon" onclick="EMS.employeesPageFunctions.ellipsisFunction(this)">more_horiz</span>
        <div class="ellipsis-menu">
          <ul>
            <li><a href="#" onclick="EMS.employeesPageFunctions.viewDetails()">View Details</a></li>
            <li><a href="#" onclick="EMS.employeesPageFunctions.editRow()">Edit</a></li>
            <li onclick="EMS.employeesPageFunctions.deleteRow(this)"><a href="#">Delete</a></li>
          </ul>
        </div>
      </td>
    `;
        tableBody.appendChild(row);
      });
      sideBarFunctions.populateDepartmentList();
    },

    generateAlphabetButtons: function () {
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
          filterFunctions.filterEmployeesByAlphabet(this);
        });
        alphabetsContainer.appendChild(alphabetButton);
      }
    },

    deleteRow: function (row) {
      var tableRow = row.closest("tr");
      var tableBody = tableRow.parentNode;
      var rowIndex = Array.from(tableBody.children).indexOf(tableRow);
      var existingData =
        globalUtilityFunctions.getAllEmployeesFromLocalStorage();
      existingData.splice(rowIndex, 1);
      localStorage.setItem("employees", JSON.stringify(existingData));
      tableRow.remove();
      globalUtilityFunctions.loadEmployees();
      sideBarFunctions.populateDepartmentList();
      alert("Employee data deleted successfully!");
    },

    ellipsisFunction: function (icon) {
      let menu = icon.nextElementSibling;
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    },

    updateSelectedOptions: function () {
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
    },

    handleCheckbox: function (checkbox) {
      checkbox.addEventListener("click", this.updateSelectedOptions);
    },
  };

  const filterFunctions = {
    generateFilterOptions: function (options, className) {
      return options
        .map(
          (option) => `
      <div class="dropdown-options ${className}" onclick="EMS.filterFunctions.selectOption(this)" value="${option}">
        ${option}
      </div>
    `
        )
        .join("");
    },

    populateFilterOptions: function () {
      const filterContainerLeft = document.getElementById(
        "filterContainerLeft"
      );
      filterContainerLeft.innerHTML = "";
      filterContainerLeft.innerHTML = `
      <div class="dropdown dropdown-status" onclick="EMS.filterFunctions.handleFilterDropdown(this)">
        <button class="filter-btn btn-status dropbtn" data-default-text="Status">
          <div>Status</div>
          <div class="expand-more-icon">
            <span class="material-icons-outlined expand-more-icon">
              expand_more
            </span>
          </div>
        </button>
        <div class="dropdown-content">
          ${this.generateFilterOptions(filterOptions.status, "status")}
        </div>
      </div>
      <div class="dropdown dropdown-location" onclick="EMS.filterFunctions.handleFilterDropdown(this)">
        <button class="filter-btn btn-location dropbtn" data-default-text="Location">
          <div>Location</div>
          <div class="expand-more-icon">
            <span class="material-icons-outlined expand-more-icon">
              expand_more
            </span>
          </div>
        </button>
        <div class="dropdown-content">
          ${this.generateFilterOptions(filterOptions.location, "location")}
        </div>
      </div>
      <div class="dropdown dropdown-department" onclick="EMS.filterFunctions.handleFilterDropdown(this)">
        <button class="filter-btn btn-department dropbtn" data-default-text="Department">
          <div>Department</div>
          <div class="expand-more-icon">
            <span class="material-icons-outlined expand-more-icon">
              expand_more
            </span>
          </div>
        </button>
        <div class="dropdown-content">
          ${this.generateFilterOptions(filterOptions.department, "department")}
        </div>
      </div>
    `;
    },

    handleFilterDropdown: function (element) {
      if (element.classList.contains("active")) {
        element.classList.remove("active");
      } else {
        element.classList.add("active");
      }
    },

    selectOption: function (option) {
      option.classList.toggle("selected");
      option.classList.toggle("active");

      const value = option.getAttribute("value").trim().toLowerCase();
      const dropdownOptions = document.querySelectorAll(".dropdown-options");
      dropdownOptions.forEach((dropdownOption) => {
        if (
          dropdownOption.getAttribute("value").trim().toLowerCase() === value
        ) {
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

      this.handleFilterBar();
    },

    handleFilterBar: function () {
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
        this.updateFilteredResults();
        resetButton.disabled = true;
        applyButton.disabled = true;
      }
    },

    resetFilter: function () {
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
      globalUtilityFunctions.resetSelectedFiltersState();
      employeesPageFunctions.renderEmployees(
        this.getFilteredData(selectedFilters)
      );
    },

    updateFilteredResults: function () {
      let selectedFilters = this.getSelectedFilters();
      employeesPageFunctions.renderEmployees(
        this.getFilteredData(selectedFilters)
      );
    },

    getSelectedFilterOptions: function (selector) {
      const selectedOptions = [];
      const selectedElements = document.querySelectorAll(
        `${selector} .dropdown-options.selected`
      );
      selectedElements.forEach((option) => {
        const value = option.getAttribute("value").trim().toLowerCase();
        if (value === "all") {
          selectedOptions.push("active", "inactive");
        } else if (!selectedOptions.includes(value)) {
          selectedOptions.push(value);
        }
      });

      return selectedOptions;
    },

    getSelectedAlphabets: function () {
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
    },

    getSelectedFilters: function () {
      const selectedFilters = {
        alphabet: this.getSelectedAlphabets(),
        status: this.getSelectedFilterOptions(".dropdown-status"),
        location: this.getSelectedFilterOptions(".dropdown-location"),
        department: this.getSelectedFilterOptions(".dropdown-department"),
      };
      return selectedFilters;
    },

    filterEmployeesByAlphabet: function (element) {
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
      const applyButton = document.querySelector(".btn-apply");
      const resetButton = document.querySelector(".btn-reset");
      if (noActiveAlphabets) {
        filterBtn.classList.remove("active");
        applyButton.disabled = true;
        resetButton.disabled = true;
      }
      applyButton.disabled = false;
      resetButton.disabled = false;
    },

    getFilteredData: function (
      selectedFilters = {
        alphabet: [],
        status: [],
        department: [],
        location: [],
      }
    ) {
      const employees =
        globalUtilityFunctions.getAllEmployeesFromLocalStorage();
      return employees.filter((employee) => {
        const firstName = employee.firstName
          ? employee.firstName.toLowerCase()
          : "n/a";
        const location = employee.location
          ? employee.location.toLowerCase()
          : "n/a";
        const department = employee.department
          ? employee.department.toLowerCase()
          : "n/a";
        const status = employee.status ? "active" : "inactive";
        const matchesFilters =
          (selectedFilters.alphabet.length === 0 ||
            selectedFilters.alphabet.some((alphabet) =>
              firstName.startsWith(alphabet.toLowerCase())
            )) &&
          (selectedFilters.status.length === 0 ||
            selectedFilters.status.includes(status)) &&
          (selectedFilters.department.length === 0 ||
            selectedFilters.department.includes(department)) &&
          (selectedFilters.location.length === 0 ||
            selectedFilters.location.includes(location));
        return matchesFilters;
      });
    },
  };

  const globalUtilityFunctions = {
    loadEmployees: function () {
      let employees = this.getAllEmployeesFromLocalStorage();
      if (employees) {
        employeesPageFunctions.renderEmployees(employees);
      }
    },

    exportCSV(filename, excludedColumns, tableData) {
      const csvContent = globalUtilityFunctions.convertToCSV(
        tableData,
        excludedColumns
      );
      globalUtilityFunctions.downloadCSVFile(csvContent, filename);
    },

    getAllEmployeesFromLocalStorage: function () {
      return JSON.parse(localStorage.getItem("employees")) || [];
    },

    handlePostFormSubmissions: function (
      form,
      activeContainers,
      removeContainers
    ) {
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
    },

    toggleSelectOptions: function () {
      const options = document.querySelector(".select-items");
      options.classList.toggle("select-hide");
    },

    extractTableData: function () {
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
      let tableData = [];
      rows.forEach((row) => {
        let rowData = Array.from(row.querySelectorAll("td")).map(
          (cell, index) => {
            if (!columnsToRemove.includes(headers[index])) {
              let cellData = cell.textContent.trim();
              return '"' + cellData.replace(/"/g, '""') + '"';
            }
            return "";
          }
        );
        rowData = rowData.filter((cell) => cell !== "");
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });
      return { headers: filteredHeaders, data: tableData };
    },

    // Responsiveness for SideBar
    handleSidebarResponsive: function () {
      var sideBar = document.querySelector(".sidebar");

      if (sideBar) {
        if (window.innerWidth <= 900) {
          sideBar.classList.remove("active");
        } else {
          sideBar.classList.add("active");
        }
      }
    },

    // Handle grid layout on responsiveness change
    updateGridTemplateColumns: function () {
      var screenWidth = window.innerWidth;
      var sideBar = document.querySelector(".sidebar");
      var gridContainer = document.querySelector(".grid-container");
      if (screenWidth > 900 && sideBar.classList.contains("active")) {
        gridContainer.style.gridTemplateColumns = "20% 80%";
      } else {
        gridContainer.style.gridTemplateColumns = "100%";
      }
    },

    convertToCSV: function (employeesData, excludedColumns = []) {
      let csvContent = "";
      if (employeesData.length === 0) {
        return csvContent;
      }
      const headers = Object.keys(employeesData[0]);
      const filteredHeaders = headers.filter(
        (header) => !excludedColumns.includes(header)
      );
      csvContent += '"' + filteredHeaders.join('","') + '"\n';
      employeesData.forEach((rowData) => {
        let rowContent = filteredHeaders
          .map((header) => {
            let cell = rowData[header];
            if (typeof cell === "string" && cell.includes('"')) {
              cell = cell.replace(/"/g, '""');
            }
            if (typeof cell === "string" && cell.includes(",")) {
              cell = '"' + cell + '"';
            }
            return cell;
          })
          .join(",");
        csvContent += rowContent + "\n";
      });

      return csvContent;
    },

    downloadCSVFile: function (csvContent, filename) {
      let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      let url = URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.click();
      URL.revokeObjectURL(url);
    },

    resetSelectedFiltersState: function () {
      selectedFilters.alphabet = [];
      selectedFilters.status = [];
      selectedFilters.location = [];
      selectedFilters.department = [];
    },
  };

  function Employee(
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

  const addEmployeesPageFunctions = {
    populateSelectOptions: function (selectId, options) {
      const selectElement = document.getElementById(selectId);
      selectElement.innerHTML = "";
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
      });
    },

    handleAddEmployeesFormCancel: function (
      activeContainers,
      removeContainers
    ) {
      let form = document.getElementById("employeeForm");
      defaultImageSource = "../assets/default-user.png";
      const profileImagePreview = document.getElementById(
        "profileImagePreview"
      );
      profileImagePreview.src = defaultImageSource;
      globalUtilityFunctions.handlePostFormSubmissions(
        form,
        activeContainers,
        removeContainers
      );
    },

    handleFormSubmit: function () {
      const form = document.getElementById("employeeForm");
      const formData = new FormData(form);
      if (this.validateForm(formData)) {
        this.createEmployeeFromFormData(formData);
        form.reset();
        this.resetProfileImage();
        alert("Employee data added successfully!");
        globalUtilityFunctions.loadEmployees();
      }
    },

    createEmployeeFromFormData: function (formData) {
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
      const status = true;
      let newEmployee;
      if (profileImageInput.size > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(profileImageInput);
        reader.onload = () => {
          profileImageBase64 = reader.result;
          newEmployee = new Employee(
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
          );
          this.saveEmployeeToLocalStorage(newEmployee);
        };
      } else {
        newEmployee = new Employee(
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
        );
        this.saveEmployeeToLocalStorage(newEmployee);
      }
    },

    saveEmployeeToLocalStorage: function (employee) {
      let existingData =
        globalUtilityFunctions.getAllEmployeesFromLocalStorage() || [];
      if (employee) {
        existingData.push(employee);
        localStorage.setItem("employees", JSON.stringify(existingData));
      }
      const defaultImageSource = "../assets/default-user.png";
      const profileImagePreview = document.getElementById(
        "profileImagePreview"
      );
      profileImagePreview.src = defaultImageSource;
    },

    validateInput: function () {
      if (this.value.trim() === "") {
        this.showInputErrorMessage(this);
      } else {
        this.hideInputErrorMessage(this);
      }
    },

    openProfileImageInput: function () {
      document.getElementById("profileImageInput").click();
    },

    previewProfileImage: function (event) {
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
    },

    resetProfileImage: function () {
      const defaultImageSource = "../assets/default-user.png";
      const profileImagePreview = document.getElementById(
        "profileImagePreview"
      );
      profileImagePreview.src = defaultImageSource;
    },

    showInputErrorMessage: function (input) {
      const errorMessage = input.nextElementSibling;
      errorMessage.classList.add("active");
    },

    hideInputErrorMessage: function (input) {
      const errorMessage = input.nextElementSibling;
      errorMessage.classList.remove("active");
    },

    validateForm: function (formData) {
      const requiredFields = [
        "empNo",
        "firstName",
        "lastName",
        "email",
        "joiningDate",
      ];
      let formIsValid = true;
      requiredFields.forEach((field) => {
        const inputElement = document.getElementById(field);
        if (!inputElement.value.trim()) {
          this.showInputErrorMessage(inputElement); // Use arrow function to bind 'this'
          formIsValid = false;
        } else {
          this.hideInputErrorMessage(inputElement); // Use arrow function to bind 'this'
        }
      });
      return formIsValid;
    },
  };

  const headerFunctions = {
    toggleSideBar: function () {
      var sideBar = document.querySelector(".sidebar");
      var gridContainer = document.querySelector(".grid-container");
      var sidebarHandleIcon = document.querySelector(
        ".sidebar-handle-icon img"
      );
      if (sideBar.classList.contains("active")) {
        sideBar.classList.remove("active");
        gridContainer.style.gridTemplateColumns = "6% 94%";
        document
          .querySelectorAll(".sub-sec-left-left img")
          .forEach(function (img) {
            img.style.paddingLeft = "0.5rem";
          });
        document.querySelector(".sidebar-roles-icon").style.paddingLeft =
          "0.3rem";
        document.querySelector(".sidebar-assign-user-icon").style.paddingLeft =
          "0.3rem";
        sidebarHandleIcon.style.transform = "rotate(-180deg)";
      } else {
        sideBar.classList.add("active");
        gridContainer.style.gridTemplateColumns = "20% 80%";
        document
          .querySelectorAll(".sub-sec-left-left img")
          .forEach(function (img) {
            img.style.paddingLeft = "1rem";
          });
        document.querySelector(".sidebar-roles-icon").style.paddingLeft =
          "1rem";
        document.querySelector(".sidebar-assign-user-icon").style.paddingLeft =
          "1rem";
        sidebarHandleIcon.style.transform = "rotate(360deg)";
      }
    },

    handleBurger: function (burgerContainer) {
      var dropdownContent = document.querySelector(".dropdown-content-header");
      if (dropdownContent.classList.contains("active")) {
        dropdownContent.classList.remove("active");
      } else {
        dropdownContent.classList.add("active");
      }
    },
  };

  const rolesPageFunctions = {
    openRoleDescription: function (element) {
      let roleDescPage = document.querySelector(".roles-desc-page");
      let rolePage = document.querySelector(".role-page");
      if (!roleDescPage.classList.contains("active")) {
        rolePage.classList.remove("active");
        roleDescPage.classList.add("active");
      }
    },

    handleAddRoleBtn: function (element, removeContainers) {
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
    },
  };

  const addRoleFormFunction = {
    handleAddRolesFormCancel: function (activeContainers, removeContainers) {
      let form = document.getElementById("roleForm");
      globalUtilityFunctions.handlePostFormSubmissions(
        form,
        activeContainers,
        removeContainers
      );
    },
  };

  main();

  return {
    sideBarFunctions: sideBarFunctions,
    employeesPageFunctions: employeesPageFunctions,
    filterFunctions: filterFunctions,
    globalUtilityFunctions: globalUtilityFunctions,
    addEmployeesPageFunctions: addEmployeesPageFunctions,
    headerFunctions: headerFunctions,
    rolesPageFunctions: rolesPageFunctions,
    addRoleFormFunction: addRoleFormFunction,
  };
})();
