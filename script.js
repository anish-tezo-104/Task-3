function toggleSubSecClass(
  element,
  containerSelectors,
  removeContainers,
  removeActiveSubSec
) {
  if (element.classList.contains("unlocked")) {
    console.log(element.classList.contains("active"));
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

function toggleAlphBtn() {
  var alphBtn = document.querySelector(".alph-btn");
  if (alphBtn.classList.contains("active")) {
    alphBtn.classList.remove("active");
  } else {
    alphBtn.classList.add("active");
  }
}

function toggleSideBar() {
  var sideBar = document.querySelector(".sidebar");
  var gridContainer = document.querySelector(".grid-container");
  if (sideBar.classList.contains("active")) {
    sideBar.classList.remove("active");
    gridContainer.style.gridTemplateColumns = "100%";
    document.querySelector(".sidebar-handle-icon").style.left = "-2rem";
    document.querySelector(".sidebar-handle-icon img").style.transform =
      "rotate(-180deg)";
  } else {
    sideBar.classList.add("active");
    gridContainer.style.gridTemplateColumns = "20% 80%";
    document.querySelector(".sidebar-handle-icon").style.left = "-3rem";
    document.querySelector(".sidebar-handle-icon img").style.transform =
      "rotate(360deg)";
  }
}

function handleUpdateDismiss() {
  var updateContainer = document.querySelector(".update-message");
  updateContainer.classList.remove("active");
}

document.getElementById("all-checkbox").addEventListener("change", function () {
  var checkboxes = document.querySelectorAll(".check-box-col input");

  checkboxes.forEach(function (checkbox) {
    checkbox.checked = this.checked;
  }, this);
});
