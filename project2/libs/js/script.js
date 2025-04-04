$(document).ready(function () {

  /*----------------------------------------*/
  /* Global variables */
  /*----------------------------------------*/

   // Preloader
  function hidePreloader() {
    $("#preloader").fadeOut(500, function() {
      $(this).remove();
    });
    $("#mainContent").fadeIn(500);
  }

  // Call functions to populate personnel tables on load
  getAllPersonnel();

  // Clear search input on load
  clearSearchInput();

  // Update filter button state on load
  updateFilterButtonState();

  // Reset filter dropdowns on load
  resetFilterDropdowns();

  // Hide preloader after everything is initialized
  setTimeout(hidePreloader, 800);

  // Clear Table  
  const clearTable = (tableType) => {

    if (tableType === "personnel") {
      $("#personnelTableBody").html(""); 
    }

    if (tableType === "departments") {
      $("#departmentTableBody").html("");
    }

    if (tableType === "locations") {
      $("#locationTableBody").html("");
    }

  };

  // <p> Alert Classes
  const alertDanger = "alert alert-danger";
  const alertWarning = "alert alert-warning";

  // <td> Classes
  const tdClass = "align-middle text-nowrap d-none d-md-table-cell";
  const btnClass = "btn btn-primary btn-sm me-2 align-right";
  
  // <button> Classes
  function createButton(id, buttonType, tableType = "Personnel") {

    const iconClass = buttonType === "edit" ? "fa-pencil" : "fa-trash";
    const modalTarget = `#${buttonType}${tableType}Modal`;

    return $("<button>", {

      type: "button",
      class: btnClass,
      "data-bs-toggle": "modal",
      "data-bs-target": modalTarget,
      "data-id": id

    }).append($("<i>", {

       class: `fa-solid ${iconClass} fa-fw`

      }
    ));
  };

  // Function to Show Success Toast
  function showSuccessToast(message) {

    $("#successToastMessage").text(message);

    const toast = new bootstrap.Toast($("#successToast")[0]);
    toast.show();

  }

  // Current Personnel ID
  let currentPersonnelId
  let currentDepartmentId

  /*----------------------------------------*/
  /* GET ALL DATA */
  /*----------------------------------------*/

  // Get All Personnel
  function getAllPersonnel() {
    $.ajax({
      url: "libs/php/getAllPersonnel.php",
      type: "GET",
      dataType: "json",
      success: function(result) {
        if (result.status.code == 200) {
          // Clear the table before appending new data
          clearTable("personnel");

          $.each(result.data, function() {
            // Create TR with data attributes for department and location NAMES
            $("#personnelTableBody").append(
              $("<tr>", {
                "data-department-name": this.department, 
                "data-location-name": this.location
              }).append(
                $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),
                $("<td>", { text: this.department, class: tdClass }),
                $("<td>", { text: this.location, class: tdClass }),
                $("<td>", { text: this.email, class: tdClass }),
                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
              )
            );
          });
        }
      }
    });
  };

  // Get All Departments
  function getAllDepartments () {
    // AJAX call to get all departments
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",

      success: function (result) {

        if (result.status.code == 200) {
          // Clear the table before appending new data
          clearTable("departments");
          // Append each row to the table body
          $.each(result.data, function () {

            $("#departmentTableBody").append(

              $("<tr>").append(
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),
                $("<td>", { text: this.location, class: tdClass }),
                $("<td>" , { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Departments")).append(createButton(this.id, "delete", "Departments"))

              )
            );
          });
        }
      }
    });
  };

  // Get All Locations
  function getAllLocations () {
    // AJAX call to get all locations
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {        
          // Clear the table before appending new data
          clearTable("locations");
          // Append each row to the table body        
          $.each(result.data, function () {

            $("#locationTableBody").append(
              $("<tr>").append(               
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),
                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))

              )
            );
          });
        }
      }
    });
  };

  /*----------------------------------------*/
  /* DELETE FUNCTIONS */
  /*----------------------------------------*/

  // Delete Personnel Modal Show
  $("#deletePersonnelModal").on("show.bs.modal", function (e) {
    // Get the personnel ID from the button that triggered the modal
    currentPersonnelId = $(e.relatedTarget).attr("data-id");
    // Get personnel name
    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentPersonnelId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the personnel name from the result
          const firstName = result.data.personnel[0].firstName;
          const lastName = result.data.personnel[0].lastName;
          // Show the delete confirmation message
          $("#deletePersonnelName").html(
            `<div class="${alertWarning}">Are you sure you want to delete <strong>${firstName} ${lastName}</strong> from personnel?</div>`
          );

        } else {
          // If the result code is not 200, show an error message
          $("#deletePersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );

        }
      }
    });
  });

  // Delete Personnel Form Submit
  $("#deletePersonnelBtn").on("click", function () {
    // AJAX call to delete the personnel
    $.ajax({
      url: "libs/php/deletePersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentPersonnelId
      },

      success: function (result) {   

        if (result.status.code == 200) {
          // Get the personnel name from the modal
          const personnelName = $("#deletePersonnelName strong").first().text();
          // Show success message and refresh the personnel table
          getAllPersonnel();
          $("#deletePersonnelModal").modal("hide");
          showSuccessToast(`${personnelName} has been successfully deleted.`);

        }
      }
    });
  });

  // Delete Department Modal Show
  $("#deleteDepartmentsModal").on("show.bs.modal", function (e) {
    // Get the department ID from the button that triggered the modal
    currentDepartmentId = $(e.relatedTarget).attr("data-id");
    // Get department name and personnel count
    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentDepartmentId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name and personnel count from the result
          const departmentName = result.data.department[0].name;
          const personnelCount = parseInt(result.data.department[0].personnelCount);
          $("#deleteDepartmentsBtns").show();
          $("#deleteDepartmentsCancelBtn").show();
          // Show the delete confirmation message
          if (personnelCount > 0) {    
            // If personnel count is greater than 0, show an error message    
            $("#deleteDepartmentsName").html(
              `<div class="${alertDanger}">You are unable to delete <strong>${departmentName}</strong> as <strong>${personnelCount} Personnel</strong> are assigned to this department.</div>`
            );
            $("#deleteDepartmentsBtns").hide();

          } else {
            // If personnel count is 0, show the delete confirmation message
            $("#deleteDepartmentsName").html(
              `<div class="${alertWarning}">Are you sure you want to delete the <strong>${departmentName}</strong> department?</div>`
            );
            $("#deleteDepartmentsCancelBtn").hide();

          }
        }
      }
    });
  });

  // Delete Department Form Submit
  $("#deleteDepartmentsBtn").on("click", function () {
    // AJAX call to delete the department
    $.ajax({
      url: "libs/php/deleteDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentDepartmentId
      },

      success: function (result) {
        // If the result code is 200, show success message and refresh the department table
        if (result.status.code == 200) {

          const departmentName = $("#deleteDepartmentsName strong").first().text();
          getAllDepartments();
          $("#deleteDepartmentsModal").modal("hide");
          showSuccessToast(`${departmentName} has been successfully deleted.`);

        }
      }
    });
  });

  // Delete Location Modal Show
  $("#deleteLocationsModal").on("show.bs.modal", function (e) {  
    // Get the location ID from the button that triggered the modal 
    currentLocationId = $(e.relatedTarget).attr("data-id");
    // Get location name and department count   
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentLocationId
      },

      success: function (result) {
        // If the result code is 200, get the location name and department count
        if (result.status.code == 200) {

          const locationName = result.data[0].name;
          const departmentCount = parseInt(result.data[0].departmentCount);
          $("#deleteLocationsBtns").show();
          $("#deleteLocationsCancelBtn").show();

        if (departmentCount > 0) {
            // If department count is greater than 0, show an error message
            $("#deleteLocationsName").html(
              `<div class="${alertDanger}">You are unable to delete <strong>${locationName}</strong> as <strong>${departmentCount} Departments </strong> are assigned to this location.</div>`
            );        
            $("#deleteLocationsBtns").hide();

          } else {
            // If department count is 0, show the delete confirmation message
            $("#deleteLocationsName").html(
              `<div class="${alertWarning}">Are you sure you want to delete <strong>${locationName}</strong> from the database?</div>`);
            $("#deleteLocationsCancelBtn").hide();

          };
        }
      }
    });
  });

  // Delete Location Form Submit
  $("#deleteLocationsBtn").on("click", function () {    
    // AJAX call to delete the location
    $.ajax({
      url: "libs/php/deleteLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentLocationId
      },

      success: function (result) {    

        if (result.status.code == 200) {
          // If the result code is 200, show success message and refresh the location table
          const locationName = $("#deleteLocationsName strong").first().text();
          getAllLocations();
          $("#deleteLocationsModal").modal("hide");
          showSuccessToast(`${locationName} has been successfully deleted.`);

        }
      }
    });
  });

  /*----------------------------------------*/
  /* SEARCH FUNTCION */
  /*----------------------------------------*/

  // Clear search input
  function clearSearchInput() {
    $("#searchInp").val("");
  }

  // Search Input
  $("#searchInp").on("keyup", function () {
    // Clear the table before appending new data
    const searchInput = $(this).val();
    filterActive = false;
    updateFilterActiveState();    
    // Personel table
    if ($("#personnelBtn").hasClass("active")) {;
      // If the search input is empty, show all personnel     
      $.ajax({
        url: "libs/php/searchAllPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) { 

          if (result.status.code == 200) {
            // Clear the table before appending new data
            clearTable("personnel");

            if(result.data && result.data.length > 0) {
              // Append each row to the table body
              $.each(result.data, function () {

                $("#personnelTableBody").append( 
                  $("<tr>").append(                   
                    $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),
                    $("<td>", { text: this.departmentName, class: tdClass }),
                    $("<td>", { text: this.locationName, class: tdClass }),
                    $("<td>", { text: this.email, class: tdClass }),
                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
                  )
                );

              });

            } else {  
              // If no data is found, show a message            
              $("#personnelTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );
            }

          }
        }
      });

    // Department table
    } else if ($("#departmentsBtn").hasClass("active")) {
      // If the search input is empty, show all departments      
      $.ajax({
        url: "libs/php/searchAllDepartments.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) {

          if (result.status.code == 200) {
            // Clear the table before appending new data
            clearTable("departments");

            if(result.data && result.data.length > 0) {
              // Append each row to the table body
              $.each(result.data, function () {

                $("#departmentTableBody").append(
                  $("<tr>").append(                    
                    $("<td>", { text: this.name, class: "align-middle text-nowrap" }),
                    $("<td>", { text: this.locationName, class: tdClass }),
                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Departments")).append(createButton(this.id, "delete", "Departments"))
                  )
                );

              });

            } else {
              // If no data is found, show a message
              $("#departmentTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );
            }

          }
        }
      });  

    // Location table
    } else { 
      // If the search input is empty, show all locations     
      $.ajax({
        url: "libs/php/searchAllLocations.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) { 

          if (result.status.code == 200) {
            // Clear the table before appending new data
            clearTable("locations");
            if(result.data && result.data.length > 0) { 
              // Append each row to the table body          
              $.each(result.data, function () {

                $("#locationTableBody").append(
                  $("<tr>").append(                    
                    $("<td>", { text: this.name, class: "align-middle text-nowrap" }),
                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
                  )
                );

              });

            } else {
              // If no data is found, show a message
              $("#locationTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );
            };

          };
        }
      });
    };
  });

  /*----------------------------------------*/
  /* FILTER FUNCTIONS */
  /*----------------------------------------*/

  // Update filter button state
  function updateFilterButtonState() {
    // Enable filter button if personnel button is active
    if ($("#personnelBtn").hasClass("active")) {
      $("#filterBtn").prop("disabled", false).removeAttr("disabled");
    // Disable filter button if personnel button is not active
    } else {

      $("#filterBtn").prop("disabled", true).attr("disabled", "disabled");

    }
  };

  // Filter Active State
  let filterActive = false;

  // Update Filter Active State
  function updateFilterActiveState() {
    // Update filter button state based on filterActive variable
    if (filterActive) {

      $("#filterBtn").addClass("active");
    // If filterActive is false, remove active class
    } else {

      $("#filterBtn").removeClass("active");

    }
  };

  // Reset Filter Dropdowns
  function resetFilterDropdowns() {
    // Reset filter dropdowns to default values
    $("#filterPersonnelDepartment").html('<option value="">Any Department</option>');
    $("#filterPersonnelLocation").html('<option value="">Any Location</option>');

  };

  // Filter Personnel Modal Show
  $("#filterPersonnelModal").on("show.bs.modal", function () {
    // Show filter button as active
    $("#filterBtn").addClass("active");
    
    $.ajax({
      url: "libs/php/filterDropdown.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {
          // Clear the filter dropdowns before appending new data
          $.each(result.data.department, function () {

            $("#filterPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });
          // Clear the filter dropdowns before appending new data
          $.each(result.data.location, function () {

            $("#filterPersonnelLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })

            );
          });

        }
      }
    });
  });

  // Filter Personnel Department Change
  $("#filterPersonnelDepartment").on("change", function() {
    const departmentId = $(this).val();
    const departmentName = $(this).find("option:selected").text();
    
    if (departmentId !== "") {
      // Clear the other filter
      $("#filterPersonnelLocation").val("");
      
      // Show/hide rows based on department name
      let foundMatches = false;
      $("#personnelTableBody tr").each(function() {
        const rowDeptName = $(this).attr("data-department-name");
        
        if (rowDeptName === departmentName) {
          $(this).show();
          foundMatches = true;
        } else {
          $(this).hide();
        }
      });
      
      // Set filter state
      filterActive = true;
    } else {
      // If "Any Department" is selected, show all rows
      $("#personnelTableBody tr").show();
      filterActive = false;
    }
    
    updateFilterActiveState();
  });

  // Filter Personnel Location Change
  $("#filterPersonnelLocation").on("change", function() {
    const locationId = $(this).val();
    const locationName = $(this).find("option:selected").text();
    
    if (locationId !== "") {
      // Clear the other filter
      $("#filterPersonnelDepartment").val("");
      
      // Show/hide rows based on location name
      let foundMatches = false;
      $("#personnelTableBody tr").each(function() {
        const rowLocName = $(this).attr("data-location-name");
        
        if (rowLocName === locationName) {
          $(this).show();
          foundMatches = true;
        } else {
          $(this).hide();
        }
      });
      
      // Set filter state
      filterActive = true;
    } else {
      // If "Any Location" is selected, show all rows
      $("#personnelTableBody tr").show();
      filterActive = false;
    }
    
    updateFilterActiveState();
  });

  // Filter Personnel Modal Hide
  $("#filterPersonnelModal").on("hide.bs.modal", function() {

    updateFilterActiveState();
  });

  /*----------------------------------------*/
  /* ADD FUNCTIONS */
  /*----------------------------------------*/

  // Add Personnel Modal Show
  $("#addPersonnelModal").on("show.bs.modal", function () {
    // Clear the form fields
    $("#addPersonnelFirstName").val("");
    $("#addPersonnelLastName").val("");
    $("#addPersonnelJobTitle").val("");
    $("#addPersonnelEmailAddress").val("");
    $("#addPersonnelDepartment").html("");

    // Hide error message if it exists
    if ($("#addPersonnelError").length > 0) {

        $("#addPersonnelError").hide().html("");

    }
    // Get all departments
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {
          // Clear the department dropdown before appending new data
          $.each(result.data, function () {
            $("#addPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

        }
      }
    })
  });

  // Add Personnel Form Submit
  $("#addPersonnelForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const firstName = $("#addPersonnelFirstName").val();
    const lastName = $("#addPersonnelLastName").val();
    const jobTitle = $("#addPersonnelJobTitle").val();
    const email = $("#addPersonnelEmailAddress").val();
    const department = $("#addPersonnelDepartment").val();
    
    // Add error message div if it doesn't exist
    if ($("#addPersonnelError").length === 0) {

        $(this).prepend('<div id="addPersonnelError" class="mb-3" style="display: none;"></div>');
    }
    // AJAX call to save form data
    $.ajax({
      url: "libs/php/insertPersonnel.php",
      type: "POST",
      dataType: "json",
      data: {
        firstName: firstName,
        lastName: lastName,
        jobTitle: jobTitle,
        email: email,
        departmentID: department
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the personnel name from the form and show success toast
          const personnelName = `${firstName} ${lastName}`;
          getAllPersonnel();
          $("#addPersonnelModal").modal("hide");
          showSuccessToast(`${personnelName} has been successfully added.`);

        } else if (result.status.code == 409) {

          // Personnel with email already exists
          $("#addPersonnelError").html(
            `<div class="${alertDanger}">Email <strong>${email}</strong> is already assigned to another personnel.</div>`
          ).show();

        }

      }

    });
  });

  // Add Department Modal Show
  $("#addDepartmentsModal").on("show.bs.modal", function () {
    // Clear the form fields
    $("#addDepartmentsName").val("");
    $("#addDepartmentsLocation").html("");

    // Hide error message if it exists
    if ($("#addDepartmentsError").length > 0) {

        $("#addDepartmentsError").hide().html("");
    }
    // Get all locations
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {
          // Clear the location dropdown before appending new data
          $.each(result.data, function () {
            $("#addDepartmentsLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

        }

      }

    })
  });

  // Add Department Form Submit
  $("#addDepartmentsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const name = $("#addDepartmentsName").val();
    const location = $("#addDepartmentsLocation").val();
    const locationName = $("#addDepartmentsLocation option:selected").text();
    
    // Add error message div if it doesn't exist
    if ($("#addDepartmentsError").length === 0) {

        $(this).prepend('<div id="addDepartmentsError" class="mb-3" style="display: none;"></div>');
    }
    // AJAX call to save form data
    $.ajax({
      url: "libs/php/insertDepartment.php",
      type: "POST",
      dataType: "json",
      data: {
        name: name,
        locationID: location
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name from the form and show success toast
          getAllDepartments();
          $("#addDepartmentsModal").modal("hide");
          showSuccessToast(`${name} has been successfully added.`);

        } else if (result.status.code == 409) {
          // Department already exists
          $("#addDepartmentsError").html(
            `<div class="${alertDanger}">There is already a <strong>${name}</strong> department in <strong>${locationName}</strong>.</div>`
          ).show();

        }
      }

    });
  });

  // Add Location Modal Show
  $("#addLocationsModal").on("show.bs.modal", function () {
    // Clear the form fields
    $("#addLocationsName").val("");
    // Hide error message if it exists
    if ($("#addLocationsError").length > 0) {

        $("#addLocationsError").hide().html("");
    }

  });

  // Add Location Form Submit
  $("#addLocationsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const name = $("#addLocationsName").val();
    // Add error message div if it doesn't exist
    if ($("#addLocationsError").length === 0) {

        $(this).prepend('<div id="addLocationsError" class="mb-3" style="display: none;"></div>');

    }
    // AJAX call to save form data
    $.ajax({
      url: "libs/php/insertLocation.php",
      type: "POST",
      dataType: "json",
      data: {
        name: name
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the location name from the form and show success toast
          getAllLocations();
          $("#addLocationsModal").modal("hide");
          showSuccessToast(`${name} has been successfully added.`);

        } else if (result.status.code == 409) {

          // Location already exists
          $("#addLocationsError").html(
            `<div class="${alertDanger}"><strong>${name}</strong> is already an existing location.</div>`
          ).show();
        }
      }

    });
  });

  /*----------------------------------------*/
  /* EDIT FUNCTIONS */
  /*----------------------------------------*/

  // Edit Personnel Modal Show
  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    // Hide error message if it exists
    if ($("#editPersonnelError").length > 0) {

      $("#editPersonnelError").hide().html("");

    }
    // AJAX call to get personnel data by ID
    $.ajax({
      url:
        "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id") 
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);
          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);
          $("#editPersonnelDepartment").html("");
          // Clear the department dropdown before appending new data
          $.each(result.data.department, function () {

            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });
          // Update hidden form value of departmentID
          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
          
        } else {
          // If the result code is not 200, show an error message
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );

        }
      }
    });
  });

  // Edit Personnel Modal Submit
  $("#editPersonnelForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const firstName = $("#editPersonnelFirstName").val();
    const lastName = $("#editPersonnelLastName").val();
    const jobTitle = $("#editPersonnelJobTitle").val();
    const email = $("#editPersonnelEmailAddress").val();
    const department = $("#editPersonnelDepartment").val();
    
    // Add error message div if it doesn't exist
    if ($("#editPersonnelError").length === 0) {

        $(this).prepend('<div id="editPersonnelError" class="mb-3" style="display: none;"></div>');

    }

    // AJAX call to save form data
    $.ajax({
      url: "libs/php/updatePersonnel.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editPersonnelEmployeeID").val(),
        firstName: firstName,
        lastName: lastName,
        jobTitle: jobTitle,
        email: email,
        departmentID: department
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the personnel name from the form and show success toast
          const personnelName = `${firstName} ${lastName}`;
          getAllPersonnel();
          $("#editPersonnelModal").modal("hide");
          showSuccessToast(`${personnelName} has been successfully edited.`);

        } else if (result.status.code == 409) {

          // Personnel already exists
          $("#editPersonnelError").html(
            `<div class="${alertDanger}">Email <strong>${email}</strong> is already assigned to another personnel.</div>`
          ).show();

        }

      }

    });
  });

  // Edit Department Modal Show
  $("#editDepartmentsModal").on("show.bs.modal", function (e) {
    
    // Hide error message if it exists
    if ($("#editDepartmentsError").length > 0) {

      $("#editDepartmentsError").hide().html("");

    }
    // Get the department ID from the button that triggered the modal
    const departmentId = $(e.relatedTarget).attr("data-id");
    $("#editDepartmentsID").val(departmentId);
    // Get department name and locations
    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: departmentId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name and locations from the result
          $("#editDepartmentsName").val(result.data.department[0].name);
          $("#editDepartmentsLocation").html("");
          // Clear the location dropdown before appending new data
          $.each(result.data.locations, function () {

            $("#editDepartmentsLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });
          // Update hidden form value of locationID
          $("#editDepartmentsLocation").val(result.data.department[0].locationID);

        } else {
          // If the result code is not 200, show an error message
          $("#editDepartmentsModal .modal-title").replaceWith(
            "Error retrieving data"
          );

        }

      }

    });
  });

  // Edit Department Modal Submit
  $("#editDepartmentsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const department = $("#editDepartmentsName").val();
    const location = $("#editDepartmentsLocation").val();
    const locationName = $("#editDepartmentsLocation option:selected").text();
    // Add error message div if it doesn't exist
    if ($("#editDepartmentsError").length === 0) {

      $(this).prepend('<div id="editDepartmentsError" class="mb-3" style="display: none;"></div>');

    }
    // AJAX call to save form data
    $.ajax({
      url: "libs/php/updateDepartments.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editDepartmentsID").val(),
        name: department,
        locationID: location
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name from the form and show success toast
          getAllDepartments();
          $("#editDepartmentsModal").modal("hide");
          showSuccessToast(`${department} has been successfully edited.`);

        } else if (result.status.code == 409) {
          // Department already exists
          $("#editDepartmentsError").html(
            `<div class="${alertDanger}"><strong>${department}</strong> department already exists in <strong>${locationName}</strong>.</div>`
          ).show();

        }

      }

    });
  });
  
  // Edit Location Modal Show
  $("#editLocationsModal").on("show.bs.modal", function (e) {
    
    // Hide error message if it exists
    if ($("#editLocationsError").length > 0) {

      $("#editLocationsError").hide().html("");

    }
    // Get the location ID from the button that triggered the modal
    const locationId = $(e.relatedTarget).attr("data-id");
    $("#editLocationsID").val(locationId);
    // Get location name
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: locationId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the location name from the result
          $("#editLocationsName").val(result.data[0].name);

        } else {
          // If the result code is not 200, show an error message
          $("#editLocationsModal .modal-title").replaceWith(
            "Error retrieving data"
          );

        }

      }

    });
  });

  // Edit Location Modal Submit
  $("#editLocationsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const location = $("#editLocationsName").val();

    if ($("#editLocationsError").length === 0) {
      // Add error message div if it doesn't exist
      $(this).prepend('<div id="editLocationsError" class="mb-3" style="display: none;"></div>');

    }
    // AJAX call to save form data
    $.ajax({
      url: "libs/php/updateLocations.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editLocationsID").val(),
        name: location
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the location name from the form and show success toast
          getAllLocations();
          $("#editLocationsModal").modal("hide");
          showSuccessToast(`${location} has been successfully edited.`);

        } else if (result.status.code == 409) {

          // Location already exists
          $("#editLocationsError").html(
            `<div class="${alertDanger}"><strong>${location}</strong> is already and existing location.</div>`
          ).show();

        }

      }

    });
  });

  /*----------------------------------------*/
  /* BUTTON FUNCTIONS */
  /*----------------------------------------*/

  $("#refreshBtn").click(function () {
    // Refresh the table based on the active button
    resetFilterDropdowns();
    clearSearchInput();
    filterActive = false;
    updateFilterActiveState();
    
    $("#personnelTableBody tr").show();
    if ($("#personnelBtn").hasClass("active")) {

      // Refresh personnel table
      getAllPersonnel();

    } else if ($("#departmentsBtn").hasClass("active")) {

      // Refresh department table
      getAllDepartments();

    } else {

      // Refresh location table
      getAllLocations();

    }

  });

  // Filter Button
  $("#filterBtn").click(function () {
    
    $("#filterPersonnelModal").modal("show");
    
  });

  // Add Button
  $("#addBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {
      
      $("#addPersonnelModal").modal("show");
    
    } else if ($("#departmentsBtn").hasClass("active")) {
      
      $("#addDepartmentsModal").modal("show");

    } else {
      
      $("#addLocationsModal").modal("show");

    }

  });

  // Personnel, Departments, and Locations Button Click
  $("#personnelBtn").click(function () {

    // Call function to refresh personnel table
    filterActive = false;
    updateFilterActiveState();
    resetFilterDropdowns();
    getAllPersonnel();
    clearSearchInput();
    updateFilterButtonState();

  });
  
  $("#departmentsBtn").click(function () {

    // Call function to refresh department table
    getAllDepartments();
    clearSearchInput();
    updateFilterButtonState();

  });
  
  $("#locationsBtn").click(function () {

    // Call function to refresh location table
    getAllLocations();
    clearSearchInput();
    updateFilterButtonState();

  });

});