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

  // Clear search input
  function clearSearchInput() {
    $("#searchInp").val("");
  }

  // Update filter button state
  function updateFilterButtonState() {
    if ($("#personnelBtn").hasClass("active")) {
      $("#filterBtn").prop("disabled", false).removeAttr("disabled");
    } else {
      $("#filterBtn").prop("disabled", true).attr("disabled", "disabled");
    }
  }

  // Filter active state
  let filterActive = false;

  // Update filter active state
  function updateFilterActiveState() {
    if (filterActive) {
      $("#filterBtn").addClass("active");
    } else {
      $("#filterBtn").removeClass("active");
    }
  }

  // Reset filter dropdowns
  function resetFilterDropdowns() {

    $("#filterPersonnelDepartment").html('<option value="">Any Department</option>');

    $("#filterPersonnelLocation").html('<option value="">Any Location</option>');
  }

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

  // <td> classes
  const tdClass = "align-middle text-nowrap d-none d-md-table-cell";
  const btnClass = "btn btn-primary btn-sm me-2 align-right";

  // <button> classes
  function createButton(id, buttonType, tableType = "Personnel") {
    
    const iconClass = buttonType === "edit" ? "fa-pencil" : "fa-trash";
    
    const modalTarget = `#${buttonType}${tableType}Modal`;
    
    return $("<button>", {
      type: "button",
      class: btnClass,
      "data-bs-toggle": "modal",
      "data-bs-target": modalTarget,
      "data-id": id
    }).append($("<i>", { class: `fa-solid ${iconClass} fa-fw` }));

  }



  // Current personnel id
  let currentPersonnelId
  let currentDepartmentId

  /*----------------------------------------*/
  /* GET ALL DATA */
  /*----------------------------------------*/

  // Get all personnel
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

  // Get all departments
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

  // Get all locations
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

  // Delete personnel modal
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

  // Delete personnel submit
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

  // Delete department modal
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
          const departmentName = result.data[0].name;
          const personnelCount = parseInt(result.data[0].personnelCount);

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

  // Delete department submit
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

  // Delete location modal
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

  // Delete location submit
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

  // Populate department and location dropdowns
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

  // When modal closes, only remove active class if no filter is applied
  $("#filterPersonnelModal").on("hide.bs.modal", function() {
    updateFilterActiveState();
  });

  /*----------------------------------------*/
  /* ADD FUNCTIONS */
  /*----------------------------------------*/

  // Add personnel modal
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

  // submit add personnel form
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

  // Add department modal
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

  // submit add department form
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

  // Add location modal
  $("#addLocationsModal").on("show.bs.modal", function () {

    $("#addLocationsName").val("");

    // Hide error message if it exists
    if ($("#addLocationsError").length > 0) {
        $("#addLocationsError").hide().html("");
    }

  });

  // submit add location form
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

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    
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

  // Executes when the form button with type="submit" is clicked

  $("#editPersonnelForm").on("submit", function (e) {
    
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour

    e.preventDefault();

    // AJAX call to save form data
    
  });

});