$(document).ready(function () {


  /*----------------------------------------*/
  /* Global variables */
  /*----------------------------------------*/

  // Call functions to populate tables on load
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();

  // Clear search input on load
  clearSearchInput();

  // Update filter button state on load
  updateFilterButtonState();

  // Reset filter dropdowns on load
  resetFilterDropdowns();

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

  // Current Personnel ID
  let currentPersonnelId
  let currentDepartmentId

  /*----------------------------------------*/
  /* GET ALL DATA */
  /*----------------------------------------*/

  // Get All Personnel
  function getAllPersonnel () {
    
    $.ajax({
      url: "libs/php/getAllPersonnel.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("personnel");
          
          $.each(result.data, function () {
            
            $("#personnelTableBody").append(
              
              $("<tr>").append(
                
                $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),

                $("<td>", { text: this.department, class: tdClass }),

                $("<td>", { text: this.location, class: tdClass }),

                $("<td>", { text: this.email, class: tdClass }),

                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  // Get All Departments
  function getAllDepartments () {
    
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("departments");
          
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
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  // Get All Locations
  function getAllLocations () {
    
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("locations");
          
          $.each(result.data, function () {

            $("#locationTableBody").append(

              $("<tr>").append(
                
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  /*----------------------------------------*/
  /* DELETE FUNCTIONS */
  /*----------------------------------------*/

  // Delete Personnel Modal Show
  $("#deletePersonnelModal").on("show.bs.modal", function (e) {

    currentPersonnelId = $(e.relatedTarget).attr("data-id");
    
    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentPersonnelId
      },
      success: function (result) {

        if (result.status.code == 200) {

          $("#deletePersonnelName").html(
            `Are you sure you want to delete <strong>${result.data.personnel[0].firstName} ${result.data.personnel[0].lastName}</strong> from the database?`
          );
          
        } else {
          $("#deletePersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#deletePersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  }
  );

  // Delete Personnel Form Submit
  $("#deletePersonnelBtn").on("click", function () {
    
    $.ajax({
      url: "libs/php/deletePersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentPersonnelId
      },
      success: function (result) {
        
        if (result.status.code == 200) {
          getAllPersonnel();
          $("#deletePersonnelModal").modal("hide");
        }

      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
  }
  );

  // Delete Department Modal Show
  $("#deleteDepartmentsModal").on("show.bs.modal", function (e) {
    
    currentDepartmentId = $(e.relatedTarget).attr("data-id");
    
    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentDepartmentId
      },
      success: function (result) {

        if (result.status.code == 200) {
          const departmentName = result.data.department[0].name;
          const personnelCount = parseInt(result.data.department[0].personnelCount);

          $("#deleteDepartmentsBtns").show();
          $("#deleteDepartmentsCancelBtn").show();

          if (personnelCount > 0) {
            
            $("#deleteDepartmentsName").html(
              `You are unable to delete <strong>${departmentName}</strong> as <strong>${personnelCount} Personnel</strong> are assigned to this department.`
            );

            $("#deleteDepartmentsBtns").hide();
                
          } else {

            $("#deleteDepartmentsName").html(
              `Are you sure you want to delete <strong>${departmentName}</strong> from the database?`
            );

            $("#deleteDepartmentsCancelBtn").hide();

          }

        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#deleteDepartmentsModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  }
  );

  // Delete Department Form Submit
  $("#deleteDepartmentsBtn").on("click", function () {
    
    $.ajax({
      url: "libs/php/deleteDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentDepartmentId
      },
      success: function (result) {
        
        if (result.status.code == 200) {
          getAllDepartments();
          $("#deleteDepartmentsModal").modal("hide");
        }

      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  });

  // Delete Location Modal Show
  $("#deleteLocationsModal").on("show.bs.modal", function (e) {
    
    currentLocationId = $(e.relatedTarget).attr("data-id");
    
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentLocationId
      },
      success: function (result) {

        if (result.status.code == 200) {
          const locationName = result.data[0].name;
          const departmentCount = parseInt(result.data[0].departmentCount);

          $("#deleteLocationsBtns").show();
          $("#deleteLocationsCancelBtn").show();
        
        if (departmentCount > 0) {

            $("#deleteLocationsName").html(
              `You are unable to delete <strong>${locationName}</strong> as <strong>${departmentCount} Departments</strong> are assigned to this location.`
            );
          
            $("#deleteLocationsBtns").hide();

          } else {

            $("#deleteLocationsName").html(
              `Are you sure you want to delete <strong>${locationName}</strong> from the database?`
            );

            $("#deleteLocationsCancelBtn").hide();

          };

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        $("#deleteLocationsModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }

    });

  });

  // Delete Location Form Submit
  $("#deleteLocationsBtn").on("click", function () {
    
    $.ajax({
      url: "libs/php/deleteLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentLocationId
      },
      success: function (result) {
        
        if (result.status.code == 200) {
          getAllLocations();
          $("#deleteLocationsModal").modal("hide");
        }

      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
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

    const searchInput = $(this).val();
    filterActive = false;
    updateFilterActiveState();
    
    // Personel table
    if ($("#personnelBtn").hasClass("active")) {;
      
      $.ajax({
        url: "libs/php/searchAllPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("personnel");
            
            if(result.data && result.data.length > 0) {

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
              
              $("#personnelTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            }
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      });
    
    // Department table
    } else if ($("#departmentsBtn").hasClass("active")) {
      
      $.ajax({
        url: "libs/php/searchAllDepartments.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },
        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("departments");

            if(result.data && result.data.length > 0) {

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

              $("#departmentTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            }
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }

      });
    
    // Location table
    } else {
      
      $.ajax({
        url: "libs/php/searchAllLocations.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },
        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("locations");

            if(result.data && result.data.length > 0) {
            
              $.each(result.data, function () {

                $("#locationTableBody").append(

                  $("<tr>").append(
                    
                    $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
                  )
                );
              });

            } else {

              $("#locationTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            };
          };
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }

      });
    };
  });

  /*----------------------------------------*/
  /* FILTER FUNCTIONS */
  /*----------------------------------------*/

  // Update filter button state
  function updateFilterButtonState() {

    if ($("#personnelBtn").hasClass("active")) {

      $("#filterBtn").prop("disabled", false).removeAttr("disabled");

    } else {

      $("#filterBtn").prop("disabled", true).attr("disabled", "disabled");

    }

  }

  // Filter Active State
  let filterActive = false;

  // Update Filter Active State
  function updateFilterActiveState() {

    if (filterActive) {

      $("#filterBtn").addClass("active");

    } else {

      $("#filterBtn").removeClass("active");

    }
  }

  // Reset Filter Dropdowns
  function resetFilterDropdowns() {

    $("#filterPersonnelDepartment").html('<option value="">Any Department</option>');

    $("#filterPersonnelLocation").html('<option value="">Any Location</option>');

  }

  // Filter Personnel Modal Show
  $("#filterPersonnelModal").on("show.bs.modal", function () {

    $("#filterBtn").addClass("active");

    $.ajax({
      url: "libs/php/filterDropdown.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {

          $.each(result.data.department, function () {

            $("#filterPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });

          $.each(result.data.location, function () {

            $("#filterPersonnelLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })

            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  });

  // Filter Personnel Form Submit
  $("#filterPersonnelForm").on("submit", function (e) {
    
    e.preventDefault();

    const department = $("#filterPersonnelDepartment").val();
    const location = $("#filterPersonnelLocation").val();

    filterActive = (department !== "" && department !== "Any Department") || 
    (location !== "" && location !== "Any Location");

    updateFilterActiveState();

    $.ajax({
      url: "libs/php/filterPersonnel.php",
      type: "POST",
      dataType: "json",
      data: {
        department: department,
        location: location
      },
      success: function (result) {
        
        if (result.status.code == 200) {

          clearTable("personnel");

          if(result.data && result.data.length > 0) {

            $.each(result.data, function () {
              
              $("#personnelTableBody").append(
                
                $("<tr>").append(
                  
                  $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),

                  $("<td>", { text: this.department, class: tdClass }),

                  $("<td>", { text: this.location, class: tdClass }),

                  $("<td>", { text: this.email, class: tdClass }),

                  $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
                )
              );
            });

          } else {

            $("#personnelTableBody").html(
              $("<tr>").append(
                $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
              )
            );

          }
        }

        $("#filterPersonnelModal").modal("hide");

      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  }
  );

  // Filter Personnel Modal Hide
  $("#filterPersonnelModal").on("hide.bs.modal", function() {
    updateFilterActiveState();
  });

  /*----------------------------------------*/
  /* ADD FUNCTIONS */
  /*----------------------------------------*/

  // Add Personnel Modal Show
  $("#addPersonnelModal").on("show.bs.modal", function () {

    $("#addPersonnelFirstName").val("");
    $("#addPersonnelLastName").val("");
    $("#addPersonnelJobTitle").val("");
    $("#addPersonnelEmailAddress").val("");
    $("#addPersonnelDepartment").html("");

    // Hide error message if it exists
    if ($("#addPersonnelError").length > 0) {
        $("#addPersonnelError").hide().html("");
    }

    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {

          $.each(result.data, function () {
            $("#addPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    })

  });

  // Add Personnel Form Submit
  $("#addPersonnelForm").on("submit", function (e) {
    
    e.preventDefault();

    const firstName = $("#addPersonnelFirstName").val();
    const lastName = $("#addPersonnelLastName").val();
    const jobTitle = $("#addPersonnelJobTitle").val();
    const email = $("#addPersonnelEmailAddress").val();
    const department = $("#addPersonnelDepartment").val();
    
    // Add error message div if it doesn't exist
    if ($("#addPersonnelError").length === 0) {
        $(this).prepend('<div id="addPersonnelError" class="mb-3" style="display: none;"></div>');
    }
    
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
          getAllPersonnel();
          $("#addPersonnelModal").modal("hide");
        } else if (result.status.code == 409) {
          // Personnel already exists
          $("#addPersonnelError").html(
            `<div class="alert alert-danger">${result.status.description}</div>`
          ).show();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
  }
  );

  // Add Department Modal Show
  $("#addDepartmentsModal").on("show.bs.modal", function () {

    $("#addDepartmentsName").val("");
    $("#addDepartmentsLocation").html("");

    // Hide error message if it exists
    if ($("#addDepartmentsError").length > 0) {
        $("#addDepartmentsError").hide().html("");
    }

    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {

          $.each(result.data, function () {
            $("#addDepartmentsLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    })

  });

  // Add Department Form Submit
  $("#addDepartmentsForm").on("submit", function (e) {
    
    e.preventDefault();

    const name = $("#addDepartmentsName").val();
    const location = $("#addDepartmentsLocation").val();
    
    // Add error message div if it doesn't exist
    if ($("#addDepartmentsError").length === 0) {
        $(this).prepend('<div id="addDepartmentsError" class="mb-3" style="display: none;"></div>');
    }
    
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
          getAllDepartments();
          $("#addDepartmentsModal").modal("hide");
        } else if (result.status.code == 409) {
          // Department already exists
          $("#addDepartmentsError").html(
            `<div class="alert alert-danger">${result.status.description}</div>`
          ).show();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
  });

  // Add Location Modal Show
  $("#addLocationsModal").on("show.bs.modal", function () {

    $("#addLocationsName").val("");

    // Hide error message if it exists
    if ($("#addLocationsError").length > 0) {
        $("#addLocationsError").hide().html("");
    }

  });

  // Add Location Form Submit
  $("#addLocationsForm").on("submit", function (e) {

    e.preventDefault();

    const name = $("#addLocationsName").val();

    // Add error message div if it doesn't exist
    if ($("#addLocationsError").length === 0) {
        $(this).prepend('<div id="addLocationsError" class="mb-3" style="display: none;"></div>');
    }

    $.ajax({
      url: "libs/php/insertLocation.php",
      type: "POST",
      dataType: "json",
      data: {
        name: name
      },
      success: function (result) {
        if (result.status.code == 200) {
          getAllLocations();
          $("#addLocationsModal").modal("hide");
        } else if (result.status.code == 409) {
          // Location already exists
          $("#addLocationsError").html(
            `<div class="alert alert-danger">${result.status.description}</div>`
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
    
    $.ajax({
      url:
        "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id") 
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted

          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

          $("#editPersonnelDepartment").html("");

          $.each(result.data.department, function () {
            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
          
        } else {
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

  // Edit Personnel Modal Submit
  $("#editPersonnelForm").on("submit", function (e) {
    
    e.preventDefault();

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
          getAllPersonnel();
          $("#editPersonnelModal").modal("hide");
        } else if (result.status.code == 409) {
          // Personnel already exists
          $("#editPersonnelError").html(
            `<div class="alert alert-danger">${result.status.description}</div>`
          ).show();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
    
  });

  // Edit Department Modal Show
  $("#editDepartmentsModal").on("show.bs.modal", function (e) {
    
    // Hide error message if it exists
    if ($("#editDepartmentsError").length > 0) {
      $("#editDepartmentsError").hide().html("");
    }

    const departmentId = $(e.relatedTarget).attr("data-id");
    $("#editDepartmentsID").val(departmentId);

    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: departmentId
      },
      success: function (result) {
        if (result.status.code == 200) {

          $("#editDepartmentsName").val(result.data.department[0].name);

          $("#editDepartmentsLocation").html("");

          $.each(result.data.locations, function () {
            $("#editDepartmentsLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

          $("#editDepartmentsLocation").val(result.data.department[0].locationID);

        } else {
          $("#editDepartmentsModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }

      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editDepartmentsModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }

    });
  });

  // Edit Department Modal Submit
  $("#editDepartmentsForm").on("submit", function (e) {

    e.preventDefault();

    const department = $("#editDepartmentsName").val();
    const location = $("#editDepartmentsLocation").val();
    const locationName = $("#editDepartmentsLocation option:selected").text();

    if ($("#editDepartmentsError").length === 0) {
      $(this).prepend('<div id="editDepartmentsError" class="mb-3" style="display: none;"></div>');
    }

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

          getAllDepartments();
          $("#editDepartmentsModal").modal("hide");

        } else if (result.status.code == 409) {

          // Department already exists
          $("#editDepartmentsError").html(
            `<div class="alert alert-danger">${result.status.description}<p>in ${locationName}.</p></div>`
          ).show();

        }

      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });
  });
  
  // Edit Location Modal Show
  $("#editLocationsModal").on("show.bs.modal", function (e) {
    
    // Hide error message if it exists
    if ($("#editLocationsError").length > 0) {
      $("#editLocationsError").hide().html("");
    }

    const locationId = $(e.relatedTarget).attr("data-id");
    $("#editLocationsID").val(locationId);

    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: locationId
      },
      success: function (result) {
        if (result.status.code == 200) {

          $("#editLocationsName").val(result.data[0].name);

        } else {
          $("#editLocationsModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }

      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editLocationsModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }

    });
  }
  );

  // Edit Location Modal Submit
  $("#editLocationsForm").on("submit", function (e) {

    e.preventDefault();

    const location = $("#editLocationsName").val();

    if ($("#editLocationsError").length === 0) {
      $(this).prepend('<div id="editLocationsError" class="mb-3" style="display: none;"></div>');
    }

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

          getAllLocations();
          $("#editLocationsModal").modal("hide");

        } else if (result.status.code == 409) {

          // Location already exists
          $("#editLocationsError").html(
            `<div class="alert alert-danger">${result.status.description}</div>`
          ).show();

        }

      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });
  });

  /*----------------------------------------*/
  /* BUTTON FUNCTIONS */
  /*----------------------------------------*/

  $("#refreshBtn").click(function () {
    
    resetFilterDropdowns();
    clearSearchInput();
    filterActive = false;
    updateFilterActiveState(); 

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

  $("#filterBtn").click(function () {
    
    $("#filterPersonnelModal").modal("show");
    
  });

  $("#addBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {
      
      $("#addPersonnelModal").modal("show");
    
    } else if ($("#departmentsBtn").hasClass("active")) {
      
      $("#addDepartmentsModal").modal("show");

    } else {
      
      $("#addLocationsModal").modal("show");

    }

  });

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